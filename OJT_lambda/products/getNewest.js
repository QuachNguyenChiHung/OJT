// Lambda function: Get newest products (MySQL - Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Schema v2: Product, Category, Brand (no created_at in Product table)
    const sql = `SELECT 
                   p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                   c.c_id, c.c_name, b.brand_id, b.brand_name
                 FROM Product p
                 LEFT JOIN Category c ON p.c_id = c.c_id
                 LEFT JOIN Brand b ON p.brand_id = b.brand_id
                 WHERE p.is_active = TRUE
                 ORDER BY p.p_id DESC
                 LIMIT 10`;

    const rows = await getMany(sql);

    const products = (rows || []).map(row => ({
      id: row.p_id,
      pId: row.p_id,
      name: row.p_name,
      pName: row.p_name,
      description: row.p_desc || null,
      pDesc: row.p_desc || null,
      price: parseFloat(row.price || 0),
      isActive: !!row.is_active,
      categoryId: row.c_id,
      categoryName: row.c_name,
      category: row.c_id ? {
        cId: row.c_id,
        cName: row.c_name
      } : null,
      brandId: row.brand_id,
      brandName: row.brand_name,
      brand: row.brand_id ? {
        brandId: row.brand_id,
        brandName: row.brand_name
      } : null,
    }));

    return successResponse(products);

  } catch (error) {
    console.error('Get newest products error:', error);
    return errorResponse('Failed to fetch newest products', 500);
  }
};
