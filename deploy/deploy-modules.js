#!/usr/bin/env node
/**
 * Deploy Lambda Modules
 * Builds and deploys all 12 Lambda modules with Layer support
 * 
 * Usage:
 *   node deploy-modules.js           # Deploy all modules
 *   node deploy-modules.js auth      # Deploy specific module
 *   node deploy-modules.js --no-layer # Deploy without updating layer config
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config');

const BUILD_DIR = path.join(__dirname, config.paths.buildDir);
const LAMBDA_ROOT = path.join(__dirname, config.paths.lambdaRoot);

// Parse arguments
const args = process.argv.slice(2);
const targetModule = args.find(a => !a.startsWith('--'));
const skipLayer = args.includes('--no-layer');

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (file.endsWith('.js')) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function buildModule(name, moduleConfig) {
  const moduleDir = path.join(LAMBDA_ROOT, moduleConfig.folder);
  const sharedDir = path.join(LAMBDA_ROOT, 'shared');
  const moduleBuildDir = path.join(BUILD_DIR, 'modules', name);
  const zipPath = path.join(moduleBuildDir, `${name}.zip`);

  console.log(`\n📦 Building ${name}...`);

  // Clean and create build directory
  if (fs.existsSync(moduleBuildDir)) {
    fs.rmSync(moduleBuildDir, { recursive: true });
  }
  fs.mkdirSync(moduleBuildDir, { recursive: true });

  // Create temp directory
  const tempDir = path.join(moduleBuildDir, 'temp');
  fs.mkdirSync(tempDir, { recursive: true });

  // Copy module JS files only (dependencies come from Layer)
  fs.readdirSync(moduleDir).forEach(file => {
    if (file.endsWith('.js')) {
      fs.copyFileSync(path.join(moduleDir, file), path.join(tempDir, file));
    }
  });

  // Copy shared folder (auth.js, database.js, response.js)
  if (fs.existsSync(sharedDir)) {
    copyDirRecursive(sharedDir, path.join(tempDir, 'shared'));
    console.log(`   + shared folder`);
  }

  // Create ZIP (no node_modules - using Layer)
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  const zipCommand = process.platform === 'win32'
    ? `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`
    : `cd "${tempDir}" && zip -r "${zipPath}" .`;
  execSync(zipCommand, { stdio: 'pipe' });

  // Cleanup
  fs.rmSync(tempDir, { recursive: true });

  const stats = fs.statSync(zipPath);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);

  return zipPath;
}

async function waitForLambdaReady(functionName) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = execSync(
        `aws lambda get-function --function-name ${functionName} --region ${config.aws.region} --query "Configuration.LastUpdateStatus" --output text`,
        { stdio: 'pipe', encoding: 'utf-8' }
      ).trim();
      
      if (result === 'Successful' || result === 'None') {
        return true;
      }
      console.log(`   ⏳ Waiting for Lambda ready (${result})...`);
    } catch (e) {
      // Function might not exist yet
    }
    await sleep(RETRY_DELAY_MS);
  }
  return false;
}

async function deployModule(name, moduleConfig, zipPath, layerArn) {
  console.log(`📤 Deploying ${moduleConfig.lambdaName}...`);

  // Wait for Lambda to be ready before updating
  await waitForLambdaReady(moduleConfig.lambdaName);

  // Update function code with retry
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const updateCodeCmd = `aws lambda update-function-code --function-name ${moduleConfig.lambdaName} --zip-file fileb://${zipPath} --region ${config.aws.region}`;
      execSync(updateCodeCmd, { stdio: 'pipe' });
      break;
    } catch (error) {
      if (error.message.includes('ResourceConflictException') && attempt < MAX_RETRIES) {
        console.log(`   ⏳ Retry ${attempt}/${MAX_RETRIES} (update in progress)...`);
        await sleep(RETRY_DELAY_MS);
      } else if (attempt === MAX_RETRIES) {
        throw error;
      }
    }
  }

  // Update layer configuration if layer ARN provided
  if (layerArn && !skipLayer) {
    console.log(`   Attaching layer...`);
    
    // Wait for code update to complete
    await waitForLambdaReady(moduleConfig.lambdaName);
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const updateLayerCmd = `aws lambda update-function-configuration --function-name ${moduleConfig.lambdaName} --layers ${layerArn} --region ${config.aws.region}`;
        execSync(updateLayerCmd, { stdio: 'pipe' });
        break;
      } catch (error) {
        if (error.message.includes('ResourceConflictException') && attempt < MAX_RETRIES) {
          console.log(`   ⏳ Retry ${attempt}/${MAX_RETRIES} (update in progress)...`);
          await sleep(RETRY_DELAY_MS);
        } else if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }
  }

  console.log(`   ✅ Deployed!`);
  return true;
}

async function main() {
  console.log('🚀 Lambda Modules Deployment');
  console.log('━'.repeat(50));
  console.log(`App: ${config.app.name}`);
  console.log(`Region: ${config.aws.region}`);
  console.log(`Environment: ${config.app.environment}`);
  console.log('━'.repeat(50));

  // Check AWS credentials
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  } catch (error) {
    console.error('\n❌ AWS credentials not configured. Run: aws configure');
    process.exit(1);
  }

  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Get layer ARN
  let layerArn = null;
  const layerArnFile = path.join(BUILD_DIR, 'layer-arn.txt');
  if (fs.existsSync(layerArnFile)) {
    layerArn = fs.readFileSync(layerArnFile, 'utf-8').trim();
    console.log(`\nUsing Layer: ${layerArn}`);
  } else {
    console.log('\n⚠️  No layer found. Run: node deploy-layer.js first');
    console.log('   Deploying without layer (modules will include dependencies)');
  }

  // Determine modules to deploy
  const modulesToDeploy = targetModule
    ? { [targetModule]: config.modules[targetModule] }
    : config.modules;

  if (targetModule && !config.modules[targetModule]) {
    console.error(`\n❌ Unknown module: ${targetModule}`);
    console.log(`Available: ${Object.keys(config.modules).join(', ')}`);
    process.exit(1);
  }

  let success = 0, failed = 0;
  const failedModules = [];

  for (const [name, moduleConfig] of Object.entries(modulesToDeploy)) {
    try {
      const zipPath = buildModule(name, moduleConfig);
      const deployed = await deployModule(name, moduleConfig, zipPath, layerArn);
      if (deployed) success++;
      else {
        failed++;
        failedModules.push(name);
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failed++;
      failedModules.push(name);
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`✅ Deployment Complete!`);
  console.log(`   Success: ${success} modules`);
  if (failed > 0) {
    console.log(`   Failed: ${failed} modules (${failedModules.join(', ')})`);
  }
}

main();
