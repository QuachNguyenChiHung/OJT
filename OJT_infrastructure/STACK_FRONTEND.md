# 🌍 Frontend Stack - CloudFront Distribution

## 📋 Stack Information

**Stack Name:** `OJT-FrontendStack`  
**Purpose:** CloudFront CDN để host React frontend  
**Deploy Order:** 4 (Sau Storage Stack)

---

## 🏗️ AWS Services

### 1. **Amazon CloudFront**
- **Service:** CloudFront Distribution
- **Purpose:** Global CDN để serve React SPA

#### Distribution Configuration
- **Distribution Type:** Web
- **Price Class:** PriceClass_100 (US, Europe, Asia)
- **HTTP Version:** HTTP/2, HTTP/3 (QUIC)
- **IPv6:** Enabled
- **Default Root Object:** `index.html`
- **Viewer Protocol:** Redirect HTTP to HTTPS
- **Allowed Methods:** GET, HEAD, OPTIONS

#### Origin Configuration
- **Origin Type:** S3 Bucket
- **Origin:** `ojt-frontend-{account}-{region}.s3.amazonaws.com`
- **Origin Access:** Origin Access Identity (OAI)
- **Origin Protocol:** HTTPS only
- **Origin Shield:** Disabled (save cost)

#### Cache Behavior
- **Path Pattern:** Default (`/*`)
- **Viewer Protocol Policy:** Redirect HTTP to HTTPS
- **Allowed Methods:** GET, HEAD, OPTIONS
- **Cached Methods:** GET, HEAD, OPTIONS
- **Cache Policy:**
  - TTL: 86400s (24 hours) cho static assets
  - TTL: 0s cho `index.html` (always fresh)
- **Compress Objects:** Enabled (gzip, brotli)

#### Custom Error Responses (SPA Support)
- **403 Error:** Redirect to `/index.html` (200)
- **404 Error:** Redirect to `/index.html` (200)
- **Purpose:** Support client-side routing (React Router)

### 2. **Origin Access Identity (OAI)**
- **Service:** CloudFront OAI
- **Purpose:** Cho phép CloudFront access S3 mà không public bucket

#### Configuration
- **Comment:** `OJT Frontend OAI`
- **S3 Bucket Policy:** Updated to allow OAI
- **Benefit:** S3 bucket có thể private hoàn toàn

### 3. **SSL/TLS Certificate** (Optional)
- **Service:** AWS Certificate Manager (ACM)
- **Purpose:** HTTPS cho custom domain

#### Certificate Configuration
- **Domain:** `yourdomain.com`, `www.yourdomain.com`
- **Validation:** DNS validation (recommended)
- **Region:** us-east-1 (CloudFront requirement)
- **Renewal:** Auto-renewal

### 4. **Route 53** (Optional)
- **Service:** Route 53 DNS
- **Purpose:** Custom domain cho CloudFront

#### DNS Configuration
- **Record Type:** A + AAAA (IPv4 + IPv6)
- **Alias Target:** CloudFront distribution
- **TTL:** 300 seconds

---

## 📊 Frontend Architecture

```
┌──────────────────────────────────────────────────┐
│                 End Users                         │
│         (Global - Multiple Regions)               │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
                     │ https://yourdomain.com
                     ▼
┌──────────────────────────────────────────────────┐
│          Amazon CloudFront (CDN)                  │
│                                                   │
│  Edge Locations (200+ worldwide):                │
│  - Cache static assets (JS, CSS, images)         │
│  - Compression (gzip, brotli)                    │
│  - HTTPS termination                             │
│  - Custom domain support                         │
│                                                   │
│  Distribution:                                    │
│  - Default root: index.html                      │
│  - Error pages: → index.html (SPA routing)       │
│  - Cache policy: 24h for assets, 0s for HTML    │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     │ Origin Access Identity (OAI)
                     │ HTTPS only
                     ▼
┌──────────────────────────────────────────────────┐
│         S3 Frontend Bucket (Private)              │
│      ojt-frontend-{account}-{region}             │
│                                                   │
│  📄 index.html                                    │
│  📁 assets/                                       │
│     ├── index-abc123.js                          │
│     ├── index-abc123.css                         │
│     └── vendor-def456.js                         │
│  📁 img/                                          │
│                                                   │
│  ✅ Private bucket (no public access)            │
│  ✅ Only CloudFront can access (via OAI)         │
│  ✅ Versioning enabled (rollback)                │
│                                                   │
└──────────────────────────────────────────────────┘


Request Flow:
┌─────────────┐
│ User Browser│
└──────┬──────┘
       │ GET https://yourdomain.com/products
       ▼
┌─────────────────┐
│ CloudFront Edge │ ← Check cache
└──────┬──────────┘
       │ Cache MISS
       ▼
┌─────────────────┐
│   S3 Origin     │ ← Fetch index.html
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ CloudFront Edge │ ← Cache + return
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User Browser    │ ← Render React app
│ (Client-side    │ ← React Router handles /products
│  routing)       │
└─────────────────┘
```

---

## 💰 Cost Estimate

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| CloudFront Data Transfer | 10 GB | ~$0.85 |
| CloudFront Requests | 1M requests | ~$0.10 |
| S3 Storage (Frontend) | 1 GB | ~$0.023 |
| S3 Requests | 1,000 | ~$0.005 |
| ACM Certificate | 1 cert | FREE |
| Route 53 Hosted Zone | 1 zone | $0.50 |
| **Total** | | **~$1.48/month** |

**Free Tier:**
- CloudFront: 1 TB data transfer OUT + 10M requests free (first 12 months)
- ACM: Always free
- Route 53: $0.50/month per hosted zone (no free tier)

