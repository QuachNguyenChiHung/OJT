// Lambda: Get All Brands
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const sql = `SELECT brand_id, brand_name FROM Brands ORDER BY brand_name`;
    const result = await executeStatement(sql);

    const brands = (result.records || []).map(record => ({
      brandId: record[0].stringValue,
      name: record[1].stringValue
    }));

    return successResponse({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return errorResponse(error.message, 500);
  }
};
