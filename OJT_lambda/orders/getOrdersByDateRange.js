// Lambda: Get Orders by Date Range - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const body = parseBody(event);
    const { status, startDate, endDate } = body;

    if (!startDate || !endDate) {
      return errorResponse('Start date and end date are required', 400);
    }

    let sql = `SELECT o.o_id, o.u_id, o.status, o.total_price, o.shipping_address,
                      o.payment_method, o.date_created, u.u_name, u.email,
                      (SELECT COUNT(*) FROM OrderDetails od WHERE od.o_id = o.o_id) as item_count
               FROM Orders o
               LEFT JOIN Users u ON o.u_id = u.user_id
               WHERE o.date_created >= ? AND o.date_created <= ?`;

    const params = [startDate, endDate];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.date_created DESC';

    const rows = await getMany(sql, params);

    const orders = rows.map(row => ({
      id: row.o_id,
      userId: row.u_id,
      status: row.status,
      totalPrice: parseFloat(row.total_price || 0),
      shippingAddress: row.shipping_address || null,
      paymentMethod: row.payment_method || null,
      dateCreated: row.date_created,
      customerName: row.u_name || null,
      customerEmail: row.email,
      itemCount: row.item_count || 0,
    }));

    return successResponse(orders);
  } catch (error) {
    console.error('Get orders by date range error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
};
