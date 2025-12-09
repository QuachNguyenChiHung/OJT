// Lambda: Get Orders by User and Status - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const { verifyToken } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const userId = getPathParam(event, 'userId');
    const status = getPathParam(event, 'status');

    if (!userId || !status) {
      return errorResponse('User ID and status are required', 400);
    }

    // Check authorization
    if (userId !== user.u_id && user.role !== 'ADMIN') {
      return errorResponse('Not authorized', 403);
    }

    const sql = `SELECT o.o_id, o.u_id, o.order_status, o.total_price, o.shipping_address,
                        o.payment_method, o.created_at,
                        (SELECT COUNT(*) FROM order_details od WHERE od.o_id = o.o_id) as item_count
                 FROM orders o
                 WHERE o.u_id = ? AND o.order_status = ?
                 ORDER BY o.created_at DESC`;

    const rows = await getMany(sql, [userId, status]);

    const orders = rows.map(row => ({
      id: row.o_id,
      userId: row.u_id,
      status: row.order_status,
      totalPrice: parseFloat(row.total_price || 0),
      shippingAddress: row.shipping_address || null,
      paymentMethod: row.payment_method || null,
      dateCreated: row.created_at,
      itemCount: row.item_count || 0,
    }));

    return successResponse(orders);
  } catch (error) {
    console.error('Get orders by user status error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
};
