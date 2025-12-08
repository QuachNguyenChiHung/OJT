# 📊 Monitoring Stack - CloudWatch Dashboard & Alarms

## 📋 Stack Information

**Stack Name:** `OJT-MonitoringStack`  
**Purpose:** CloudWatch monitoring, dashboards, và alarms  
**Deploy Order:** 5 (Cuối cùng, sau tất cả stacks)

---

## 🏗️ AWS Services

### 1. **Amazon CloudWatch Dashboard**
- **Service:** CloudWatch Dashboard
- **Purpose:** Tổng quan metrics và monitoring

#### Dashboard Configuration
- **Dashboard Name:** `OJT-{environment}-Dashboard`
- **Refresh:** Auto-refresh every 1 minute
- **Time Range:** Last 3 hours (configurable)

#### Widgets

##### API Gateway Metrics
- **Total Requests:** Line graph (Sum)
- **Request Rate:** Requests per minute
- **Latency:** p50, p95, p99 percentiles
- **4XX Errors:** Client error count
- **5XX Errors:** Server error count
- **Integration Latency:** Lambda execution time

##### Lambda Metrics
- **Invocations:** Total function calls
- **Duration:** Execution time (average, max)
- **Errors:** Failed invocations
- **Throttles:** Rate-limited calls
- **Concurrent Executions:** Active instances
- **Dead Letter Errors:** Failed async invocations

##### RDS Metrics
- **CPU Utilization:** Percentage
- **Database Connections:** Active connections
- **Free Storage Space:** Available disk
- **Read/Write IOPS:** I/O operations
- **Network Throughput:** Bytes in/out

##### CloudFront Metrics
- **Requests:** Total requests
- **Bytes Downloaded:** Data transfer
- **Cache Hit Rate:** % cached
- **4XX/5XX Error Rate:** Error percentage

##### S3 Metrics (Optional)
- **Bucket Size:** Total storage
- **Number of Objects:** Object count
- **All Requests:** API calls

### 2. **CloudWatch Alarms**
- **Service:** CloudWatch Alarms
- **Purpose:** Alert khi có issues

#### API Gateway Alarms

##### High 5XX Error Rate
- **Metric:** 5XXError
- **Threshold:** > 1% of requests
- **Period:** 5 minutes
- **Evaluation:** 2 datapoints out of 3
- **Action:** Send SNS notification
- **Severity:** CRITICAL

##### High Latency
- **Metric:** Latency (p99)
- **Threshold:** > 3000ms
- **Period:** 5 minutes
- **Evaluation:** 3 datapoints out of 3
- **Action:** Send SNS notification
- **Severity:** WARNING

#### Lambda Alarms

##### Function Errors
- **Metric:** Errors
- **Threshold:** > 5 errors in 5 minutes
- **Period:** 5 minutes
- **Evaluation:** 1 datapoint out of 1
- **Action:** Send SNS notification
- **Severity:** CRITICAL

##### High Duration
- **Metric:** Duration (average)
- **Threshold:** > 25 seconds (83% of timeout)
- **Period:** 5 minutes
- **Evaluation:** 3 datapoints out of 3
- **Action:** Send SNS notification
- **Severity:** WARNING

##### Throttles
- **Metric:** Throttles
- **Threshold:** > 0
- **Period:** 5 minutes
- **Evaluation:** 1 datapoint out of 1
- **Action:** Send SNS notification
- **Severity:** WARNING

#### RDS Alarms

##### High CPU
- **Metric:** CPUUtilization
- **Threshold:** > 80%
- **Period:** 5 minutes
- **Evaluation:** 3 datapoints out of 3
- **Action:** Send SNS notification
- **Severity:** WARNING

##### Low Storage
- **Metric:** FreeStorageSpace
- **Threshold:** < 2 GB
- **Period:** 5 minutes
- **Evaluation:** 1 datapoint out of 1
- **Action:** Send SNS notification
- **Severity:** CRITICAL

##### High Connection Count
- **Metric:** DatabaseConnections
- **Threshold:** > 90% of max_connections
- **Period:** 5 minutes
- **Evaluation:** 2 datapoints out of 2
- **Action:** Send SNS notification
- **Severity:** WARNING

### 3. **Amazon SNS (Simple Notification Service)**
- **Service:** SNS Topic
- **Purpose:** Gửi notifications cho alarms

#### SNS Configuration
- **Topic Name:** `OJT-{environment}-Alerts`
- **Protocol:** Email, SMS (configurable)
- **Endpoints:**
  - Email: devops@yourdomain.com
  - SMS: +84901234567 (optional)
