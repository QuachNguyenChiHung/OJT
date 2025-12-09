#!/usr/bin/env node
/**
 * Deploy Lambda Layer
 * Creates/updates shared dependencies layer for all Lambda modules
 * 
 * Usage: node deploy-layer.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config');

const LAYER_DIR = path.join(__dirname, config.paths.layerDir);
const LAYER_ZIP = path.join(__dirname, config.paths.buildDir, 'layer.zip');

async function deployLayer() {
  console.log('🔧 Building Lambda Layer...\n');

  // Clean and create layer directory structure
  // Lambda Layer requires nodejs/node_modules structure
  const nodejsDir = path.join(LAYER_DIR, 'nodejs');
  if (fs.existsSync(LAYER_DIR)) {
    fs.rmSync(LAYER_DIR, { recursive: true });
  }
  fs.mkdirSync(nodejsDir, { recursive: true });

  // Create package.json for layer
  const layerPackage = {
    name: 'ojt-lambda-layer',
    version: '1.0.0',
    dependencies: config.sharedDependencies,
  };
  fs.writeFileSync(
    path.join(nodejsDir, 'package.json'),
    JSON.stringify(layerPackage, null, 2)
  );

  // Copy shared utilities
  const sharedSrc = path.join(__dirname, config.paths.lambdaRoot, 'shared');
  const sharedDest = path.join(nodejsDir, 'node_modules', 'shared');
  fs.mkdirSync(sharedDest, { recursive: true });
  
  fs.readdirSync(sharedSrc).forEach(file => {
    if (file.endsWith('.js')) {
      fs.copyFileSync(path.join(sharedSrc, file), path.join(sharedDest, file));
    }
  });

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --production', { cwd: nodejsDir, stdio: 'inherit' });

  // Create ZIP
  console.log('\n📦 Creating layer ZIP...');
  if (fs.existsSync(LAYER_ZIP)) {
    fs.unlinkSync(LAYER_ZIP);
  }

  const zipCommand = process.platform === 'win32'
    ? `powershell -Command "Compress-Archive -Path '${LAYER_DIR}\\*' -DestinationPath '${LAYER_ZIP}' -Force"`
    : `cd "${LAYER_DIR}" && zip -r "${LAYER_ZIP}" .`;
  execSync(zipCommand, { stdio: 'pipe' });

  // Check ZIP size
  const stats = fs.statSync(LAYER_ZIP);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   Layer size: ${sizeMB} MB`);

  if (stats.size > 50 * 1024 * 1024) {
    console.error('❌ Layer exceeds 50MB limit!');
    process.exit(1);
  }

  // Publish layer
  console.log('\n📤 Publishing Lambda Layer...');
  try {
    const publishCmd = `aws lambda publish-layer-version \
      --layer-name ${config.layer.name} \
      --description "${config.layer.description}" \
      --zip-file fileb://${LAYER_ZIP} \
      --compatible-runtimes ${config.layer.runtime} \
      --region ${config.aws.region}`;

    const result = execSync(publishCmd, { encoding: 'utf-8' });
    const layerInfo = JSON.parse(result);

    console.log(`\n✅ Layer published successfully!`);
    console.log(`   Layer ARN: ${layerInfo.LayerVersionArn}`);
    console.log(`   Version: ${layerInfo.Version}`);

    // Save layer ARN for modules to use
    fs.writeFileSync(
      path.join(__dirname, config.paths.buildDir, 'layer-arn.txt'),
      layerInfo.LayerVersionArn
    );

    return layerInfo.LayerVersionArn;
  } catch (error) {
    console.error('❌ Failed to publish layer:', error.message);
    process.exit(1);
  }
}

deployLayer();
