// Lambda: Get All Discount Levels
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async () => {
  try {
    const rows = await getMany(`
      SELECT id, discount_percent, name, is_active, created_at
      FROM DiscountLevel
      WHERE is_active = 1
      ORDER BY discount_percent ASC
    `);

    const levels = (rows || []).map(row => ({
      id: row.id,
      discountPercent: row.discount_percent,
      name: row.name || `Giảm ${row.discount_percent}%`,
      isActive: !!row.is_active,
      createdAt: row.created_at
    }));

    return successResponse(levels);
  } catch (error) {
    console.error('Get discount levels error:', error);
    return errorResponse('Failed to fetch discount levels: ' + error.message, 500);
  }
};
