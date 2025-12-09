// Lambda function: Get current user (me) - Schema v2
const { getOne } = require('./shared/database');
const { verifyToken, extractTokenFromHeader } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const token = extractTokenFromHeader(event.headers);
    
    if (!token) {
      return errorResponse('Token không được cung cấp', 401);
    }

    const decoded = await verifyToken({ headers: event.headers });
    console.log('[me] Decoded token:', JSON.stringify(decoded));
    
    if (!decoded) {
      return errorResponse('Token không hợp lệ hoặc đã hết hạn', 401);
    }

    // Schema v2: Users table with user_id, u_name, isActive
    const sql = `SELECT user_id, email, u_name, role, phone_number, address, isActive, date_of_birth
                 FROM Users WHERE user_id = ?`;
    
    console.log('[me] Looking for user with user_id:', decoded.u_id);
    const user = await getOne(sql, [decoded.u_id]);
    console.log('[me] Found user:', JSON.stringify(user));

    if (!user) {
      console.log('[me] User not found in database, returning Cognito data');
      // Return data from Cognito token if user not in DB
      return successResponse({
        userId: decoded.u_id,
        email: decoded.email,
        fullName: null,
        role: decoded.role || 'USER',
        phoneNumber: null,
        address: null,
        isActive: true,
      });
    }

    return successResponse({
      userId: user.user_id,
      email: user.email,
      fullName: user.u_name || null,
      role: user.role,
      phoneNumber: user.phone_number || null,
      address: user.address || null,
      isActive: user.isActive !== undefined ? !!user.isActive : true,
      dateOfBirth: user.date_of_birth || null,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Lỗi server: ' + error.message, 500);
  }
};
