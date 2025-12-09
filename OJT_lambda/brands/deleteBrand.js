// Lambda: Delete Brand - MySQL
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

    const brandId = getPathParam(event, 'id');

    if (!brandId) {
      return errorResponse('Brand ID is required', 400);
    }

    // Check if brand has products
    const checkSql = `SELECT COUNT(*) as count FROM products WHERE b_id = ?`;
    const checkResult = await getOne(checkSql, [brandId]);

    if (checkResult && checkResult.count > 0) {
      return errorResponse('Cannot delete brand with existing products', 400);
    }

    const sql = `DELETE FROM brands WHERE b_id = ?`;
    const affectedRows = await remove(sql, [brandId]);

    if (affectedRows === 0) {
      return errorResponse('Brand not found', 404);
    }

    return successResponse({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    return errorResponse('Failed to delete brand', 500);
  }
};
