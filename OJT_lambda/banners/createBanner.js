// Lambda: Create Banner - MySQL
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const body = parseBody(event);
    const { title, imageUrl, linkUrl, displayOrder, isActive } = body;

    if (!imageUrl) {
      return errorResponse('Image URL is required', 400);
    }

    const bannerId = uuidv4();
    const sql = `INSERT INTO banners (banner_id, title, image_url, link_url, display_order, is_active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

    await insert(sql, [
      bannerId,
      title || null,
      imageUrl,
      linkUrl || null,
      displayOrder || 0,
      isActive !== false ? 1 : 0
    ]);

    return successResponse({
      bannerId,
      title,
      imageUrl,
      linkUrl,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    }, 201);
  } catch (error) {
    console.error('Create banner error:', error);
    return errorResponse('Failed to create banner', 500);
  }
};
