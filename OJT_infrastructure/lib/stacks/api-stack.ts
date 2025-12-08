import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  appName: string;
  vpc: ec2.IVpc;
  dbSecretArn: string;
  dbEndpoint: string;
  dbName: string;
  imagesBucketName: string;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add RDS Data API permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'rds-data:ExecuteStatement',
        'rds-data:BatchExecuteStatement',
        'secretsmanager:GetSecretValue',
      ],
      resources: ['*'],
    }));

    // Add S3 permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: [
        `arn:aws:s3:::${props.imagesBucketName}/*`,
        `arn:aws:s3:::${props.imagesBucketName}`,
      ],
    }));

    // Add Bedrock permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:*'],
      resources: ['*'],
    }));

    // Common environment variables
    const commonEnv = {
      DB_SECRET_ARN: props.dbSecretArn,
      DB_ENDPOINT: props.dbEndpoint,
      DB_NAME: props.dbName,
      IMAGES_BUCKET: props.imagesBucketName,
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
      // AWS_REGION is automatically set by Lambda runtime, cannot be set manually
      BEDROCK_AGENT_ID: process.env.BEDROCK_AGENT_ID || '',
      BEDROCK_AGENT_ALIAS_ID: process.env.BEDROCK_AGENT_ALIAS_ID || '',
    };

    // Placeholder Lambda code - will be updated after deployment
    const placeholderCode = lambda.Code.fromInline(`
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ 
      message: 'Function not yet deployed. Please run: npm run deploy:lambda' 
    })
  };
};
    `);

    // Auth Lambda Functions (with placeholder code)
    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128, // Cost optimization: 128MB is sufficient for simple DB queries
      timeout: cdk.Duration.seconds(10), // Cost optimization: reduced from 30s
      logRetention: logs.RetentionDays.ONE_DAY, // Cost optimization: reduced from 1 week
      description: 'Auth - Login function (update code with: npm run deploy:lambda)',
    });

    const signupFunction = new lambda.Function(this, 'SignupFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Auth - Signup function (update code with: npm run deploy:lambda)',
    });

    const meFunction = new lambda.Function(this, 'MeFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Auth - Get current user function (update code with: npm run deploy:lambda)',
    });

    // Products Lambda Functions (with placeholder code)
    const getProductsFunction = new lambda.Function(this, 'GetProductsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Products - Get all products (update code with: npm run deploy:lambda)',
    });

    const getBestSellingFunction = new lambda.Function(this, 'GetBestSellingFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Products - Get best selling (update code with: npm run deploy:lambda)',
    });

    const getNewestFunction = new lambda.Function(this, 'GetNewestFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Products - Get newest (update code with: npm run deploy:lambda)',
    });

    const searchProductsFunction = new lambda.Function(this, 'SearchProductsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: placeholderCode,
      environment: commonEnv,
      role: lambdaRole,
      vpc: props.vpc,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      description: 'Products - Search products (update code with: npm run deploy:lambda)',
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `${props.appName}-API`,
      description: `${props.appName} Serverless API`,
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // API Routes - Auth
    const auth = this.api.root.addResource('auth');
    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginFunction));
    auth.addResource('signup').addMethod('POST', new apigateway.LambdaIntegration(signupFunction));
    auth.addResource('me').addMethod('GET', new apigateway.LambdaIntegration(meFunction));

    // API Routes - Products
    const products = this.api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsFunction));
    products.addResource('best-selling').addMethod('GET', new apigateway.LambdaIntegration(getBestSellingFunction));
    products.addResource('newest').addMethod('GET', new apigateway.LambdaIntegration(getNewestFunction));
    products.addResource('search').addMethod('GET', new apigateway.LambdaIntegration(searchProductsFunction));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: `${props.appName}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: `${props.appName}-ApiId`,
    });

    // Output Lambda function names for updating code later
    new cdk.CfnOutput(this, 'LoginFunctionName', {
      value: loginFunction.functionName,
      description: 'Login Lambda function name',
    });

    new cdk.CfnOutput(this, 'SignupFunctionName', {
      value: signupFunction.functionName,
      description: 'Signup Lambda function name',
    });

    new cdk.CfnOutput(this, 'MeFunctionName', {
      value: meFunction.functionName,
      description: 'Me Lambda function name',
    });

    new cdk.CfnOutput(this, 'GetProductsFunctionName', {
      value: getProductsFunction.functionName,
      description: 'Get Products Lambda function name',
    });

    new cdk.CfnOutput(this, 'GetBestSellingFunctionName', {
      value: getBestSellingFunction.functionName,
      description: 'Get Best Selling Lambda function name',
    });

    new cdk.CfnOutput(this, 'GetNewestFunctionName', {
      value: getNewestFunction.functionName,
      description: 'Get Newest Lambda function name',
    });

    new cdk.CfnOutput(this, 'SearchProductsFunctionName', {
      value: searchProductsFunction.functionName,
      description: 'Search Products Lambda function name',
    });
  }
}
