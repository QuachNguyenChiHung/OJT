// Lambda: Create Brand - MySQL
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const body = parseBody(event);
    // Support both bName and brandName from frontend
    const bName = body.bName || body.brandName || body.name;

    if (!bName) {
      return errorResponse('Brand name is required', 400);
    }

    const brandId = uuidv4();
    // Schema v2: Brand table with brand_id, brand_name
    const sql = `INSERT INTO Brand (brand_id, brand_name) VALUES (?, ?)`;
    
    await insert(sql, [brandId, bName]);

    // Return both formats for compatibility
    return successResponse({ 
      brandId: brandId, 
      brandName: bName,
      id: brandId,
      name: bName,
      bId: brandId, 
      bName 
    }, 201);
  } catch (error) {
    console.error('Create brand error:', error);
    return errorResponse('Failed to create brand', 500);
  }
};
