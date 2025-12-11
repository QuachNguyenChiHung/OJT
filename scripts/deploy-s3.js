/**
 * Deploy Frontend to S3 + CloudFront
 * 
 * Cách sử dụng:
 * 1. Build frontend: npm run build
 * 2. Deploy: npm run deploy
 * 
 * Hoặc chạy trực tiếp: node scripts/deploy-s3.js
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, '../.env');
let env = {};
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
}

// Configuration - Lấy từ .env hoặc dùng default
const config = {
  S3_BUCKET: env.S3_BUCKET || env.VITE_S3_BUCKET || 'ojt-ecommerce-frontend',
  CLOUDFRONT_DISTRIBUTION_ID: env.CLOUDFRONT_DISTRIBUTION_ID || env.VITE_CLOUDFRONT_DISTRIBUTION_ID || '',
  AWS_REGION: env.AWS_REGION || env.VITE_AWS_REGION || 'ap-southeast-1',
  BUILD_DIR: resolve(__dirname, '../dist'),
};

console.log('🚀 Starting Frontend Deployment to AWS S3...\n');
console.log('📋 Configuration:');
console.log(`   S3 Bucket: ${config.S3_BUCKET}`);
console.log(`   CloudFront ID: ${config.CLOUDFRONT_DISTRIBUTION_ID || 'Not configured'}`);
console.log(`   AWS Region: ${config.AWS_REGION}`);
console.log(`   Build Directory: ${config.BUILD_DIR}\n`);

// Check if build directory exists
if (!existsSync(config.BUILD_DIR)) {
  console.error('❌ Build directory not found! Run "npm run build" first.');
  process.exit(1);
}

try {
  // Step 1: Sync to S3
  console.log('📤 Step 1: Uploading to S3...');
  const s3SyncCmd = `aws s3 sync "${config.BUILD_DIR}" "s3://${config.S3_BUCKET}" --delete --region ${config.AWS_REGION}`;
  console.log(`   Command: ${s3SyncCmd}\n`);
  execSync(s3SyncCmd, { stdio: 'inherit' });
  console.log('✅ S3 upload completed!\n');

  // Step 2: Set cache headers for different file types
  console.log('📝 Step 2: Setting cache headers...');
  
  // HTML files - no cache (always fresh)
  execSync(`aws s3 cp "s3://${config.S3_BUCKET}" "s3://${config.S3_BUCKET}" --recursive --exclude "*" --include "*.html" --metadata-directive REPLACE --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html" --region ${config.AWS_REGION}`, { stdio: 'inherit' });
  
  // JS/CSS files - long cache (hashed filenames)
  execSync(`aws s3 cp "s3://${config.S3_BUCKET}/assets" "s3://${config.S3_BUCKET}/assets" --recursive --metadata-directive REPLACE --cache-control "public, max-age=31536000, immutable" --region ${config.AWS_REGION}`, { stdio: 'inherit' });
  
  console.log('✅ Cache headers set!\n');

  // Step 3: Invalidate CloudFront cache (if configured)
  if (config.CLOUDFRONT_DISTRIBUTION_ID) {
    console.log('🔄 Step 3: Invalidating CloudFront cache...');
    const invalidateCmd = `aws cloudfront create-invalidation --distribution-id ${config.CLOUDFRONT_DISTRIBUTION_ID} --paths "/*" --region ${config.AWS_REGION}`;
    console.log(`   Command: ${invalidateCmd}\n`);
    execSync(invalidateCmd, { stdio: 'inherit' });
    console.log('✅ CloudFront invalidation created!\n');
  } else {
    console.log('⚠️  Step 3: Skipping CloudFront invalidation (not configured)\n');
  }

  console.log('🎉 Deployment completed successfully!\n');
  console.log('📌 Next steps:');
  console.log(`   - S3 URL: http://${config.S3_BUCKET}.s3-website-${config.AWS_REGION}.amazonaws.com`);
  if (config.CLOUDFRONT_DISTRIBUTION_ID) {
    console.log(`   - CloudFront: Check AWS Console for distribution URL`);
  }

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.error('\n📋 Troubleshooting:');
  console.error('   1. Ensure AWS CLI is installed and configured');
  console.error('   2. Check AWS credentials: aws configure list');
  console.error('   3. Verify S3 bucket exists and you have permissions');
  console.error('   4. Check .env file has correct values');
  process.exit(1);
}
