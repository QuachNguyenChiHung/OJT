// Images Module Router - handles all /images/* endpoints
const uploadImage = require('./uploadImage');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  console.log(`[ImagesModule] ${method} ${path}`);

  // POST /images/upload
  if (path.endsWith('/upload') && method === 'POST') {
    return uploadImage.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
