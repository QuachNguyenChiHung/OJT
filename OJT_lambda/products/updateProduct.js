// Lambda: Update Product (Admin)
const { executeStatement } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const productId = event.pathParameters?.id;
    const { name, description, imageUrl, categoryId, brandId } = parseBody(event);

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check if product exists
    const checkSql = `SELECT p_id FROM Products WHERE p_id = @productId`;
    const checkResult = await executeStatement(checkSql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    if (!checkResult.records || checkResult.records.length === 0) {
      return errorResponse('Product not found', 404);
    }

    const updateSql = `
      UPDATE Products
      SET p_name = COALESCE(@name, p_name),
          description = COALESCE(@description, description),
          image_url = COALESCE(@imageUrl, image_url),
          c_id = COALESCE(@categoryId, c_id),
          brand_id = COALESCE(@brandId, brand_id),
          updated_at = GETDATE()
      WHERE p_id = @productId
    `;

    await executeStatement(updateSql, [
      { name: 'name', value: { stringValue: name || null } },
      { name: 'description', value: { stringValue: description || null } },
      { name: 'imageUrl', value: { stringValue: imageUrl || null } },
      { name: 'categoryId', value: { stringValue: categoryId || null } },
      { name: 'brandId', value: { stringValue: brandId || null } },
      { name: 'productId', value: { stringValue: productId } }
    ]);

    return successResponse({
      productId,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(error.message || 'Failed to update product', 500);
  }
};
