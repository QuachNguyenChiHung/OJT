// Lambda: Create Product Details - MySQL
// Updated: Support sizes array (multiple sizes per color variant)
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    const { productId, colorName, colorCode, sizes, size, amount, price, inStock, imgList, description } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const pdId = uuidv4();

    // Support both new format (sizes array) and old format (single size/amount)
    let sizesJson = null;
    if (sizes && Array.isArray(sizes)) {
      // New format: sizes array like [{"size":"S","amount":10},{"size":"M","amount":15}]
      sizesJson = JSON.stringify(sizes);
    } else if (size) {
      // Old format: convert single size/amount to array
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
    const sql = `INSERT INTO ProductDetails (pd_id, p_id, color_name, color_code, sizes, size, amount, in_stock, img_list, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await insert(sql, [
      pdId,
      productId,
      colorName || null,
      colorCode || null,
      sizesJson,
      size || null, // Keep for backward compatibility
      totalAmount,
      inStock !== false ? 1 : 0,
      imgList || null,
      description || null
    ]);

    return successResponse({
      pdId,
      productId,
      colorName,
      colorCode,
      sizes: sizes || (size ? [{ size, amount: amount || 0 }] : []),
      size, // Keep for backward compatibility
      amount: totalAmount,
      price: price || 0,
      inStock: inStock !== false,
      imgList,
      description,
    }, 201);
  } catch (error) {
    console.error('Create product details error:', error);
    return errorResponse('Failed to create product details', 500);
  }
};
