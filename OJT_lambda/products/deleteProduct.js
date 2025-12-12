// Lambda: Delete Product (Admin) - MySQL
const { update } = require('./shared/database');
const { verifyToken, isAdmin } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Soft delete - set is_active to false
    const deleteSql = `UPDATE Product SET is_active = FALSE WHERE p_id = ?`;
    await update(deleteSql, [productId]);

    return successResponse({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(error.message || 'Failed to delete product', 500);
  }
};
