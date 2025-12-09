// Banners Module Router - handles all /banners/* endpoints
const getBanners = require('./getBanners');
const getBannerById = require('./getBannerById');
const createBanner = require('./createBanner');
const updateBanner = require('./updateBanner');
const deleteBanner = require('./deleteBanner');
const toggleBanner = require('./toggleBanner');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[BannersModule] ${method} ${path}`, { pathParams });

  // GET /banners (+ ?active=true)
  if (path === '/banners' && method === 'GET') {
    return getBanners.handler(event);
  }
  // POST /banners (Admin)
  if (path === '/banners' && method === 'POST') {
    return createBanner.handler(event);
  }
  // PATCH /banners/{id}/toggle
  if (path.includes('/toggle') && method === 'PATCH') {
    return toggleBanner.handler(event);
  }
  // GET /banners/{id}
  if (path.match(/\/banners\/[^\/]+$/) && method === 'GET' && pathParams.id) {
    return getBannerById.handler(event);
  }
  // PUT /banners/{id}
  if (path.match(/\/banners\/[^\/]+$/) && method === 'PUT' && pathParams.id) {
    return updateBanner.handler(event);
  }
  // DELETE /banners/{id}
  if (path.match(/\/banners\/[^\/]+$/) && method === 'DELETE' && pathParams.id) {
    return deleteBanner.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
