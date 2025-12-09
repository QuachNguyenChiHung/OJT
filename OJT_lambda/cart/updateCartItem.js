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
    const checkSql = `
      SELECT c.cart_id, c.pd_id, pd.amount, p.price
      FROM Cart c
      INNER JOIN ProductDetails pd ON c.pd_id = pd.pd_id
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE c.cart_id = ? AND c.user_id = ?
    `;

    const cartItem = await getOne(checkSql, [cartId, user.u_id]);

    if (!cartItem) {
      return errorResponse('Cart item not found', 404);
    }

    const availableAmount = parseInt(cartItem.amount || 0);
    const price = parseFloat(cartItem.price || 0);

    // Check stock
    if (availableAmount < quantity) {
      return errorResponse('Insufficient stock', 400);
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
