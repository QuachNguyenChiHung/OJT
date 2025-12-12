// Common response formatters
const successResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
  body: JSON.stringify(data),
});

const errorResponse = (message, statusCode = 500, error = null) => {
  console.error('Error response:', { message, statusCode, error });
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
    body: JSON.stringify({
      error: message,
      ...(error && process.env.ENVIRONMENT === 'dev' && { details: error.message }),
    }),
  };
};

const parseBody = (event) => {
  try {
    return JSON.parse(event.body || '{}');
  } catch (error) {
    console.error('Failed to parse body:', error);
    return {};
  }
};

const getQueryParams = (event) => {
  return event.queryStringParameters || {};
};

const getPathParams = (event) => {
  return event.pathParameters || {};
};

const getPathParam = (event, paramName) => {
  const params = event.pathParameters || {};
  return params[paramName] || null;
};

const getQueryParam = (event, paramName) => {
  const params = event.queryStringParameters || {};
  return params[paramName] || null;
};

// Extract user info from JWT token
const getUserFromToken = (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.replace('Bearer ', '');
    // Decode JWT payload (base64)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    return {
      userId: payload.sub || payload.userId || payload.user_id,
      email: payload.email,
      role: payload.role || payload['custom:role'],
    };
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

module.exports = {
  successResponse,
  errorResponse,
  parseBody,
  getQueryParams,
  getPathParams,
  getPathParam,
  getQueryParam,
  getUserFromToken,
};
