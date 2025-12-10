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

    const { productDetailsId, quantity, selectedSize } = parseBody(event);

    if (!productDetailsId || !quantity || quantity <= 0) {
      return errorResponse('Product details ID and valid quantity are required', 400);
    }

    // Check if product details exists and has stock - Schema v2
    const checkProductSql = `
      SELECT pd.pd_id, pd.amount, pd.size, pd.sizes, pd.p_id, p.price
      FROM ProductDetails pd
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE pd.pd_id = ?
    `;
    
    const product = await getOne(checkProductSql, [productDetailsId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const price = parseFloat(product.price || 0);
    const size = selectedSize || product.size || '';
    
    // Calculate available stock for the selected size
    let availableAmount = parseInt(product.amount || 0);
    if (product.sizes && selectedSize) {
      try {
        const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
        if (Array.isArray(sizes)) {
          const sizeData = sizes.find(s => s.size === selectedSize);
          if (sizeData) {
            availableAmount = parseInt(sizeData.amount || 0);
          }
        }
      } catch (e) {
        // Keep using product.amount
      }
    }

    // Check stock
    if (availableAmount < quantity) {
      return errorResponse(`Chỉ còn ${availableAmount} sản phẩm size ${size}`, 400);
    }

    // Check if item already exists in cart (same product + same size)
    const checkCartSql = `
      SELECT cart_id, quantity
      FROM Cart
      WHERE user_id = ? AND pd_id = ? AND (selected_size = ? OR (selected_size IS NULL AND ? IS NULL) OR (selected_size IS NULL AND ? = ''))
    `;

    const cartItem = await getOne(checkCartSql, [user.u_id, productDetailsId, size, size, size]);

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
      // Insert new cart item with selected_size
      const insertSql = `
        INSERT INTO Cart (user_id, pd_id, selected_size, quantity, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      cartId = await insert(insertSql, [user.u_id, productDetailsId, size || null, quantity]);
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
