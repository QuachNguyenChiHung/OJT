// Lambda: Delete Category - MySQL
const { getOne, remove } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const categoryId = getPathParam(event, 'id');

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    // Check if category has products
    const checkSql = `SELECT COUNT(*) as count FROM products WHERE c_id = ?`;
    const checkResult = await getOne(checkSql, [categoryId]);

    if (checkResult && checkResult.count > 0) {
      return errorResponse('Cannot delete category with existing products', 400);
    }

    const sql = `DELETE FROM categories WHERE c_id = ?`;
    const affectedRows = await remove(sql, [categoryId]);

    if (affectedRows === 0) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse('Failed to delete category', 500);
  }
};
