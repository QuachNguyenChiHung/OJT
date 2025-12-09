// Lambda: Clear Cart - MySQL
const { remove } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Delete all cart items for user - Schema v2
    const deleteSql = `DELETE FROM Cart WHERE user_id = ?`;
    await remove(deleteSql, [user.u_id]);

    return successResponse({
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse(error.message || 'Failed to clear cart', 500);
  }
};
