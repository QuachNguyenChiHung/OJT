# 🎯 OJT E-commerce Platform - Serverless Architecture

## 📂 Project Structure

Dự án được tách thành **2 repositories riêng biệt**:

```
OJT/
├── OJT_infrastructure/      # CDK Infrastructure (TypeScript)
│   └── Deploy AWS resources: VPC, RDS, S3, API Gateway, etc.
│
└── OJT_lambda/             # Lambda Functions (JavaScript)
    └── Application code cho API endpoints
```

## 🎭 Why 2 Separate Projects?

### ❌ Vấn đề khi merge:
- CDK phải build Lambda dependencies mỗi lần deploy
- Lỗi dependency resolution
- Deploy chậm (10+ phút)
- Không thể update Lambda code độc lập

### ✅ Lợi ích khi tách:
- **CDK deploy nhanh**: Chỉ deploy infrastructure (5 phút)
- **Lambda update nhanh**: Chỉ update code (30 giây)
- **Không lỗi dependency**: CDK không build Lambda code
- **Clear separation**: Infrastructure vs Application code
- **CI/CD friendly**: Deploy riêng từng phần

---

## 🚀 Quick Start Guide

### 1️⃣ Deploy Infrastructure (CDK)

```bash
# Navigate to infrastructure project
cd OJT_infrastructure

# Install dependencies
npm install

# Configure AWS
cp .env.example .env
# Edit .env with your AWS account ID

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy infrastructure
npm run deploy:core      # VPC, RDS, S3, Cognito (8 phút)
npm run deploy:api       # API Gateway + Placeholder Lambda (2 phút)
```

**Output:** Note API Gateway URL và Lambda function names

### 2️⃣ Deploy Lambda Functions

```bash
# Navigate to Lambda project
cd ../OJT_lambda

# Install dependencies
npm install
npm run install:all

# Configure (sử dụng Lambda function names từ CDK output)
cp .env.example .env
# Edit .env

# Build Lambda packages
npm run build

# Deploy to AWS
npm run deploy          # Deploy all functions (1 phút)
```

**✅ Done!** API sẵn sàng sử dụng.

---

## 📋 Project Comparison

| Aspect | OJT_infrastructure | OJT_lambda |
|--------|-------------------|------------|
| **Language** | TypeScript | JavaScript |
| **Purpose** | Infrastructure as Code | Application logic |
| **Deploy to** | CloudFormation | Lambda functions |
| **Deploy time** | 5-10 minutes | 30 seconds - 2 minutes |
| **Update frequency** | Low (khi thay đổi infrastructure) | High (khi update logic) |
| **Dependencies** | AWS CDK | bcryptjs, jsonwebtoken, etc. |

---

## 🔄 Common Workflows

### Update Lambda Code

```bash
cd OJT_lambda

# 1. Edit code
vim auth/login.js

# 2. Rebuild
npm run build:auth

# 3. Deploy
npm run deploy:auth

# ⏱️ 30 giây
```

### Add New API Endpoint

```bash
# 1. Update infrastructure (thêm route mới)
cd OJT_infrastructure
vim lib/stacks/api-stack.ts
npm run deploy:api

# 2. Create Lambda function
cd ../OJT_lambda
vim products/createProduct.js

# 3. Update build script
vim scripts/build-lambda.js

# 4. Build & deploy
npm run build:products
npm run deploy:products
```

### Update Database Schema

```bash
# 1. Update RDS
# Run migration scripts

# 2. Update Lambda code (nếu cần)
cd OJT_lambda
vim products/getProducts.js
npm run build
npm run deploy
```

---

## 📖 Documentation Links

### OJT_infrastructure (CDK)
- [README.md](OJT_infrastructure/README.md) - Full infrastructure guide
- [ARCHITECTURE_REPORT.md](OJT_infrastructure/ARCHITECTURE_REPORT.md) - Architecture overview
- [DEPLOYMENT_CONFIG_SUMMARY.md](OJT_infrastructure/DEPLOYMENT_CONFIG_SUMMARY.md) - Deployment strategy

