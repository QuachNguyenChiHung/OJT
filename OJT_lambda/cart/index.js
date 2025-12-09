// Cart Module Router - handles all /cart/* endpoints
const addToCart = require('./addToCart');
const getMyCart = require('./getMyCart');
const updateCartItem = require('./updateCartItem');
const removeCartItem = require('./removeCartItem');
const clearCart = require('./clearCart');
const getCartCount = require('./getCartCount');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[CartModule] ${method} ${path}`, { pathParams });

  // POST /cart - Add to cart
  if (path === '/cart' && method === 'POST') {
    return addToCart.handler(event);
  }
  // DELETE /cart - Clear cart
  if (path === '/cart' && method === 'DELETE') {
    return clearCart.handler(event);
  }
  // GET /cart/me
  if (path.endsWith('/me') && method === 'GET') {
    return getMyCart.handler(event);
  }
  // GET /cart/count
  if (path.endsWith('/count') && method === 'GET') {
    return getCartCount.handler(event);
  }
  // PUT /cart/{id} - Update quantity
  if (path.match(/\/cart\/[^\/]+$/) && method === 'PUT' && !path.endsWith('/me') && !path.endsWith('/count')) {
    // Extract cart ID from path
    const match = path.match(/\/cart\/([^\/]+)$/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return updateCartItem.handler(event);
  }
  // DELETE /cart/{id} - Remove item
  if (path.match(/\/cart\/[^\/]+$/) && method === 'DELETE' && !path.endsWith('/me') && !path.endsWith('/count')) {
    // Extract cart ID from path
    const match = path.match(/\/cart\/([^\/]+)$/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return removeCartItem.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
