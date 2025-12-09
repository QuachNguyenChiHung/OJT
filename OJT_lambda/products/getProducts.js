// Lambda: Get All Products - MySQL (Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

exports.handler = async (event) => {
  try {
    console.log('[getProducts] Starting...');
    const { isActive } = getQueryParams(event);
    
    // Schema v2: Product table with c_id, brand_id
    let sql = `SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                      c.c_id, c.c_name, b.brand_id, b.brand_name
               FROM Product p
               LEFT JOIN Category c ON p.c_id = c.c_id
               LEFT JOIN Brand b ON p.brand_id = b.brand_id`;
    
    if (isActive === 'true') {
      sql += ' WHERE p.is_active = 1';
    }
    
    sql += ' ORDER BY p.p_id DESC';

    console.log('[getProducts] Executing SQL...');
    const rows = await getMany(sql);
    console.log('[getProducts] Got', rows?.length || 0, 'products');

    const products = (rows || []).map(row => ({
      id: row.p_id,
      pId: row.p_id,
      name: row.p_name,
      pName: row.p_name,
      description: row.p_desc || null,
      price: parseFloat(row.price || 0),
      isActive: !!row.is_active,
      categoryId: row.c_id,
      categoryName: row.c_name || null,
      category: row.c_id ? {
        cId: row.c_id,
        cName: row.c_name
      } : null,
      brandId: row.brand_id,
      brandName: row.brand_name || null,
      brand: row.brand_id ? {
        brandId: row.brand_id,
        brandName: row.brand_name
      } : null,
    }));

    return successResponse(products);

  } catch (error) {
    console.error('[getProducts] Error:', error.message, error.stack);
    return errorResponse('Failed to fetch products: ' + error.message, 500);
  }
};
