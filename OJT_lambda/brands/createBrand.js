// Lambda: Create Brand - MySQL
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const body = parseBody(event);
    const { bName } = body;

    if (!bName) {
      return errorResponse('Brand name is required', 400);
    }

    const brandId = uuidv4();
    const sql = `INSERT INTO brands (b_id, b_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    
    await insert(sql, [brandId, bName]);

    return successResponse({ bId: brandId, bName }, 201);
  } catch (error) {
    console.error('Create brand error:', error);
    return errorResponse('Failed to create brand', 500);
  }
};
