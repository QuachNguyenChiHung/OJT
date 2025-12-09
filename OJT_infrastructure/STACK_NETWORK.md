# 🌐 Network Stack - VPC Infrastructure

## 📋 Stack Information

**Stack Name:** `OJT-NetworkStack`  
**Purpose:** Tạo Virtual Private Cloud (VPC) và network infrastructure  
**Deploy Order:** 1 (Deploy đầu tiên)  
**Deploy Time:** ~5 minutes  
**Monthly Cost:** ~$23 ✅ **OPTIMIZED** (Reduced from $46)

---

## 🏗️ AWS Services

### 1. **Amazon VPC (Virtual Private Cloud)**
- **Service:** VPC
- **Purpose:** Mạng ảo riêng biệt trong AWS
- **Configuration:**
  - CIDR Block: 10.0.0.0/16
  - DNS Support: Enabled
  - DNS Hostnames: Enabled

### 2. **Subnets (Public, Private, Isolated)**
- **Service:** VPC Subnets
- **Purpose:** Phân chia VPC thành các mạng con

#### Public Subnets (2 AZs)
- Internet-facing resources
- NAT Gateway
- Bastion Host (nếu cần)
- Public IP addresses enabled

#### Private Subnets (2 AZs)
- Lambda Functions
- Application servers
- Internal services
- No direct internet access (qua NAT Gateway)

#### Isolated Subnets (2 AZs)
- RDS Database
- Sensitive data storage
- No internet access at all
- Highest security tier

### 3. **Internet Gateway**
- **Service:** Internet Gateway
- **Purpose:** Cho phép VPC kết nối với Internet
- **Attached to:** VPC
- **Routes to:** Public subnets

### 4. **NAT Gateway** ✅ **COST OPTIMIZED**
- **Service:** NAT Gateway
- **Purpose:** Cho phép private subnets truy cập Internet (outbound only)
- **Configuration:** **1 NAT Gateway** (cost optimized)
- **Location:** Public subnet (single AZ)
- **Elastic IP:** Auto-allocated
- **Cost Optimization:** Reduced from 2 to 1 NAT Gateway (-$23/month)

**Key Points:**
- ✅ Sufficient for development/staging environments
- ✅ Suitable for low-medium traffic (< 1000 concurrent users)
- ⚠️ Single point of failure (acceptable for non-production)
- 🚀 Can scale to 2 NAT Gateways for production high availability

### 5. **Route Tables**
- **Service:** VPC Route Tables
- **Purpose:** Định tuyến traffic giữa các subnets

#### Public Route Table
- Route to Internet Gateway (0.0.0.0/0)
- Associated with public subnets

#### Private Route Table
- Route to NAT Gateway (0.0.0.0/0)
- Associated with private subnets

#### Isolated Route Table
- No internet routes
- Local VPC traffic only
- Associated with isolated subnets

### 6. **Security Groups**
- **Service:** VPC Security Groups
- **Purpose:** Firewall rules cho resources

#### Lambda Security Group
- Outbound: All traffic allowed
- Inbound: From API Gateway

#### RDS Security Group
- Inbound: Port 1433 (SQL Server) from Lambda SG
- Outbound: None

#### VPC Endpoints Security Group
- Inbound: HTTPS (443) from private subnets
- Outbound: None

### 7. **VPC Endpoints**
- **Service:** VPC Endpoints (Interface/Gateway)
- **Purpose:** Private connection đến AWS services

#### S3 Gateway Endpoint
- Service: S3
- Type: Gateway
- No internet required for S3 access

#### Secrets Manager Interface Endpoint
- Service: Secrets Manager
- Type: Interface
- Private DNS enabled

#### RDS Data API Endpoint
- Service: RDS Data
- Type: Interface
- Private DNS enabled

---

## 📊 Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
└────────────────────────┬────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │ Internet Gateway │
                └────────┬────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    VPC (10.0.0.0/16)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         Public Subnets (2 AZs)                 │     │
│  │         10.0.0.0/24, 10.0.1.0/24              │     │
│  │                                                │     │
│  │  - 1 NAT Gateway ✅ (Cost Optimized)          │     │
│  │  - Elastic IP                                  │     │
│  └──────────────────┬─────────────────────────────┘     │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────┐        │
│  │       Private Subnets (2 AZs)               │        │
│  │       10.0.10.0/24, 10.0.11.0/24           │        │
│  │                                              │        │
│  │  - Lambda Functions                         │        │
│  │  - Application Resources                    │        │
│  │  - Internet access via NAT Gateway          │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │      Isolated Subnets (2 AZs)               │        │
│  │      10.0.20.0/24, 10.0.21.0/24            │        │
│  │                                              │        │
│  │  - RDS Database                             │        │
│  │  - No internet access                       │        │
│  │  - Highest security                         │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  VPC Endpoints:                                          │
│  - S3 Gateway Endpoint                                   │
│  - Secrets Manager Interface Endpoint                    │
│  - RDS Data API Interface Endpoint                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Estimate

