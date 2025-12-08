# 🚀 OJT E-commerce - AWS CDK Infrastructure (Serverless)

## 📋 Tổng Quan

Dự án infrastructure AWS CDK hoàn toàn **serverless** thay thế Spring Boot bằng Lambda functions.

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND TIER                             │
│  React App → S3 Static Hosting → CloudFront → Users         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     API TIER                                 │
│  API Gateway → Lambda Functions (Node.js)                   │
│    ├── Auth (Login, Signup, Me)                             │
│    ├── Products (CRUD, Search, Best-selling)                │
│    ├── Cart (Add, Update, Delete)                           │
│    └── Orders (Create, List, Update)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES TIER                              │
│  ├── RDS SQL Server (Database)                              │
│  ├── S3 (Image Storage)                                     │
│  ├── Bedrock (AI Chatbot)                                   │
│  ├── Cognito (Authentication - Optional)                    │
│  └── Secrets Manager (Credentials)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  MONITORING TIER                             │
│  CloudWatch Logs + Metrics + Alarms + X-Ray                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Cấu Trúc Dự Án

```
OJT_infrastructure/             # ← CDK Infrastructure Project
├── bin/
│   └── infrastructure.ts          # CDK App entry point
├── lib/
│   ├── stacks/
│   │   ├── network-stack.ts       # VPC, Subnets, Security Groups
│   │   ├── auth-stack.ts          # Cognito User Pool & Identity Pool
│   │   ├── database-stack.ts      # RDS SQL Server + Secrets Manager
│   │   ├── storage-stack.ts       # S3 Buckets (Images + Frontend)
│   │   ├── api-stack.ts           # API Gateway + Lambda (placeholder)
│   │   ├── frontend-stack.ts      # CloudFront Distribution
│   │   └── monitoring-stack.ts    # CloudWatch Dashboard & Alarms
│   └── constructs/                # Reusable CDK constructs
├── package.json
├── cdk.json
├── tsconfig.json
├── .env.example
└── README.md

OJT_lambda/                     # ← Lambda Code Project (SEPARATE!)
├── shared/                        # Shared utilities
│   ├── database.js               # RDS Data API helper
│   ├── auth.js                   # JWT utilities
│   ├── response.js               # Response formatters
│   └── package.json
├── auth/                         # Authentication functions
│   ├── login.js                  # POST /auth/login
│   ├── signup.js                 # POST /auth/signup
│   ├── me.js                     # GET /auth/me
│   └── package.json
├── products/                     # Product functions
│   ├── getProducts.js            # GET /products
│   ├── getBestSelling.js         # GET /products/best-selling
│   ├── getNewest.js              # GET /products/newest
│   ├── searchProducts.js         # GET /products/search
│   └── package.json
├── scripts/
│   ├── build-lambda.js           # Build ZIP packages
│   ├── deploy-lambda.js          # Deploy to AWS
│   └── clean.js
├── package.json
└── README.md
```

## 🔧 Cài Đặt

### 1. Cài đặt dependencies

```bash
cd OJT_infrastructure
npm install
```

### 2. Cài đặt AWS CDK CLI (nếu chưa có)

```powershell
npm install -g aws-cdk
```

