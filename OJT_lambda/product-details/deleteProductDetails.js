// Lambda: Delete Product Details - MySQL
const { remove } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const pdId = getPathParam(event, 'id');

    if (!pdId) {
      return errorResponse('Product details ID is required', 400);
    }

    // Schema v2: ProductDetails table
    const sql = `DELETE FROM ProductDetails WHERE pd_id = ?`;
    const affectedRows = await remove(sql, [pdId]);

    if (affectedRows === 0) {
      return errorResponse('Product details not found', 404);
    }

    return successResponse({ message: 'Product details deleted successfully' });
  } catch (error) {
    console.error('Delete product details error:', error);
    return errorResponse('Failed to delete product details', 500);
  }
};
