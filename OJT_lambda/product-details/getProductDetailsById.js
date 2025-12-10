// Lambda: Get Product Details by ID - MySQL
const { getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const pdId = getPathParam(event, 'id');

    if (!pdId) {
      return errorResponse('Product details ID is required', 400);
    }

    // Schema v2: ProductDetails and Product tables
    const sql = `SELECT pd.pd_id, pd.color_name, pd.color_code, pd.size, pd.amount, 
                        pd.in_stock, pd.img_list, pd.p_id,
                        p.p_name, p.price
                 FROM ProductDetails pd
                 LEFT JOIN Product p ON pd.p_id = p.p_id
                 WHERE pd.pd_id = ?`;

    const row = await getOne(sql, [pdId]);

    if (!row) {
      return errorResponse('Product details not found', 404);
    }

    // Parse img_list JSON string to array
    let imgList = [];
    if (row.img_list) {
      try {
        imgList = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
      } catch (e) {
        imgList = [];
      }
    }

    const productDetails = {
      pdId: row.pd_id,
      colorName: row.color_name || null,
      colorCode: row.color_code || null,
      size: row.size || null,
      amount: row.amount || 0,
      inStock: !!row.in_stock,
      imgList: imgList,
      productId: row.p_id,
      productName: row.p_name,
      price: parseFloat(row.price || 0),
    };

    return successResponse(productDetails);
  } catch (error) {
    console.error('Get product details by ID error:', error);
    return errorResponse('Failed to fetch product details', 500);
  }
};
