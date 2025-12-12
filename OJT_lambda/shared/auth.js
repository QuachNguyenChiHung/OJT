// JWT utilities for authentication
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

const extractTokenFromHeader = (headers) => {
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

// Extract and verify token from event - supports both self-signed and Cognito tokens
const verifyToken = async (event) => {
  const token = extractTokenFromHeader(event.headers || {});
  if (!token) {
    console.log('[Auth] No token found');
    return null;
  }
  
  let decoded = null;
  
  // Try verify with secret first
  try {
    decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth] JWT verified with secret');
  } catch (e) {
    // If verify fails, try decode (for Cognito tokens)
    try {
      decoded = jwt.decode(token);
      if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('[Auth] Token expired');
        return null;
      }
      console.log('[Auth] Cognito token decoded');
    } catch (e2) {
      console.log('[Auth] Token decode failed');
      return null;
    }
  }
  
  if (!decoded) return null;
  
  // Normalize u_id from various sources
  const userId = decoded.u_id || decoded.sub || decoded.userId || decoded.id;
  
  return {
    ...decoded,
    u_id: userId,
  };
};

// Check if user is admin
const isAdmin = (user) => {
  if (!user) return false;
  // Check role
  if (user.role === 'ADMIN' || user.role === 'admin') return true;
  // Check Cognito groups
  if (user['cognito:groups'] && user['cognito:groups'].includes('admin')) return true;
  if (user.groups && user.groups.includes('admin')) return true;
  return false;
};

module.exports = {
  generateToken,
  extractTokenFromHeader,
  verifyToken,
  isAdmin,
};
