// Lambda: Get Product Details by Product ID - MySQL
// Updated: Support sizes array (multiple sizes per color variant)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = getPathParam(event, 'productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Schema v2: ProductDetails table with sizes JSON column
    const sql = `SELECT pd.pd_id, pd.color_name, pd.color_code, pd.sizes, pd.size, pd.amount, 
                        pd.in_stock, pd.img_list, pd.p_id, pd.description
                 FROM ProductDetails pd
                 WHERE pd.p_id = ?
                 ORDER BY pd.color_name`;

    const rows = await getMany(sql, [productId]);

    const productDetails = rows.map(row => {
      // Parse img_list JSON string to array
      let imgList = [];
      if (row.img_list) {
        try {
          imgList = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
        } catch (e) {
          imgList = [];
        }
      }

      // Parse sizes JSON string to array
      let sizes = [];
      if (row.sizes) {
        try {
          sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes;
        } catch (e) {
          sizes = [];
        }
      }
      // Fallback: if no sizes array but has single size/amount, convert
      if (sizes.length === 0 && row.size) {
        sizes = [{ size: row.size, amount: row.amount || 0 }];
      }
      
      return {
        pdId: row.pd_id,
        colorName: row.color_name || null,
        colorCode: row.color_code || null,
        sizes: sizes,
        size: row.size || null, // Keep for backward compatibility
        amount: row.amount || 0,
        price: parseFloat(row.price || 0),
        inStock: !!row.in_stock,
        imgList: imgList,
        productId: row.p_id,
        description: row.description || null,
      };
    });

    return successResponse(productDetails);
  } catch (error) {
    console.error('Get product details by product ID error:', error);
    return errorResponse('Failed to fetch product details', 500);
  }
};
