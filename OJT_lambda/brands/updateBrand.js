// Lambda: Update Brand - MySQL
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

    const brandId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!brandId) {
      return errorResponse('Brand ID is required', 400);
    }

    const { bName } = body;

    if (!bName) {
      return errorResponse('Brand name is required', 400);
    }

    const sql = `UPDATE brands SET b_name = ?, updated_at = NOW() WHERE b_id = ?`;
    const affectedRows = await update(sql, [bName, brandId]);

    if (affectedRows === 0) {
      return errorResponse('Brand not found', 404);
    }

    return successResponse({ bId: brandId, bName });
  } catch (error) {
    console.error('Update brand error:', error);
    return errorResponse('Failed to update brand', 500);
  }
};
