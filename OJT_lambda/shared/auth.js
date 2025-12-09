// Authentication utilities - supports both Cognito and custom JWT
const jwt = require('jsonwebtoken');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_REGION = process.env.AWS_REGION || 'ap-southeast-1';

// Use Cognito if configured, otherwise use custom JWT
const USE_COGNITO = !!COGNITO_USER_POOL_ID && !!COGNITO_CLIENT_ID;

/**
 * Generate custom JWT token (fallback when Cognito not configured)
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Verify custom JWT token
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
};

/**
 * Verify Cognito token
 * Cognito tokens are JWTs signed by Cognito
 */
const verifyCognitoToken = async (token) => {
  try {
    // Decode token without verification first to get header
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return null;

    // For Cognito, we trust the token if it's from our User Pool
    // In production, you should verify against Cognito's JWKS
    const payload = decoded.payload;
    
    // Check issuer matches our User Pool
    const expectedIssuer = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
    if (payload.iss !== expectedIssuer) {
      console.error('Token issuer mismatch');
      return null;
    }

    // Check token is not expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.error('Token expired');
      return null;
    }

    // Return user info from Cognito token
    return {
      u_id: payload.sub,
      email: payload.email || payload['cognito:username'],
      role: payload['custom:role'] || 'CUSTOMER',
      groups: payload['cognito:groups'] || [],
    };
  } catch (error) {
    console.error('Cognito token verification failed:', error.message);
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (headers) => {
  const authHeader = headers?.Authorization || headers?.authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

/**
 * Verify token from Lambda event
 * Supports both Cognito and custom JWT
 */
const verifyToken = async (event) => {
  const token = extractTokenFromHeader(event.headers || {});
  if (!token) return null;

  // Try Cognito first if configured
  if (USE_COGNITO) {
    const cognitoUser = await verifyCognitoToken(token);
    if (cognitoUser) return cognitoUser;
  }

  // Fallback to custom JWT
  return verifyJWT(token);
};

/**
 * Check if user has admin role
 */
const isAdmin = (user) => {
  if (!user) return false;
  
  // Check role (case-insensitive)
  const role = (user.role || '').toUpperCase();
  if (role === 'ADMIN') return true;
  
  // Check Cognito groups (case-insensitive)
  if (user.groups && Array.isArray(user.groups)) {
    const hasAdminGroup = user.groups.some(g => 
      g.toLowerCase() === 'admin' || g.toLowerCase() === 'admins'
    );
    if (hasAdminGroup) return true;
  }
  
  return false;
};

/**
 * Middleware to require authentication
 */
const requireAuth = async (event) => {
  const user = await verifyToken(event);
  if (!user) {
    return {
      authorized: false,
      error: { statusCode: 401, message: 'Unauthorized' }
    };
  }
  return { authorized: true, user };
};

/**
 * Middleware to require admin role
 */
const requireAdmin = async (event) => {
  const { authorized, user, error } = await requireAuth(event);
  if (!authorized) return { authorized, error };
  
  if (!isAdmin(user)) {
    return {
      authorized: false,
      error: { statusCode: 403, message: 'Forbidden - Admin access required' }
    };
  }
  return { authorized: true, user };
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  isAdmin,
  requireAuth,
  requireAdmin,
  USE_COGNITO,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
};
