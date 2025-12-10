// Lambda: Cancel Order - MySQL
const { getOne, update, getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const { verifyToken } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const orderId = getPathParam(event, 'id');

    if (!orderId) {
      return errorResponse('Order ID is required', 400);
    }

    // Check if order exists and belongs to user (or user is admin)
    const checkSql = `SELECT o_id, u_id, status FROM Orders WHERE o_id = ?`;
    const order = await getOne(checkSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const orderUserId = order.u_id;
    const orderStatus = order.status;

    // Check ownership or admin
    if (orderUserId !== user.u_id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized to cancel this order', 403);
    }

    // Check if order can be cancelled
    if (['DELIVERED', 'CANCELLED'].includes(orderStatus)) {
      return errorResponse(`Cannot cancel order with status: ${orderStatus}`, 400);
    }

    // Update order status to CANCELLED
    const updateSql = `UPDATE Orders SET status = 'CANCELLED' WHERE o_id = ?`;
    await update(updateSql, [orderId]);

    // Restore product stock - get order details first
    const detailsSql = `SELECT pd_id, quantity FROM OrderDetails WHERE o_id = ?`;
    const details = await getMany(detailsSql, [orderId]);

    for (const detail of details) {
      const restoreSql = `UPDATE ProductDetails SET amount = amount + ? WHERE pd_id = ?`;
      await update(restoreSql, [detail.quantity, detail.pd_id]);
    }

    return successResponse({ message: 'Order cancelled successfully', orderId });
  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse('Failed to cancel order', 500);
  }
};
