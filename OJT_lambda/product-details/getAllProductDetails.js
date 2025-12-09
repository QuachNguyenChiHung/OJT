// Lambda: Get All Product Details - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Schema v2: ProductDetails and Product tables
    const sql = `SELECT pd.pd_id, pd.color_name, pd.color_code, pd.size, pd.amount, 
                        pd.in_stock, pd.img_list, pd.p_id,
                        p.p_name, p.price
                 FROM ProductDetails pd
                 LEFT JOIN Product p ON pd.p_id = p.p_id
                 ORDER BY pd.pd_id DESC`;

    const rows = await getMany(sql);

    const productDetails = rows.map(row => ({
      pdId: row.pd_id,
      colorName: row.color_name || null,
      colorCode: row.color_code || null,
      size: row.size || null,
      amount: row.amount || 0,
      inStock: !!row.in_stock,
      imgList: row.img_list || null,
      productId: row.p_id,
      productName: row.p_name,
      price: parseFloat(row.price || 0),
    }));

    return successResponse(productDetails);
  } catch (error) {
    console.error('Get all product details error:', error);
    return errorResponse('Failed to fetch product details', 500);
  }
};
