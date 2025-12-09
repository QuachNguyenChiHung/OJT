// Lambda: Search Categories - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { name } = getQueryParams(event);

    let sql = `SELECT c_id, c_name, created_at, updated_at FROM categories`;
    const params = [];

    if (name) {
      sql += ` WHERE c_name LIKE ?`;
      params.push(`%${name}%`);
    }

    sql += ' ORDER BY c_name ASC';

    const rows = await getMany(sql, params);

    const categories = rows.map(row => ({
      cId: row.c_id,
      cName: row.c_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return successResponse(categories);
  } catch (error) {
    console.error('Search categories error:', error);
    return errorResponse('Failed to search categories', 500);
  }
};
