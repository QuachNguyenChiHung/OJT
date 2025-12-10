// Lambda: Update Product (Admin) - MySQL
const { getOne, update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Check role from database
    const dbUser = await getOne('SELECT role FROM Users WHERE user_id = ?', [user.u_id]);
    const isAdmin = dbUser?.role === 'ADMIN' || user.role === 'ADMIN' || (user.groups && user.groups.includes('admin'));
    
    if (!isAdmin) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    // Extract productId from path
    let productId = event.pathParameters?.id;
    if (!productId) {
      const path = event.path || event.rawPath || '';
      const match = path.match(/\/products\/([^\/\?]+)/);
      if (match) productId = match[1];
    }
    
    const body = parseBody(event);
    // Support multiple field names
    const name = body.name || body.PName || body.pName;
    const description = body.description || body.pDesc;
    const price = body.price;
    const categoryId = body.categoryId || event.queryStringParameters?.categoryId;
    const brandId = body.brandId || event.queryStringParameters?.brandId;
    const isActive = body.isActive;
    const thumbnail1 = body.thumbnail1;
    const thumbnail2 = body.thumbnail2;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check if product exists - Schema v2
    const checkSql = `SELECT p_id FROM Product WHERE p_id = ?`;
    const product = await getOne(checkSql, [productId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Schema v2: Product table with p_desc, brand_id, thumbnail_1, thumbnail_2
    const updateSql = `
      UPDATE Product
      SET p_name = COALESCE(?, p_name),
          p_desc = COALESCE(?, p_desc),
          price = COALESCE(?, price),
          c_id = COALESCE(?, c_id),
          brand_id = COALESCE(?, brand_id),
          is_active = COALESCE(?, is_active),
          thumbnail_1 = COALESCE(?, thumbnail_1),
          thumbnail_2 = COALESCE(?, thumbnail_2)
      WHERE p_id = ?
    `;

    await update(updateSql, [
      name || null,
      description || null,
      price !== undefined ? price : null,
      categoryId || null,
      brandId || null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      thumbnail1 || null,
      thumbnail2 || null,
      productId
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
