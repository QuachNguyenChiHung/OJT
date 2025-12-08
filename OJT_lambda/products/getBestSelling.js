// Lambda function: Get best selling products
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const sql = `SELECT TOP 10 
                   p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                   c.c_id, c.c_name, b.b_id, b.b_name,
                   COUNT(oi.order_item_id) as total_sold
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.c_id
                 LEFT JOIN brands b ON p.brand_id = b.b_id
                 LEFT JOIN product_details pd ON p.p_id = pd.product_id
                 LEFT JOIN order_items oi ON pd.pd_id = oi.product_detail_id
                 WHERE p.is_active = 1
                 GROUP BY p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                          c.c_id, c.c_name, b.b_id, b.b_name
                 ORDER BY total_sold DESC`;

    const result = await executeStatement(sql);

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
      totalSold: parseInt(record[9].longValue || 0),
    }));

    return successResponse(products);

  } catch (error) {
    console.error('Get best selling products error:', error);
    return errorResponse('Failed to fetch best selling products', 500, error);
  }
};
