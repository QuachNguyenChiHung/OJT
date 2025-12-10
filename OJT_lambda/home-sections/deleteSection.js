// Lambda: Delete Home Section (Admin)
const { remove, getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

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

    // Delete products in section first
    await remove('DELETE FROM HomeSectionProduct WHERE section_id = ?', [sectionId]);
    
    // Delete section
    await remove('DELETE FROM HomeSection WHERE section_id = ?', [sectionId]);

    return successResponse({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete section error:', error);
    return errorResponse('Failed to delete section: ' + error.message, 500);
  }
};
