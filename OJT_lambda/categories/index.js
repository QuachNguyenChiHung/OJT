// Categories Module Router - handles all /categories/* endpoints
const getCategories = require('./getCategories');
const getCategoryById = require('./getCategoryById');
const createCategory = require('./createCategory');
const updateCategory = require('./updateCategory');
const deleteCategory = require('./deleteCategory');
const searchCategories = require('./searchCategories');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[CategoriesModule] ${method} ${path}`, { pathParams });

  // GET /categories
  if (path === '/categories' && method === 'GET') {
    return getCategories.handler(event);
  }
  // POST /categories (Admin)
  if (path === '/categories' && method === 'POST') {
    return createCategory.handler(event);
  }
  // GET /categories/search
  if (path.endsWith('/search') && method === 'GET') {
    return searchCategories.handler(event);
  }
  // GET /categories/{id}
  if (path.match(/\/categories\/[^\/]+$/) && method === 'GET' && pathParams.id) {
    return getCategoryById.handler(event);
  }
  // PUT /categories/{id}
  if (path.match(/\/categories\/[^\/]+$/) && method === 'PUT' && pathParams.id) {
    return updateCategory.handler(event);
  }
  // DELETE /categories/{id}
  if (path.match(/\/categories\/[^\/]+$/) && method === 'DELETE' && pathParams.id) {
    return deleteCategory.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
