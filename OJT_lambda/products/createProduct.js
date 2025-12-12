// Lambda: Create Product (Admin)
const { executeStatement } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const { name, description, imageUrl, categoryId, brandId } = parseBody(event);

    if (!name || !categoryId) {
      return errorResponse('Product name and category are required', 400);
    }

    const productId = uuidv4();

    const sql = `
      INSERT INTO Products (p_id, p_name, description, image_url, c_id, brand_id, created_at, updated_at)
      VALUES (@productId, @name, @description, @imageUrl, @categoryId, @brandId, GETDATE(), GETDATE())
    `;

    await executeStatement(sql, [
      { name: 'productId', value: { stringValue: productId } },
      { name: 'name', value: { stringValue: name } },
      { name: 'description', value: { stringValue: description || '' } },
      { name: 'imageUrl', value: { stringValue: imageUrl || '' } },
      { name: 'categoryId', value: { stringValue: categoryId } },
      { name: 'brandId', value: { stringValue: brandId || null } }
    ]);

    return successResponse({
      productId,
      name,
      message: 'Product created successfully'
    }, 201);

  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(error.message || 'Failed to create product', 500);
  }
};
