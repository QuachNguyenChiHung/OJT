import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  appName: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // Custom Message Lambda Trigger for professional email templates
    const customMessageLambda = new lambda.Function(this, 'CustomMessageTrigger', {
      functionName: `${props.appName}-custom-message`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
exports.handler = async (event) => {
  const { triggerSource, request, response } = event;
  const { codeParameter, usernameParameter } = request;
  
  // Softer color scheme - easier on eyes for mobile
  const primaryTeal = '#0d9488';
  const darkNavy = '#1e293b';
  const accentTeal = '#14b8a6';
  const lightBg = '#f8fafc';
  
  // Professional email template - no external images
  const getEmailTemplate = (title, iconSvg, content) => \`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: \${lightBg};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: \${lightBg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
              
              <!-- Header - Text based logo -->
              <tr>
                <td style="background: \${darkNavy}; padding: 30px 40px; text-align: center; border-bottom: 3px solid \${primaryTeal};">
                  <div style="width: 60px; height: 60px; background: \${primaryTeal}; border-radius: 12px; margin: 0 auto 15px; display: inline-block; line-height: 60px;">
                    <span style="color: #ffffff; font-size: 28px; font-weight: 700;">F5</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">FURIOUS FIVE FASHION</h1>
                  <p style="color: \${accentTeal}; margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Premium Fashion Store</p>
                </td>
              </tr>
              
              <!-- Title Bar -->
              <tr>
                <td style="background: \${primaryTeal}; padding: 18px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding-right: 10px;">\${iconSvg}</td>
                      <td><h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">\${title}</h2></td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 35px 40px;">
                  \${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: \${darkNavy}; padding: 25px 40px; text-align: center; border-top: 3px solid \${primaryTeal};">
                  <p style="color: #ffffff; margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">Furious Five Fashion</p>
                  <p style="color: #94a3b8; margin: 0 0 12px 0; font-size: 12px;">Your Style, Your Statement</p>
                  <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 12px;">
                    <p style="color: #64748b; margin: 0; font-size: 11px;">&copy; 2024 Furious Five Fashion. All rights reserved.</p>
                  </div>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  \`;
  
  // Icon SVGs
  const verifyIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const lockIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const mailIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  
  // Code box component - softer colors
  const codeBox = \`
    <div style="background: #f1f5f9; border: 2px solid \${primaryTeal}; border-radius: 10px; padding: 22px; text-align: center; margin: 22px 0;">
      <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: \${darkNavy}; font-family: 'Courier New', monospace;">\${codeParameter}</div>
    </div>
  \`;
  
  // Warning box - English text
  const warningBox = (time) => \`
    <div style="background: #fef9e7; border-left: 4px solid #d97706; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #92400e; margin: 0; font-size: 13px;"><strong>&#9200; Note:</strong> This code will expire in <strong>\${time}</strong>. Please do not share this code with anyone.</p>
    </div>
  \`;
  
  if (triggerSource === 'CustomMessage_SignUp') {
    const content = \`
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">Hello <strong style="color: \${primaryTeal};">\${usernameParameter || 'there'}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 14px 0;">Thank you for registering at <strong>Furious Five Fashion</strong>! We're excited to have you join us.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 10px 0;">To complete your registration, please enter the verification code below:</p>
      \${codeBox}
      \${warningBox('24 hours')}
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 18px 0 0 0;">If you did not create this account, please ignore this email.</p>
    \`;
    response.emailSubject = 'Verify Your Account - Furious Five Fashion';
    response.emailMessage = getEmailTemplate('Account Verification', verifyIcon, content);
    
  } else if (triggerSource === 'CustomMessage_ForgotPassword') {
    const content = \`
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">Hello <strong style="color: \${primaryTeal};">\${usernameParameter || 'there'}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 14px 0;">We received a request to reset your password for your <strong>Furious Five Fashion</strong> account.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 10px 0;">Here is your password reset code:</p>
      \${codeBox}
      \${warningBox('1 hour')}
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 18px 0 0 0;">If you did not request a password reset, please ignore this email or contact us immediately.</p>
    \`;
    response.emailSubject = 'Reset Your Password - Furious Five Fashion';
    response.emailMessage = getEmailTemplate('Password Reset', lockIcon, content);
    
  } else if (triggerSource === 'CustomMessage_ResendCode') {
    const content = \`
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">Hello <strong style="color: \${primaryTeal};">\${usernameParameter || 'there'}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 10px 0;">As requested, here is your new verification code:</p>
      \${codeBox}
      \${warningBox('24 hours')}
    \`;
    response.emailSubject = 'New Verification Code - Furious Five Fashion';
    response.emailMessage = getEmailTemplate('New Verification Code', mailIcon, content);
  }
  
  return event;
};
      `),
      timeout: cdk.Duration.seconds(10),
    });

    // Pre Sign-up Lambda Trigger - Check duplicate phone_number using Cognito API
    const preSignUpLambda = new lambda.Function(this, 'PreSignUpTrigger', {
      functionName: `${props.appName}-pre-signup`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'preSignUp.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../OJT_lambda/auth')),
      timeout: cdk.Duration.seconds(10),
    });
    
    // Grant Lambda permission to list users in Cognito
    preSignUpLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['cognito-idp:ListUsers'],
      resources: ['*'], // Will be scoped to this user pool after creation
    }));

    // Cognito User Pool
    // - Đăng nhập bằng email HOẶC username
    // - Yêu cầu verify email
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${props.appName}-users`,
      selfSignUpEnabled: true,
      
      // Cho phép đăng nhập bằng email HOẶC username
      signInAliases: {
        email: true,
        username: true,
        // phone: false - không dùng phone để đăng nhập, tránh yêu cầu verify
      },
      
      // Chỉ verify email, KHÔNG verify phone_number
      autoVerify: { email: true, phone: false },
      
      // Không yêu cầu xác thực email khi đăng ký
      signInCaseSensitive: false,
      
      // Thuộc tính user
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        // phone_number: optional, không verify, không dùng làm alias
        // => không bị ràng buộc unique trong Cognito
        phoneNumber: {
          required: false,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      
      // Custom attributes
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
        address: new cognito.StringAttribute({ mutable: true }),
      },
      
      // Password policy
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      
      // Account recovery
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      
      // Lambda triggers
      lambdaTriggers: {
        customMessage: customMessageLambda,
        preSignUp: preSignUpLambda,
      },
      
      // Email configuration - use Cognito default (SES sandbox mode)
      email: cognito.UserPoolEmail.withCognito(),
      
      // Không xóa khi destroy stack
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // User Pool Client
    this.userPoolClient = this.userPool.addClient('WebClient', {
      userPoolClientName: `${props.appName}-web-client`,
      authFlows: {
        userPassword: true,      // Cho phép đăng nhập bằng username/password
        userSrp: true,           // Secure Remote Password
        custom: false,
        adminUserPassword: true, // Admin có thể tạo user
      },
      generateSecret: false,
      
      // Token validity
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(24),
      idTokenValidity: cdk.Duration.hours(24),
      
      enableTokenRevocation: true,
      preventUserExistenceErrors: true,
    });

    // Identity Pool for AWS resource access
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `${props.appName}IdentityPool`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      }],
    });

    // IAM roles for authenticated users
    const authenticatedRole = new iam.Role(this, 'AuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // Attach identity pool roles
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    });

    // User Groups for Admin and User roles
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      description: 'Admin users with full access',
      precedence: 1,
    });

    new cognito.CfnUserPoolGroup(this, 'UserGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'user',
      description: 'Regular users',
      precedence: 10,
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${props.appName}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${props.appName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${props.appName}-IdentityPoolId`,
    });

    new cdk.CfnOutput(this, 'CognitoRegion', {
      value: this.region,
      description: 'Cognito Region',
      exportName: `${props.appName}-CognitoRegion`,
    });
  }
}
