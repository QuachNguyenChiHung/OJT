// Lambda function: Forgot Password
// Gửi code reset password qua email
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { COGNITO_CLIENT_ID } = require('./shared/auth');

// Cognito SDK v3
const { CognitoIdentityProviderClient, ForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const cognitoClient = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const { email, username } = parseBody(event);
    const identifier = email || username;

    if (!identifier) {
      return errorResponse('Email or username is required', 400);
    }

    if (!COGNITO_CLIENT_ID) {
      return errorResponse('Cognito not configured', 500);
    }

    // Initiate forgot password flow
    const command = new ForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: identifier,
    });

    await cognitoClient.send(command);

    return successResponse({
      message: 'Password reset code sent to your email',
      email: identifier.includes('@') ? identifier : undefined,
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error.name === 'UserNotFoundException') {
      return errorResponse('User not found', 404);
    }
    if (error.name === 'LimitExceededException') {
      return errorResponse('Too many requests. Please try again later', 429);
    }
    
    return errorResponse('Failed to send reset code', 500, error);
  }
};