### 3. Cấu hình môi trường

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your values
```

### 4. Cấu hình AWS Credentials

```powershell
aws configure
# Nhập AWS Access Key ID
# Nhập AWS Secret Access Key
# Region: ap-southeast-1
```

### 5. Bootstrap CDK (chỉ chạy 1 lần)

```bash
cdk bootstrap aws://ACCOUNT-ID/ap-southeast-1
```

## 📦 Lambda Functions

⚠️ **Lambda code đã được tách ra project riêng: `../OJT_lambda/`**

Lambda functions giờ được quản lý và deploy **hoàn toàn độc lập** với CDK infrastructure.

**Lợi ích:**
- ✅ CDK deploy nhanh hơn (không build Lambda code)
- ✅ Không lỗi dependency khi CDK build
- ✅ Update Lambda code dễ dàng và nhanh chóng
- ✅ Tách biệt infrastructure code và application code

### Cấu Trúc Lambda (trong OJT_lambda/)

```
OJT_lambda/                  # ← Separate project!
├── shared/                  # Shared utilities
│   ├── database.js         # RDS Data API helpers
│   ├── auth.js             # JWT utilities
│   ├── response.js         # Response formatters
│   └── package.json
├── auth/                   # Authentication functions
│   ├── login.js
│   ├── signup.js
│   ├── me.js
│   └── package.json
├── products/               # Product functions
│   ├── getProducts.js
│   ├── getBestSelling.js
│   ├── getNewest.js
│   ├── searchProducts.js
│   └── package.json
├── scripts/
│   ├── build-lambda.js     # Build ZIP packages
│   ├── deploy-lambda.js    # Deploy to AWS
│   └── clean.js
└── package.json            # Lambda project config
```

**👉 Xem [OJT_lambda/README.md](../OJT_lambda/README.md) để deploy Lambda functions**

## 🚀 Deployment

### ⚡ Quick Deployment (2-Project Process)

**CDK Infrastructure** (OJT_infrastructure) và **Lambda Code** (OJT_lambda) là **2 projects riêng biệt**.

#### **Bước 1: Deploy CDK Infrastructure** (5-10 phút)

```bash
# Trong OJT_infrastructure/
npm install

# Bootstrap CDK (lần đầu)
cdk bootstrap

# Deploy infrastructure
npm run deploy:core      # VPC, RDS, S3, Cognito
npm run deploy:api       # API Gateway + Lambda (placeholder code)

# Optional
npm run deploy:frontend     # CloudFront
npm run deploy:monitoring   # CloudWatch
```

**Outputs:** Note Lambda function names từ CDK outputs (dùng cho step 2)

#### **Bước 2: Deploy Lambda Code** (1-2 phút)

```bash
# Navigate to Lambda project
cd ../OJT_lambda

# Install dependencies
npm install
npm run install:all

# Configure environment
cp .env.example .env
# Edit .env với Lambda function names từ CDK outputs

# Build Lambda packages
npm run build

# Deploy to AWS
npm run deploy
```

**✅ Done!** API hoạt động với Lambda code thực.

**👉 Chi tiết Lambda deployment: [OJT_lambda/README.md](../OJT_lambda/README.md)**

### 📋 CDK Deployment Commands

**Infrastructure only** (trong OJT_infrastructure/):

```bash
npm run deploy:core          # VPC + Database + Storage + Auth
npm run deploy:api           # API Gateway + Placeholder Lambda
npm run deploy:frontend      # CloudFront distribution
npm run deploy:monitoring    # CloudWatch dashboard
npm run deploy              # Deploy all stacks
```

**Lambda Code** (trong OJT_lambda/):

```bash
npm run build               # Build all Lambda packages
npm run deploy              # Deploy all functions
npm run deploy:auth         # Auth functions only
npm run deploy:products     # Products functions only
```

### 🔄 Update Workflow

**Update Lambda Code:**
```bash
# Trong OJT_lambda/
vim auth/login.js          # Sửa code

npm run build:auth         # Build lại
npm run deploy:auth        # Deploy (30 giây)
```

**Update Infrastructure:**
```bash
# Trong OJT_infrastructure/
vim lib/stacks/api-stack.ts   # Sửa infrastructure

