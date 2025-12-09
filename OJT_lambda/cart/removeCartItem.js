// Lambda: Remove Cart Item - MySQL
const { getOne, remove } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const cartId = event.pathParameters?.id || event.pathParameters?.cartId;

    if (!cartId) {
      return errorResponse('Cart ID is required', 400);
    }

    // Check if cart item exists and belongs to user - Schema v2
    const checkSql = `SELECT cart_id FROM Cart WHERE cart_id = ? AND user_id = ?`;
    const cartItem = await getOne(checkSql, [cartId, user.u_id]);

    if (!cartItem) {
      return errorResponse('Cart item not found', 404);
    }

    // Delete cart item - Schema v2
    const deleteSql = `DELETE FROM Cart WHERE cart_id = ?`;
    await remove(deleteSql, [cartId]);

    return successResponse({
      message: 'Cart item removed successfully'
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
    return errorResponse(error.message || 'Failed to remove cart item', 500);
  }
};
