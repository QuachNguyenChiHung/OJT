# 🚀 API Stack - API Gateway + Lambda Functions

## 📋 Stack Information

**Stack Name:** `OJT-ApiStack`  
**Purpose:** REST API với API Gateway và Lambda functions  
**Deploy Order:** 3 (Sau Network, Database, Storage)

---

## 🏗️ AWS Services

### 1. **Amazon API Gateway (REST API)**
- **Service:** API Gateway REST API
- **Purpose:** HTTP API endpoint cho frontend

#### API Configuration
- **API Name:** `OJT-{environment}-API`
- **API Type:** REST API (not HTTP API)
- **Endpoint Type:** Regional
- **Stage:** `dev`, `staging`, `prod`
- **Protocol:** HTTPS only

#### Features Enabled
- **CORS:** Enabled for all origins
  - Allowed Origins: `*` (hoặc specific domain)
  - Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
  - Allowed Headers: Content-Type, Authorization, X-Api-Key
- **CloudWatch Logs:** Enabled
- **X-Ray Tracing:** Enabled
- **Request Validation:** Schema validation
- **API Keys:** Optional (rate limiting)
- **Usage Plans:** Optional (throttling)

#### Throttling
- **Rate Limit:** 10,000 requests/second
- **Burst Limit:** 5,000 requests
- **Per-method limits:** Configurable

### 2. **AWS Lambda Functions**
- **Service:** Lambda
- **Purpose:** Serverless compute cho business logic

#### Lambda Configuration (Common)
- **Runtime:** Node.js 20.x
- **Architecture:** x86_64
- **Memory:** 512 MB (configurable)
- **Timeout:** 30 seconds
- **VPC:** Enabled (private subnets)
- **Security Group:** Lambda-SecurityGroup
- **Environment Variables:**
  - `DB_SECRET_ARN`: RDS credentials
  - `DB_ENDPOINT`: RDS endpoint
  - `DB_NAME`: Database name
  - `IMAGES_BUCKET`: S3 images bucket
  - `JWT_SECRET`: JWT signing key
  - `ENVIRONMENT`: dev/staging/prod

#### Lambda Functions List

##### Authentication Functions
1. **Login Function**
   - **Handler:** `login.handler`
   - **Route:** `POST /auth/login`
   - **Purpose:** User login
   - **Input:** `{ email, password }`
   - **Output:** `{ token, user }`

2. **Signup Function**
   - **Handler:** `signup.handler`
   - **Route:** `POST /auth/signup`
   - **Purpose:** User registration
   - **Input:** `{ email, password, fullName }`
   - **Output:** `{ message, userId }`

3. **Me Function**
   - **Handler:** `me.handler`
   - **Route:** `GET /auth/me`
   - **Purpose:** Get current user info
   - **Auth:** Required
   - **Output:** `{ user }`

##### Product Functions
4. **Get Products Function**
   - **Handler:** `getProducts.handler`
   - **Route:** `GET /products`
   - **Purpose:** List all products
   - **Query Params:** `?page=1&limit=20&brandId=1&categoryId=2`
   - **Output:** `{ products, total, page, limit }`

5. **Get Best Selling Function**
   - **Handler:** `getBestSelling.handler`
   - **Route:** `GET /products/best-selling`
   - **Purpose:** Top selling products
   - **Query Params:** `?limit=10`
   - **Output:** `{ products }`

6. **Get Newest Function**
   - **Handler:** `getNewest.handler`
   - **Route:** `GET /products/newest`
   - **Purpose:** Recently added products
   - **Query Params:** `?limit=10`
   - **Output:** `{ products }`

7. **Search Products Function**
   - **Handler:** `searchProducts.handler`
   - **Route:** `GET /products/search`
   - **Purpose:** Search products
   - **Query Params:** `?q=keyword`
   - **Output:** `{ products }`

### 3. **IAM Roles**

#### Lambda Execution Role
- **Service:** IAM Role
- **Purpose:** Permissions cho Lambda functions

