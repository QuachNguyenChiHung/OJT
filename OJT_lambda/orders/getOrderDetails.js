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
    const checkOrderSql = `SELECT o_id, u_id FROM Orders WHERE o_id = ?`;
    const order = await getOne(checkOrderSql, [orderId]);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Check authorization - support both Cognito groups and role
    const isAdmin = user.role === 'ADMIN' || 
                    (user['cognito:groups'] && user['cognito:groups'].includes('admin')) ||
                    (user.groups && user.groups.includes('admin'));
    
    if (user.u_id !== order.u_id && !isAdmin) {
      console.log('[getOrderDetails] Access denied:', { userId: user.u_id, orderUserId: order.u_id, isAdmin });
      return errorResponse('Forbidden', 403);
    }

    // Get order details with product information
    const sql = `
      SELECT 
        od.od_id,
        od.quantity,
        od.price,
        od.size as order_size,
        pd.pd_id,
        pd.size as pd_size,
        pd.color_name,
        pd.img_list,
        p.p_id,
        p.p_name
      FROM OrderDetails od
      INNER JOIN ProductDetails pd ON od.pd_id = pd.pd_id
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE od.o_id = ?
    `;

    const rows = await getMany(sql, [orderId]);

    const items = rows.map(row => {
      const quantity = parseInt(row.quantity || 0);
      const price = parseFloat(row.price || 0);
      // Handle img_list - can be string (JSON) or already parsed array
      let imageUrl = '';
      try {
        let imgList = row.img_list;
        // If it's a string, parse it; if already array, use directly
        if (typeof imgList === 'string') {
          imgList = JSON.parse(imgList);
        }
        imageUrl = Array.isArray(imgList) && imgList.length > 0 ? imgList[0] : '';
      } catch (e) {
        imageUrl = '';
      }

      return {
        orderDetailId: row.od_id,
        quantity,
        price,
        itemTotal: price * quantity,
        productDetails: {
          pdId: row.pd_id,
          size: row.order_size || row.pd_size,
          colorName: row.color_name
        },
        product: {
          pId: row.p_id,
          name: row.p_name,
          imageUrl
        }
      };
    });

    return successResponse({ items });

  } catch (error) {
    console.error('Get order details error:', error);
    return errorResponse(error.message || 'Failed to get order details', 500);
  }
};
