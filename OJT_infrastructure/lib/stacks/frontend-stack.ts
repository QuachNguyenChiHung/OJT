import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  appName: string;
  logsBucketName?: string;
  apiUrl?: string;
}

/**
 * Frontend Stack - S3 Frontend Bucket + CloudFront + OAC
 * 
 * Tất cả trong 1 stack, deploy riêng sau khi test BE xong
 * 
 * Deploy Backend trước:
 *   npx cdk deploy OJT-Ecommerce-NetworkStack OJT-Ecommerce-StorageStack \
 *       OJT-Ecommerce-DatabaseStack OJT-Ecommerce-ApiStack
 * 
 * Deploy Frontend sau:
 *   npx cdk deploy OJT-Ecommerce-FrontendStack
 */
export class FrontendStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const bucketPrefix = props.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // ========================================
    // 1. FRONTEND S3 BUCKET - Private (CloudFront OAC only)
    // ========================================
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `${bucketPrefix}-frontend-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // ========================================
    // 2. CLOUDFRONT OAC
    // ========================================
    const oac = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: `${props.appName}-frontend-OAC`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
        description: `OAC for ${props.appName} Frontend - Secure S3 access`,
      },
    });

    // ========================================
    // 3. CLOUDFRONT DISTRIBUTION
    // ========================================
    
    // Import logs bucket if provided
    let logsBucket: s3.IBucket | undefined;
    if (props.logsBucketName) {
      logsBucket = s3.Bucket.fromBucketName(this, 'LogsBucket', props.logsBucketName);
    }

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${props.appName} Frontend`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.frontendBucket, {
          originAccessControl: cloudfront.S3OriginAccessControl.fromOriginAccessControlId(
            this,
            'ImportedOAC',
            oac.attrId
          ),
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      enableLogging: !!logsBucket,
      logBucket: logsBucket,
      logFilePrefix: logsBucket ? 'cloudfront/' : undefined,
    });

    // ========================================
    // 4. S3 BUCKET POLICY FOR OAC
    // ========================================
    this.frontendBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${this.frontendBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // ========================================
    // OUTPUTS
    // ========================================
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'S3 bucket for frontend',
      exportName: `${props.appName}-FrontendBucketName`,
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront URL (HTTPS)',
      exportName: `${props.appName}-CloudFrontUrl`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${props.appName}-DistributionId`,
    });

    new cdk.CfnOutput(this, 'DeployCommand', {
      value: `cd OJT_frontendDev && npm run build && aws s3 sync dist/ s3://${this.frontendBucket.bucketName}/ --delete && aws cloudfront create-invalidation --distribution-id ${this.distribution.distributionId} --paths "/*"`,
      description: 'Deploy frontend command',
    });
  }
}
