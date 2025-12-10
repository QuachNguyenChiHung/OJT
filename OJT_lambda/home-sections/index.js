// Home Sections Module Router
const getSections = require('./getSections');
const createSection = require('./createSection');
const updateSection = require('./updateSection');
const deleteSection = require('./deleteSection');
const addProductToSection = require('./addProductToSection');
const removeProductFromSection = require('./removeProductFromSection');
const getSectionProducts = require('./getSectionProducts');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[HomeSectionsModule] ${method} ${path}`, { pathParams });

  // GET /home-sections - Get all sections with products
  if (path === '/home-sections' && method === 'GET') {
    return getSections.handler(event);
  }
  
  // POST /home-sections - Create new section (Admin)
  if (path === '/home-sections' && method === 'POST') {
    return createSection.handler(event);
  }
  
  // PUT /home-sections/{id} - Update section (Admin)
  if (path.match(/\/home-sections\/[^\/]+$/) && method === 'PUT') {
    const match = path.match(/\/home-sections\/([^\/]+)$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return updateSection.handler(event);
  }
  
  // DELETE /home-sections/{id} - Delete section (Admin)
  if (path.match(/\/home-sections\/[^\/]+$/) && method === 'DELETE') {
    const match = path.match(/\/home-sections\/([^\/]+)$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return deleteSection.handler(event);
  }
  
  // GET /home-sections/{id}/products - Get products in section
  if (path.match(/\/home-sections\/[^\/]+\/products$/) && method === 'GET') {
    const match = path.match(/\/home-sections\/([^\/]+)\/products$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return getSectionProducts.handler(event);
  }
  
  // POST /home-sections/{id}/products - Add product to section (Admin)
  if (path.match(/\/home-sections\/[^\/]+\/products$/) && method === 'POST') {
    const match = path.match(/\/home-sections\/([^\/]+)\/products$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return addProductToSection.handler(event);
  }
  
  // DELETE /home-sections/{id}/products/{productId} - Remove product from section (Admin)
  if (path.match(/\/home-sections\/[^\/]+\/products\/[^\/]+$/) && method === 'DELETE') {
    const match = path.match(/\/home-sections\/([^\/]+)\/products\/([^\/]+)$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1], productId: match[2] };
    return removeProductFromSection.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