**Managed Policies:**
- `AWSLambdaVPCAccessExecutionRole` (VPC access)
- `AWSLambdaBasicExecutionRole` (CloudWatch Logs)

**Inline Policies:**
```
RDS Data API:
- rds-data:ExecuteStatement
- rds-data:BatchExecuteStatement

Secrets Manager:
- secretsmanager:GetSecretValue

S3:
- s3:GetObject
- s3:PutObject
- s3:DeleteObject (cho images bucket)

Bedrock (optional):
- bedrock:InvokeModel
```

### 4. **CloudWatch Logs**
- **Service:** CloudWatch Logs
- **Purpose:** Lambda execution logs

#### Log Configuration
- **Log Group:** `/aws/lambda/{function-name}`
- **Retention:** 7 days (configurable)
- **Log Level:** INFO (DEBUG for dev)

---

## 📊 API Architecture

```
┌──────────────────────────────────────────────────┐
│              Frontend (React)                     │
│         https://yourdomain.com                    │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────┐
│           CloudFront (Optional CDN)               │
│         Custom domain, SSL certificate            │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│          API Gateway REST API                     │
│   https://xxx.execute-api.region.amazonaws.com   │
│                                                   │
│  Endpoints:                                       │
│  ├── POST /auth/login                            │
│  ├── POST /auth/signup                           │
│  ├── GET  /auth/me                               │
│  ├── GET  /products                              │
│  ├── GET  /products/best-selling                 │
│  ├── GET  /products/newest                       │
│  └── GET  /products/search                       │
│                                                   │
│  Features:                                        │
│  - CORS enabled                                   │
│  - Request validation                             │
│  - CloudWatch logging                             │
│  - X-Ray tracing                                  │
└────────────────────┬─────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌──────▼────┐
    │ Lambda   │          │  Lambda   │
    │ (Auth)   │          │ (Products)│
    └────┬─────┘          └──────┬────┘
         │                       │
         │  VPC (Private Subnet) │
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌──────▼────┐
    │   RDS    │          │    S3     │
    │SQL Server│          │ (Images)  │
    └──────────┘          └───────────┘
```

---

## 🔗 API Endpoints

### Authentication

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "Customer"
  }
}
```

#### POST /auth/signup
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "fullName": "Jane Doe",
  "phone": "+84901234567"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "userId": 124
}
```