### OJT_lambda (Functions)
- [README.md](OJT_lambda/README.md) - **⭐ START HERE for Lambda deployment**
- Includes: build scripts, deploy scripts, testing guide

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CloudFront (CDN)                    │
│                  (Frontend Distribution)                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                  API Gateway (REST API)                 │
│              https://xxx.execute-api...                 │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼──────┐                 ┌──────▼──────┐
│   Lambda     │                 │   Lambda     │
│  Functions   │                 │  Functions   │
│  (Auth)      │                 │  (Products)  │
└──────┬───────┘                 └──────┬───────┘
       │                               │
       └───────────────┬───────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼──────┐                 ┌──────▼──────┐
│  RDS SQL     │                 │  S3 Buckets │
│  Server      │                 │  (Images)   │
│  (Database)  │                 │             │
└──────────────┘                 └─────────────┘
```

**Deployed by OJT_infrastructure (CDK):**
- VPC with public/private subnets
- RDS SQL Server Express 2019
- S3 buckets (images + frontend)
- API Gateway REST API
- Lambda functions (placeholder code)
- CloudFront distribution
- CloudWatch monitoring

**Deployed by OJT_lambda:**
- Lambda function code (actual logic)

---

## 🎯 Deployment Strategy

### Infrastructure (CDK)
```bash
# Deploy once, update rarely
cd OJT_infrastructure
npm run deploy:core      # VPC, Database, Storage
npm run deploy:api       # API Gateway
```

**When to redeploy:**
- Change VPC configuration
- Add new API routes
- Modify RDS settings
- Update security groups

### Lambda Code
```bash
# Deploy frequently
cd OJT_lambda
npm run deploy
```

**When to redeploy:**
- Fix bugs in business logic
- Add new features
- Update API responses
- Change database queries

---

## 📊 Cost Estimate

| Service | Configuration | Monthly Cost (estimate) |
|---------|--------------|------------------------|
| RDS SQL Server | t3.small | ~$100 |
| Lambda | 1M requests | ~$0.20 |
| API Gateway | 1M requests | ~$3.50 |
| S3 | 10GB storage | ~$0.23 |
| CloudFront | 10GB transfer | ~$0.85 |
| **Total** | | **~$105/month** |

**Free tier eligible:**
- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free (12 months)
- S3: 5GB storage free (12 months)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
   - Use `.env.example` as template
   - Add `.env` to `.gitignore`

2. **Rotate secrets regularly**
   - JWT_SECRET
   - Database passwords (in Secrets Manager)

3. **Use least-privilege IAM roles**
   - Lambda execution roles
   - API Gateway permissions

4. **Enable CloudWatch Logs**
   - Monitor Lambda invocations
   - Set up alarms for errors

---

## 🐛 Troubleshooting

### CDK Deploy fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check CDK version
cdk --version

# Clean and rebuild
rm -rf node_modules cdk.out
npm install
cdk synth
```

### Lambda Deploy fails
```bash
# Check function exists
aws lambda list-functions | grep OJT-

# Check ZIP file created
ls -lh build/

# Rebuild and redeploy
npm run clean
npm run build
npm run deploy
```

### API returns placeholder response
```bash
# Lambda code chưa deploy
cd OJT_lambda
npm run deploy
```

---

## 📞 Support

- **Infrastructure issues**: Check [OJT_infrastructure/README.md](OJT_infrastructure/README.md)
- **Lambda issues**: Check [OJT_lambda/README.md](OJT_lambda/README.md)
- **Architecture questions**: Check [ARCHITECTURE_REPORT.md](OJT_infrastructure/ARCHITECTURE_REPORT.md)

---

**Version**: 2.0 (Separated Architecture)  
**Last Updated**: December 2025  
**AWS Region**: ap-southeast-1 (Singapore)
