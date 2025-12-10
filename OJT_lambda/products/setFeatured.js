// Lambda: Set Product Featured Status - MySQL
const { update, getOne, execute } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = getPathParam(event, 'id');
    
    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Parse body
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      body = {};
    }

    const isFeatured = body.isFeatured !== undefined ? body.isFeatured : true;

    // Check if product exists
    const checkSql = `SELECT p_id, p_name FROM Product WHERE p_id = ?`;
    const product = await getOne(checkSql, [productId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Try to update featured status
    try {
      const updateSql = `UPDATE Product SET is_featured = ? WHERE p_id = ?`;
      await update(updateSql, [isFeatured ? 1 : 0, productId]);
    } catch (e) {
      // Column might not exist, try to add it first
      if (e.message && e.message.includes('is_featured')) {
        console.log('Adding is_featured column...');
        await update(`ALTER TABLE Product ADD COLUMN is_featured BOOLEAN DEFAULT FALSE`, []);
        // Retry update
        const updateSql = `UPDATE Product SET is_featured = ? WHERE p_id = ?`;
        await update(updateSql, [isFeatured ? 1 : 0, productId]);
      } else {
        throw e;
      }
    }

    return successResponse({
      success: true,
      message: isFeatured ? 'Sản phẩm đã được đẩy lên trang chủ' : 'Sản phẩm đã được gỡ khỏi trang chủ',
      productId: productId,
      productName: product.p_name,
      isFeatured: isFeatured
    });
  } catch (error) {
    console.error('Set featured error:', error);
    return errorResponse('Failed to update featured status: ' + error.message, 500);
  }
};
