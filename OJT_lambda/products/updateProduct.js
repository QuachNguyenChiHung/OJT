// Lambda: Update Product (Admin) - MySQL
const { getOne, update } = require('./shared/database');
const { verifyToken, isAdmin } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const productId = event.pathParameters?.id;
    const { name, description, price, categoryId, brandId, isActive } = parseBody(event);

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check if product exists
    const checkSql = `SELECT p_id FROM Product WHERE p_id = ?`;
    const existing = await getOne(checkSql, [productId]);

    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('p_name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('p_desc = ?'); params.push(description); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (categoryId !== undefined) { updates.push('c_id = ?'); params.push(categoryId); }
    if (brandId !== undefined) { updates.push('brand_id = ?'); params.push(brandId); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    params.push(productId);
    const updateSql = `UPDATE Product SET ${updates.join(', ')} WHERE p_id = ?`;
    await update(updateSql, params);

    return successResponse({
      productId,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(error.message || 'Failed to update product', 500);
  }
};
