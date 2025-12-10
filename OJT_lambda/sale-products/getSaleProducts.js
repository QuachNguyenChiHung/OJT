// Lambda: Get All Sale Products
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async () => {
  try {
    const rows = await getMany(`
      SELECT sp.p_id, sp.discount_percent, sp.start_date, sp.end_date, sp.is_active,
             p.p_name, p.price, p.thumbnail_1, p.thumbnail_2, p.c_id,
             c.c_name as category_name, b.brand_name
      FROM SaleProduct sp
      JOIN Product p ON sp.p_id = p.p_id
      LEFT JOIN Category c ON p.c_id = c.c_id
      LEFT JOIN Brand b ON p.brand_id = b.brand_id
      WHERE sp.is_active = 1
      ORDER BY sp.created_at DESC
    `);

    const saleProducts = (rows || []).map(row => ({
      id: row.p_id,
      productId: row.p_id,
      discountPercent: row.discount_percent,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: !!row.is_active,
      name: row.p_name,
      productName: row.p_name,
      price: parseFloat(row.price || 0),
      originalPrice: parseFloat(row.price || 0),
      salePrice: Math.round(parseFloat(row.price || 0) * (1 - (row.discount_percent || 0) / 100)),
      thumbnail1: row.thumbnail_1,
      thumbnail2: row.thumbnail_2,
      categoryId: row.c_id,
      categoryName: row.category_name,
      brandName: row.brand_name
    }));

    return successResponse(saleProducts);
  } catch (error) {
    console.error('Get sale products error:', error);
    return errorResponse('Failed to fetch sale products: ' + error.message, 500);
  }
};
