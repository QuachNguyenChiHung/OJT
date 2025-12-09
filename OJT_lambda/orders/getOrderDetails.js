// Lambda: Get Order Details - MySQL
const { getOne, getMany } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

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

    // Check if order exists and user has access
    const checkOrderSql = `SELECT o_id, u_id FROM orders WHERE o_id = ?`;
    const order = await getOne(checkOrderSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Check authorization
    if (user.u_id !== order.u_id && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403);
    }

    // Get order details with product information
    const sql = `
      SELECT 
        od.od_id,
        od.quantity,
        od.price,
        pd.pd_id,
        pd.size,
        p.p_id,
        p.p_name,
        p.image_url
      FROM order_details od
      INNER JOIN product_details pd ON od.pd_id = pd.pd_id
      INNER JOIN products p ON pd.p_id = p.p_id
      WHERE od.o_id = ?
    `;

    const rows = await getMany(sql, [orderId]);

    const items = rows.map(row => {
      const quantity = parseInt(row.quantity || 0);
      const price = parseFloat(row.price || 0);

      return {
        orderDetailId: row.od_id,
        quantity,
        price,
        itemTotal: price * quantity,
        productDetails: {
          pdId: row.pd_id,
          size: row.size
        },
        product: {
          pId: row.p_id,
          name: row.p_name,
          imageUrl: row.image_url || ''
        }
      };
    });

    return successResponse({ items });

  } catch (error) {
    console.error('Get order details error:', error);
    return errorResponse(error.message || 'Failed to get order details', 500);
  }
};
