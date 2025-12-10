// Lambda: Update Category with Hierarchy - MySQL
const { update, getOne } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const categoryId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    const { name, cName, parentId, displayOrder } = body;
    const categoryName = name || cName;

    if (!categoryName) {
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

    const sql = `UPDATE Category SET c_name = ?, parent_id = ?, level = ?, display_order = ? WHERE c_id = ?`;
    const affectedRows = await update(sql, [categoryName, parentId || null, level, displayOrder || 0, categoryId]);

    if (affectedRows === 0) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ 
      id: categoryId, 
      name: categoryName,
      parentId: parentId || null,
      level,
      displayOrder: displayOrder || 0
    });
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse('Failed to update category: ' + error.message, 500);
  }
};
