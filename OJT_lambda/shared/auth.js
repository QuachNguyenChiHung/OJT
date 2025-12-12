// JWT utilities for authentication
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

const extractTokenFromHeader = (headers) => {
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

// Extract and verify token from event
const verifyTokenFromEvent = async (event) => {
  const token = extractTokenFromHeader(event.headers || {});
  if (!token) return null;
  
  return verifyToken(token);
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  verifyToken: verifyTokenFromEvent, // Export as verifyToken for Lambda handlers
};

