// Lambda: Get Cart Count - MySQL
const { getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Count cart items - Schema v2
    const sql = `SELECT COUNT(*) as count FROM Cart WHERE user_id = ?`;
    const result = await getOne(sql, [user.u_id]);

    const count = result?.count || 0;

    return successResponse({
      count: parseInt(count)
    });

  } catch (error) {
    console.error('Get cart count error:', error);
    return errorResponse(error.message || 'Failed to get cart count', 500);
  }
};
