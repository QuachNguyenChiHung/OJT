// Lambda function: Login
const bcrypt = require('bcryptjs');
const { executeStatement } = require('../shared/database');
const { generateToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const { email, password } = parseBody(event);

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Query user from database
    const sql = `SELECT u_id, email, full_name, password_hash, role, phone_number, address 
                 FROM app_users 
                 WHERE email = @email AND is_active = 1`;
    
    const result = await executeStatement(sql, [
      { name: 'email', value: { stringValue: email } }
    ]);

    if (!result.records || result.records.length === 0) {
      return errorResponse('Invalid credentials', 401);
    }

    const user = result.records[0];
    const passwordMatch = await bcrypt.compare(password, user[3].stringValue); // password_hash

    if (!passwordMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken({
      u_id: user[0].stringValue,
      email: user[1].stringValue,
      role: user[4].stringValue,
    });

    return successResponse({
      token,
      email: user[1].stringValue,
      fullName: user[2].stringValue || null,
      role: user[4].stringValue,
      phoneNumber: user[5].stringValue || null,
      address: user[6].stringValue || null,
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500, error);
  }
};
