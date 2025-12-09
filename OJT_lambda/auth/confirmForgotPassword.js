// Lambda function: Confirm Forgot Password
// Xác nhận code và đặt mật khẩu mới
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { COGNITO_CLIENT_ID } = require('./shared/auth');

// Cognito SDK v3
const { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const cognitoClient = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  try {
    const { email, username, code, newPassword, confirmPassword } = parseBody(event);
    const identifier = email || username;

    if (!identifier) {
      return errorResponse('Email or username is required', 400);
    }
    if (!code) {
      return errorResponse('Verification code is required', 400);
    }
    if (!newPassword) {
      return errorResponse('New password is required', 400);
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse('Passwords do not match', 400);
    }
    if (newPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    if (!COGNITO_CLIENT_ID) {
      return errorResponse('Cognito not configured', 500);
    }

    // Confirm forgot password with new password
    const command = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: identifier,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return successResponse({
      message: 'Password reset successful. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Confirm forgot password error:', error);
    
    if (error.name === 'CodeMismatchException') {
      return errorResponse('Invalid verification code', 400);
    }
    if (error.name === 'ExpiredCodeException') {
      return errorResponse('Verification code has expired', 400);
    }
    if (error.name === 'InvalidPasswordException') {
      return errorResponse('Password does not meet requirements', 400);
    }
    
    return errorResponse('Failed to reset password', 500, error);
  }
};
