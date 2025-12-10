// Lambda: Search Products - MySQL (Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { q, categoryId, brandId, minPrice, maxPrice } = getQueryParams(event);
    
    // Schema v2: Product, Category, Brand tables
    let sql = `SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                      p.thumbnail_1, p.thumbnail_2,
                      c.c_id, c.c_name, b.brand_id, b.brand_name
               FROM Product p
               LEFT JOIN Category c ON p.c_id = c.c_id
               LEFT JOIN Brand b ON p.brand_id = b.brand_id
               WHERE p.is_active = 1`;
    
    const params = [];
    
    if (q) {
      sql += ' AND (p.p_name LIKE ? OR p.p_desc LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (categoryId) {
      sql += ' AND p.c_id = ?';
      params.push(categoryId);
    }
    
    if (brandId) {
      sql += ' AND p.brand_id = ?';
      params.push(brandId);
    }
    
    if (minPrice) {
      sql += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    sql += ' ORDER BY p.p_name';

    const rows = await getMany(sql, params);

    const products = rows.map(row => ({
      id: row.p_id,
      pId: row.p_id,
      name: row.p_name,
      pName: row.p_name,
      description: row.p_desc || null,
      price: parseFloat(row.price || 0),
      thumbnail1: row.thumbnail_1 || null,
      thumbnail2: row.thumbnail_2 || null,
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
    console.error('Search products error:', error);
    return errorResponse('Failed to search products', 500);
  }
};
