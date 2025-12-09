// Lambda function: Login
// Đăng nhập bằng email HOẶC username
// Supports both Cognito and custom JWT
const bcrypt = require('bcryptjs');
const { getOne } = require('./shared/database');
const { generateToken, USE_COGNITO, COGNITO_CLIENT_ID } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

// Cognito SDK v3 (built into Lambda Node.js 20)
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Login with Cognito (SDK v3)
 */
const loginWithCognito = async (identifier, password) => {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: identifier,
      PASSWORD: password,
    },
  });

  const result = await cognitoClient.send(command);
  
  return {
    token: result.AuthenticationResult.IdToken,
    accessToken: result.AuthenticationResult.AccessToken,
    refreshToken: result.AuthenticationResult.RefreshToken,
    expiresIn: result.AuthenticationResult.ExpiresIn,
  };
};

/**
 * Get user profile from database (MySQL)
 */
const getUserProfile = async (identifier) => {
  const isEmail = identifier.includes('@');
  const sql = isEmail
    ? `SELECT u_id, username, email, full_name, role, phone_number, address FROM app_users WHERE email = ?`
    : `SELECT u_id, username, email, full_name, role, phone_number, address FROM app_users WHERE username = ?`;
  
  return await getOne(sql, [identifier]);
};

/**
 * Login with custom JWT (database authentication)
 */
const loginWithJWT = async (identifier, password) => {
  const isEmail = identifier.includes('@');
  
  // Query user from database by email or username
  const sql = isEmail
    ? `SELECT u_id, username, email, full_name, password_hash, role, phone_number, address 
       FROM app_users WHERE email = ? AND is_active = TRUE`
    : `SELECT u_id, username, email, full_name, password_hash, role, phone_number, address 
       FROM app_users WHERE username = ? AND is_active = TRUE`;
  
  const user = await getOne(sql, [identifier]);
  if (!user) return null;

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) return null;

  // Generate JWT token
  const token = generateToken({
    u_id: user.u_id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      u_id: user.u_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name || null,
      role: user.role,
      phoneNumber: user.phone_number || null,
      address: user.address || null,
    }
  };
};

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    
    // Support both 'email' and 'username' fields, or combined 'identifier'
    const identifier = body.identifier || body.email || body.username;
    const password = body.password;

    if (!identifier) {
      return errorResponse('Email hoặc username là bắt buộc', 400);
    }
    if (!password) {
      return errorResponse('Mật khẩu là bắt buộc', 400);
    }

    // Try Cognito first if configured
    if (USE_COGNITO) {
      try {
        console.log('Attempting Cognito login...');
        const cognitoResult = await loginWithCognito(identifier, password);
        
        // Get user profile from database
        let userInfo = {};
        try {
          const profile = await getUserProfile(identifier);
          if (profile) {
            userInfo = {
              u_id: profile.u_id,
              username: profile.username,
              email: profile.email,
              fullName: profile.full_name || null,
              role: profile.role,
              phoneNumber: profile.phone_number || null,
              address: profile.address || null,
            };
          }
        } catch (dbError) {
          console.log('Could not fetch user profile from DB:', dbError.message);
        }
        
        return successResponse({
          message: 'Đăng nhập thành công',
          token: cognitoResult.token,
          accessToken: cognitoResult.accessToken,
          refreshToken: cognitoResult.refreshToken,
          expiresIn: cognitoResult.expiresIn,
          ...userInfo,
          authType: 'cognito',
        });
      } catch (cognitoError) {
        console.error('Cognito login failed:', cognitoError.message);
        if (cognitoError.name === 'NotAuthorizedException') {
          return errorResponse('Sai email/username hoặc mật khẩu', 401);
        }
        if (cognitoError.name === 'UserNotConfirmedException') {
          return errorResponse('Vui lòng xác nhận email trước khi đăng nhập', 401);
        }
        if (cognitoError.name === 'UserNotFoundException') {
          // Fall through to JWT login
          console.log('User not found in Cognito, trying JWT...');
        } else {
          // Fall through to JWT login for other errors
          console.log('Cognito error, trying JWT...');
        }
      }
    }

    // Fallback to custom JWT login
    console.log('Using custom JWT login...');
    const jwtResult = await loginWithJWT(identifier, password);

    if (!jwtResult) {
      return errorResponse('Sai email/username hoặc mật khẩu', 401);
    }

    return successResponse({
      message: 'Đăng nhập thành công',
      token: jwtResult.token,
      ...jwtResult.user,
      authType: 'jwt',
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Lỗi server: ' + error.message, 500);
  }
};
