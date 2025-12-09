// Lambda: Get All Brands - MySQL (Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Schema v2: Brand table with brand_id, brand_name
    const sql = `SELECT brand_id, brand_name FROM Brand ORDER BY brand_name`;
    const rows = await getMany(sql);

    const brands = (rows || []).map(row => ({
      id: row.brand_id,
      brandId: row.brand_id,
      name: row.brand_name,
      brandName: row.brand_name
    }));

    return successResponse(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    return errorResponse(error.message, 500);
  }
};
