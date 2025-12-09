// Lambda: Toggle Banner Active Status - MySQL
const { getOne, update } = require('./shared/database');
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

    // Get current status
    const selectSql = `SELECT is_active FROM banners WHERE banner_id = ?`;
    const row = await getOne(selectSql, [bannerId]);

    if (!row) {
      return errorResponse('Banner not found', 404);
    }

    const currentStatus = !!row.is_active;
    const newStatus = !currentStatus;

    // Update status
    const updateSql = `UPDATE banners SET is_active = ?, updated_at = NOW() WHERE banner_id = ?`;
    await update(updateSql, [newStatus ? 1 : 0, bannerId]);

    return successResponse({
      bannerId,
      isActive: newStatus,
      message: `Banner ${newStatus ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle banner error:', error);
    return errorResponse('Failed to toggle banner', 500);
  }
};
