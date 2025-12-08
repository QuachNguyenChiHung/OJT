// Common response formatters
const successResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
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
      'Access-Control-Allow-Credentials': true,
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

module.exports = {
  successResponse,
  errorResponse,
  parseBody,
  getQueryParams,
  getPathParams,
};
