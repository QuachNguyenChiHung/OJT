# 🚀 OJT Lambda Functions

AWS Lambda functions for OJT E-commerce API - **Completely separate from CDK infrastructure**.

## 📁 Project Structure

```
OJT_lambda/
├── shared/              # Shared utilities
│   ├── database.js      # RDS Data API client
│   ├── auth.js          # JWT utilities
│   ├── response.js      # API response formatters
│   └── package.json
├── auth/                # Authentication functions
│   ├── login.js
│   ├── signup.js
│   ├── me.js
│   └── package.json
├── products/            # Product functions
│   ├── getProducts.js
│   ├── getBestSelling.js
│   ├── getNewest.js
│   ├── searchProducts.js
│   └── package.json
├── scripts/
│   ├── build-lambda.js  # Build ZIP files
│   ├── deploy-lambda.js # Deploy to AWS
│   └── clean.js         # Clean build artifacts
└── build/               # Generated ZIP files (gitignored)
```

## 🎯 Workflow

### **CDK Infrastructure (OJT_infrastructure/)** vs **Lambda Code (OJT_lambda/)**

| Aspect | CDK Project | Lambda Project |
|--------|-------------|----------------|
| **Purpose** | Infrastructure (VPC, RDS, S3, API Gateway) | Application code |
| **Language** | TypeScript | JavaScript |
| **Deploy to** | CloudFormation | AWS Lambda directly |
| **Dependencies** | CDK libraries | bcryptjs, jsonwebtoken, etc. |
| **Deploy time** | 5-10 minutes | 1-2 minutes |

### **Deployment Flow:**

```
┌─────────────────────┐      ┌──────────────────────┐
│  OJT_infrastructure │      │     OJT_lambda       │
│                     │      │                      │
│  1. CDK Deploy      │─────▶│  2. Build & Deploy   │
│     (Infrastructure)│      │     (Application)    │
└─────────────────────┘      └──────────────────────┘
         │                              │
         ▼                              ▼
    API Gateway                   Lambda Functions
    RDS, S3, etc.                 (with real logic)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install build tools
npm install

# Install Lambda dependencies
npm run install:all

# Or install individually
npm run install:shared
npm run install:auth
npm run install:products
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# Get these from CDK outputs
notepad .env
```

Required values:
- `AWS_REGION`: Your AWS region
- `AWS_ACCOUNT_ID`: Your AWS account ID
- `LAMBDA_CODE_BUCKET`: S3 bucket for Lambda code (optional)
- Lambda function names (e.g., `OJT-Auth-Login`)

### 3. Build Lambda Packages

```bash
# Build all functions
npm run build

# Build specific category
npm run build:auth
npm run build:products
```

This creates ZIP files in `build/` directory:
- `build/auth/login.zip`
- `build/auth/signup.zip`
- `build/products/getProducts.zip`
- etc.

### 4. Deploy to AWS

```bash
# Deploy all functions
npm run deploy

# Deploy specific category
npm run deploy:auth
npm run deploy:products
```

### 5. Test API

```bash
# Get API URL from CDK outputs
# Test signup
curl https://YOUR-API-URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'

# Test login
curl https://YOUR-API-URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 📝 Common Tasks

### Update Lambda Code

```bash
# 1. Edit function
vim auth/login.js

# 2. Rebuild
npm run build:auth

# 3. Deploy
npm run deploy:auth

# ⏱️ Takes ~1 minute
```

### Add New Lambda Function

```bash
# 1. Create function file
vim products/createProduct.js

# 2. Update scripts/build-lambda.js
# Add 'createProduct' to FUNCTIONS.products array

# 3. Update scripts/deploy-lambda.js
# Add mapping to Lambda function name