- **Filter Policy:** None (all alarms)

#### Notification Format
```
ALARM: "OJT-HighAPILatency" in ASIA-PACIFIC (SINGAPORE)
Threshold Crossed: 2 datapoints were greater than 3000.0

Alarm Details:
- AlarmName: OJT-HighAPILatency
- AlarmDescription: API latency exceeded 3 seconds
- AWSAccountId: 123456789012
- NewStateValue: ALARM
- NewStateReason: Threshold Crossed
- StateChangeTime: 2025-12-07T10:30:00.000+0000
- Region: ASIA-PACIFIC (SINGAPORE)
- Metric: Latency
- Namespace: AWS/ApiGateway
```

### 4. **CloudWatch Logs**
- **Service:** CloudWatch Logs
- **Purpose:** Centralized logging

#### Log Groups

##### Lambda Logs
- **Log Group:** `/aws/lambda/{function-name}`
- **Retention:** 7 days
- **Log Level:** INFO (DEBUG for dev)

##### API Gateway Logs
- **Log Group:** `/aws/apigateway/{api-id}/{stage}`
- **Retention:** 7 days
- **Log Format:** JSON
- **Include:**
  - Request ID
  - HTTP method & path
  - Status code
  - Latency
  - Error message (if any)

##### RDS Logs (Optional)
- **Log Types:**
  - Error logs
  - Slow query logs (>1 second)
  - General logs (not recommended, high cost)

#### Log Insights Queries

##### Top API Endpoints
```
fields @timestamp, httpMethod, resourcePath, status
| filter status >= 200
| stats count() by resourcePath
| sort count desc
| limit 10
```

##### Error Analysis
```
fields @timestamp, errorMessage, errorType
| filter @message like /ERROR/
| stats count() by errorType
| sort count desc
```

##### Slow Lambda Functions
```
fields @timestamp, @duration
| filter @duration > 1000
| stats avg(@duration), max(@duration), count()
```

---

## 📊 Monitoring Architecture

```
┌──────────────────────────────────────────────────┐
│          CloudWatch Dashboard                     │
│        OJT-dev-Dashboard                         │
│                                                   │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ API Gateway    │  │    Lambda      │         │
│  │ - Requests     │  │ - Invocations  │         │
│  │ - Latency      │  │ - Errors       │         │
│  │ - Errors       │  │ - Duration     │         │
│  └────────────────┘  └────────────────┘         │
│                                                   │
│  ┌────────────────┐  ┌────────────────┐         │
│  │      RDS       │  │  CloudFront    │         │
│  │ - CPU          │  │ - Requests     │         │
│  │ - Connections  │  │ - Cache Rate   │         │
│  │ - Storage      │  │ - Errors       │         │
│  └────────────────┘  └────────────────┘         │
│                                                   │
└──────────────────────────────────────────────────┘
                     │
                     │ Metrics
                     ▼
┌──────────────────────────────────────────────────┐
│           CloudWatch Alarms                       │
│                                                   │
│  ⚠️  High API Latency (>3s)                      │
│  ⚠️  High 5XX Errors (>1%)                       │
│  ⚠️  Lambda Errors (>5)                          │
│  ⚠️  RDS High CPU (>80%)                         │
│  ⚠️  RDS Low Storage (<2GB)                      │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     │ Trigger
                     ▼
┌──────────────────────────────────────────────────┐
│              SNS Topic                            │
│         OJT-dev-Alerts                           │
│                                                   │
│  Subscribers:                                     │
│  📧 devops@yourdomain.com                        │
│  📱 +84901234567 (SMS)                           │
│                                                   │
└──────────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Notification          │
        │  - Email alert         │
        │  - SMS alert           │
        │  - Slack (optional)    │
        └────────────────────────┘
```

---

## 💰 Cost Estimate

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| CloudWatch Dashboard | 1 dashboard | FREE (first 3) |
| CloudWatch Alarms | 10 alarms | FREE (first 10) |
| CloudWatch Logs | 5 GB ingestion | $2.50 |
| CloudWatch Logs Storage | 5 GB | $0.25 |
| SNS Notifications | 100 emails | FREE (first 1000) |
| SNS SMS | 10 messages | ~$0.60 |
| **Total** | | **~$3.35/month** |

**Free Tier:**
- Dashboards: First 3 free
- Alarms: First 10 free
- Metrics: First 10 custom metrics free
- SNS: 1,000 email notifications free
- Logs Insights: 5 GB scanned free

**Cost at Scale:**
- 50 GB logs: ~$27
- 100 alarms: ~$45
- 10 dashboards: ~$3

