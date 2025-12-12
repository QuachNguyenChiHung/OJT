// Orders Module Router - handles all /orders/* and /notifications/* endpoints
const getAllOrders = require('./getAllOrders');
const createOrder = require('./createOrder');
const createOrderCOD = require('./createOrderCOD');
const getOrderDetails = require('./getOrderDetails');
const getUserOrders = require('./getUserOrders');
const getOrdersByUserStatus = require('./getOrdersByUserStatus');
const updateOrderStatus = require('./updateOrderStatus');
const cancelOrder = require('./cancelOrder');
const getOrdersByDateRange = require('./getOrdersByDateRange');
// Notifications handlers (inline)
const { getMany, update, getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[OrdersModule] ${method} ${path}`, { pathParams });

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // ============ NOTIFICATIONS ROUTES ============
  // GET /notifications
  if (path === '/notifications' && method === 'GET') {
    return handleGetNotifications(event);
  }
  // GET /notifications/unread-count
  if (path === '/notifications/unread-count' && method === 'GET') {
    return handleGetUnreadCount(event);
  }
  // PUT /notifications/read-all (with optional action=delete query param)
  if (path === '/notifications/read-all' && method === 'PUT') {
    const queryParams = event.queryStringParameters || {};
    if (queryParams.action === 'delete') {
      return handleDeleteAllNotifications(event);
    }
    return handleMarkAllAsRead(event);
  }
  // PUT /notifications/{id}/read
  if (path.match(/\/notifications\/[^\/]+\/read$/) && method === 'PUT') {
    return handleMarkAsRead(event);
  }

  // GET /orders (Admin)
  if (path === '/orders' && method === 'GET') {
    return getAllOrders.handler(event);
  }
  // POST /orders
  if (path === '/orders' && method === 'POST') {
    return createOrder.handler(event);
  }
  // POST /orders/create-cod
  if (path.endsWith('/create-cod') && method === 'POST') {
    return createOrderCOD.handler(event);
  }
  // POST /orders/status/date-range
  if (path.endsWith('/date-range') && method === 'POST') {
    return getOrdersByDateRange.handler(event);
  }
  // DELETE /orders/{id} - Cancel order
  if (path.match(/\/orders\/[^\/]+$/) && method === 'DELETE' && pathParams.id) {
    return cancelOrder.handler(event);
  }
  // GET /orders/{id}/details
  if (path.includes('/details') && method === 'GET' && pathParams.id) {
    return getOrderDetails.handler(event);
  }
  // PATCH /orders/{id}/status
  if (path.includes('/status') && method === 'PATCH' && pathParams.id) {
    return updateOrderStatus.handler(event);
  }
  // GET /orders/user/{userId}/status/{status}
  if (path.includes('/user/') && path.includes('/status/') && method === 'GET') {
    return getOrdersByUserStatus.handler(event);
  }
  // GET /orders/user/{userId}
  if (path.includes('/user/') && method === 'GET' && pathParams.userId) {
    return getUserOrders.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};

// ============ NOTIFICATIONS HANDLERS ============
async function handleGetNotifications(event) {
  try {
    const user = await verifyToken(event);
    if (!user) return errorResponse('Unauthorized', 401);

    const limit = parseInt(event.queryStringParameters?.limit) || 20;
    const offset = parseInt(event.queryStringParameters?.offset) || 0;

    // Use string interpolation for LIMIT/OFFSET since MySQL prepared statements don't handle them well
    const sql = `
      SELECT n_id, title, message, type, reference_id, is_read, created_at
      FROM notifications WHERE u_id = ?
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;
    const notifications = await getMany(sql, [user.u_id]);

    return successResponse({
      notifications: notifications.map(n => ({
        id: n.n_id, title: n.title, message: n.message, type: n.type,
        referenceId: n.reference_id, isRead: !!n.is_read, createdAt: n.created_at
      }))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(error.message || 'Failed to get notifications', 500);
  }
}

async function handleGetUnreadCount(event) {
  try {
    const user = await verifyToken(event);
    if (!user) return errorResponse('Unauthorized', 401);

    const sql = `SELECT COUNT(*) as count FROM notifications WHERE u_id = ? AND is_read = FALSE`;
    const result = await getOne(sql, [user.u_id]);

    return successResponse({ unreadCount: result?.count || 0 });
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(error.message || 'Failed to get unread count', 500);
  }
}

async function handleMarkAsRead(event) {
  try {
    const user = await verifyToken(event);
    if (!user) return errorResponse('Unauthorized', 401);

    // Extract notification ID from path: /notifications/{id}/read
    const path = event.path || event.rawPath || '';
    const match = path.match(/\/notifications\/([^\/]+)\/read$/);
    const notificationId = event.pathParameters?.id || (match ? match[1] : null);
    
    if (!notificationId) return errorResponse('Notification ID is required', 400);

    const checkSql = `SELECT n_id FROM notifications WHERE n_id = ? AND u_id = ?`;
    const notification = await getOne(checkSql, [notificationId, user.u_id]);
    if (!notification) return errorResponse('Notification not found', 404);

    await update(`UPDATE notifications SET is_read = TRUE WHERE n_id = ?`, [notificationId]);
    return successResponse({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return errorResponse(error.message || 'Failed to mark notification as read', 500);
  }
}

async function handleMarkAllAsRead(event) {
  try {
    const user = await verifyToken(event);
    if (!user) return errorResponse('Unauthorized', 401);

    await update(`UPDATE notifications SET is_read = TRUE WHERE u_id = ? AND is_read = FALSE`, [user.u_id]);
    return successResponse({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return errorResponse(error.message || 'Failed to mark all notifications as read', 500);
  }
}

async function handleDeleteAllNotifications(event) {
  try {
    const user = await verifyToken(event);
    if (!user) return errorResponse('Unauthorized', 401);

    const result = await update(`DELETE FROM notifications WHERE u_id = ?`, [user.u_id]);
    return successResponse({ 
      message: 'All notifications deleted successfully',
      deletedCount: result.affectedRows || 0
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return errorResponse(error.message || 'Failed to delete all notifications', 500);
  }
}
