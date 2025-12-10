// Lambda: Get User Orders - MySQL
const { getMany } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = event.pathParameters?.userId || user.u_id;

    // Check if user can access these orders (own orders or admin)
    if (user.u_id !== userId && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403);
    }

    // Get all orders for user
    const sql = `
      SELECT 
        o.o_id,
        o.total_price,
        0 as additional_fee,
        o.status as order_status,
        o.payment_method,
        o.shipping_address,
        o.phone as phone_number,
        o.date_created as created_at,
        o.date_created as updated_at,
        COUNT(od.od_id) as item_count
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.o_id = od.o_id
      WHERE o.u_id = ?
      GROUP BY o.o_id, o.total_price, o.status, 
        o.payment_method, o.shipping_address, o.phone, o.date_created
      ORDER BY o.date_created DESC
    `;

    const rows = await getMany(sql, [userId]);

    const orders = rows.map(row => ({
      orderId: row.o_id,
      totalPrice: parseFloat(row.total_price || 0),
      additionalFee: parseFloat(row.additional_fee || 0),
      status: row.order_status,
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      itemCount: parseInt(row.item_count || 0)
    }));

    return successResponse({ orders });

  } catch (error) {
    console.error('Get user orders error:', error);
    return errorResponse(error.message || 'Failed to get orders', 500);
  }
};
