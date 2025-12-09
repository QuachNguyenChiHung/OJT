# 🗄️ Database Stack - RDS SQL Server

## 📋 Stack Information

**Stack Name:** `OJT-DatabaseStack`  
**Purpose:** SQL Server database với Secrets Manager  
**Deploy Order:** 2 (Sau Network Stack)  
**Deploy Time:** ~10-15 minutes  
**Monthly Cost:** ~$15 ✅ **OPTIMIZED** (Reduced from $54)

---

## 🏗️ AWS Services

### 1. **Amazon RDS (Relational Database Service)**
- **Service:** RDS for SQL Server
- **Purpose:** Managed SQL Server database

#### Database Configuration ✅ **COST OPTIMIZED**
- **Engine:** Microsoft SQL Server Express 2019
- **Version:** 15.00.4236.7.v1 (SQL Server 2019)
- **License:** License-included (miễn phí với Express)
- **Instance Class:** **db.t3.micro** (cost optimized)
  - vCPU: 2
  - RAM: 1 GB (sufficient cho HikariCP max 20 connections)
  - Network: Moderate performance
  - **Cost:** ~$15/month (vs $54/month for t3.small)
- **Storage:**
  - Type: General Purpose SSD (gp3)
  - Size: 20 GB allocated
  - Max: 100 GB (auto-scaling enabled)
  - IOPS: 3000 baseline
  - Throughput: 125 MB/s

#### High Availability & Backup ✅ **COST OPTIMIZED**
- **Multi-AZ:** Disabled (cost optimization for dev/staging)
  - ⚠️ Enable for production (+$54/month)
- **Backup Retention:** **1 day** (cost optimized)
  - Reduced from 7 days: **-$2/month**
  - Sufficient for development environment
  - 🚀 Increase to 7 days for production
- **Automated Backups:** Daily
- **Backup Window:** 03:00-04:00 UTC
- **Maintenance Window:** Sun 04:00-05:00 UTC
- **Deletion Protection:** Disabled (dev/staging)
- **Removal Policy:** Snapshot (data safety)

#### Network
- **VPC:** OJT VPC (from Network Stack)
- **Subnets:** Private with Egress (2 AZs)
  - Can access internet via NAT Gateway
  - Required for RDS maintenance and updates
- **Subnet Group:** Auto-created from VPC subnets
- **Public Access:** Disabled (security best practice)
- **Port:** 1433 (SQL Server default)

#### Security
- **Security Group:** RDS-only (từ Network Stack)
- **Encryption at Rest:** Enabled (KMS)
- **Encryption in Transit:** SSL/TLS
- **IAM Authentication:** Disabled (dùng username/password)

### 2. **AWS Secrets Manager**
- **Service:** Secrets Manager
- **Purpose:** Lưu trữ database credentials an toàn

#### Secret Configuration
- **Secret Name:** `OJT/RDS/Credentials`
- **Secret Type:** RDS database credentials
- **Rotation:** Enabled (optional, 30 days)
- **Auto-rotation:** Via Lambda (optional)

#### Stored Values
```json
{
  "username": "admin",
  "password": "auto-generated-strong-password",
  "engine": "sqlserver-ex",
  "host": "ojt-database.xxxxxxxxx.ap-southeast-1.rds.amazonaws.com",
  "port": 1433,
  "dbname": "OJT_Database"
}
```

### 3. **RDS Data API** (Optional)
- **Service:** RDS Data API
- **Purpose:** HTTP-based database access (cho Lambda)
- **Benefits:**
  - No connection pooling needed
  - Automatic scaling
  - Pay per request
  - No VPC dependency

---

## 📊 Database Architecture

```
┌──────────────────────────────────────────────────┐
│              AWS Secrets Manager                  │
│         OJT/RDS/Credentials                      │
│  - Username: admin                                │
│  - Password: ****************                     │
│  - Host: ojt-database.xxx.rds.amazonaws.com      │
└────────────────────┬─────────────────────────────┘
                     │ Credentials
                     │ Auto-rotation
                     ▼
┌──────────────────────────────────────────────────┐
│           Amazon RDS SQL Server                   │
│                                                   │
│  Isolated Subnet (AZ-1)   Isolated Subnet (AZ-2) │
│  ┌─────────────────┐      ┌─────────────────┐    │
│  │  Primary DB     │◄────►│  Standby DB     │    │
│  │  (Multi-AZ)     │      │  (Auto-failover)│    │
│  └─────────────────┘      └─────────────────┘    │
│                                                   │
│  Engine: SQL Server Express 2019                  │
│  Instance: db.t3.small (2 vCPU, 2GB RAM)         │
│  Storage: 20GB gp3 SSD                           │
│  Port: 1433                                       │
│  Encryption: KMS                                  │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Security Group        │
        │  RDS-SecurityGroup     │
        │                        │
        │  Inbound:              │
        │  - Port 1433           │
        │  - From Lambda SG only │
        │                        │
        │  Outbound: None        │
        └────────────────────────┘
```

