# OJT E-commerce Frontend

React + Vite frontend cho OJT E-commerce Platform.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## 📦 Deploy to AWS S3 + CloudFront

### Prerequisites
1. AWS CLI đã cài đặt và cấu hình (`aws configure`)
2. CDK Infrastructure đã deploy (OJT_infrastructure)
3. Có quyền S3 và CloudFronts

### Step 1: Cấu hình .env

Sau khi deploy CDK, lấy output values và cập nhật `.env`:

```bash
# Lấy S3 bucket name từ CDK output
S3_BUCKET=ojt-ecommerce-frontend-<account-id>

# Lấy CloudFront Distribution ID từ CDK output  
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXX

# API Gateway URL (từ ApiStack output)
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/prod
```

### Step 2: Build và Deploy

```bash
# Build + Deploy to S3 + Invalidate CloudFront
npm run deploy
```

Hoặc từng bước:
```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Step 3: Thêm Bucket Policy cho CloudFront OAC

Sau khi deploy FrontendStack, cần thêm bucket policy (lấy từ CDK output `RequiredBucketPolicy`).

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + Deploy to S3 |
| `npm run deploy:invalidate` | Invalidate CloudFront cache only |

## 📁 Project Structure

```
OJT_frontendDev/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   └── App.jsx       # Main app
├── scripts/
│   ├── deploy-s3.js          # S3 deploy script
│   └── invalidate-cloudfront.js  # CloudFront invalidation
├── .env              # Environment variables
└── vite.config.js    # Vite configuration
```

## 🌐 URLs sau khi Deploy

- **S3 Website**: `http://BUCKET.s3-website-ap-southeast-1.amazonaws.com`
- **CloudFront (HTTPS)**: `https://DISTRIBUTION_ID.cloudfront.net`

## ⚠️ Lưu ý

1. **VITE_API_URL**: Phải đổi sang API Gateway URL khi deploy production
2. **CORS**: API Gateway đã cấu hình CORS cho tất cả origins
3. **Cache**: 
   - HTML files: no-cache (luôn fresh)
   - JS/CSS files: 1 year cache (có hash trong filename)
4. **CloudFront Invalidation**: Mất 5-10 phút để propagate globally
