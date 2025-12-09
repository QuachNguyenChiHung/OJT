// Lambda function: Logout
const { successResponse } = require('./shared/response');

exports.handler = async (event) => {
  // For JWT-based auth, logout is handled client-side by removing the token
  // This endpoint just returns success and clears any cookies if needed
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      // Clear the token cookie
      'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
    },
    body: JSON.stringify({
      success: true,
      message: 'Logged out successfully',
    }),
  };
};
