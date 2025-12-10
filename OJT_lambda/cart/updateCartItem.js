// Lambda: Update Cart Item - MySQL
const { getOne, update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const cartId = event.pathParameters?.id || event.pathParameters?.cartId;
    const { quantity } = parseBody(event);

    if (!cartId) {
      return errorResponse('Cart ID is required', 400);
    }

    if (!quantity || quantity <= 0) {
      return errorResponse('Valid quantity is required', 400);
    }

    // Check if cart item exists and belongs to user - Schema v2
    // Include selected_size and sizes JSON for accurate stock calculation
    const checkSql = `
      SELECT c.cart_id, c.pd_id, c.selected_size, pd.amount, pd.sizes, pd.size, p.price
      FROM Cart c
      INNER JOIN ProductDetails pd ON c.pd_id = pd.pd_id
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE c.cart_id = ? AND c.user_id = ?
    `;

    const cartItem = await getOne(checkSql, [cartId, user.u_id]);

    if (!cartItem) {
      return errorResponse('Cart item not found', 404);
    }

    // Parse sizes JSON array first
    let sizes = [];
    if (cartItem.sizes) {
      try {
        sizes = typeof cartItem.sizes === 'string' ? JSON.parse(cartItem.sizes) : cartItem.sizes;
        if (!Array.isArray(sizes)) sizes = [];
      } catch (e) {
        sizes = [];
      }
    }
    
    // Get selected size from cart, or fallback to product size, or first available size
    let selectedSize = cartItem.selected_size || cartItem.size || '';
    if (!selectedSize && sizes.length > 0) {
      const firstAvailable = sizes.find(s => parseInt(s.amount || 0) > 0);
      if (firstAvailable) {
        selectedSize = firstAvailable.size;
      } else {
        selectedSize = sizes[0]?.size || '';
      }
    }
    
    // Calculate stock for the selected size
    let availableAmount = parseInt(cartItem.amount || 0);
    if (sizes.length > 0 && selectedSize) {
      const sizeData = sizes.find(s => s.size === selectedSize);
      if (sizeData) {
        availableAmount = parseInt(sizeData.amount || 0);
      }
    }
    
    const price = parseFloat(cartItem.price || 0);

    // Check stock for selected size
    if (availableAmount < quantity) {
      return errorResponse(`Chỉ còn ${availableAmount} sản phẩm size ${selectedSize || 'này'} trong kho`, 400);
    }

    // Update cart item - Schema v2
    const updateSql = `
      UPDATE Cart
      SET quantity = ?, updated_at = NOW()
      WHERE cart_id = ?
    `;

    await update(updateSql, [quantity, cartId]);

    return successResponse({
      cartId,
      quantity,
      price,
      itemTotal: price * quantity,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    return errorResponse(error.message || 'Failed to update cart item', 500);
  }
};
