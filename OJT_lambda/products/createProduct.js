// Lambda: Create Product (Admin) - MySQL
const { insert } = require('./shared/database');
const { verifyToken, isAdmin } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const { name, description, price, categoryId, brandId } = parseBody(event);

    if (!name || !categoryId || !price) {
      return errorResponse('Product name, price and category are required', 400);
    }

    const productId = uuidv4();

    const sql = `
      INSERT INTO Product (p_id, p_name, p_desc, price, c_id, brand_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `;

    await insert(sql, [productId, name, description || '', price, categoryId, brandId || null]);

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