npm run build              # Compile TypeScript
npm run deploy:api         # Deploy stack (3-5 phút)
```

### 📖 Chi Tiết

- **Lambda Deployment Guide**: [OJT_lambda/README.md](../OJT_lambda/README.md) ⭐ **Read this for Lambda deployment**
- **Architecture Overview**: [ARCHITECTURE_REPORT.md](ARCHITECTURE_REPORT.md)
- **Deployment Config Summary**: [DEPLOYMENT_CONFIG_SUMMARY.md](DEPLOYMENT_CONFIG_SUMMARY.md)

## 🔗 API Endpoints

Sau khi deploy, API Gateway URL sẽ được output:

```
https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev/
```

### Auth APIs

```
POST /auth/login        # Login
POST /auth/signup       # Register
GET  /auth/me           # Get current user
```

### Products APIs

```
GET /products                 # Get all products
GET /products/best-selling    # Top selling
GET /products/newest          # Newest products
GET /products/search?q=...    # Search products
```

## 🌐 Frontend Deployment

### 1. Build React app

```bash
cd ../OJT_frontendDev
npm run build
```

### 2. Update API URL trong .env

```env
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
```

### 3. Deploy to S3 + CloudFront

```bash
# Get bucket name from CDK output
aws s3 sync dist/ s3://ojt-dev-frontend/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXXXXX \
  --paths "/*"
```

## 📊 Monitoring & Logs

### CloudWatch Dashboard

```
https://console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=OJT-dev-Dashboard
```

### Lambda Logs

```bash
# View logs của một function
aws logs tail /aws/lambda/OJT-dev-LoginFunction --follow
```

### API Gateway Logs

```bash
aws logs tail /aws/apigateway/OJT-dev-API --follow
```

## 🗑️ Destroy Infrastructure

```bash
# Destroy all stacks
npm run destroy

# Or destroy individual stacks
cdk destroy OJT-MonitoringStack
cdk destroy OJT-FrontendStack
cdk destroy OJT-ApiStack
cdk destroy OJT-DatabaseStack
cdk destroy OJT-AuthStack
cdk destroy OJT-StorageStack
cdk destroy OJT-NetworkStack
```

## 💰 Chi Phí Ước Tính (Hàng Tháng)

| Service | Usage | Cost (USD) |
|---------|-------|------------|
| API Gateway | 1M requests | $3.50 |
| Lambda | 1M invocations, 512MB, 1s avg | $2.50 |
| RDS SQL Server (t3.small) | 24/7 | $40 |
| S3 Storage | 10GB | $0.25 |
| S3 Requests | 100k GET, 10k PUT | $0.50 |
| CloudFront | 10GB data transfer | $1.00 |
| NAT Gateway | 1 instance | $32 |
| CloudWatch Logs | 5GB | $2.50 |
| **TOTAL** | | **~$82/month** |

## 🔐 Security Best Practices

- ✅ RDS trong private subnet
- ✅ Secrets Manager cho database credentials
- ✅ JWT authentication
- ✅ HTTPS only (CloudFront)
- ✅ CORS configured
- ✅ IAM roles với least privilege
- ✅ VPC Flow Logs enabled
- ✅ CloudWatch monitoring & alarms

## 📝 Environment Variables

```env
# AWS
AWS_ACCOUNT_ID=123456789012
AWS_REGION=ap-southeast-1

# Application
APP_NAME=OJT
ENVIRONMENT=dev

# Database
DB_NAME=demoaws
DB_USERNAME=admin
DB_PASSWORD=YourSecurePassword123!

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Bedrock
BEDROCK_AGENT_ID=N5NDKT3J5I
BEDROCK_AGENT_ALIAS_ID=MYWIN33OEP

# Monitoring
ALARM_EMAIL=your-email@example.com
```

## 🆘 Troubleshooting

### Lambda cold start chậm?
- Tăng memory allocation
- Sử dụng Provisioned Concurrency
- Optimize dependencies

### RDS connection timeout?
- Check security groups
- Verify Lambda trong VPC
- Check subnet routing

### 4XX/5XX errors?
- Check CloudWatch Logs
- Verify IAM permissions
- Check database connection

## 📚 Tài Liệu Tham Khảo

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [RDS Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)

## 👥 Contributors

OJT Team - 2025
