// Lambda: Update Order Status - MySQL
const { getOne, update, insert } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

// Status messages in Vietnamese
const statusMessages = {
  PENDING: { title: 'Đơn hàng đang chờ xử lý', message: 'Đơn hàng của bạn đang được chờ xác nhận.' },
  PROCESSING: { title: 'Đơn hàng đã được xác nhận', message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.' },
  SHIPPING: { title: 'Đơn hàng đang giao', message: 'Đơn hàng của bạn đang được vận chuyển đến địa chỉ của bạn.' },
  SHIPPED: { title: 'Đơn hàng đang giao', message: 'Đơn hàng của bạn đang được vận chuyển đến địa chỉ của bạn.' },
  DELIVERED: { title: 'Đơn hàng đã giao thành công', message: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!' },
  CANCELLED: { title: 'Đơn hàng đã bị hủy', message: 'Đơn hàng của bạn đã bị hủy. Vui lòng liên hệ hỗ trợ nếu cần.' }
};

// Create notification helper
const createNotification = async (userId, title, message, type, referenceId) => {
  try {
    const notificationId = uuidv4();
    const createdAt = Math.floor(Date.now() / 1000);
    const sql = `
      INSERT INTO notifications (n_id, u_id, title, message, type, reference_id, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
    `;
    await insert(sql, [notificationId, userId, title, message, type, referenceId, createdAt]);
    return true;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
};

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
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Check if order exists and get user ID
    const checkSql = `SELECT o_id, u_id, status FROM Orders WHERE o_id = ?`;
    const order = await getOne(checkSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const previousStatus = order.status;

    // Update order status
    const updateSql = `UPDATE Orders SET status = ? WHERE o_id = ?`;
    await update(updateSql, [status, orderId]);

    // Create notification for user if status changed
    if (previousStatus !== status && order.u_id) {
      const statusInfo = statusMessages[status] || { title: 'Cập nhật đơn hàng', message: `Trạng thái đơn hàng đã được cập nhật thành ${status}` };
      await createNotification(
        order.u_id,
        statusInfo.title,
        statusInfo.message,
        'ORDER_UPDATE',
        orderId
      );
    }

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
