// Lambda: Update User Profile - MySQL - Schema v2
const { update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = event.pathParameters?.id;
    const body = parseBody(event);
    // Support both 'name' and 'fullName' field names
    const fullName = body.fullName || body.name;
    const { phoneNumber, address, dateOfBirth } = body;

    // Check authorization - user can update their own profile
    // user.u_id comes from Cognito token (sub claim)
    const isOwner = user.u_id === userId;
    const isAdmin = user.role === 'ADMIN' || (user.groups && user.groups.includes('admin'));
    
    console.log('[updateProfile] Auth check:', { tokenUserId: user.u_id, requestUserId: userId, isOwner, isAdmin, role: user.role });
    
    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Convert dateOfBirth from dd/MM/yyyy to YYYY-MM-DD for MySQL
    let mysqlDate = null;
    if (dateOfBirth) {
      // Check if format is dd/MM/yyyy
      if (dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        mysqlDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (dateOfBirth.includes('-')) {
        // Already in YYYY-MM-DD format
        mysqlDate = dateOfBirth;
      }
      console.log('[updateProfile] Date conversion:', { input: dateOfBirth, output: mysqlDate });
    }

    // Schema v2: Users table with user_id, u_name, updatedAt
    const sql = `
      UPDATE Users
      SET u_name = ?, 
          phone_number = ?,
          address = ?,
          date_of_birth = ?,
          updatedAt = NOW()
      WHERE user_id = ?
    `;

    await update(sql, [
      fullName || '',
      phoneNumber || '',
      address || '',
      mysqlDate,
      userId
    ]);

    return successResponse({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(error.message, 500);
  }
};
