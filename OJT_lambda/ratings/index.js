// Ratings Module Router - handles all /ratings/* endpoints
const getProductRatings = require('./getProductRatings');
const getRatingStats = require('./getRatingStats');
const createRating = require('./createRating');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[RatingsModule] ${method} ${path}`, { pathParams });

  // POST /ratings
  if (path === '/ratings' && method === 'POST') {
    return createRating.handler(event);
  }
  // GET /ratings/product/{productId}/stats
  if (path.includes('/stats') && method === 'GET') {
    return getRatingStats.handler(event);
  }
  // GET /ratings/product/{productId}
  if (path.includes('/ratings/product/') && method === 'GET') {
    return getProductRatings.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
