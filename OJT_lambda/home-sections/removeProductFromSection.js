// Lambda: Remove Product from Home Section (Admin)
const { remove, getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const sectionId = getPathParam(event, 'id');
    const productId = getPathParam(event, 'productId');

    if (!sectionId || !productId) {
      return errorResponse('Section ID and Product ID are required', 400);
    }

    // Check if exists
    const existing = await getOne(
      'SELECT id FROM HomeSectionProduct WHERE section_id = ? AND p_id = ?',
      [sectionId, productId]
    );
    if (!existing) {
      return errorResponse('Product not found in this section', 404);
    }

    await remove(
      'DELETE FROM HomeSectionProduct WHERE section_id = ? AND p_id = ?',
      [sectionId, productId]
    );

    return successResponse({ message: 'Product removed from section' });
  } catch (error) {
    console.error('Remove product from section error:', error);
    return errorResponse('Failed to remove product: ' + error.message, 500);
  }
};
