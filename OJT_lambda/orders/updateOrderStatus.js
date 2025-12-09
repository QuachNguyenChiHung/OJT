// Lambda: Update Order Status - MySQL
const { getOne, update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication - Admin only
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized - Admin access required', 403);
    }

    const orderId = event.pathParameters?.id || event.pathParameters?.orderId;
    const { status } = parseBody(event);

    if (!orderId) {
      return errorResponse('Order ID is required', 400);
    }

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Check if order exists
    const checkSql = `SELECT o_id FROM orders WHERE o_id = ?`;
    const order = await getOne(checkSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Update order status
    const updateSql = `UPDATE orders SET order_status = ?, updated_at = NOW() WHERE o_id = ?`;
    await update(updateSql, [status, orderId]);

    return successResponse({
      orderId,
      status,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(error.message || 'Failed to update order status', 500);
  }
};
