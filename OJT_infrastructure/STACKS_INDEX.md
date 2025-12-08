# 📚 CDK Stacks Documentation - Index

## 🎯 Overview

Tài liệu chi tiết về từng AWS stack trong OJT Infrastructure - **KHÔNG có code cấu hình**, chỉ mô tả services và architecture.

## 💰 **CẤU HÌNH TỐI ƯU CHI PHÍ - $100-500/THÁNG**

**⚡ OPTIMIZED FOR COST EFFICIENCY ⚡**

Cấu hình đã được tối ưu hóa để phù hợp với backend Spring Boot + SQL Server Express, đảm bảo chi phí trong tầm **$45-70/tháng** (tuỳ traffic).

---

## 📋 Stacks List

### 1. [Network Stack](STACK_NETWORK.md) 🌐
**Services:** VPC, Subnets, Internet Gateway, NAT Gateway (1), Security Groups

**Deploy Order:** 1 (Đầu tiên)  
**Deploy Time:** ~5 minutes  
**Monthly Cost:** ~$23 ✅ **OPTIMIZED** (Reduced from $46)

**Key Features:**
- 3-tier architecture (Public/Private/Isolated)
- **1 NAT Gateway** (cost optimized, sufficient cho low-medium traffic)
- Multi-AZ subnets cho high availability
- Security Groups cho isolation

**Cost Optimization:**
- ✅ Reduced NAT Gateways from 2 to 1: **-$23/month**
- Single NAT Gateway is sufficient for development/staging environments
- For production scale-up, có thể thêm NAT Gateway thứ 2

---

### 2. [Database Stack](STACK_DATABASE.md) 🗄️
**Services:** Amazon RDS SQL Server Express, AWS Secrets Manager

**Deploy Order:** 2 (Sau Network)  
**Deploy Time:** ~10-15 minutes  
**Monthly Cost:** ~$15 ✅ **OPTIMIZED** (Reduced from $54)

**Key Features:**
- **SQL Server Express 2019** on **t3.micro** instance
- Deployed in isolated subnets
- Automated backups (**1 day** retention)
- Secrets Manager cho credentials

**Cost Optimization:**
- ✅ Changed instance from t3.small → **t3.micro**: **-$39/month**
- ✅ Reduced backup retention from 7 days → 1 day: **-$2/month**
- t3.micro (1 vCPU, 1GB RAM) đủ cho:
  - Spring Boot backend với HikariCP pool (max 20 connections)
  - Low-medium traffic (< 1000 concurrent users)
  - Database size < 20GB

**⚠️ Lưu ý:** Nếu traffic tăng cao, có thể scale up sang t3.small ($15 → $54/month)

---

### 3. [Storage Stack](STACK_STORAGE.md) 📦
**Services:** Amazon S3 (2 buckets)

**Deploy Order:** 2 (Sau Network, song song với Database)  
**Deploy Time:** ~2 minutes  
**Monthly Cost:** ~$1.25

**Key Features:**
- Images bucket (public read) - Product images
- Frontend bucket (private, CloudFront access)
- CORS configured
- Lifecycle policies

**No changes needed** - Already cost-optimized

---

### 4. [Auth Stack](STACK_AUTH.md) 🔐
**Services:** Amazon Cognito User Pool, Cognito Identity Pool

**Deploy Order:** 2 (Sau Network, song song với Database/Storage)  
**Deploy Time:** ~3 minutes  
**Monthly Cost:** $0 (Free tier)

**Key Features:**
- User registration & login
- Email verification
- JWT tokens
- Custom attributes (role, userId)
- **Optional** (Backend đang dùng custom JWT trong Spring Boot)

**⚠️ Recommendation:** **SKIP stack này** nếu backend đã có JWT authentication
- Saves deployment time
- Backend hiện tại đã implement JWT trong Spring Security
- Chỉ deploy nếu cần Cognito features (social login, MFA, etc.)

---

### 5. [API Stack](STACK_API.md) 🚀
**Services:** API Gateway REST API, AWS Lambda Functions (7), IAM Roles

