// Lambda: Update Home Section (Admin)
const { update, getOne } = require('./shared/database');
const { successResponse, errorResponse, parseBody, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const sectionId = getPathParam(event, 'id');
    if (!sectionId) {
      return errorResponse('Section ID is required', 400);
    }

    // Check if section exists
    const section = await getOne('SELECT section_id FROM HomeSection WHERE section_id = ?', [sectionId]);
    if (!section) {
      return errorResponse('Section not found', 404);
    }

    const { title, description, displayOrder, isActive } = parseBody(event);

    await update(`
      UPDATE HomeSection
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          display_order = COALESCE(?, display_order),
          is_active = COALESCE(?, is_active)
      WHERE section_id = ?
    `, [
      title?.trim() || null,
      description !== undefined ? description : null,
      displayOrder !== undefined ? displayOrder : null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      sectionId
    ]);

    return successResponse({
      id: sectionId,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error('Update section error:', error);
    return errorResponse('Failed to update section: ' + error.message, 500);
  }
};