---

## 💰 Cost Estimate

| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| RDS SQL Server Express | db.t3.small | ~$50 |
| Storage (gp3) | 20 GB | ~$2.40 |
| Backup Storage | 7 days retention | ~$0.95 |
| Secrets Manager | 1 secret | $0.40 |
| Multi-AZ (optional) | If enabled | +$50 |
| **Total (Single-AZ)** | | **~$53.75/month** |
| **Total (Multi-AZ)** | | **~$103.75/month** |

**Free Tier:** RDS Free Tier covers 750 hours/month of db.t3.micro (first 12 months)

**Cost Optimization:**
- Dùng db.t3.micro cho dev/test: ~$25/month
- Reserved Instances: Giảm 30-40% cho production
- Aurora Serverless: Pay per use (nếu traffic thấp)

---

## 💰 Cost Estimate

### ✅ **OPTIMIZED Configuration (Current)**

| Resource | Configuration | Monthly Cost |
|----------|--------------|-------------|
| **RDS Instance** | **db.t3.micro** (1 vCPU, 1GB RAM) | **~$13** |
| Storage | 20 GB gp3 SSD | ~$2.30 |
| Backup Storage | 1-day retention (~20GB) | ~$0.50 |
| **Secrets Manager** | 1 secret | ~$0.40 |
| **Total** | | **~$16.20/month** ✅ |

**Cost Optimization Applied:**
- ✅ **t3.small → t3.micro: Saves $39/month**
- ✅ **7-day → 1-day backup: Saves $2/month**
- ✅ **Multi-AZ disabled: Saves $54/month** (for dev/staging)
- **Total Savings: ~$95/month**

### 📈 **Original Configuration (Not Recommended)**

| Resource | Configuration | Monthly Cost |
|----------|--------------|-------------|
| RDS Instance | db.t3.small (2 vCPU, 2GB RAM) | ~$54 |
| Multi-AZ | Enabled | +$54 (double cost) |
| Backup | 7-day retention | +$2 |
| **Total** | | **~$110/month** |

### 🚀 **When to Scale Up**

| Scenario | Action | Additional Cost |
|----------|--------|----------------|
| **Database CPU > 70%** | Upgrade to t3.small | +$39/month |
| **Production deployment** | Enable Multi-AZ | +$54/month |
| **Compliance requirements** | 7-day backup retention | +$2/month |
| **High traffic (>1000 users)** | All of the above | +$95/month |

### 📊 **Performance Notes**

**t3.micro is sufficient for:**
- Spring Boot backend with HikariCP (max 20 connections)
- Low-medium traffic (< 1000 concurrent users)
- Database size < 20GB
- Read/Write IOPS < 3000

**Upgrade to t3.small when:**
- CPU consistently > 70%
- Connection pool exhaustion
- Slow query performance
- Database size approaching limits

---

## 📄 Database Schema

### Tables (from existing backend)

#### Users Table
- UserID (PK)
- Email (Unique)
- PasswordHash
- FullName
- Phone
- Address
- Role (Customer/Admin)
- IsActive
- CreatedAt
- UpdatedAt

#### Products Table
- ProductID (PK)
- ProductName
- Description
- Price
- StockQuantity
- BrandID (FK)
- CategoryID (FK)
- IsActive
- CreatedAt

#### Categories Table
- CategoryID (PK)
- CategoryName
- Description

#### Brands Table
- BrandID (PK)
- BrandName
- Description

#### Orders Table
- OrderID (PK)
- UserID (FK)
- OrderDate
- TotalAmount
- Status (Pending/Processing/Shipped/Delivered/Cancelled)
- PaymentMethod (COD/Online)
- ShippingAddress
- IsCOD

#### OrderDetails Table
- OrderDetailID (PK)
- OrderID (FK)
- ProductID (FK)
- Quantity
- UnitPrice
- TotalPrice

#### Cart Table
- CartID (PK)
- UserID (FK)
- CreatedAt

#### CartItems Table
- CartItemID (PK)
- CartID (FK)
- ProductID (FK)
- Quantity
- AddedAt

#### ProductImages Table
- ImageID (PK)
- ProductID (FK)
- ImageURL
- IsPrimary
- CreatedAt

#### Reviews Table
- ReviewID (PK)
- ProductID (FK)
- UserID (FK)
- Rating (1-5)
- Comment
- CreatedAt

---

## 🔐 Security Features

### Network Security
- ✅ Deployed in isolated subnets (no internet access)
- ✅ Security group chỉ cho phép Lambda SG
- ✅ No public endpoint

### Data Security
- ✅ Encryption at rest (KMS)
- ✅ Encryption in transit (SSL/TLS)
- ✅ Automated backups (1 day retention - cost optimized)
- ✅ Point-in-time recovery within retention period

### Access Control
- ✅ Credentials trong Secrets Manager
- ✅ IAM roles cho Lambda access
- ✅ Secret rotation (optional)

