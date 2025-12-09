// Lambda: Get User by ID - MySQL - Schema v2
const { getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = event.pathParameters?.id;

    // Check authorization
    if (user.u_id !== userId && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403);
    }

    // Schema v2: Users table with user_id, u_name, isActive
    const sql = `
      SELECT user_id, email, u_name, phone_number, address, date_of_birth, role, isActive
      FROM Users WHERE user_id = ?
    `;

    const row = await getOne(sql, [userId]);

    if (!row) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: row.user_id,
      userId: row.user_id,
      email: row.email,
      fullName: row.u_name || '',
      phoneNumber: row.phone_number || '',
      address: row.address || '',
      dateOfBirth: row.date_of_birth || null,
      role: row.role,
      isActive: row.isActive !== undefined ? !!row.isActive : true
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(error.message, 500);
  }
};
