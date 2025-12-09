// Users Module Router - handles all /users/* endpoints
const getAllUsers = require('./getAllUsers');
const getUserById = require('./getUserById');
const updateProfile = require('./updateProfile');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  let pathParams = event.pathParameters || {};
  
  console.log(`[UsersModule] ${method} ${path}`, { pathParams });

  // GET /users (Admin)
  if (path === '/users' && method === 'GET') {
    return getAllUsers.handler(event);
  }
  
  // PUT /users/profile/{userId} - extract userId from path
  if (path.includes('/profile/') && method === 'PUT') {
    const match = path.match(/\/users\/profile\/([^\/]+)/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return updateProfile.handler(event);
  }
  
  // GET /users/{id} - extract id from path if not in pathParams
  if (path.match(/\/users\/[^\/]+$/) && method === 'GET') {
    if (!pathParams.id) {
      const match = path.match(/\/users\/([^\/]+)$/);
      if (match) {
        event.pathParameters = { ...pathParams, id: match[1] };
      }
    }
    return getUserById.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
