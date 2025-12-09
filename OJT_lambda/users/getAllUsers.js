// Lambda: Get All Users (Admin only) - MySQL (Schema v2)
const { getMany } = require('./shared/database');
const { verifyToken, isAdmin } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    console.log('[getAllUsers] User from token:', JSON.stringify(user));
    if (!user || !isAdmin(user)) {
      console.log('[getAllUsers] Access denied - user:', user, 'isAdmin:', isAdmin(user));
      return errorResponse('Forbidden - Admin access required', 403);
    }

    // Schema v2: Users table with user_id, u_name, isActive
    const sql = `
      SELECT user_id, email, u_name, phone_number, address, date_of_birth, role, isActive, createdAt
      FROM Users
      ORDER BY createdAt DESC
    `;

    const rows = await getMany(sql);

    const users = (rows || []).map(row => ({
      id: row.user_id,
      userId: row.user_id,
      email: row.email,
      fullName: row.u_name || '',
      name: row.u_name || '',
      phoneNumber: row.phone_number || '',
      address: row.address || '',
      dateOfBirth: row.date_of_birth || null,
      role: row.role,
      isActive: row.isActive !== undefined ? !!row.isActive : true
    }));

    return successResponse({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(error.message, 500);
  }
};
