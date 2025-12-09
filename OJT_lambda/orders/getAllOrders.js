// Lambda: Get All Orders (Admin only) - MySQL (Schema v2)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  console.log('[getAllOrders] Starting...');
  try {
    // Verify admin
    let user = null;
    try {
      user = await verifyToken(event);
      console.log('[getAllOrders] User from token:', JSON.stringify(user));
    } catch (authErr) {
      console.error('[getAllOrders] Auth error:', authErr.message);
      return errorResponse('Authentication failed: ' + authErr.message, 401);
    }
    
    if (!user || !isAdmin(user)) {
      console.log('[getAllOrders] Access denied - user:', user, 'isAdmin:', user ? isAdmin(user) : false);
      return errorResponse('Admin access required', 403);
    }

    const { status, page = '1', limit = '20' } = getQueryParams(event);
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Schema v2: Orders table with u_id, Users table with user_id, u_name
    let sql = `SELECT o.o_id, o.u_id, o.status, o.total_price, o.shipping_address,
                      o.payment_method, o.date_created, o.phone, o.order_number,
                      u.u_name, u.email
               FROM Orders o
               LEFT JOIN Users u ON o.u_id = u.user_id`;

    const params = [];

    if (status) {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.date_created DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    console.log('[getAllOrders] Executing SQL:', sql);
    const rows = await getMany(sql, params);
    console.log('[getAllOrders] Got', rows?.length || 0, 'orders');

    const orders = (rows || []).map(row => ({
      id: row.o_id,
      orderId: row.o_id,
      orderNumber: row.order_number,
      userId: row.u_id,
      status: row.status,
      total: parseFloat(row.total_price || 0),
      totalPrice: parseFloat(row.total_price || 0),
      shippingAddress: row.shipping_address || null,
      paymentMethod: row.payment_method || null,
      phone: row.phone || null,
      dateCreated: row.date_created ? Math.floor(new Date(row.date_created).getTime() / 1000) : null,
      customerName: row.u_name || null,
      customerEmail: row.email || null,
      itemCount: 0,
    }));

    return successResponse(orders);
  } catch (error) {
    console.error('[getAllOrders] Error:', error.message, error.stack);
    return errorResponse('Failed to fetch orders: ' + error.message, 500);
  }
};
