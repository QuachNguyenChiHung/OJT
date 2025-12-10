// Lambda: Create Category (Admin) - MySQL with Hierarchy
const { insert, getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { name, parentId, displayOrder } = body;
    if (!name) {
      return errorResponse('Category name is required', 400);
    }

    // Calculate level based on parent
    let level = 0;
    if (parentId) {
      const parent = await getOne('SELECT level FROM Category WHERE c_id = ?', [parentId]);
      if (!parent) {
        return errorResponse('Parent category not found', 404);
      }
      level = (parent.level || 0) + 1;
    }

    const categoryId = uuidv4();
    const sql = `INSERT INTO Category (c_id, c_name, parent_id, level, display_order) VALUES (?, ?, ?, ?, ?)`;

    await insert(sql, [categoryId, name, parentId || null, level, displayOrder || 0]);

    return successResponse({ 
      id: categoryId, 
      name, 
      parentId: parentId || null,
      level,
      displayOrder: displayOrder || 0,
      message: 'Category created' 
    }, 201);
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse('Danh mục với tên này đã tồn tại trong cùng danh mục cha', 409);
    }
    
    return errorResponse(error.message, 500);
  }
};
