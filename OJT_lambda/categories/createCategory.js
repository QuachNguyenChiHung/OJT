// Lambda: Create Category (Admin)
const { executeStatement } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const { name } = parseBody(event);
    if (!name) {
      return errorResponse('Category name is required', 400);
    }

    const categoryId = uuidv4();
    const sql = `
      INSERT INTO Categories (c_id, c_name)
      VALUES (@categoryId, @name)
    `;

    await executeStatement(sql, [
      { name: 'categoryId', value: { stringValue: categoryId } },
      { name: 'name', value: { stringValue: name } }
    ]);

    return successResponse({ categoryId, name, message: 'Category created' }, 201);
  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse(error.message, 500);
  }
};
