// Orders Module Router - handles all /orders/* endpoints
const getAllOrders = require('./getAllOrders');
const createOrder = require('./createOrder');
const createOrderCOD = require('./createOrderCOD');
const getOrderDetails = require('./getOrderDetails');
const getUserOrders = require('./getUserOrders');
const getOrdersByUserStatus = require('./getOrdersByUserStatus');
const updateOrderStatus = require('./updateOrderStatus');
const cancelOrder = require('./cancelOrder');
const getOrdersByDateRange = require('./getOrdersByDateRange');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[OrdersModule] ${method} ${path}`, { pathParams });

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
