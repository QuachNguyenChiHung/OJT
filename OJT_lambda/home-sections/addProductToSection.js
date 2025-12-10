// Lambda: Add Product to Home Section (Admin)
const { insert, getOne } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const sectionId = getPathParam(event, 'id');
    if (!sectionId) {
      return errorResponse('Section ID is required', 400);
    }

    const { productId, displayOrder } = parseBody(event);
    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check section exists
    const section = await getOne('SELECT section_id FROM HomeSection WHERE section_id = ?', [sectionId]);
    if (!section) {
      return errorResponse('Section not found', 404);
    }

    // Check product exists
    const product = await getOne('SELECT p_id FROM Product WHERE p_id = ?', [productId]);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Check if already in section
    const existing = await getOne(
      'SELECT id FROM HomeSectionProduct WHERE section_id = ? AND p_id = ?',
      [sectionId, productId]
    );
    if (existing) {
      return errorResponse('Product already in this section', 400);
    }

    const id = uuidv4();
    await insert(`
      INSERT INTO HomeSectionProduct (id, section_id, p_id, display_order)
      VALUES (?, ?, ?, ?)
    `, [id, sectionId, productId, displayOrder || 0]);

    return successResponse({
      id,
      sectionId,
      productId,
      displayOrder: displayOrder || 0,
      message: 'Product added to section'
    }, 201);
  } catch (error) {
    console.error('Add product to section error:', error);
    return errorResponse('Failed to add product: ' + error.message, 500);
  }
};
