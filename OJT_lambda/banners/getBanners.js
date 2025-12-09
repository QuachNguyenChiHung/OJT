// Lambda: Get All Banners - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { active } = getQueryParams(event);

    let sql = `SELECT banner_id, title, image_url, link_url, display_order, is_active, created_at, updated_at
               FROM banners`;

    if (active === 'true') {
      sql += ' WHERE is_active = 1';
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const rows = await getMany(sql);

    const banners = rows.map(row => ({
      bannerId: row.banner_id,
      title: row.title || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      displayOrder: row.display_order || 0,
      isActive: !!row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return successResponse(banners);
  } catch (error) {
    console.error('Get banners error:', error);
    return errorResponse('Failed to fetch banners', 500);
  }
};
