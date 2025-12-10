// Lambda: Remove Product from Sale
const { executeStatement, getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return errorResponse('productId is required', 400);
    }

    // Check if exists in sale
    const existing = await getOne('SELECT p_id FROM SaleProduct WHERE p_id = ?', [productId]);
    if (!existing) {
      return errorResponse('Product not found in sale', 404);
    }

    // Remove from sale
    await executeStatement('DELETE FROM SaleProduct WHERE p_id = ?', [productId]);

    return successResponse({ message: 'Product removed from sale', productId });
  } catch (error) {
    console.error('Remove sale product error:', error);
    return errorResponse('Failed to remove product from sale: ' + error.message, 500);
  }
};