---

## 🚀 Deployment

```bash
# Deploy monitoring stack
cd OJT_infrastructure
npm run deploy:monitoring

# Verify dashboard
# Go to CloudWatch Console → Dashboards → OJT-dev-Dashboard
```

**Deploy Time:** ~2 minutes

---

## 🔍 Verification

```bash
# List dashboards
aws cloudwatch list-dashboards

# List alarms
aws cloudwatch describe-alarms --alarm-names "OJT-*"

# Test alarm (trigger manually)
aws cloudwatch set-alarm-state \
  --alarm-name "OJT-HighAPILatency" \
  --state-value ALARM \
  --state-reason "Testing alarm"

# Check SNS subscriptions
aws sns list-subscriptions-by-topic \
  --topic-arn "arn:aws:sns:ap-southeast-1:123456789012:OJT-dev-Alerts"
```

---

## 📊 Dashboard URL

**Direct Link:**
```
https://console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=OJT-dev-Dashboard
```

---

## 🔔 SNS Subscription Setup

### Confirm Email Subscription

1. Deploy stack → SNS sends confirmation email
2. Check email inbox
3. Click "Confirm subscription" link
4. Status changes to "Confirmed"

### Add More Subscribers

```bash
# Add email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-1:123456789012:OJT-dev-Alerts \
  --protocol email \
  --notification-endpoint another@example.com

# Add SMS
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-1:123456789012:OJT-dev-Alerts \
  --protocol sms \
  --notification-endpoint +84901234567
```

---

## 📊 Monitoring Best Practices

### Metrics Collection
1. **Enable Detailed Monitoring:** For critical resources
2. **Custom Metrics:** Business-specific metrics (e.g., orders/minute)
3. **Distributed Tracing:** AWS X-Ray for request flow

### Alerting
1. **Alert Fatigue:** Don't alert on non-actionable issues
2. **Severity Levels:** CRITICAL vs WARNING
3. **Escalation:** Multiple notification channels
4. **Runbooks:** Document response procedures

### Logging
1. **Structured Logging:** JSON format
2. **Log Levels:** ERROR, WARN, INFO, DEBUG
3. **Sensitive Data:** Mask passwords, tokens
4. **Retention:** 7 days for dev, 30+ for prod

### Cost Optimization
1. **Log Retention:** Shorten for non-critical logs
2. **Metric Resolution:** 1-minute vs 5-minute
3. **Dashboard Sharing:** Use snapshots instead of live
4. **Alarm Consolidation:** Composite alarms

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `DashboardName` | CloudWatch dashboard name | Quick access |
| `DashboardUrl` | Direct dashboard URL | Documentation |
| `AlertTopicArn` | SNS topic ARN | Additional subscriptions |

---

## 📚 Related Documentation

- [CloudWatch Dashboards](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)
- [CloudWatch Alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- [SNS Documentation](https://docs.aws.amazon.com/sns/)

---

## ⚠️ Important Notes

1. **Email Confirmation:** SNS subscriptions cần confirm qua email
2. **SMS Cost:** SMS notifications tốn tiền (~$0.06/message)
3. **Alarm Actions:** Có thể trigger Lambda, Auto Scaling, etc.
4. **Dashboard Limit:** Free tier chỉ có 3 dashboards
5. **Log Retention:** Default 7 days, có thể extend

---

## 🎯 Recommended Alarms

### Production Environment
- ✅ API 5XX errors
- ✅ API high latency
- ✅ Lambda errors
- ✅ Lambda throttles
- ✅ RDS high CPU
- ✅ RDS low storage
- ✅ RDS high connections
- ✅ CloudFront high error rate

### Development Environment
- ✅ API 5XX errors (relaxed threshold)
- ✅ Lambda errors
- ✅ RDS low storage

---

## 📊 Custom Metrics (Optional)

### Business Metrics
```javascript
// In Lambda function
const cloudwatch = new AWS.CloudWatch();

await cloudwatch.putMetricData({
  Namespace: 'OJT/Business',
  MetricData: [{
    MetricName: 'OrdersCreated',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date()
  }]
}).promise();
```

### Dashboard Widget
```json
{
  "metrics": [
    ["OJT/Business", "OrdersCreated", { "stat": "Sum", "period": 300 }]
  ],
  "period": 300,
  "stat": "Sum",
  "region": "ap-southeast-1",
  "title": "Orders Created (5min)"
}
```

---

**Stack Status:** ✅ Production Ready  
**Last Updated:** December 2025  
**Dashboard:** View in CloudWatch Console
