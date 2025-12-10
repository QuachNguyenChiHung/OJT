// Lambda: Create Discount Level
const { v4: uuidv4 } = require('uuid');
const { executeStatement, getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const { discountPercent, name } = body;

    if (!discountPercent || discountPercent < 1 || discountPercent > 99) {
      return errorResponse('Discount percent must be between 1 and 99', 400);
    }

    // Check if discount level already exists
    const existing = await getOne(
      'SELECT id FROM DiscountLevel WHERE discount_percent = ?',
      [discountPercent]
    );

    if (existing) {
      return errorResponse(`Mức giảm ${discountPercent}% đã tồn tại`, 400);
    }

    const id = uuidv4();
    const levelName = name || `Giảm ${discountPercent}%`;

    await executeStatement(
      'INSERT INTO DiscountLevel (id, discount_percent, name) VALUES (?, ?, ?)',
      [id, discountPercent, levelName]
    );

    return successResponse({
      id,
      discountPercent,
      name: levelName,
      isActive: true
    }, 201);
  } catch (error) {
    console.error('Create discount level error:', error);
    return errorResponse('Failed to create discount level: ' + error.message, 500);
  }
};