**Deploy Order:** 3 (Sau Network, Database, Storage)  
**Deploy Time:** ~5 minutes (infrastructure), +1-2 min (Lambda code)  
**Monthly Cost:** ~$2 ✅ **OPTIMIZED** (Reduced from $5)

**Key Features:**
- REST API với CORS
- **7 Lambda functions** với optimized config:
  - **Memory: 128MB** (reduced from default 256MB)
  - **Timeout: 10s** (reduced from 30s)
  - **Log retention: 1 day** (reduced from 7 days)
- VPC integration cho RDS access

**Cost Optimization:**
- ✅ Reduced Lambda memory 256MB → **128MB**: **-$1.5/month**
- ✅ Reduced timeout 30s → **10s**: Faster execution, lower cost
- ✅ Reduced log retention 7 days → **1 day**: **-$1.5/month**
- Lambda 128MB đủ cho:
  - Simple database queries
  - JSON parsing/transformation
  - Auth validation

**Lambda Functions:**
1. Login (auth/login.js)
2. Signup (auth/signup.js)
3. Get User (auth/me.js)
4. Get Products (products/getProducts.js)
5. Best Selling (products/getBestSelling.js)
6. Newest Products (products/getNewest.js)
7. Search Products (products/searchProducts.js)

---

### 6. [Frontend Stack](STACK_FRONTEND.md) 🌍
**Services:** Amazon CloudFront, Origin Access Identity, ACM Certificate (optional)

**Deploy Order:** 4 (Sau Storage)  
**Deploy Time:** ~15 minutes  
**Monthly Cost:** ~$1.50

**Key Features:**
- Global CDN (200+ edge locations)
- HTTPS only
- SPA routing support (error → index.html)
- Compression (gzip, brotli)

**No changes needed** - Already cost-optimized

---

### 7. [Monitoring Stack](STACK_MONITORING.md) 📊
**Services:** CloudWatch Dashboard, CloudWatch Alarms, SNS

**Deploy Order:** 5 (Cuối cùng) - **OPTIONAL**  
**Deploy Time:** ~2 minutes  
**Monthly Cost:** ~$1.50 ✅ **OPTIMIZED** (Reduced from $3.35)

**Key Features:**
- Real-time dashboard
- Essential alarms only (API errors, high latency)
- Email notifications via SNS
- **Reduced log retention** (1 day)

**Cost Optimization:**
- ✅ Reduced alarms from 10+ to 3-5 essential ones: **-$1/month**
- ✅ Log retention già reduced to 1 day: **-$0.85/month**

**⚠️ Recommendation:** **OPTIONAL** - Có thể skip để tiết kiệm thêm $1.50/month

---

## 📊 **OPTIMIZED Cost Summary - Budget $100-500**

### 💚 **Development/Staging Configuration (RECOMMENDED)**

| Stack | Monthly Cost (USD) | Optimization | Status |
|-------|-------------------|--------------|--------|
| Network | ~$23 | 1 NAT Gateway | ✅ OPTIMIZED |
| Database | ~$15 | t3.micro + 1-day backup | ✅ OPTIMIZED |
| Storage | ~$1.25 | Minimal usage | ✅ OK |
| Auth | $0 | **SKIP** (use backend JWT) | ⚠️ OPTIONAL |
| API | ~$2 | 128MB, 10s timeout, 1-day logs | ✅ OPTIMIZED |
| Frontend | ~$1.50 | CloudFront + S3 | ✅ OK |
| Monitoring | ~$1.50 | Essential alarms only | ⚠️ OPTIONAL |
| **TOTAL** | **~$44.25/month** | **Single-AZ** | ✅ **FITS BUDGET** |

**💰 Savings:** ~$67/month (from original $111)

### 📈 **Traffic-based Cost Estimates**

| Traffic Level | Monthly Cost | Recommended Config |
|--------------|--------------|-------------------|
| **Low** (< 100 users/day) | $40-50 | Skip Monitoring, use t3.micro |
| **Medium** (100-1000 users/day) | $50-70 | Add Monitoring, keep t3.micro |
| **High** (> 1000 users/day) | $70-120 | Upgrade to t3.small, add 2nd NAT |

### 🚀 **Production Configuration** (When Ready)

