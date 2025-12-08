#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';

// Load environment variables
dotenv.config();

const app = new cdk.App();

const appName = process.env.APP_NAME || 'OJT';
const account = process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'ap-southeast-1';

const stackProps: cdk.StackProps = {
  env: {
    account,
    region,
  },
  tags: {
    Project: appName,
    ManagedBy: 'AWS CDK',
  },
};

// 1. Network Stack (VPC)
const networkStack = new NetworkStack(app, `${appName}-NetworkStack`, {
  ...stackProps,
  appName,
});

// 2. Storage Stack (S3 Buckets)
const storageStack = new StorageStack(app, `${appName}-StorageStack`, {
  ...stackProps,
  appName,
});

// 3. Auth Stack (Cognito)
const authStack = new AuthStack(app, `${appName}-AuthStack`, {
  ...stackProps,
  appName,
});

// 4. Database Stack (RDS)
const databaseStack = new DatabaseStack(app, `${appName}-DatabaseStack`, {
  ...stackProps,
  appName,
  vpc: networkStack.vpc,
});
databaseStack.addDependency(networkStack);

// 5. API Stack (Lambda + API Gateway)
const apiStack = new ApiStack(app, `${appName}-ApiStack`, {
  ...stackProps,
  appName,
  vpc: networkStack.vpc,
  dbSecretArn: databaseStack.dbSecret.secretArn,
  dbEndpoint: cdk.Fn.importValue(`${appName}-DBEndpoint`),
  dbName: process.env.DB_NAME || 'demoaws',
  imagesBucketName: storageStack.imagesBucket.bucketName,
});
apiStack.addDependency(networkStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(storageStack);

// 6. Frontend Stack (CloudFront)
const frontendStack = new FrontendStack(app, `${appName}-FrontendStack`, {
  ...stackProps,
  appName,
  frontendBucket: storageStack.frontendBucket,
  apiUrl: apiStack.api.url,
});
frontendStack.addDependency(storageStack);
frontendStack.addDependency(apiStack);

// 7. Monitoring Stack (CloudWatch)
const monitoringStack = new MonitoringStack(app, `${appName}-MonitoringStack`, {
  ...stackProps,
  appName,
  apiId: apiStack.api.restApiId,
  alarmEmail: process.env.ALARM_EMAIL,
});
monitoringStack.addDependency(apiStack);

app.synth();
