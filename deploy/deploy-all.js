#!/usr/bin/env node
/**
 * Deploy All - Complete deployment script
 * Deploys Layer + All 11 Lambda Modules in one command
 * 
 * Usage: node deploy-all.js
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 OJT E-commerce - Full Lambda Deployment');
console.log('═'.repeat(50));
console.log('This will deploy:');
console.log('  1. Lambda Layer (shared dependencies)');
console.log('  2. All 11 Lambda Modules');
console.log('═'.repeat(50));
console.log('');

const deployDir = __dirname;

try {
  // Step 1: Deploy Layer
  console.log('📦 Step 1/2: Deploying Lambda Layer...\n');
  execSync(`node "${path.join(deployDir, 'deploy-layer.js')}"`, { 
    stdio: 'inherit',
    cwd: deployDir 
  });

  console.log('\n');

  // Step 2: Deploy Modules
  console.log('📦 Step 2/2: Deploying Lambda Modules...\n');
  execSync(`node "${path.join(deployDir, 'deploy-modules.js')}"`, { 
    stdio: 'inherit',
    cwd: deployDir 
  });

  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Full deployment completed successfully!');
  console.log('═'.repeat(50));
  console.log('\nNext steps:');
  console.log('  1. Test API endpoints');
  console.log('  2. Check CloudWatch logs for any errors');
  console.log('  3. Deploy frontend when ready');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
