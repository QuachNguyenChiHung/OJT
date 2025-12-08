// Lambda function: Get all products
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse, getQueryParams } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const { isActive } = getQueryParams(event);
    
    let sql = `SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                      c.c_id, c.c_name, b.b_id, b.b_name,
                      p.created_at, p.updated_at
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.c_id
               LEFT JOIN brands b ON p.brand_id = b.b_id`;
    
    const parameters = [];
    
    if (isActive === 'true') {
      sql += ' WHERE p.is_active = 1';
    }
    
    sql += ' ORDER BY p.created_at DESC';

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
      createdAt: record[9].stringValue,
      updatedAt: record[10].stringValue,
    }));

    return successResponse(products);

  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse('Failed to fetch products', 500, error);
  }
};