### ✅ **OPTIMIZED Configuration (Current)**

| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| VPC | Free | $0 |
| Subnets | Free | $0 |
| Internet Gateway | Free | $0 |
| **NAT Gateway** | **1 instance** (optimized) | **~$23** |
| NAT Gateway Data Transfer | 10GB | ~$0.45 |
| **Total** | | **~$23.45/month** ✅ |

**Cost Optimization Applied:**
- ✅ **Reduced NAT Gateways from 2 to 1: Saves $23/month**
- Single NAT Gateway is sufficient for development/staging environments
- Suitable for low-medium traffic (< 1000 concurrent users)

### 📊 **Original Configuration (Not Recommended)**

| Resource | Configuration | Monthly Cost |
|----------|--------------|--------------|
| NAT Gateway | 2 instances (Multi-AZ) | ~$46 |
| NAT Gateway Data Transfer | 10GB | ~$0.45 |
| **Total** | | **~$46.45/month** |

### 🚀 **When to Scale Up to 2 NAT Gateways**

Scale up when experiencing:
- NAT Gateway bandwidth saturation
- Need for higher availability in production
- Traffic > 1000 concurrent users
- Multi-AZ redundancy requirement

**Additional Cost:** +$23/month

---

## 🔐 Security Features

### Network Isolation
- ✅ 3-tier architecture (Public/Private/Isolated)
- ✅ Database hoàn toàn isolated (no internet)
- ✅ Lambda trong private subnet

### Traffic Control
- ✅ Security Groups (stateful firewall)
- ✅ Network ACLs (stateless firewall)
- ✅ Private connectivity via VPC Endpoints

### High Availability
- ✅ Multi-AZ deployment (2 availability zones)
- ⚠️ Single NAT Gateway (cost optimized for dev/staging)
- ✅ Subnet redundancy across AZs
- 🚀 Can scale to 2 NAT Gateways for production HA

---

## 📤 Outputs

Stack này export các values sau cho stacks khác:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `VpcId` | VPC ID | All stacks |
| `PublicSubnetIds` | Public subnet IDs | Frontend, Monitoring |
| `PrivateSubnetIds` | Private subnet IDs | Lambda, API Gateway |
| `IsolatedSubnetIds` | Isolated subnet IDs | RDS Database |
| `LambdaSecurityGroupId` | Lambda SG ID | API Stack |
| `RdsSecurityGroupId` | RDS SG ID | Database Stack |

---

## 🚀 Deployment

```bash
# Deploy network stack
cd OJT_infrastructure
npm run deploy:core

# Hoặc deploy riêng
cdk deploy OJT-NetworkStack
```

**Deploy Time:** ~5 minutes

---

## 🔍 Verification

Sau khi deploy, verify:

```bash
# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=OJT-*"

# Check Subnets
aws ec2 describe-subnets --filters "Name=tag:aws:cloudformation:stack-name,Values=OJT-NetworkStack"

# Check NAT Gateway
aws ec2 describe-nat-gateways --filter "Name=state,Values=available"

# Check VPC Endpoints
aws ec2 describe-vpc-endpoints
```

---

## 📚 Related Documentation

- [AWS VPC Documentation](https://docs.aws.amazon.com/vpc/)
- [NAT Gateway Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
- [VPC Endpoints Guide](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html)

---

## ⚠️ Important Notes

### 💰 Cost Optimization
1. **NAT Gateway**: Đã tối ưu từ 2 → 1 NAT Gateway
   - Saves: $23/month
   - Sufficient for development/staging (< 1000 concurrent users)
   - Trade-off: Single point of failure (acceptable for non-production)

2. **When to Scale Up**:
   - Production deployment → Add 2nd NAT Gateway (+$23/month)
   - High traffic (> 1000 users) → Multi-AZ NAT redundancy
   - NAT Gateway bandwidth saturation → Additional NAT Gateway

### 🏗️ Architecture
3. **Multi-AZ**: Subnets deployed across 2 availability zones for HA
4. **CIDR Planning**: 10.0.0.0/16 cho phép ~65,000 IPs
5. **3-Tier Design**: Public/Private/Isolated for security isolation

### 🔒 Security
6. **Database Isolation**: RDS in isolated subnets (no internet access)
7. **Lambda Security**: Private subnets with NAT Gateway for outbound only
8. **VPC Endpoints**: Private connectivity to AWS services (no internet needed)

---

**Stack Status:** ✅ Cost-Optimized for Development/Staging  
**Configuration:** 1 NAT Gateway, Multi-AZ Subnets  
**Last Updated:** December 2025
