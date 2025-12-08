import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface StorageStackProps extends cdk.StackProps {
  appName: string;
}

export class StorageStack extends cdk.Stack {
  public readonly imagesBucket: s3.Bucket;
  public readonly frontendBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // Images Bucket (for product images)
    this.imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      bucketName: process.env.IMAGES_BUCKET_NAME || 
                  `${props.appName.toLowerCase()}-images`,
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
          id: 'DeleteOldImages',
          enabled: false, // Enable in production if needed
          expiration: cdk.Duration.days(365),
        },
      ],
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // Bucket policy for public read access
    this.imagesBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.imagesBucket.bucketArn}/*`],
      })
    );

    // Frontend Bucket (for React app)
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: process.env.FRONTEND_BUCKET_NAME || 
                  `${props.appName.toLowerCase()}-frontend`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // Bucket policy for frontend public access
    this.frontendBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.frontendBucket.bucketArn}/*`],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: this.imagesBucket.bucketName,
      description: 'S3 bucket for product images',
      exportName: `${props.appName}-ImagesBucketName`,
    });

    new cdk.CfnOutput(this, 'ImagesBucketUrl', {
      value: this.imagesBucket.bucketWebsiteUrl,
      description: 'S3 images bucket URL',
      exportName: `${props.appName}-ImagesBucketUrl`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'S3 bucket for frontend React app',
      exportName: `${props.appName}-FrontendBucketName`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketUrl', {
      value: this.frontendBucket.bucketWebsiteUrl,
      description: 'S3 frontend bucket website URL',
      exportName: `${props.appName}-FrontendBucketUrl`,
    });
  }
}
