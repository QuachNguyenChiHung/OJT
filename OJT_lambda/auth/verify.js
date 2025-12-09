// Lambda function: Verify Email (Cognito)
// Xác nhận email sau khi đăng ký - TẠO PROFILE TRONG RDS
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { COGNITO_CLIENT_ID } = require('./shared/auth');
const { insert, getOne } = require('./shared/database');

const { 
  CognitoIdentityProviderClient, 
  ConfirmSignUpCommand,
  AdminGetUserCommand 
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/**
 * Get user attributes from Cognito
 */
const getCognitoUserAttributes = async (username) => {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
    const result = await cognitoClient.send(command);
    
    const attrs = {};
    result.UserAttributes.forEach(attr => {
      attrs[attr.Name] = attr.Value;
    });
    return {
      sub: attrs.sub,
      email: attrs.email,
      phone: attrs.phone_number,
      fullName: attrs.name,
      username: result.Username,
    };
  } catch (error) {
    console.error('Failed to get Cognito user:', error);
    return null;
  }
};

/**
 * Create user profile in RDS MySQL - Schema v2
 */
const createUserProfile = async (userId, username, email, fullName, phone) => {
  // Check if user already exists - Schema v2: Users table
  const existing = await getOne('SELECT user_id FROM Users WHERE user_id = ? OR email = ?', [userId, email]);
  if (existing) {
    console.log('User profile already exists');
    return false;
  }

  // Schema v2: Users table with user_id, u_name, phone_number, isActive
  const sql = `INSERT INTO Users (user_id, u_name, email, password, phone_number, role, isActive) 
               VALUES (?, ?, ?, '', ?, 'USER', TRUE)`;
  await insert(sql, [userId, fullName || username, email, phone || null]);
  console.log('User profile created in RDS:', userId);
  return true;
};

exports.handler = async (event) => {
  try {
    const { username, email, code } = parseBody(event);
    const identifier = username || email;

    if (!identifier) {
      return errorResponse('Username hoặc email là bắt buộc', 400);
    }
    if (!code) {
      return errorResponse('Mã xác nhận là bắt buộc', 400);
    }

    if (!COGNITO_CLIENT_ID) {
      return errorResponse('Cognito chưa được cấu hình', 500);
    }

    // Confirm signup in Cognito
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: identifier,
      ConfirmationCode: code,
    });

    await cognitoClient.send(confirmCommand);
    console.log('Cognito verification successful for:', identifier);

    // Get user info from Cognito and create profile in RDS
    const userInfo = await getCognitoUserAttributes(identifier);
    if (userInfo) {
      try {
        await createUserProfile(
          userInfo.sub,
          userInfo.username,
          userInfo.email,
          userInfo.fullName,
          userInfo.phone
        );
      } catch (dbError) {
        console.error('Failed to create user profile:', dbError);
        // Don't fail the verification if profile creation fails
      }
    }

    return successResponse({
      message: 'Xác nhận email thành công! Bạn có thể đăng nhập ngay.',
      profileCreated: !!userInfo,
    });

  } catch (error) {
    console.error('Verify error:', error);
    
    if (error.name === 'CodeMismatchException') {
      return errorResponse('Mã xác nhận không đúng', 400);
    }
    if (error.name === 'ExpiredCodeException') {
      return errorResponse('Mã xác nhận đã hết hạn', 400);
    }
    if (error.name === 'NotAuthorizedException') {
      return errorResponse('Tài khoản đã được xác nhận trước đó', 400);
    }
    
    return errorResponse('Xác nhận thất bại: ' + error.message, 500);
  }
};