### Monitoring
- ✅ CloudWatch metrics
- ✅ Enhanced monitoring (optional)
- ✅ Performance Insights (optional)
- ✅ Slow query logs

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `DbEndpoint` | RDS endpoint | API Stack (Lambda) |
| `DbSecretArn` | Secrets Manager ARN | API Stack (Lambda) |
| `DbName` | Database name | API Stack |
| `DbPort` | Database port (1433) | API Stack |

---

## 🚀 Deployment

```bash
# Deploy database stack (sau network stack)
cd OJT_infrastructure
npm run deploy:core

# Hoặc deploy riêng
cdk deploy OJT-DatabaseStack
```

**Deploy Time:** ~10-15 minutes (RDS takes time)

---

## 🔍 Verification

```bash
# Check RDS instance
aws rds describe-db-instances --db-instance-identifier ojt-database-dev

# Get secret value
aws secretsmanager get-secret-value --secret-id OJT/RDS/Credentials

# Test connection (từ trong VPC)
sqlcmd -S ojt-database.xxx.rds.amazonaws.com,1433 -U admin -P 'password' -Q "SELECT @@VERSION"
```

---

## 🔄 Database Migration

### Initial Setup

```sql
-- Run migration scripts
-- 1. Create tables
sqlcmd -S endpoint -U admin -P password -i migration_create_tables.sql

-- 2. Add COD columns
sqlcmd -S endpoint -U admin -P password -i migration_add_cod_columns.sql

-- 3. Add IsActive column
sqlcmd -S endpoint -U admin -P password -i add_isactive_column.sql

-- 4. Seed data (optional)
sqlcmd -S endpoint -U admin -P password -i sample.sql
```

### Backup & Restore

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ojt-database-dev \
  --db-snapshot-identifier ojt-backup-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ojt-database-restored \
  --db-snapshot-identifier ojt-backup-20251207
```

---

## 📊 Monitoring Metrics

### CloudWatch Metrics
- CPU Utilization
- Database Connections
- Free Storage Space
- Read/Write IOPS
- Read/Write Latency
- Network Throughput

### Alarms
- High CPU (>80%)
- Low Storage Space (<2GB)
- High Connection Count (>90% of max)
- Replication Lag (Multi-AZ)

---

## 📚 Related Documentation

- [RDS SQL Server Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_SQLServer.html)
- [Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [RDS Backup and Restore](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html)

---

## ⚠️ Important Notes

### 💰 Cost Optimization
1. **t3.micro Instance**: Đã tối ưu từ t3.small → t3.micro
   - Saves: $39/month
   - Sufficient cho Spring Boot + HikariCP (max 20 connections)
   - Trade-off: Lower RAM (1GB vs 2GB), acceptable for dev/staging

2. **1-Day Backup**: Giảm từ 7 days → 1 day
   - Saves: $2/month
   - Sufficient for development environment
   - 🚀 Increase to 7 days for production compliance

3. **Single-AZ**: Multi-AZ disabled
   - Saves: $54/month
   - Trade-off: No automatic failover (acceptable for non-production)
   - 🚀 Enable Multi-AZ for production high availability

### 📊 Performance
4. **Express Edition Limitations:**
   - Max 10 GB database size per database
   - Max 1 CPU socket utilized
   - Max 1 GB RAM usage by SQL Server
   - Good for small/medium applications

5. **t3.micro Specs:**
   - 2 vCPUs (burstable)
   - 1 GB RAM total
   - Suitable for HikariCP connection pool (10-20 connections)
   - Monitor CPU credits for sustained workloads

### 🚀 When to Scale Up
6. **Monitor these metrics:**
   - Database CPU > 70% consistently
   - Free memory < 200MB
   - Connection count > 15 (out of ~20 max)
   - Slow query performance (>1s for simple queries)

7. **Scaling Path:**
   - Step 1: Upgrade t3.micro → t3.small (+$39/month)
   - Step 2: Enable Multi-AZ (+$54/month)
   - Step 3: Increase backup retention (+$2/month)
   - Production total: ~$110/month

### 🔒 Security
8. **Network Isolation:**
   - Database in private subnets (not isolated)
   - Can access internet via NAT Gateway for updates
   - No public endpoint enabled

9. **Credentials:**
   - Stored in AWS Secrets Manager
   - Auto-generated strong password
   - Rotation enabled (optional)

---

**Stack Status:** ✅ Cost-Optimized for Development/Staging  
**Configuration:** t3.micro, 1-day backup, Single-AZ  
**Last Updated:** December 2025

3. **Backup:** Automated backups retained for 7 days (có thể extend)

4. **Migration:** Use Database Migration Service (DMS) nếu migrate từ on-premise

5. **Connection Pooling:** Lambda nên dùng RDS Data API để tránh connection issues

---

**Stack Status:** ✅ Production Ready  
**Last Updated:** December 2025
