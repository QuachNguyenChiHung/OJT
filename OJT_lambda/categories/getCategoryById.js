// Lambda: Get Category by ID - MySQL
const { getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const categoryId = getPathParam(event, 'id');

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    const sql = `SELECT c_id, c_name, created_at, updated_at FROM categories WHERE c_id = ?`;
    const row = await getOne(sql, [categoryId]);

    if (!row) {
      return errorResponse('Category not found', 404);
    }

    const category = {
      cId: row.c_id,
      cName: row.c_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    return errorResponse('Failed to fetch category', 500);
  }
};