| Stack | Change | Additional Cost |
|-------|--------|----------------|
| Network | Add 2nd NAT Gateway | +$23/month |
| Database | Upgrade t3.micro → t3.small | +$39/month |
| Database | Multi-AZ deployment | +$54/month |
| Database | 7-day backup retention | +$2/month |
| API | Increase Lambda memory to 256MB | +$2/month |
| Monitoring | Full alarm suite | +$2/month |
| **Production Total** | | **~$160-180/month** |

---

## 💡 **Cost Optimization Recommendations**

### ✅ **Immediate Actions (Already Applied)**
1. ✅ Use 1 NAT Gateway instead of 2
2. ✅ Use t3.micro for RDS (sufficient for current backend)
3. ✅ Reduce Lambda memory to 128MB
4. ✅ Reduce log retention to 1 day
5. ✅ Reduce backup retention to 1 day

### 🎯 **Additional Savings (Optional)**
1. **Skip Auth Stack** if using backend JWT: **Save $0** (already free tier)
2. **Skip Monitoring Stack** for development: **Save $1.50/month**
3. **Use Reserved Instances** for RDS (1-year commitment): **Save 30-40%**
4. **Enable S3 Intelligent Tiering**: **Save $0.20-0.50/month**

### 📊 **When to Scale Up**
Scale up when experiencing:
- Database CPU > 70% consistently
- Lambda timeout errors
- NAT Gateway bandwidth saturation
- Storage > 80% capacity

**Free Tier Savings:** ~$40/month (first 12 months) - Already included in estimates above

---

## 🚀 **OPTIMIZED Deployment Order**

```
💰 COST-OPTIMIZED DEPLOYMENT (Budget: $100-500/month)
═══════════════════════════════════════════════════

Step 1: Core Infrastructure (ESSENTIAL)
├── Network Stack        (5 min)  - $23/month  ✅ 1 NAT Gateway
├── Database Stack       (15 min) - $15/month  ✅ t3.micro + 1-day backup
├── Storage Stack        (2 min)  - $1.25/month ✅ S3 for images
└── Auth Stack          (3 min)   - $0/month   ⚠️ OPTIONAL (skip if using backend JWT)

Step 2: API Layer (ESSENTIAL)
└── API Stack            (5 min)  - $2/month   ✅ 128MB Lambda, 1-day logs

Step 3: Lambda Code (ESSENTIAL - Separate Project!)
└── OJT_lambda deploy    (2 min)  - Included in API cost

Step 4: Frontend (ESSENTIAL)
└── Frontend Stack       (15 min) - $1.50/month ✅ CloudFront + S3

Step 5: Monitoring (OPTIONAL - Recommended for Production)
└── Monitoring Stack     (2 min)  - $1.50/month ⚠️ Skip to save cost

═══════════════════════════════════════════════════
TOTAL COST (All stacks):     ~$44/month  ✅ OPTIMIZED
TOTAL COST (Skip optional):  ~$42.75/month ✅ MINIMUM
Total Deployment Time:       ~45-50 minutes
═══════════════════════════════════════════════════
```

### 📝 **Deployment Commands**

```bash
# Step 1: Install dependencies
cd OJT_infrastructure
npm install

# Step 2: Bootstrap CDK (one-time)
cdk bootstrap

# Step 3: Deploy core infrastructure
cdk deploy NetworkStack DatabaseStack StorageStack
# Skip AuthStack if using backend JWT authentication

# Step 4: Deploy API Gateway + Lambda placeholders
cdk deploy ApiStack

# Step 5: Deploy actual Lambda code
cd ../OJT_lambda
npm run deploy:lambda

# Step 6: Deploy Frontend
cd ../OJT_infrastructure
cdk deploy FrontendStack

# Step 7 (Optional): Deploy Monitoring
cdk deploy MonitoringStack

# Verify deployment
cdk list
aws cloudformation describe-stacks --region ap-southeast-1
```

---

## 🔒 **SECURITY CONFIGURATION - CRITICAL**

### **⚠️ Required Before Deployment**

Các cấu hình bảo mật **BẮT BUỘC** phải thiết lập trước khi deploy để tránh lỗi:

