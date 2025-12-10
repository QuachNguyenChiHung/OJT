// Lambda: Update Product Details - MySQL
// Updated: Support sizes array (multiple sizes per color variant)
const { update } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const pdId = getPathParam(event, 'id');
    const body = parseBody(event);

    if (!pdId) {
      return errorResponse('Product details ID is required', 400);
    }

    const { colorName, colorCode, sizes, size, amount, price, inStock, imgList, description } = body;

    // Support both new format (sizes array) and old format (single size/amount)
    let sizesJson = null;
    if (sizes && Array.isArray(sizes)) {
      sizesJson = JSON.stringify(sizes);
    } else if (size) {
      sizesJson = JSON.stringify([{ size: size, amount: amount || 0 }]);
    }

    // Calculate total amount from sizes array
    let totalAmount = 0;
    if (sizes && Array.isArray(sizes)) {
      totalAmount = sizes.reduce((sum, s) => sum + (parseInt(s.amount) || 0), 0);
    } else {
      totalAmount = amount || 0;
    }

    // Schema v2: ProductDetails table with sizes JSON column
    const sql = `UPDATE ProductDetails 
                 SET color_name = ?, color_code = ?, sizes = ?, size = ?, 
                     amount = ?, in_stock = ?, img_list = ?, description = ?
                 WHERE pd_id = ?`;

    const affectedRows = await update(sql, [
      colorName || null,
      colorCode || null,
      sizesJson,
      size || null,
      totalAmount,
      inStock !== false ? 1 : 0,
      imgList || null,
      description || null,
      pdId
    ]);

    if (affectedRows === 0) {
      return errorResponse('Product details not found', 404);
    }

    return successResponse({
      pdId,
      colorName,
      colorCode,
      sizes: sizes || (size ? [{ size, amount: amount || 0 }] : []),
      size,
      amount: totalAmount,
      price: price || 0,
      inStock: inStock !== false,
      imgList,
      description,
    });
  } catch (error) {
    console.error('Update product details error:', error);
    return errorResponse('Failed to update product details', 500);
  }
};
