// Lambda: Get Products by Price Range - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { minPrice, maxPrice, isAdmin } = getQueryParams(event);

    if (!minPrice || !maxPrice) {
      return errorResponse('minPrice and maxPrice are required', 400);
    }

    let sql = `SELECT p.p_id, p.p_name, p.description, p.image_url, p.is_active,
                      c.c_id, c.c_name, b.b_id, b.b_name,
                      (SELECT MIN(pd.price) FROM product_details pd WHERE pd.p_id = p.p_id) as min_price
               FROM products p
               LEFT JOIN categories c ON p.c_id = c.c_id
               LEFT JOIN brands b ON p.b_id = b.b_id
               WHERE EXISTS (SELECT 1 FROM product_details pd WHERE pd.p_id = p.p_id AND pd.price >= ? AND pd.price <= ?)`;

    const params = [parseFloat(minPrice), parseFloat(maxPrice)];

    if (isAdmin !== 'true') {
      sql += ' AND p.is_active = 1';
    }

    sql += ' ORDER BY min_price ASC';

    const rows = await getMany(sql, params);

    const products = rows.map(row => ({
      pId: row.p_id,
      pName: row.p_name,
      description: row.description || null,
      imageUrl: row.image_url || null,
      price: parseFloat(row.min_price || 0),
      isActive: !!row.is_active,
      category: row.c_id ? {
        cId: row.c_id,
        cName: row.c_name
      } : null,
      brand: row.b_id ? {
        bId: row.b_id,
        bName: row.b_name
      } : null,
    }));

    return successResponse(products);
  } catch (error) {
    console.error('Get products by price range error:', error);
    return errorResponse('Failed to fetch products', 500);
  }
};