#### **1. Environment Variables (.env file)**

**CRITICAL - Must be configured:**

```bash
# AWS Account Configuration
AWS_ACCOUNT_ID=123456789012          # ⚠️ REQUIRED - Replace with your AWS Account ID
AWS_REGION=ap-southeast-1            # ✅ OK - Singapore region

# Application Configuration
APP_NAME=OJT-Ecommerce               # ✅ OK - App prefix for resources

# JWT Authentication (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  # ⚠️ MUST CHANGE
# Recommendation: Use random 256-bit key
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Database Credentials (Auto-generated by Secrets Manager)
DB_NAME=OJT_Ecommerce               # ✅ OK
DB_USERNAME=admin                    # ✅ OK - Can change
DB_PASSWORD=YourStrongPassword123!   # ⚠️ CHANGE - Min 8 chars, uppercase+lowercase+number+special

# Bedrock AI (Optional)
BEDROCK_AGENT_ID=your-bedrock-agent-id      # ⚠️ OPTIONAL - For chatbot feature
BEDROCK_AGENT_ALIAS_ID=your-agent-alias-id  # ⚠️ OPTIONAL
```

**🔧 How to Configure:**
```bash
cd OJT_infrastructure
cp .env.example .env
# Edit .env with your values
# NEVER commit .env to git!
```

---

#### **2. AWS Secrets Manager (Database Credentials)**

**Automatic Configuration:**
- Database Stack tự động tạo secret: `OJT-db-credentials`
- Auto-generates secure password nếu không set `DB_PASSWORD` trong .env
- Secret rotation có thể enable sau khi deploy

**Manual Configuration (Optional):**
```bash
# View database secret after deployment
aws secretsmanager get-secret-value \
  --secret-id OJT-db-credentials \
  --region ap-southeast-1

# Rotate password manually
aws secretsmanager rotate-secret \
  --secret-id OJT-db-credentials \
  --region ap-southeast-1
```

**Best Practices:**
- ✅ Use auto-generated passwords (more secure)
- ✅ Enable rotation for production (30-90 days)
- ❌ Never hardcode DB passwords in Lambda code
- ❌ Never log passwords in CloudWatch

---

#### **3. AWS Certificate Manager (ACM) - HTTPS/SSL Certificates**

**Status:** ⚠️ **OPTIONAL** (Not currently configured)

**When Needed:**
- Custom domain names for Frontend (e.g., `www.yourapp.com`)
- Custom domain for API Gateway (e.g., `api.yourapp.com`)
- Production deployments requiring HTTPS

**How to Add ACM Certificate:**

**Step 1: Request Certificate**
```bash
# Request certificate for your domain
aws acm request-certificate \
  --domain-name yourapp.com \
  --subject-alternative-names '*.yourapp.com' \
  --validation-method DNS \
  --region us-east-1  # MUST be us-east-1 for CloudFront

# Note the CertificateArn in output
```

**Step 2: Validate Domain Ownership**
- Add DNS CNAME records từ ACM console
- Wait for validation (5-30 minutes)

**Step 3: Update .env file**
```bash
# Add to .env
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxxxx
```

**Step 4: Update Frontend Stack Code**
```typescript
// In lib/stacks/frontend-stack.ts
const certificate = acm.Certificate.fromCertificateArn(
  this, 
  'Certificate', 
  process.env.ACM_CERTIFICATE_ARN!
);

// Add to CloudFront distribution
viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
  aliases: ['www.yourapp.com'],
  sslSupportMethod: cloudfront.SSLMethod.SNI,
  securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
})
```

**Cost:** $0/month (ACM certificates are FREE)

---

#### **4. AWS KMS (Key Management Service) - Encryption Keys**

**Current Status:** ⚠️ Using AWS Managed Keys (Default)

**AWS Managed Keys (Current - Free):**
- RDS: `aws/rds` key for database encryption
- S3: `aws/s3` key for bucket encryption
- Secrets Manager: `aws/secretsmanager` key
- CloudWatch Logs: `aws/logs` key