# 4. Build and deploy
npm run build:products
npm run deploy:products
```

### Clean Build Artifacts

```bash
npm run clean
```

## 🔧 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build all Lambda ZIP files |
| `npm run build:auth` | Build auth functions only |
| `npm run build:products` | Build products functions only |
| `npm run deploy` | Deploy all functions to AWS |
| `npm run deploy:auth` | Deploy auth functions only |
| `npm run deploy:products` | Deploy products functions only |
| `npm run clean` | Remove build/ directory |

## 🏗️ Architecture

### Lambda Function Structure

Each Lambda function follows this pattern:

```javascript
// Import shared utilities
const { getDbConnection } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { success, error } = require('../shared/response');

exports.handler = async (event) => {
  try {
    // 1. Parse input
    const body = JSON.parse(event.body || '{}');
    
    // 2. Validate
    if (!body.email) {
      return error('Email is required', 400);
    }
    
    // 3. Business logic
    const db = await getDbConnection();
    const result = await db.query('SELECT * FROM Users WHERE email = ?', [body.email]);
    
    // 4. Return response
    return success(result);
    
  } catch (err) {
    console.error('Error:', err);
    return error('Internal server error', 500);
  }
};
```

### Shared Utilities

**database.js** - RDS Data API client:
```javascript
const { getDbConnection } = require('../shared/database');
const db = await getDbConnection();
const users = await db.query('SELECT * FROM Users');
```

**auth.js** - JWT utilities:
```javascript
const { generateToken, verifyToken } = require('../shared/auth');
const token = generateToken({ userId: 123 });
const payload = verifyToken(token);
```

**response.js** - API responses:
```javascript
const { success, error } = require('../shared/response');
return success({ message: 'OK' });
return error('Not found', 404);
```

## 🔐 Environment Variables

Lambda functions use these environment variables (set by CDK):

- `DB_SECRET_ARN`: RDS credentials in Secrets Manager
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT signing key
- `S3_IMAGES_BUCKET`: S3 bucket for images
- `AWS_REGION`: AWS region (auto-provided)

## 📊 Monitoring

### CloudWatch Logs

```bash
# View logs for specific function
aws logs tail /aws/lambda/OJT-Auth-Login --follow

# View all Lambda logs
aws logs tail /aws/lambda/OJT- --follow
```

### Lambda Metrics

Check in AWS Console → Lambda → Functions → Monitoring:
- Invocations
- Duration
- Errors
- Throttles

## 🐛 Troubleshooting

### Build fails

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules shared/node_modules auth/node_modules products/node_modules
npm run install:all
npm run build
```

### Deploy fails - Function not found

```bash
# Check function names match
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `OJT-`)].FunctionName'

# Update function names in scripts/deploy-lambda.js
```

### Deploy fails - Access denied

```bash
# Check AWS credentials
aws sts get-caller-identity

# Configure if needed
aws configure
```

### Lambda returns placeholder response

```bash
# You need to deploy Lambda code
npm run build
npm run deploy
```

## 📚 Best Practices

### 1. **Keep shared code DRY**
- Put common logic in `shared/`
- Import in functions as needed

### 2. **Test locally before deploy**
```bash
node -e "const handler = require('./auth/login.js').handler; handler({body: JSON.stringify({email: 'test@test.com', password: 'test123'})}).then(console.log)"
```

### 3. **Use specific deploys**
- `npm run deploy:auth` faster than `npm run deploy`
- Only deploy what changed

### 4. **Version control**
- Git tag releases
- Keep ZIP files in .gitignore
- Document API changes

### 5. **Security**
- Never commit `.env` file
- Rotate JWT secrets regularly
- Use least-privilege IAM roles

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Lambda

on:
  push:
    paths:
      - 'OJT_lambda/**'
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd OJT_lambda
          npm install
          npm run install:all
      
      - name: Build
        run: |
          cd OJT_lambda
          npm run build
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1
      
      - name: Deploy
        run: |
          cd OJT_lambda
          npm run deploy
```

## 📖 Related Documentation

- [CDK Infrastructure README](../OJT_infrastructure/README.md)
- [API Documentation](./API.md)
- [Architecture Overview](../OJT_infrastructure/ARCHITECTURE_REPORT.md)

---

**Questions?** Check the [OJT_infrastructure README](../OJT_infrastructure/README.md) for full deployment guide.
