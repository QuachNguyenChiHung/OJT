// Lambda function: Search products
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse, getQueryParams } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const { q, categoryId, brandId, minPrice, maxPrice } = getQueryParams(event);
    
    let sql = `SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                      c.c_id, c.c_name, b.b_id, b.b_name
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.c_id
               LEFT JOIN brands b ON p.brand_id = b.b_id
               WHERE p.is_active = 1`;
    
    const parameters = [];
    
    if (q) {
      sql += ' AND (p.p_name LIKE @search OR p.p_desc LIKE @search)';
      parameters.push({ name: 'search', value: { stringValue: `%${q}%` } });
    }
    
    if (categoryId) {
      sql += ' AND p.category_id = @categoryId';
      parameters.push({ name: 'categoryId', value: { stringValue: categoryId } });
    }
    
    if (brandId) {
      sql += ' AND p.brand_id = @brandId';
      parameters.push({ name: 'brandId', value: { stringValue: brandId } });
    }
    
    if (minPrice) {
      sql += ' AND p.price >= @minPrice';
      parameters.push({ name: 'minPrice', value: { doubleValue: parseFloat(minPrice) } });
    }
    
    if (maxPrice) {
      sql += ' AND p.price <= @maxPrice';
      parameters.push({ name: 'maxPrice', value: { doubleValue: parseFloat(maxPrice) } });
    }
    
    sql += ' ORDER BY p.p_name';

    const result = await executeStatement(sql, parameters);

    const products = (result.records || []).map(record => ({
      pId: record[0].stringValue,
      pName: record[1].stringValue,
      pDesc: record[2].stringValue || null,
      price: parseFloat(record[3].stringValue),
      isActive: record[4].booleanValue,
      category: record[5].stringValue ? {
        cId: record[5].stringValue,
        cName: record[6].stringValue
      } : null,
      brand: record[7].stringValue ? {
        bId: record[7].stringValue,
        bName: record[8].stringValue
      } : null,
    }));

    return successResponse(products);

  } catch (error) {
    console.error('Search products error:', error);
    return errorResponse('Failed to search products', 500, error);
  }
};
