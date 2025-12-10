// Lambda: Update Sale Product Discount
const { executeStatement, getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { discountPercent, startDate, endDate, isActive } = body;

    if (!productId) {
      return errorResponse('productId is required', 400);
    }

    // Check if exists in sale
    const existing = await getOne('SELECT p_id FROM SaleProduct WHERE p_id = ?', [productId]);
    if (!existing) {
      return errorResponse('Product not found in sale', 404);
    }

    // Build update query
    const updates = [];
    const params = [];

    if (discountPercent !== undefined) {
      if (discountPercent < 1 || discountPercent > 99) {
        return errorResponse('discountPercent must be between 1 and 99', 400);
      }
      updates.push('discount_percent = ?');
      params.push(discountPercent);
    }

    if (startDate !== undefined) {
      updates.push('start_date = ?');
      params.push(startDate || null);
    }

    if (endDate !== undefined) {
      updates.push('end_date = ?');
      params.push(endDate || null);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    params.push(productId);
    await executeStatement(`UPDATE SaleProduct SET ${updates.join(', ')} WHERE p_id = ?`, params);

    return successResponse({ message: 'Sale product updated', productId });
  } catch (error) {
    console.error('Update sale product error:', error);
    return errorResponse('Failed to update sale product: ' + error.message, 500);
  }
};
