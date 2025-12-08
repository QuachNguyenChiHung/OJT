# 📦 Storage Stack - S3 Buckets

## 📋 Stack Information

**Stack Name:** `OJT-StorageStack`  
**Purpose:** S3 buckets cho images và frontend hosting  
**Deploy Order:** 2 (Sau Network Stack, song song với Database)

---

## 🏗️ AWS Services

### 1. **Amazon S3 - Images Bucket**
- **Service:** S3 (Simple Storage Service)
- **Purpose:** Lưu trữ product images, user avatars

#### Bucket Configuration
- **Bucket Name:** `ojt-images-{accountId}-{region}`
- **Region:** ap-southeast-1 (Singapore)
- **Versioning:** Disabled (để tiết kiệm cost)
- **Encryption:**
  - Type: SSE-S3 (server-side encryption)
  - At rest: Enabled by default
- **Public Access:**
  - Block Public ACLs: NO (cần public read)
  - Block Public Policy: NO
  - Ignore Public ACLs: NO
  - Restrict Public Buckets: NO

#### Access Policy
- **Public Read:** Enabled cho images
- **Upload:** Chỉ qua Lambda (IAM role)
- **Delete:** Chỉ Lambda với quyền phù hợp

#### CORS Configuration
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

#### Lifecycle Rules
- **Intelligent Tiering:** Tự động move sang cheaper storage
- **Expired Objects:** Auto-delete after 90 days (optional)
- **Incomplete Multipart:** Clean up after 7 days

### 2. **Amazon S3 - Frontend Bucket**
- **Service:** S3
- **Purpose:** Host React frontend (static website)

#### Bucket Configuration
- **Bucket Name:** `ojt-frontend-{accountId}-{region}`
- **Static Website Hosting:** Enabled
  - Index Document: `index.html`
  - Error Document: `index.html` (for SPA routing)
- **Versioning:** Enabled (rollback capability)
- **Encryption:** SSE-S3
- **Public Access:**
  - Blocked (CloudFront sẽ access qua OAI)

#### CloudFront Origin Access Identity (OAI)
- **Purpose:** Cho phép CloudFront access S3 mà không public
- **Bucket Policy:** Chỉ CloudFront OAI được phép read

---

## 📊 Storage Architecture

```
┌──────────────────────────────────────────────────┐
│              S3 Images Bucket                     │
│        ojt-images-{account}-{region}             │
│                                                   │
│  📁 products/                                     │
│     ├── product-1-image-1.jpg                    │
│     ├── product-1-image-2.jpg                    │
│     └── product-2-image-1.jpg                    │
│                                                   │
│  📁 users/                                        │
│     ├── user-123-avatar.jpg                      │
│     └── user-456-avatar.jpg                      │
│                                                   │
│  📁 banners/                                      │
│     ├── banner-1.jpg                             │
│     └── banner-2.jpg                             │
│                                                   │
│  ✅ Public Read Access                           │
│  ✅ CORS Enabled                                 │
│  ✅ Versioning: OFF (save cost)                  │
│  ✅ Encryption: SSE-S3                           │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Lambda Functions      │
        │  (Upload/Delete)       │
        │                        │
        │  IAM Role:             │
        │  - s3:PutObject        │
        │  - s3:DeleteObject     │
        │  - s3:GetObject        │
        └────────────────────────┘


┌──────────────────────────────────────────────────┐
│            S3 Frontend Bucket                     │
│      ojt-frontend-{account}-{region}             │
│                                                   │
│  📄 index.html                                    │
│  📄 favicon.ico                                   │
│  📁 assets/                                       │
│     ├── index-abc123.js                          │
│     ├── index-abc123.css                         │
│     └── logo-def456.png                          │
│  📁 img/ (static images)                          │
│                                                   │
│  ✅ Static Website Hosting                       │
│  ✅ Versioning: ON (rollback)                    │
│  ✅ Encryption: SSE-S3                           │
│  ❌ Public Access: BLOCKED                        │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     │ Origin Access Identity (OAI)
                     ▼
        ┌────────────────────────┐
        │   CloudFront CDN       │
        │   (Frontend Stack)     │
        │                        │
        │  - Global edge cache   │
        │  - HTTPS only          │
        │  - Custom domain       │
        └────────────────────────┘
```

---

## 💰 Cost Estimate

### Images Bucket

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| Storage (Standard) | 10 GB | ~$0.23 |
| PUT Requests | 10,000 | ~$0.05 |
| GET Requests | 100,000 | ~$0.04 |
| Data Transfer OUT | 10 GB | ~$0.90 |
| **Total** | | **~$1.22/month** |

### Frontend Bucket

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| Storage (Standard) | 1 GB | ~$0.023 |
| PUT Requests | 100 | ~$0.001 |
| GET Requests (via CF) | 1M | $0 (from CF) |
| **Total** | | **~$0.03/month** |

**Total Storage Cost:** ~$1.25/month

**Note:** 
- S3 Standard: $0.023 per GB/month
- GET Requests: $0.0004 per 1,000
- PUT Requests: $0.005 per 1,000
- Data transfer to CloudFront: FREE

---

## 📁 Folder Structure

### Images Bucket
```
ojt-images-bucket/
├── products/
│   ├── {productId}-1.jpg
│   ├── {productId}-2.jpg
│   └── {productId}-3.jpg
├── users/
│   └── {userId}-avatar.jpg
├── banners/
│   ├── banner-home-1.jpg
│   └── banner-home-2.jpg
└── categories/
    └── {categoryId}-icon.jpg
```

