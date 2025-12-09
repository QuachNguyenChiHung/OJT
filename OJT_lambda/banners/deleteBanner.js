// Lambda: Delete Banner - MySQL
const { remove } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const bannerId = getPathParam(event, 'id');

    if (!bannerId) {
      return errorResponse('Banner ID is required', 400);
    }

    const sql = `DELETE FROM banners WHERE banner_id = ?`;
    const affectedRows = await remove(sql, [bannerId]);

    if (affectedRows === 0) {
      return errorResponse('Banner not found', 404);
    }

    return successResponse({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return errorResponse('Failed to delete banner', 500);
  }
};
