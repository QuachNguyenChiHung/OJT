// Auth Module Router - handles all /auth/* endpoints
const login = require('./login');
const signup = require('./signup');
const logout = require('./logout');
const me = require('./me');
const forgotPassword = require('./forgotPassword');
const confirmForgotPassword = require('./confirmForgotPassword');
const verify = require('./verify');
const checkDuplicate = require('./checkDuplicate');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  console.log(`[AuthModule] ${method} ${path}`);

  // Route to appropriate handler
  if (path.endsWith('/login') && method === 'POST') {
    return login.handler(event);
  }
  if (path.endsWith('/signup') && method === 'POST') {
    return signup.handler(event);
  }
  // Check duplicate username/email/phone
  if (path.endsWith('/check-duplicate') && method === 'POST') {
    return checkDuplicate.handler(event);
  }
  if (path.endsWith('/logout') && method === 'POST') {
    return logout.handler(event);
  }
  if (path.endsWith('/me') && method === 'GET') {
    return me.handler(event);
  }
  // Forgot password - gửi code
  if (path.endsWith('/forgot-password') && method === 'POST') {
    return forgotPassword.handler(event);
  }
  // Confirm forgot password - đặt mật khẩu mới
  if (path.endsWith('/reset-password') && method === 'POST') {
    return confirmForgotPassword.handler(event);
  }
  // Verify email - xác nhận email sau đăng ký
  if (path.endsWith('/verify') && method === 'POST') {
    return verify.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
