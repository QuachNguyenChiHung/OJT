// Lambda: Create Home Section (Admin)
const { insert } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const { title, description, displayOrder, isActive } = parseBody(event);

    if (!title || !title.trim()) {
      return errorResponse('Title is required', 400);
    }

    const sectionId = uuidv4();

    await insert(`
      INSERT INTO HomeSection (section_id, title, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [sectionId, title.trim(), description || '', displayOrder || 0, isActive !== false ? 1 : 0]);

    return successResponse({
      id: sectionId,
      title: title.trim(),
      description: description || '',
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
      message: 'Section created successfully'
    }, 201);
  } catch (error) {
    console.error('Create section error:', error);
    return errorResponse('Failed to create section: ' + error.message, 500);
  }
};