**When to Use Customer Managed Keys (CMK):**
- Production environments requiring audit trails
- Compliance requirements (PCI-DSS, HIPAA, SOC2)
- Need to control key rotation policy
- Need cross-account encryption

**How to Add Custom KMS Keys:**

**Step 1: Create KMS Key**
```bash
# Create customer managed key
aws kms create-key \
  --description "OJT Ecommerce Master Key" \
  --region ap-southeast-1

# Create alias
aws kms create-alias \
  --alias-name alias/ojt-master-key \
  --target-key-id <KeyId-from-previous-command> \
  --region ap-southeast-1
```

**Step 2: Update .env file**
```bash
# Add to .env
KMS_KEY_ID=arn:aws:kms:ap-southeast-1:123456789012:key/xxxxx
# Or use alias
KMS_KEY_ALIAS=alias/ojt-master-key
```

**Step 3: Update Stack Code**
```typescript
// In lib/stacks/database-stack.ts
import * as kms from 'aws-cdk-lib/aws-kms';

const encryptionKey = kms.Key.fromKeyArn(
  this,
  'DBEncryptionKey',
  process.env.KMS_KEY_ID!
);

// Add to RDS instance
storageEncrypted: true,
storageEncryptionKey: encryptionKey,
```

**Cost:** ~$1/month per key + $0.03 per 10,000 requests

**⚠️ Recommendation:** 
- **Development/Staging:** Use AWS managed keys (FREE)
- **Production:** Use customer managed keys for compliance

---

#### **5. JWT Secret Management (CRITICAL)**

**Current Implementation:**
```typescript
// In lib/stacks/api-stack.ts
environment: {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',  // ⚠️ INSECURE DEFAULT
}
```

**🔴 Security Issues:**
- Default value 'your-secret-key' is INSECURE
- JWT_SECRET exposed in Lambda environment variables
- No secret rotation

**✅ Recommended Solution: Use AWS Secrets Manager**

**Step 1: Create JWT Secret**
```bash
# Generate secure 256-bit key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Store in Secrets Manager
aws secretsmanager create-secret \
  --name OJT-jwt-secret \
  --secret-string '{"JWT_SECRET":"<generated-key>"}' \
  --region ap-southeast-1
```

**Step 2: Update API Stack Code**
```typescript
// In lib/stacks/api-stack.ts
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

const jwtSecret = secretsmanager.Secret.fromSecretNameV2(
  this,
  'JWTSecret',
  'OJT-jwt-secret'
);

// Grant Lambda read access
jwtSecret.grantRead(lambdaRole);

// Lambda fetches from Secrets Manager at runtime (not environment variable)
```

**Step 3: Update Lambda Code**
```javascript
// In auth Lambda functions
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

let jwtSecret;
async function getJWTSecret() {
  if (jwtSecret) return jwtSecret;
  
  const data = await secretsManager.getSecretValue({
    SecretId: 'OJT-jwt-secret'
  }).promise();
  
  jwtSecret = JSON.parse(data.SecretString).JWT_SECRET;
  return jwtSecret;
}
```

**Cost:** $0.40/month per secret + $0.05 per 10,000 API calls

---

#### **6. API Security**

**Current Configuration:**
- ✅ CORS enabled (restricted origins recommended)
- ✅ JWT authentication in Lambda functions
- ⚠️ No API Gateway API Key (optional)
- ⚠️ No WAF (optional for production)

**Optional Security Enhancements:**

**A. API Gateway API Keys**
```typescript
// Add to api-stack.ts
const apiKey = apiGateway.addApiKey('ApiKey', {
  apiKeyName: 'OJT-API-Key',
  description: 'API key for OJT Ecommerce',
});

const usagePlan = api.addUsagePlan('UsagePlan', {
  name: 'OJT-Usage-Plan',
  throttle: {
    rateLimit: 100,    // requests per second
    burstLimit: 200,   // max concurrent requests
  },
  quota: {
    limit: 10000,      // requests per month
    period: apigateway.Period.MONTH,
  },
});

usagePlan.addApiKey(apiKey);
```

**B. AWS WAF (Web Application Firewall)**
```bash
# Cost: ~$5/month + $1 per million requests
# Protects against SQL injection, XSS, DDoS
# Recommended for production
```

