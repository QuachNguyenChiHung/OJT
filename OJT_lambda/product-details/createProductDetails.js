// Lambda: Create Product Details - MySQL
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const body = parseBody(event);
    const { productId, colorName, colorCode, size, amount, price, inStock, imgList } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const pdId = uuidv4();

    // Schema v2: ProductDetails table
    const sql = `INSERT INTO ProductDetails (pd_id, p_id, color_name, color_code, size, amount, in_stock, img_list)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await insert(sql, [
      pdId,
      productId,
      colorName || null,
      colorCode || null,
      size || null,
      amount || 0,
      inStock !== false ? 1 : 0,
      imgList || null
    ]);

    return successResponse({
      pdId,
      productId,
      colorName,
      colorCode,
      size,
      amount: amount || 0,
      price: price || 0,
      inStock: inStock !== false,
      imgList,
    }, 201);
  } catch (error) {
    console.error('Create product details error:', error);
    return errorResponse('Failed to create product details', 500);
  }
};