### Frontend Bucket
```
ojt-frontend-bucket/
├── index.html
├── favicon.ico
├── manifest.json
├── robots.txt
├── assets/
│   ├── index.{hash}.js
│   ├── index.{hash}.css
│   └── vendor.{hash}.js
└── img/
    ├── logo.png
    └── icons/
```

---

## 🔐 Security Features

### Images Bucket
- ✅ **Public Read Access:** Cho phép frontend load images
- ✅ **Upload via Lambda:** Chỉ Lambda functions có quyền upload
- ✅ **CORS:** Configured cho cross-origin requests
- ✅ **Encryption at Rest:** SSE-S3
- ✅ **Access Logging:** Optional (track access)

### Frontend Bucket
- ✅ **Private Bucket:** Không public trực tiếp
- ✅ **CloudFront OAI:** Chỉ CloudFront access được
- ✅ **Versioning:** Enabled để rollback
- ✅ **Encryption at Rest:** SSE-S3
- ✅ **Block Public Access:** Enabled

### IAM Policies

#### Lambda Upload Policy
```
Actions:
- s3:PutObject
- s3:PutObjectAcl
- s3:GetObject
- s3:DeleteObject

Resources:
- arn:aws:s3:::ojt-images-*/products/*
- arn:aws:s3:::ojt-images-*/users/*
```

#### CloudFront OAI Policy
```
Actions:
- s3:GetObject

Resources:
- arn:aws:s3:::ojt-frontend-*/*
```

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `ImagesBucketName` | Images bucket name | API Stack (Lambda) |
| `ImagesBucketArn` | Images bucket ARN | API Stack (IAM) |
| `FrontendBucketName` | Frontend bucket name | Frontend Stack |
| `FrontendBucketArn` | Frontend bucket ARN | Frontend Stack |

---

## 🚀 Deployment

```bash
# Deploy storage stack
cd OJT_infrastructure
npm run deploy:core

# Hoặc deploy riêng
cdk deploy OJT-StorageStack
```

**Deploy Time:** ~2 minutes

---

## 📤 Upload Frontend

```bash
# Build React app
cd OJT_frontendDev
npm run build

# Upload to S3
aws s3 sync dist/ s3://ojt-frontend-{account}-{region}/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## 🔍 Verification

```bash
# List buckets
aws s3 ls | grep ojt

# Check images bucket
aws s3 ls s3://ojt-images-{account}-{region}/

# Check frontend bucket
aws s3 ls s3://ojt-frontend-{account}-{region}/

# Test public image access
curl https://ojt-images-{account}-{region}.s3.ap-southeast-1.amazonaws.com/products/test.jpg

# Check bucket policy
aws s3api get-bucket-policy --bucket ojt-images-{account}-{region}
```

---

## 📊 Monitoring

### S3 Metrics (CloudWatch)
- **BucketSize:** Total storage size
- **NumberOfObjects:** Total object count
- **AllRequests:** Total API requests
- **GetRequests:** Read requests
- **PutRequests:** Write requests
- **4xxErrors:** Client errors
- **5xxErrors:** Server errors

### Request Metrics
- Enable for specific prefixes (e.g., `/products/`)
- Filter by prefix, tag, or access point
- 1-minute granularity (additional cost)

### CloudWatch Alarms
- High 4xx error rate
- High 5xx error rate
- Unusual request patterns

---

## 🎯 Best Practices

### Performance
1. **Use CloudFront:** Cache static content globally
2. **Optimize Images:** Compress before upload
3. **Multipart Upload:** For files >100MB
4. **Transfer Acceleration:** For uploads from far regions

### Cost Optimization
1. **Lifecycle Policies:** Move old objects to cheaper storage
2. **Intelligent Tiering:** Auto-optimize storage class
3. **Delete Incomplete Uploads:** Clean up failed multipart
4. **Monitor Unused Objects:** Delete if not needed

### Security
1. **Block Public Access:** Unless specifically needed
2. **Use CloudFront OAI:** Instead of public buckets
3. **Enable Versioning:** For critical data
4. **Encryption:** Always enable SSE
5. **Access Logging:** Track who accessed what

---

## 📚 Related Documentation

- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [S3 Performance Guidelines](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)

---

## ⚠️ Important Notes

1. **Bucket Names:** Must be globally unique across all AWS
2. **CORS:** Required nếu frontend và API khác domain
3. **Public Images:** Images bucket cần public read
4. **Frontend Private:** Frontend bucket phải private (access via CloudFront)
5. **Versioning:** Enable cho frontend (rollback capability)
6. **Lifecycle:** Consider cho images cũ (archive hoặc delete)

---

## 🔄 Image Upload Flow

```
User (Frontend)
     │
     ▼
POST /images/upload
     │
     ▼
Lambda Function (ImageUploadController)
     │
     ├── Validate image (size, format)
     ├── Generate unique filename
     ├── Resize/optimize (optional)
     │
     ▼
S3 PutObject
     │
     ▼
Return Image URL
     │
     ▼
Save URL to RDS (ProductImages table)
     │
     ▼
Frontend displays image
```

---

**Stack Status:** ✅ Production Ready  
**Last Updated:** December 2025
