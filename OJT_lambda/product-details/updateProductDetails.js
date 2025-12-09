// Lambda: Update Product Details - MySQL
const { update } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const pdId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!pdId) {
      return errorResponse('Product details ID is required', 400);
    }

    const { colorName, colorCode, size, amount, price, inStock, imgList } = body;

    // Schema v2: ProductDetails table
    const sql = `UPDATE ProductDetails 
                 SET color_name = ?, color_code = ?, size = ?, 
                     amount = ?, in_stock = ?, img_list = ?
                 WHERE pd_id = ?`;

    const affectedRows = await update(sql, [
      colorName || null,
      colorCode || null,
      size || null,
      amount || 0,
      inStock !== false ? 1 : 0,
      imgList || null,
      pdId
    ]);

    if (affectedRows === 0) {
      return errorResponse('Product details not found', 404);
    }

    return successResponse({
      pdId,
      colorName,
      colorCode,
      size,
      amount: amount || 0,
      price: price || 0,
      inStock: inStock !== false,
      imgList,
    });
  } catch (error) {
    console.error('Update product details error:', error);
    return errorResponse('Failed to update product details', 500);
  }
};
