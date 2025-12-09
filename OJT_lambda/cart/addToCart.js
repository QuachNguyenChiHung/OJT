// Lambda: Add to Cart - MySQL
const { getOne, insert, update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { productDetailsId, quantity } = parseBody(event);

    if (!productDetailsId || !quantity || quantity <= 0) {
      return errorResponse('Product details ID and valid quantity are required', 400);
    }

    // Check if product details exists and has stock - Schema v2
    const checkProductSql = `
      SELECT pd.pd_id, pd.amount, pd.size, pd.p_id, p.price
      FROM ProductDetails pd
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE pd.pd_id = ?
    `;
    
    const product = await getOne(checkProductSql, [productDetailsId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const availableAmount = parseInt(product.amount || 0);
    const price = parseFloat(product.price || 0);
    const size = product.size;

    // Check stock
    if (availableAmount < quantity) {
      return errorResponse('Insufficient stock', 400);
    }

    // Check if item already exists in cart - Schema v2
    const checkCartSql = `
      SELECT cart_id, quantity
      FROM Cart
      WHERE user_id = ? AND pd_id = ?
    `;

    const cartItem = await getOne(checkCartSql, [user.u_id, productDetailsId]);

    let cartId;
    let newQuantity = quantity;

    if (cartItem) {
      // Update existing cart item
      cartId = cartItem.cart_id;
      const currentQuantity = parseInt(cartItem.quantity || 0);
      newQuantity = currentQuantity + quantity;

      // Check stock with new quantity
      if (availableAmount < newQuantity) {
        return errorResponse('Insufficient stock for requested quantity', 400);
      }

      const updateSql = `
        UPDATE Cart
        SET quantity = ?, updated_at = NOW()
        WHERE cart_id = ?
      `;

      await update(updateSql, [newQuantity, cartId]);
    } else {
      // Insert new cart item - Schema v2
      const insertSql = `
        INSERT INTO Cart (user_id, pd_id, quantity, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      cartId = await insert(insertSql, [user.u_id, productDetailsId, quantity]);
    }

    // Get product name for response - Schema v2
    const productNameSql = `SELECT p_name FROM Product WHERE p_id = ?`;
    const productRow = await getOne(productNameSql, [product.p_id]);
    const productName = productRow?.p_name || 'Product';

    return successResponse({
      cartId,
      productDetailsId,
      productName,
      size,
      quantity: newQuantity,
      price,
      itemTotal: price * newQuantity,
      message: 'Added to cart successfully'
    }, 201);

  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse(error.message || 'Failed to add to cart', 500);
  }
};
