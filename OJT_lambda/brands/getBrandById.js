// Lambda: Get Brand by ID - MySQL
const { getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const brandId = getPathParam(event, 'id');

    if (!brandId) {
      return errorResponse('Brand ID is required', 400);
    }

    const sql = `SELECT b_id, b_name, created_at, updated_at FROM brands WHERE b_id = ?`;
    const row = await getOne(sql, [brandId]);

    if (!row) {
      return errorResponse('Brand not found', 404);
    }

    const brand = {
      bId: row.b_id,
      bName: row.b_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(brand);
  } catch (error) {
    console.error('Get brand by ID error:', error);
    return errorResponse('Failed to fetch brand', 500);
  }
};
