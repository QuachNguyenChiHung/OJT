// Lambda: Update Banner - MySQL
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

    const bannerId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!bannerId) {
      return errorResponse('Banner ID is required', 400);
    }

    const { title, imageUrl, linkUrl, displayOrder, isActive } = body;

    const sql = `UPDATE banners 
                 SET title = ?, image_url = ?, link_url = ?, 
                     display_order = ?, is_active = ?, updated_at = NOW()
                 WHERE banner_id = ?`;

    const affectedRows = await update(sql, [
      title || null,
      imageUrl || null,
      linkUrl || null,
      displayOrder || 0,
      isActive !== false ? 1 : 0,
      bannerId
    ]);

    if (affectedRows === 0) {
      return errorResponse('Banner not found', 404);
    }

    return successResponse({
      bannerId,
      title,
      imageUrl,
      linkUrl,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    return errorResponse('Failed to update banner', 500);
  }
};
