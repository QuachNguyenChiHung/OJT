/**
 * Invalidate CloudFront Cache
 * 
 * Sử dụng khi cần clear cache mà không deploy lại
 * Command: npm run deploy:invalidate
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

const CLOUDFRONT_DISTRIBUTION_ID = env.CLOUDFRONT_DISTRIBUTION_ID || env.VITE_CLOUDFRONT_DISTRIBUTION_ID;
const AWS_REGION = env.AWS_REGION || env.VITE_AWS_REGION || 'ap-southeast-1';

if (!CLOUDFRONT_DISTRIBUTION_ID) {
  console.error('❌ CLOUDFRONT_DISTRIBUTION_ID not found in .env file');
  console.error('   Add: CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id');
  process.exit(1);
}

console.log('🔄 Invalidating CloudFront cache...');
console.log(`   Distribution ID: ${CLOUDFRONT_DISTRIBUTION_ID}`);

try {
  const cmd = `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*" --region ${AWS_REGION}`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('\n✅ CloudFront cache invalidation created!');
  console.log('   Note: Invalidation may take 5-10 minutes to complete globally.');
} catch (error) {
  console.error('\n❌ Failed to invalidate cache:', error.message);
  process.exit(1);
}