#### GET /auth/me
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "user": {
    "userId": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "Customer",
    "address": "123 Main St"
  }
}
```

### Products

#### GET /products?page=1&limit=20
**Response (200):**
```json
{
  "products": [
    {
      "productId": 1,
      "productName": "iPhone 15 Pro",
      "price": 29990000,
      "stockQuantity": 50,
      "brand": "Apple",
      "category": "Smartphone",
      "images": [
        "https://bucket.s3.amazonaws.com/products/1-1.jpg"
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /products/best-selling?limit=10
**Response (200):**
```json
{
  "products": [
    {
      "productId": 5,
      "productName": "Samsung Galaxy S24",
      "price": 22990000,
      "soldCount": 1500
    }
  ]
}
```

---

## 💰 Cost Estimate

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| API Gateway | 1M requests | $3.50 |
| Lambda Invocations | 1M requests | $0.20 |
| Lambda Duration | 1M × 1s × 512MB | $0.83 |
| CloudWatch Logs | 1 GB | $0.50 |
| **Total** | | **~$5.03/month** |

**Free Tier:**
- API Gateway: 1M requests/month free (first 12 months)
- Lambda: 1M requests + 400,000 GB-seconds free (always)
- CloudWatch Logs: 5 GB free

**Cost at Scale:**
- 10M requests: ~$35
- 100M requests: ~$350

---

## 🔐 Security Features

### API Gateway Security
- ✅ **HTTPS Only:** No HTTP allowed
- ✅ **CORS:** Controlled origins
- ✅ **API Keys:** Optional rate limiting
- ✅ **WAF:** Optional (block malicious requests)
- ✅ **Throttling:** Prevent abuse

### Lambda Security
- ✅ **VPC Isolation:** Private subnets
- ✅ **Security Groups:** Restricted access
- ✅ **IAM Roles:** Least privilege
- ✅ **Environment Variables:** Encrypted
- ✅ **Secrets Manager:** For sensitive data

### Authentication
- ✅ **JWT Tokens:** Signed and verified
- ✅ **Password Hashing:** bcrypt
- ✅ **Token Expiry:** 7 days (configurable)
- ✅ **Authorization:** Role-based access

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `ApiUrl` | API Gateway URL | Frontend |
| `ApiId` | API Gateway ID | Monitoring |
| `LoginFunctionName` | Login Lambda name | Lambda deployment |
| `SignupFunctionName` | Signup Lambda name | Lambda deployment |
| `GetProductsFunctionName` | Products Lambda name | Lambda deployment |

---

## 🚀 Deployment

### 1. Deploy CDK Stack (Infrastructure)

```bash
cd OJT_infrastructure
npm run deploy:api
```

**Output:** API Gateway URL + Lambda function names (với placeholder code)

### 2. Deploy Lambda Code (Application)

```bash
cd ../OJT_lambda
npm run build
npm run deploy
```

**Result:** Lambda functions updated với code thực

---

## 🔍 Verification

```bash
# Test API endpoint
curl https://xxx.execute-api.ap-southeast-1.amazonaws.com/dev/products

# Test login
curl -X POST https://xxx.execute-api.ap-southeast-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Check Lambda logs
aws logs tail /aws/lambda/OJT-Auth-Login --follow

# List Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `OJT-`)].FunctionName'
```

---

## 📊 Monitoring

### CloudWatch Metrics

#### API Gateway
- **Count:** Total requests
- **Latency:** Response time (p50, p95, p99)
- **4XXError:** Client errors
- **5XXError:** Server errors
- **IntegrationLatency:** Lambda execution time

#### Lambda
- **Invocations:** Function calls
- **Duration:** Execution time
- **Errors:** Failed invocations
- **Throttles:** Rate-limited calls
- **ConcurrentExecutions:** Parallel executions

### Alarms
- High 5XX error rate (>1%)
- High latency (>3 seconds)
- High throttle rate
- Lambda errors

---

## 🎯 Best Practices

### Performance
1. **Cold Starts:** Keep functions warm với scheduled events
2. **Connection Pooling:** Reuse RDS connections (hoặc dùng Data API)
3. **Caching:** Cache frequent queries
4. **Async Processing:** Use SQS/SNS cho heavy tasks

### Cost Optimization
1. **Right-size Memory:** Test optimal memory (affects CPU)
2. **Reduce Package Size:** Only include necessary dependencies
3. **Reserved Concurrency:** For predictable workloads
4. **API Gateway Caching:** Cache responses (additional cost but saves Lambda)

### Security
1. **Validate Input:** Always validate request body
2. **Rate Limiting:** Use API keys + usage plans
3. **Error Handling:** Don't expose internal errors
4. **Logging:** Log requests but mask sensitive data

---

## 📚 Related Documentation

- [API Gateway REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-rest-api.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Lambda in VPC](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
- [Lambda Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

---

## ⚠️ Important Notes

1. **Placeholder Code:** CDK deploy tạo Lambda với placeholder code. Phải deploy actual code từ OJT_lambda project
2. **VPC Cold Start:** Lambda trong VPC có cold start ~1-2s (one-time per container)
3. **Concurrent Execution:** Default limit 1000 (có thể request tăng)
4. **Timeout:** 30s maximum cho API Gateway integration
5. **Payload Limit:** 6MB request/response size limit

---

## 🔄 Lambda Code Update Flow

```
Developer edits code in OJT_lambda/
         │
         ▼
npm run build (create ZIP)
         │
         ▼
npm run deploy (upload to Lambda)
         │
         ▼
Lambda function updated
         │
         ▼
Test API endpoint
```

**No CDK redeploy needed!** ✅

---

**Stack Status:** ✅ Production Ready  
**Last Updated:** December 2025  
**Lambda Code:** Deployed separately from [OJT_lambda/](../OJT_lambda/)