---

### **🔒 Security Checklist - Pre-Deployment**

**CRITICAL (Must Complete):**
- [ ] Change `AWS_ACCOUNT_ID` in .env to your actual AWS account ID
- [ ] Generate strong `JWT_SECRET` (min 256 bits)
- [ ] Set strong `DB_PASSWORD` (min 12 chars, mixed case+numbers+symbols)
- [ ] Verify .env is in .gitignore (NEVER commit secrets!)
- [ ] Review IAM roles have least-privilege access

**RECOMMENDED (For Production):**
- [ ] Request ACM certificate for custom domain
- [ ] Create customer managed KMS key
- [ ] Move JWT_SECRET to AWS Secrets Manager
- [ ] Enable RDS encryption with CMK
- [ ] Enable S3 bucket encryption
- [ ] Enable CloudTrail for audit logs
- [ ] Set up AWS Config for compliance
- [ ] Enable GuardDuty for threat detection

**OPTIONAL (Advanced):**
- [ ] Add API Gateway API Keys
- [ ] Configure AWS WAF rules
- [ ] Enable VPC Flow Logs
- [ ] Set up AWS Security Hub
- [ ] Configure AWS Inspector for vulnerability scanning

---

### **🚨 Common Security Errors**

**Error 1: Missing AWS_ACCOUNT_ID**
```
Error: Unable to resolve AWS account ID
```
**Solution:** Set `AWS_ACCOUNT_ID` in .env file

**Error 2: Invalid JWT_SECRET**
```
JsonWebTokenError: invalid signature
```
**Solution:** Ensure JWT_SECRET matches between API Gateway and backend

**Error 3: RDS Connection Failed**
```
Error: Authentication failed for user 'admin'
```
**Solution:** Check DB_PASSWORD in Secrets Manager matches RDS password

**Error 4: ACM Certificate Not Found**
```
Error: Certificate arn:aws:acm:... not found
```
**Solution:** 
- Certificate must be in us-east-1 for CloudFront
- Verify certificate is validated (DNS records added)

**Error 5: KMS Permission Denied**
```
Error: User is not authorized to perform: kms:Decrypt
```
**Solution:** Grant Lambda execution role `kms:Decrypt` permission

---

### **📚 Security Documentation Links**

- **AWS Secrets Manager:** https://docs.aws.amazon.com/secretsmanager/
- **AWS Certificate Manager:** https://docs.aws.amazon.com/acm/
- **AWS KMS:** https://docs.aws.amazon.com/kms/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc7519
- **API Gateway Security:** https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html
- **AWS Security Best Practices:** https://aws.amazon.com/architecture/security-identity-compliance/

---

## 📖 How to Read These Docs

### Each Stack Doc Contains:

1. **Stack Information**
   - Stack name, purpose, deploy order

2. **AWS Services**
   - Detailed service configurations
   - NO code, chỉ mô tả

3. **Architecture Diagram**
   - Visual representation
   - Service interactions

4. **Cost Estimate**
   - Monthly cost breakdown
   - Free tier info

5. **Security Features**
   - Security best practices
   - Access controls

6. **Outputs**
   - Values exported to other stacks

7. **Deployment Instructions**
   - Commands để deploy
   - Verification steps

8. **Monitoring**
   - Metrics to track
   - Alarms to set

9. **Documentation Links**
   - AWS official docs
   - Best practices

10. **Important Notes**
    - Gotchas, limitations
    - Production considerations

---

## 🎯 Quick Links

### For Infrastructure Understanding:
- Start with [Network Stack](STACK_NETWORK.md) - Foundation
- Then [Database Stack](STACK_DATABASE.md) - Data layer
- Then [API Stack](STACK_API.md) - Application layer

### For Deployment:
1. Read [README.md](README.md) - Overall deployment guide
2. Follow deployment order above
3. Reference individual stack docs for details

### For Cost Optimization:
- [Network Stack](STACK_NETWORK.md) - NAT Gateway alternatives
- [Database Stack](STACK_DATABASE.md) - Instance sizing
- [Monitoring Stack](STACK_MONITORING.md) - Log retention

