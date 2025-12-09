// Lambda: Create Product (Admin) - MySQL
const { insert, getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Check role from database (more reliable than token)
    const dbUser = await getOne('SELECT role FROM Users WHERE user_id = ?', [user.u_id]);
    const isAdmin = dbUser?.role === 'ADMIN' || user.role === 'ADMIN' || (user.groups && user.groups.includes('admin'));
    
    if (!isAdmin) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const { name, description, price, categoryId, brandId, isActive } = parseBody(event);

    if (!name || !categoryId) {
      return errorResponse('Product name and category are required', 400);
    }

    const productId = uuidv4();

    // Schema v2: Product table with p_desc, brand_id
    const sql = `
      INSERT INTO Product (p_id, p_name, p_desc, price, c_id, brand_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await insert(sql, [productId, name, description || '', price || 0, categoryId, brandId || null, isActive !== false ? 1 : 0]);

    return successResponse({
      id: productId,
      pId: productId,
      productId,
      name,
      pName: name,
      description: description || '',
      price: price || 0,
      categoryId,
      brandId: brandId || null,
      isActive: isActive !== false,
      message: 'Product created successfully'
    }, 201);

  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(error.message || 'Failed to create product', 500);
  }
};
