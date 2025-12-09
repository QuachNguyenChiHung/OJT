// Lambda: Search Products - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { q, categoryId, brandId, minPrice, maxPrice } = getQueryParams(event);
    
    let sql = `SELECT p.p_id, p.p_name, p.description, p.image_url, p.is_active,
                      c.c_id, c.c_name, b.b_id, b.b_name,
                      (SELECT MIN(pd.price) FROM product_details pd WHERE pd.p_id = p.p_id) as min_price
               FROM products p
               LEFT JOIN categories c ON p.c_id = c.c_id
               LEFT JOIN brands b ON p.b_id = b.b_id
               WHERE p.is_active = 1`;
    
    const params = [];
    
    if (q) {
      sql += ' AND (p.p_name LIKE ? OR p.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (categoryId) {
      sql += ' AND p.c_id = ?';
      params.push(categoryId);
    }
    
    if (brandId) {
      sql += ' AND p.b_id = ?';
      params.push(brandId);
    }
    
    if (minPrice) {
      sql += ' AND EXISTS (SELECT 1 FROM product_details pd WHERE pd.p_id = p.p_id AND pd.price >= ?)';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      sql += ' AND EXISTS (SELECT 1 FROM product_details pd WHERE pd.p_id = p.p_id AND pd.price <= ?)';
      params.push(parseFloat(maxPrice));
    }
    
    sql += ' ORDER BY p.p_name';

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
    console.error('Search products error:', error);
    return errorResponse('Failed to search products', 500);
  }
};
