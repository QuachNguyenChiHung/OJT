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
  dbSecurityGroupId?: string;
  // Cognito (optional - if not provided, uses custom JWT)
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Security Group cho Lambda
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `${props.appName}-lambda-sg`,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Permissions for RDS, Secrets Manager, S3, Bedrock
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'rds-data:ExecuteStatement',
        'rds-data:BatchExecuteStatement',
        'secretsmanager:GetSecretValue',
      ],
      resources: ['*'],
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: [
        `arn:aws:s3:::${props.imagesBucketName}/*`,
        `arn:aws:s3:::${props.imagesBucketName}`,
      ],
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:*'],
      resources: ['*'],
    }));

    // Cognito permissions for auth operations
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminGetUser',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminDeleteUser',
        'cognito-idp:ListUsers',
      ],
      resources: ['*'],
    }));

    // Common environment variables
    const commonEnv = {
      DB_SECRET_ARN: props.dbSecretArn,
      DB_ENDPOINT: props.dbEndpoint,
      DB_NAME: props.dbName,
      IMAGES_BUCKET: props.imagesBucketName,
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
      BEDROCK_AGENT_ID: process.env.BEDROCK_AGENT_ID || '',
      BEDROCK_AGENT_ALIAS_ID: process.env.BEDROCK_AGENT_ALIAS_ID || '',
      // Cognito config (optional)
      COGNITO_USER_POOL_ID: props.cognitoUserPoolId || '',
      COGNITO_CLIENT_ID: props.cognitoClientId || '',
    };

    // Placeholder code - sẽ được replace bằng actual code khi deploy Lambda
    const placeholderCode = lambda.Code.fromInline(`
exports.handler = async (event) => {
  const path = event.path || event.rawPath;
  const method = event.httpMethod || event.requestContext?.http?.method;
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ 
      message: 'Lambda module ready - deploy actual code',
      path: path,
      method: method
    })
  };
};
    `);

    // VPC config for Lambda
    const lambdaVpcConfig = {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.lambdaSecurityGroup],
    };

    // Helper function to create Lambda module with LogGroup
    const createLambdaModule = (name: string, description: string, memorySize = 128, timeout = 10) => {
      const logGroup = new logs.LogGroup(this, `${name}LogGroup`, {
        logGroupName: `/aws/lambda/${props.appName}-${name}`,
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      return new lambda.Function(this, `${name}Function`, {
        functionName: `${props.appName}-${name}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: placeholderCode,
        environment: commonEnv,
        role: lambdaRole,
        ...lambdaVpcConfig,
        memorySize: memorySize,
        timeout: cdk.Duration.seconds(timeout),
        logGroup: logGroup,
        description: description,
      });
    };

    // ========================================
    // 11 LAMBDA MODULES (gom theo chức năng)
    // ========================================

    // 1. Auth Module (4 endpoints: login, signup, logout, me)
    const authModule = createLambdaModule('AuthModule', 'Auth: login, signup, logout, me');

    // 2. Products Module (12 endpoints: CRUD + search + filters)
    const productsModule = createLambdaModule('ProductsModule', 'Products: CRUD, search, filters', 256, 15);

    // 3. Product Details Module (7 endpoints: CRUD + images)
    const productDetailsModule = createLambdaModule('ProductDetailsModule', 'Product Details: CRUD, images', 256, 30);

    // 4. Cart Module (6 endpoints: add, get, update, remove, clear, count)
    const cartModule = createLambdaModule('CartModule', 'Cart: add, get, update, remove, clear');

    // 5. Orders Module (9 endpoints: CRUD + status + filters)
    const ordersModule = createLambdaModule('OrdersModule', 'Orders: CRUD, status, filters', 256, 15);

    // 6. Categories Module (6 endpoints: CRUD + search)
    const categoriesModule = createLambdaModule('CategoriesModule', 'Categories: CRUD, search');

    // 7. Brands Module (5 endpoints: CRUD)
    const brandsModule = createLambdaModule('BrandsModule', 'Brands: CRUD');

    // 8. Banners Module (7 endpoints: CRUD + toggle)
    const bannersModule = createLambdaModule('BannersModule', 'Banners: CRUD, toggle');

    // 9. Ratings Module (3 endpoints: get, stats, create)
    const ratingsModule = createLambdaModule('RatingsModule', 'Ratings: get, stats, create');

    // 10. Users Module (3 endpoints: getAll, getById, updateProfile)
    const usersModule = createLambdaModule('UsersModule', 'Users: getAll, getById, updateProfile');

    // 11. Images Module (1 endpoint: upload to S3)
    const imagesModule = createLambdaModule('ImagesModule', 'Images: upload to S3', 512, 30);

    // 12. Database Admin Module (setup, migrations)
    const databaseModule = createLambdaModule('DatabaseModule', 'Database: setup, migrations', 256, 120);

    // ========================================
    // API GATEWAY
    // ========================================
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `${props.appName}-API`,
      description: `${props.appName} E-commerce API - 11 modules, 63 endpoints`,
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: false, // Disable X-Ray tracing to avoid additional cost
        metricsEnabled: true,
        // Note: CloudWatch logging disabled - requires account-level IAM role setup
        // To enable: aws apigateway update-account --patch-operations op=replace,path=/cloudwatchRoleArn,value=<role-arn>
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

    // Lambda integrations
    const authIntegration = new apigateway.LambdaIntegration(authModule);
    const productsIntegration = new apigateway.LambdaIntegration(productsModule);
    const productDetailsIntegration = new apigateway.LambdaIntegration(productDetailsModule);
    const cartIntegration = new apigateway.LambdaIntegration(cartModule);
    const ordersIntegration = new apigateway.LambdaIntegration(ordersModule);
    const categoriesIntegration = new apigateway.LambdaIntegration(categoriesModule);
    const brandsIntegration = new apigateway.LambdaIntegration(brandsModule);
    const bannersIntegration = new apigateway.LambdaIntegration(bannersModule);
    const ratingsIntegration = new apigateway.LambdaIntegration(ratingsModule);
    const usersIntegration = new apigateway.LambdaIntegration(usersModule);
    const imagesIntegration = new apigateway.LambdaIntegration(imagesModule);
    const databaseIntegration = new apigateway.LambdaIntegration(databaseModule);

    // ========================================
    // API ROUTES
    // ========================================

    // --- AUTH ROUTES (8 endpoints) ---
    const auth = this.api.root.addResource('auth');
    auth.addResource('login').addMethod('POST', authIntegration);
    auth.addResource('signup').addMethod('POST', authIntegration);
    auth.addResource('logout').addMethod('POST', authIntegration);
    auth.addResource('me').addMethod('GET', authIntegration);
    auth.addResource('forgot-password').addMethod('POST', authIntegration);
    auth.addResource('reset-password').addMethod('POST', authIntegration);
    auth.addResource('verify').addMethod('POST', authIntegration);
    auth.addResource('check-duplicate').addMethod('POST', authIntegration);

    // --- PRODUCTS ROUTES (13 endpoints) ---
    const products = this.api.root.addResource('products');
    products.addMethod('GET', productsIntegration);  // Get all
    products.addMethod('POST', productsIntegration); // Create (Admin)
    const productId = products.addResource('{id}');
    productId.addMethod('GET', productsIntegration);    // Get by ID
    productId.addMethod('PUT', productsIntegration);    // Update (Admin)
    productId.addMethod('DELETE', productsIntegration); // Delete (Admin)
    products.addResource('detail').addResource('{productId}').addMethod('GET', productsIntegration);
    products.addResource('search').addMethod('GET', productsIntegration);
    products.addResource('list').addMethod('GET', productsIntegration);
    products.addResource('best-selling').addMethod('GET', productsIntegration);
    products.addResource('newest').addMethod('GET', productsIntegration);
    products.addResource('category').addResource('{categoryId}').addMethod('GET', productsIntegration);
    products.addResource('brand').addResource('{brandId}').addMethod('GET', productsIntegration);
    products.addResource('price-range').addMethod('GET', productsIntegration);

    // --- PRODUCT DETAILS ROUTES (7 endpoints) ---
    const productDetails = this.api.root.addResource('product-details');
    productDetails.addMethod('GET', productDetailsIntegration);  // Get all
    productDetails.addMethod('POST', productDetailsIntegration); // Create (Admin)
    const pdId = productDetails.addResource('{id}');
    pdId.addMethod('GET', productDetailsIntegration);    // Get by ID
    pdId.addMethod('PUT', productDetailsIntegration);    // Update
    pdId.addMethod('DELETE', productDetailsIntegration); // Delete
    pdId.addResource('images').addMethod('POST', productDetailsIntegration); // Upload images
    productDetails.addResource('product').addResource('{productId}').addMethod('GET', productDetailsIntegration);

    // --- CART ROUTES (6 endpoints) ---
    const cart = this.api.root.addResource('cart');
    cart.addMethod('POST', cartIntegration);   // Add to cart
    cart.addMethod('DELETE', cartIntegration); // Clear cart
    cart.addResource('me').addMethod('GET', cartIntegration);
    cart.addResource('count').addMethod('GET', cartIntegration);
    const cartItemId = cart.addResource('{id}');
    cartItemId.addMethod('PUT', cartIntegration);    // Update quantity
    cartItemId.addMethod('DELETE', cartIntegration); // Remove item

    // --- ORDERS ROUTES (9 endpoints) ---
    const orders = this.api.root.addResource('orders');
    orders.addMethod('GET', ordersIntegration);  // Get all (Admin)
    orders.addMethod('POST', ordersIntegration); // Create order
    orders.addResource('create-cod').addMethod('POST', ordersIntegration);
    orders.addResource('status').addResource('date-range').addMethod('POST', ordersIntegration);
    const orderId = orders.addResource('{id}');
    orderId.addMethod('DELETE', ordersIntegration); // Cancel order
    orderId.addResource('details').addMethod('GET', ordersIntegration);
    orderId.addResource('status').addMethod('PATCH', ordersIntegration);
    const orderUser = orders.addResource('user').addResource('{userId}');
    orderUser.addMethod('GET', ordersIntegration); // Get user orders
    orderUser.addResource('status').addResource('{status}').addMethod('GET', ordersIntegration);

    // --- CATEGORIES ROUTES (6 endpoints) ---
    const categories = this.api.root.addResource('categories');
    categories.addMethod('GET', categoriesIntegration);  // Get all
    categories.addMethod('POST', categoriesIntegration); // Create (Admin)
    categories.addResource('search').addMethod('GET', categoriesIntegration);
    const categoryId = categories.addResource('{id}');
    categoryId.addMethod('GET', categoriesIntegration);    // Get by ID
    categoryId.addMethod('PUT', categoriesIntegration);    // Update
    categoryId.addMethod('DELETE', categoriesIntegration); // Delete

    // --- BRANDS ROUTES (5 endpoints) ---
    const brands = this.api.root.addResource('brands');
    brands.addMethod('GET', brandsIntegration);  // Get all
    brands.addMethod('POST', brandsIntegration); // Create (Admin)
    const brandId = brands.addResource('{id}');
    brandId.addMethod('GET', brandsIntegration);    // Get by ID
    brandId.addMethod('PUT', brandsIntegration);    // Update
    brandId.addMethod('DELETE', brandsIntegration); // Delete

    // --- BANNERS ROUTES (7 endpoints) ---
    const banners = this.api.root.addResource('banners');
    banners.addMethod('GET', bannersIntegration);  // Get all (+ ?active=true)
    banners.addMethod('POST', bannersIntegration); // Create (Admin)
    const bannerId = banners.addResource('{id}');
    bannerId.addMethod('GET', bannersIntegration);    // Get by ID
    bannerId.addMethod('PUT', bannersIntegration);    // Update
    bannerId.addMethod('DELETE', bannersIntegration); // Delete
    bannerId.addResource('toggle').addMethod('PATCH', bannersIntegration);

    // --- RATINGS ROUTES (3 endpoints) ---
    const ratings = this.api.root.addResource('ratings');
    ratings.addMethod('POST', ratingsIntegration); // Create rating
    const ratingProduct = ratings.addResource('product').addResource('{productId}');
    ratingProduct.addMethod('GET', ratingsIntegration); // Get product ratings
    ratingProduct.addResource('stats').addMethod('GET', ratingsIntegration);

    // --- USERS ROUTES (3 endpoints) ---
    const users = this.api.root.addResource('users');
    users.addMethod('GET', usersIntegration); // Get all (Admin)
    users.addResource('{id}').addMethod('GET', usersIntegration); // Get by ID
    users.addResource('profile').addResource('{userId}').addMethod('PUT', usersIntegration);

    // --- IMAGES ROUTES (1 endpoint) ---
    const images = this.api.root.addResource('images');
    images.addResource('upload').addMethod('POST', imagesIntegration);

    // --- DATABASE ADMIN ROUTES (3 endpoints) ---
    const database = this.api.root.addResource('database');
    database.addResource('test').addMethod('POST', databaseIntegration);
    database.addResource('setup').addMethod('POST', databaseIntegration);
    database.addResource('query').addMethod('POST', databaseIntegration);

    // ========================================
    // OUTPUTS
    // ========================================
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

    new cdk.CfnOutput(this, 'LambdaModules', {
      value: JSON.stringify({
        auth: authModule.functionName,
        products: productsModule.functionName,
        productDetails: productDetailsModule.functionName,
        cart: cartModule.functionName,
        orders: ordersModule.functionName,
        categories: categoriesModule.functionName,
        brands: brandsModule.functionName,
        banners: bannersModule.functionName,
        ratings: ratingsModule.functionName,
        users: usersModule.functionName,
        images: imagesModule.functionName,
        database: databaseModule.functionName,
      }),
      description: '12 Lambda module names',
    });
  }
}
