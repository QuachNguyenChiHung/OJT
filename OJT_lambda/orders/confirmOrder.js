// Lambda: User Confirm Order Received - MySQL
const { getOne, update, insert } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const orderId = event.pathParameters?.id || event.pathParameters?.orderId;

    if (!orderId) {
      return errorResponse('Order ID is required', 400);
    }

    // Check if order exists and belongs to user
    const checkSql = `SELECT o_id, u_id, status FROM Orders WHERE o_id = ?`;
    const order = await getOne(checkSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Only order owner can confirm
    if (order.u_id !== user.u_id) {
      return errorResponse('Forbidden - You can only confirm your own orders', 403);
    }

    // Only DELIVERED orders can be confirmed
    if (order.status !== 'DELIVERED') {
      return errorResponse('Only delivered orders can be confirmed as received', 400);
    }

    // Update order status to COMPLETED
    const updateSql = `UPDATE Orders SET status = 'COMPLETED' WHERE o_id = ?`;
    await update(updateSql, [orderId]);

    // Create notification for admin
    try {
      const notificationId = uuidv4();
      const createdAt = Math.floor(Date.now() / 1000);
      const notifSql = `
        INSERT INTO notifications (n_id, u_id, title, message, type, reference_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
      `;
      // Notify all admins - for simplicity, we'll skip this or use a general admin notification
    } catch (notifErr) {
      console.log('Notification creation skipped:', notifErr.message);
    }

    return successResponse({
      orderId,
      status: 'COMPLETED',
      message: 'Order confirmed as received successfully'
    });

  } catch (error) {
    console.error('Confirm order error:', error);
    return errorResponse(error.message || 'Failed to confirm order', 500);
  }
};
