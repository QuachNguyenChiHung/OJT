// Lambda: Delete Product (Admin)
const { executeStatement } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Delete product (cascade will handle related records)
    const deleteSql = `DELETE FROM Products WHERE p_id = @productId`;

    await executeStatement(deleteSql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    return successResponse({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(error.message || 'Failed to delete product', 500);
  }
};
