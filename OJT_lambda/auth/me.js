// Lambda function: Get current user (me)
const { executeStatement } = require('../shared/database');
const { verifyToken, extractTokenFromHeader } = require('../shared/auth');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const token = extractTokenFromHeader(event.headers);
    
    if (!token) {
      return errorResponse('No token provided', 401);
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return errorResponse('Invalid or expired token', 401);
    }

    // Get user details from database
    const sql = `SELECT u_id, email, full_name, role, phone_number, address, is_active 
                 FROM app_users 
                 WHERE u_id = @u_id`;
    
    const result = await executeStatement(sql, [
      { name: 'u_id', value: { stringValue: decoded.u_id } }
    ]);

    if (!result.records || result.records.length === 0) {
      return errorResponse('User not found', 404);
    }

    const user = result.records[0];

    return successResponse({
      u_id: user[0].stringValue,
      email: user[1].stringValue,
      fullName: user[2].stringValue || null,
      role: user[3].stringValue,
      phoneNumber: user[4].stringValue || null,
      address: user[5].stringValue || null,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 500, error);
  }
};