### For Security:
- Each stack has "Security Features" section
- [Auth Stack](STACK_AUTH.md) - Authentication
- [Network Stack](STACK_NETWORK.md) - Network isolation

---

## 📝 Related Documentation

### Infrastructure
- [README.md](README.md) - Main infrastructure guide
- [ARCHITECTURE_REPORT.md](ARCHITECTURE_REPORT.md) - Detailed architecture
- [DEPLOYMENT_CONFIG_SUMMARY.md](DEPLOYMENT_CONFIG_SUMMARY.md) - Deployment strategy

### Lambda Functions
- [../OJT_lambda/README.md](../OJT_lambda/README.md) - Lambda deployment guide

### Root
- [../README.md](../README.md) - Project overview
- [../PROJECT_SEPARATION_DIAGRAM.md](../PROJECT_SEPARATION_DIAGRAM.md) - Architecture separation

---

## 🔄 Stack Dependencies

```
Network Stack (Foundation) - $23/month ✅ OPTIMIZED
    │
    ├──► Database Stack (needs VPC, subnets, SG) - $15/month ✅ OPTIMIZED
    ├──► Storage Stack (independent) - $1.25/month ✅ OK
    ├──► Auth Stack (independent) - $0/month ⚠️ OPTIONAL
    │
    └──► API Stack (needs Network, Database, Storage) - $2/month ✅ OPTIMIZED
            │
            └──► Frontend Stack (needs Storage) - $1.50/month ✅ OK
                    │
                    └──► Monitoring Stack (needs all stacks) - $1.50/month ⚠️ OPTIONAL

TOTAL: ~$44.25/month (All stacks) | ~$42.75/month (Skip optionals)
```

---

## ⚠️ **Important Notes - COST OPTIMIZATION**

1. **Cấu hình đã được tối ưu cho budget $100-500/month**
   - Current cost: **~$44/month** (giảm 60% từ $111/month)
   - Phù hợp với backend Spring Boot + SQL Server Express
   - Đủ cho low-medium traffic (< 1000 concurrent users)

2. **Backend Requirements Met:**
   - ✅ RDS t3.micro: Đủ cho HikariCP pool (max 20 connections)
   - ✅ Lambda 128MB: Đủ cho simple database queries
   - ✅ 1 NAT Gateway: Đủ cho development/staging traffic
   - ✅ 1-day backup: Đủ cho development environment

3. **When to Scale Up:**
   - Database CPU > 70%: Upgrade t3.micro → t3.small (+$39/month)
   - High traffic: Add 2nd NAT Gateway (+$23/month)
   - Production: Enable Multi-AZ (+$54/month)
   - Compliance: Increase backup retention 1→7 days (+$2/month)

4. **Optional Stacks:**
   - **Auth Stack:** Skip nếu backend đã có JWT (Spring Security)
   - **Monitoring Stack:** Skip để tiết kiệm $1.50/month (development)

5. **Code Separation:** 
   - Infrastructure code: `OJT_infrastructure/`
   - Lambda code: `OJT_lambda/` (deployed separately)
   - Backend code: `OJT_backenddev/` (Spring Boot - deployed to EC2/ECS nếu cần)

6. **Cost Tracking:**
   - Enable AWS Cost Explorer
   - Set budget alerts at $50, $75, $100/month
   - Monitor CloudWatch metrics weekly

---

## 📞 Need Help?

### **Cost Questions:**
- Current costs too high? → Check CloudWatch metrics, scale down
- Need to scale up? → Follow production configuration table above
- Budget exceeded? → Review S3 storage, Lambda invocations, NAT Gateway traffic

### **Technical Questions:**
- **Infrastructure:** Check individual stack docs
- **Deployment:** Check [README.md](README.md)
- **Lambda:** Check [OJT_lambda/README.md](../OJT_lambda/README.md)
- **Backend:** Check [OJT_backenddev/](../OJT_backenddev/)

---

**Last Updated:** December 2025  
**Configuration:** **COST-OPTIMIZED for $100-500 budget**  
**Target:** Development/Staging environment, Low-Medium traffic  
**Backend:** Spring Boot + SQL Server Express + HikariCP