**Cost at Scale:**
- 100 GB: ~$8
- 1 TB: ~$85
- 10 TB: ~$650

**Cost Optimization:**
- Use Price Class 100 (cheaper, US/EU/Asia only)
- Enable compression (reduce transfer size)
- Increase cache TTL (reduce origin requests)

---

## 🚀 Frontend Deployment

### Build React App

```bash
cd OJT_frontendDev

# Install dependencies
npm install

# Build production bundle
npm run build
# Output: dist/ directory
```

### Deploy to S3

```bash
# Sync to S3 (delete old files)
aws s3 sync dist/ s3://ojt-frontend-{account}-{region}/ \
  --delete \
  --cache-control "max-age=31536000,public,immutable" \
  --exclude "index.html"

# Upload index.html separately (no cache)
aws s3 cp dist/index.html s3://ojt-frontend-{account}-{region}/index.html \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate"
```

### Invalidate CloudFront Cache

```bash
# Get distribution ID
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='OJT Frontend Distribution'].Id" \
  --output text

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## 🔍 Verification

```bash
# Check CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC

# Test CloudFront URL
curl -I https://d1234567890abc.cloudfront.net/

# Test custom domain (if configured)
curl -I https://yourdomain.com/

# Check cache headers
curl -I https://yourdomain.com/assets/index-abc123.js
# Should see: X-Cache: Hit from cloudfront
```

---

## 🔐 Security Features

### HTTPS/SSL
- ✅ **HTTPS Only:** Redirect HTTP to HTTPS
- ✅ **TLS 1.2+:** Secure protocols only
- ✅ **ACM Certificate:** Free SSL certificates
- ✅ **Perfect Forward Secrecy:** Enabled

### Access Control
- ✅ **OAI:** S3 bucket private (CloudFront access only)
- ✅ **Signed URLs:** Optional (premium content)
- ✅ **Geo Restriction:** Optional (block countries)
- ✅ **WAF:** Optional (DDoS protection)

### Headers
- ✅ **Security Headers:**
  - Strict-Transport-Security
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
- ✅ **CORS:** Configured if needed

---

## 📊 Performance Features

### Caching Strategy

#### Static Assets (JS, CSS, Images)
```
Cache-Control: max-age=31536000, public, immutable
```
- **TTL:** 1 year
- **Versioned Files:** Hash in filename (e.g., index-abc123.js)
- **Immutable:** Never changes (new version = new filename)

#### HTML Files (index.html)
```
Cache-Control: max-age=0, no-cache, no-store, must-revalidate
```
- **TTL:** 0 seconds
- **Always Fresh:** Get latest from origin
- **SPA Routing:** Always serve latest index.html

### Compression
- ✅ **Gzip:** Enabled
- ✅ **Brotli:** Enabled (better compression)
- **Savings:** ~70% size reduction

### HTTP/2 & HTTP/3
- ✅ **HTTP/2:** Multiplexing, header compression
- ✅ **HTTP/3 (QUIC):** Faster, more reliable

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `DistributionId` | CloudFront distribution ID | Deployment scripts |
| `DistributionDomain` | CloudFront domain name | DNS configuration |
| `FrontendUrl` | Full frontend URL | Testing, documentation |

---

## 🚀 Deployment

```bash
# Deploy frontend stack
cd OJT_infrastructure
npm run deploy:frontend

# Output: CloudFront URL
```

**Deploy Time:** ~15 minutes (CloudFront propagation)

---

## 🎯 Custom Domain Setup

### 1. Request ACM Certificate

```bash
# In us-east-1 (CloudFront requirement)
aws acm request-certificate \
  --region us-east-1 \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS
```

### 2. Validate Certificate

Add CNAME records in Route 53 (or your DNS provider)

### 3. Update CloudFront

Add custom domain in distribution settings

### 4. Create Route 53 Records

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d1234567890abc.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## 📊 Monitoring

### CloudWatch Metrics

#### CloudFront
- **Requests:** Total requests
- **BytesDownloaded:** Data transfer
- **BytesUploaded:** Uploads (if any)
- **4xxErrorRate:** Client errors
- **5xxErrorRate:** Server errors
- **OriginLatency:** S3 response time

#### Real-time Monitoring
- **Cache Hit Rate:** % of requests served from cache
- **Popular Objects:** Most requested files
- **Viewer Location:** Geographic distribution

### CloudWatch Alarms
- High 5xx error rate
- Low cache hit rate (<80%)
- High origin latency

---

## 📚 Related Documentation

- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html)
- [CloudFront Custom Domains](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
- [ACM Documentation](https://docs.aws.amazon.com/acm/)

---

## ⚠️ Important Notes

1. **Propagation Time:** CloudFront deploy takes 15-20 minutes
2. **ACM Region:** Certificates for CloudFront must be in us-east-1
3. **SPA Routing:** Configure error pages to redirect to index.html
4. **Cache Invalidation:** Costs $0 for first 1,000 paths/month
5. **Versioned Assets:** Use hash in filenames for cache busting

---

## 🔄 Deployment Workflow

```
Developer commits code
         │
         ▼
CI/CD Pipeline (GitHub Actions)
         │
         ├── npm run build
         │   (Create dist/)
         │
         ├── aws s3 sync
         │   (Upload to S3)
         │
         └── aws cloudfront create-invalidation
             (Clear cache)
         │
         ▼
Users see new version
```

---

**Stack Status:** ✅ Production Ready  
**Last Updated:** December 2025  
**Frontend App:** [OJT_frontendDev/](../OJT_frontendDev/)
