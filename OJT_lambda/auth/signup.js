// Lambda function: Signup
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { executeStatement } = require('../shared/database');
const { generateToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const { email, password, fullName } = parseBody(event);

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if user already exists
    const checkSql = 'SELECT u_id FROM app_users WHERE email = @email';
    const existingUser = await executeStatement(checkSql, [
      { name: 'email', value: { stringValue: email } }
    ]);

    if (existingUser.records && existingUser.records.length > 0) {
      return errorResponse('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    const insertSql = `INSERT INTO app_users 
                       (u_id, email, password_hash, full_name, role, is_active, created_at) 
                       VALUES (@u_id, @email, @password_hash, @full_name, 'CUSTOMER', 1, GETDATE())`;
    
    await executeStatement(insertSql, [
      { name: 'u_id', value: { stringValue: userId } },
      { name: 'email', value: { stringValue: email } },
      { name: 'password_hash', value: { stringValue: passwordHash } },
      { name: 'full_name', value: { stringValue: fullName || null } }
    ]);

    // Generate token
    const token = generateToken({
      u_id: userId,
      email,
      role: 'CUSTOMER',
    });

    return successResponse({
      token,
      email,
      fullName: fullName || null,
    }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Internal server error', 500, error);
  }
};
