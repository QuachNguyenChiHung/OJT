// Lambda: Get Product Details by Product ID - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = getPathParam(event, 'productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Schema v2: ProductDetails table (price is in Product table)
    const sql = `SELECT pd.pd_id, pd.color_name, pd.color_code, pd.size, pd.amount, 
                        pd.in_stock, pd.img_list, pd.p_id
                 FROM ProductDetails pd
                 WHERE pd.p_id = ?
                 ORDER BY pd.color_name, pd.size`;

    const rows = await getMany(sql, [productId]);

    const productDetails = rows.map(row => ({
      pdId: row.pd_id,
      colorName: row.color_name || null,
      colorCode: row.color_code || null,
      size: row.size || null,
      amount: row.amount || 0,
      price: parseFloat(row.price || 0),
      inStock: !!row.in_stock,
      imgList: row.img_list || null,
      productId: row.p_id,
    }));

    return successResponse(productDetails);
  } catch (error) {
    console.error('Get product details by product ID error:', error);
    return errorResponse('Failed to fetch product details', 500);
  }
};
