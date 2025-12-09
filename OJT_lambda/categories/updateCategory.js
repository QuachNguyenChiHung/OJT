// Lambda: Update Category - MySQL
const { update } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const categoryId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    const { cName } = body;

    if (!cName) {
      return errorResponse('Category name is required', 400);
    }

    const sql = `UPDATE categories SET c_name = ?, updated_at = NOW() WHERE c_id = ?`;
    const affectedRows = await update(sql, [cName, categoryId]);

    if (affectedRows === 0) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ cId: categoryId, cName });
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse('Failed to update category', 500);
  }
};
