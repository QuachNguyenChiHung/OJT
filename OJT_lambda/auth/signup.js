// Lambda function: Signup
// Đăng ký với: username, email, password, phone
// Supports both Cognito and custom JWT
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { insert, getOne } = require('./shared/database');
const { generateToken, USE_COGNITO, COGNITO_CLIENT_ID } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

// Cognito SDK v3 (built into Lambda Node.js 20)
const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Signup with Cognito (SDK v3)
 */
const signupWithCognito = async (username, email, password, phone, fullName) => {
  const userAttributes = [
    { Name: 'email', Value: email },
  ];
  
  if (phone) {
    // Format phone number for Cognito (+84...)
    const formattedPhone = phone.startsWith('+') ? phone : `+84${phone.replace(/^0/, '')}`;
    userAttributes.push({ Name: 'phone_number', Value: formattedPhone });
  }
  
  if (fullName) {
    userAttributes.push({ Name: 'name', Value: fullName });
  }

  const command = new SignUpCommand({
    ClientId: COGNITO_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: userAttributes,
  });

  const result = await cognitoClient.send(command);
  
  return {
    userSub: result.UserSub,
    userConfirmed: result.UserConfirmed,
    username,
    email,
  };
};

/**
 * Create user profile in database (MySQL) - Schema v2
 */
const createUserProfile = async (userId, username, email, fullName, phone, role = 'USER') => {
  const sql = `INSERT INTO Users (user_id, u_name, email, password, phone_number, role, isActive) 
               VALUES (?, ?, ?, '', ?, ?, TRUE)`;
  await insert(sql, [userId, username, email, phone || null, role]);
};

/**
 * Check if username, email, or phone already exists - Schema v2
 */
const checkDuplicates = async (username, email, phone) => {
  // Check if username already exists
  const existingUsername = await getOne('SELECT user_id FROM Users WHERE u_name = ?', [username]);
  if (existingUsername) {
    return { field: 'username', error: 'USERNAME_EXISTS' };
  }

  // Check if email already exists
  const existingEmail = await getOne('SELECT user_id FROM Users WHERE email = ?', [email]);
  if (existingEmail) {
    return { field: 'email', error: 'EMAIL_EXISTS' };
  }

  // Check if phone already exists (if provided)
  if (phone) {
    const existingPhone = await getOne('SELECT user_id FROM Users WHERE phone_number = ?', [phone]);
    if (existingPhone) {
      return { field: 'phone', error: 'PHONE_EXISTS' };
    }
  }

  return null; // No duplicates
};

/**
 * Signup with custom JWT (database) - Schema v2
 */
const signupWithJWT = async (username, email, password, phone, fullName) => {
  // Check for duplicates
  const duplicate = await checkDuplicates(username, email, phone);
  if (duplicate) {
    throw new Error(duplicate.error);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  // Create user - Schema v2: Users table
  const sql = `INSERT INTO Users (user_id, u_name, email, password, phone_number, role, isActive) 
               VALUES (?, ?, ?, ?, ?, 'USER', TRUE)`;
  await insert(sql, [userId, username, email, passwordHash, phone || null]);

  // Generate token
  const token = generateToken({
    u_id: userId,
    username,
    email,
    role: 'USER',
  });

  return { userId, token, username, email, fullName, phone };
};

exports.handler = async (event) => {
  try {
    const { username, email, password, confirmPassword, phone, fullName } = parseBody(event);

    // Validation
    if (!username) {
      return errorResponse('Username is required', 400);
    }
    if (!email) {
      return errorResponse('Email is required', 400);
    }
    if (!password) {
      return errorResponse('Password is required', 400);
    }

    // Validate username (alphanumeric, 3-30 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return errorResponse('Username must be 3-30 characters, alphanumeric and underscore only', 400);
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Validate password (Cognito requires: 8+ chars, uppercase, lowercase, number)
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    // Validate confirm password
    if (confirmPassword && password !== confirmPassword) {
      return errorResponse('Passwords do not match', 400);
    }

    // Try Cognito first if configured
    if (USE_COGNITO) {
      try {
        // Check for duplicates in database before Cognito signup
        const duplicate = await checkDuplicates(username, email, phone);
        if (duplicate) {
          if (duplicate.error === 'USERNAME_EXISTS') {
            return errorResponse('Username đã được đăng ký', 409);
          }
          if (duplicate.error === 'EMAIL_EXISTS') {
            return errorResponse('Email đã được đăng ký', 409);
          }
          if (duplicate.error === 'PHONE_EXISTS') {
            return errorResponse('Số điện thoại đã được đăng ký', 409);
          }
        }

        console.log('Attempting Cognito signup...');
        const cognitoResult = await signupWithCognito(username, email, password, phone, fullName);
        
        // Note: Profile will be created after email verification (in verify.js)
        // Store pending user info for later
        console.log('Cognito signup successful, waiting for verification');

        return successResponse({
          message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
          username: cognitoResult.username,
          email: cognitoResult.email,
          userSub: cognitoResult.userSub,
          needVerification: true,
          authType: 'cognito',
        }, 201);
      } catch (cognitoError) {
        console.error('Cognito signup failed:', cognitoError.message);
        if (cognitoError.name === 'UsernameExistsException') {
          return errorResponse('Username đã được đăng ký', 409);
        }
        if (cognitoError.name === 'InvalidParameterException') {
          return errorResponse(cognitoError.message, 400);
        }
        if (cognitoError.name === 'InvalidPasswordException') {
          return errorResponse('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số', 400);
        }
        // Fall through to JWT signup if Cognito fails
        console.log('Falling back to JWT signup...');
      }
    }

    // Fallback to custom JWT signup
    console.log('Using custom JWT signup...');
    try {
      const jwtResult = await signupWithJWT(username, email, password, phone, fullName);
      
      return successResponse({
        message: 'Đăng ký thành công!',
        token: jwtResult.token,
        username: jwtResult.username,
        email: jwtResult.email,
        fullName: jwtResult.fullName || null,
        phone: jwtResult.phone || null,
        authType: 'jwt',
      }, 201);
    } catch (error) {
      if (error.message === 'USERNAME_EXISTS') {
        return errorResponse('Username đã được đăng ký', 409);
      }
      if (error.message === 'EMAIL_EXISTS') {
        return errorResponse('Email đã được đăng ký', 409);
      }
      if (error.message === 'PHONE_EXISTS') {
        return errorResponse('Số điện thoại đã được đăng ký', 409);
      }
      throw error;
    }

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Lỗi server: ' + error.message, 500);
  }
};
