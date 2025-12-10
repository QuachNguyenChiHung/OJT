// Lambda: Add Product to Sale
const { executeStatement, getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { productId, discountPercent = 20, startDate, endDate } = body;

    if (!productId) {
      return errorResponse('productId is required', 400);
    }

    if (discountPercent < 1 || discountPercent > 99) {
      return errorResponse('discountPercent must be between 1 and 99', 400);
    }

    // Check if product exists
    const product = await getOne('SELECT p_id FROM Product WHERE p_id = ?', [productId]);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if already in sale
    const existing = await getOne('SELECT p_id FROM SaleProduct WHERE p_id = ?', [productId]);
    if (existing) {
      return errorResponse('Product is already in sale', 400);
    }

    // Add to sale
    await executeStatement(`
      INSERT INTO SaleProduct (p_id, discount_percent, start_date, end_date, is_active, created_at)
      VALUES (?, ?, ?, ?, 1, NOW())
    `, [productId, discountPercent, startDate || null, endDate || null]);

    return successResponse({ message: 'Product added to sale', productId, discountPercent });
  } catch (error) {
    console.error('Add sale product error:', error);
    return errorResponse('Failed to add product to sale: ' + error.message, 500);
  }
};
