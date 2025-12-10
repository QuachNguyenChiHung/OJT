// Lambda: Update Brand - MySQL
const { update } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const brandId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!brandId) {
      return errorResponse('Brand ID is required', 400);
    }

    // Support both bName and brandName from frontend
    const bName = body.bName || body.brandName || body.name;

    if (!bName) {
      return errorResponse('Brand name is required', 400);
    }

    // Schema v2: Brand table with brand_id, brand_name
    const sql = `UPDATE Brand SET brand_name = ? WHERE brand_id = ?`;
    const affectedRows = await update(sql, [bName, brandId]);

    if (affectedRows === 0) {
      return errorResponse('Brand not found', 404);
    }

    // Return both formats for compatibility
    return successResponse({ 
      brandId: brandId, 
      brandName: bName,
      id: brandId,
      name: bName
    });
  } catch (error) {
    console.error('Update brand error:', error);
    return errorResponse('Failed to update brand', 500);
  }
};
