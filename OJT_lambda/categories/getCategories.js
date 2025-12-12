// Lambda: Get All Categories
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const sql = `SELECT c_id, c_name FROM Categories ORDER BY c_name`;
    const result = await executeStatement(sql);

    const categories = (result.records || []).map(record => ({
      categoryId: record[0].stringValue,
      name: record[1].stringValue
    }));

    return successResponse({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(error.message, 500);
  }
};
