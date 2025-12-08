#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get target from command line (auth, products, or undefined for all)
const target = process.argv[2];

const FUNCTIONS = {
  auth: [
    { name: 'login', lambdaName: 'OJT-Auth-Login' },
    { name: 'signup', lambdaName: 'OJT-Auth-Signup' },
    { name: 'me', lambdaName: 'OJT-Auth-Me' }
  ],
  products: [
    { name: 'getProducts', lambdaName: 'OJT-Products-GetProducts' },
    { name: 'getBestSelling', lambdaName: 'OJT-Products-BestSelling' },
    { name: 'getNewest', lambdaName: 'OJT-Products-Newest' },
    { name: 'searchProducts', lambdaName: 'OJT-Products-Search' }
  ]
};

/**
 * Deploy a Lambda function ZIP file
 */
function deployFunction(category, func) {
  const zipPath = path.join(__dirname, '..', 'build', category, `${func.name}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    console.error(`❌ ZIP file not found: ${zipPath}`);
    console.log('   Run "npm run build" first');
    return false;
  }

  try {
    console.log(`📤 Deploying ${func.lambdaName}...`);
    
    const command = `aws lambda update-function-code --function-name ${func.lambdaName} --zip-file fileb://${zipPath} --region ${process.env.AWS_REGION || 'ap-southeast-1'}`;
    
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Deployed ${func.lambdaName}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to deploy ${func.lambdaName}:`, error.message);
    return false;
  }
}

/**
 * Deploy Lambda functions
 */
async function deploy() {
  console.log('🚀 Deploying Lambda functions to AWS...\n');

  // Check AWS credentials
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ AWS credentials not configured');
    console.log('   Run: aws configure');
    process.exit(1);
  }

  // Check if build exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found');
    console.log('   Run: npm run build');
    process.exit(1);
  }

  try {
    // Determine which categories to deploy
    const categories = target ? [target] : Object.keys(FUNCTIONS);

    let successCount = 0;
    let failCount = 0;

    for (const category of categories) {
      if (!FUNCTIONS[category]) {
        console.error(`❌ Unknown category: ${category}`);
        process.exit(1);
      }

      console.log(`📦 Deploying ${category} functions...\n`);
      
      for (const func of FUNCTIONS[category]) {
        const success = deployFunction(category, func);
        if (success) successCount++;
        else failCount++;
      }
    }

    console.log('━'.repeat(50));
    console.log(`✅ Deployment complete!`);
    console.log(`   Success: ${successCount} functions`);
    if (failCount > 0) {
      console.log(`   Failed: ${failCount} functions`);
    }
    console.log('\nTest your API endpoints now!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
