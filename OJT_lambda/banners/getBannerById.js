// Lambda: Get Banner by ID - MySQL
const { getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const bannerId = getPathParam(event, 'id');

    if (!bannerId) {
      return errorResponse('Banner ID is required', 400);
    }

    const sql = `SELECT banner_id, title, image_url, link_url, display_order, is_active, created_at, updated_at
                 FROM banners WHERE banner_id = ?`;

    const row = await getOne(sql, [bannerId]);

    if (!row) {
      return errorResponse('Banner not found', 404);
    }

    const banner = {
      bannerId: row.banner_id,
      title: row.title || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      displayOrder: row.display_order || 0,
      isActive: !!row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(banner);
  } catch (error) {
    console.error('Get banner by ID error:', error);
    return errorResponse('Failed to fetch banner', 500);
  }
};
