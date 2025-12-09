import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface StorageStackProps extends cdk.StackProps {
  appName: string;
}

/**
 * Storage Stack - S3 Buckets cho Images và Logs
 * 
 * Buckets:
 * 1. Images Bucket - Public read (product images, banners)
 * 2. Logs Bucket - Private (API logs, CloudFront logs)
 * 
 * NOTE: Frontend bucket + CloudFront ở Frontend Stack (deploy riêng)
 */
export class StorageStack extends cdk.Stack {
  public readonly imagesBucket: s3.Bucket;
  public readonly logsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const bucketPrefix = props.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // ========================================
    // 1. IMAGES BUCKET - Public read (product images, banners)
    // ========================================
    this.imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: `${bucketPrefix}-images-${this.account}`,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
      lifecycleRules: [
        {
          id: 'MoveToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // Public read policy
    this.imagesBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.imagesBucket.bucketArn}/*`],
      })
    );

    // ========================================
    // 2. LOGS BUCKET - Private (API logs, CloudFront logs)
    // ========================================
    this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName: `${bucketPrefix}-logs-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED, // Required for CloudFront logs
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          enabled: true,
          expiration: cdk.Duration.days(30),
        },
      ],
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Allow CloudFront to write logs
    this.logsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${this.logsBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceAccount': this.account,
          },
        },
      })
    );

    // ========================================
    // OUTPUTS
    // ========================================
    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: this.imagesBucket.bucketName,
      description: 'S3 bucket for product images (public read)',
      exportName: `${props.appName}-ImagesBucketName`,
    });

    new cdk.CfnOutput(this, 'ImagesBucketUrl', {
      value: `https://${this.imagesBucket.bucketRegionalDomainName}`,
      description: 'S3 images bucket URL',
      exportName: `${props.appName}-ImagesBucketUrl`,
    });

    new cdk.CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      description: 'S3 bucket for logs',
      exportName: `${props.appName}-LogsBucketName`,
    });
  }
}
