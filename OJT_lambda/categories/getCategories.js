// Lambda: Get All Categories (MySQL - Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Schema v2: Category table
    const sql = `SELECT c_id, c_name FROM Category ORDER BY c_name`;
    const rows = await getMany(sql);

    const categories = (rows || []).map(row => ({
      id: row.c_id,
      cId: row.c_id,
      name: row.c_name,
      cName: row.c_name
    }));

    return successResponse(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
};
