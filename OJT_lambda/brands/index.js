// Brands Module Router - handles all /brands/* endpoints
const getBrands = require('./getBrands');
const getBrandById = require('./getBrandById');
const createBrand = require('./createBrand');
const updateBrand = require('./updateBrand');
const deleteBrand = require('./deleteBrand');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[BrandsModule] ${method} ${path}`, { pathParams });

  // GET /brands
  if (path === '/brands' && method === 'GET') {
    return getBrands.handler(event);
  }
  // POST /brands (Admin)
  if (path === '/brands' && method === 'POST') {
    return createBrand.handler(event);
  }
  // GET /brands/{id}
  if (path.match(/\/brands\/[^\/]+$/) && method === 'GET' && pathParams.id) {
    return getBrandById.handler(event);
  }
  // PUT /brands/{id}
  if (path.match(/\/brands\/[^\/]+$/) && method === 'PUT' && pathParams.id) {
    return updateBrand.handler(event);
  }
  // DELETE /brands/{id}
  if (path.match(/\/brands\/[^\/]+$/) && method === 'DELETE' && pathParams.id) {
    return deleteBrand.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
