// Lambda: Create/Update Rating - MySQL
const { getOne, insert, update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { productId, ratingValue, comment } = parseBody(event);

    if (!productId || !ratingValue || ratingValue < 1 || ratingValue > 5) {
      return errorResponse('Product ID and valid rating (1-5) required', 400);
    }

    // Check if user already rated
    const checkSql = `SELECT r_id FROM ratings WHERE u_id = ? AND p_id = ?`;
    const existingRating = await getOne(checkSql, [user.u_id, productId]);

    if (existingRating) {
      // Update existing
      const ratingId = existingRating.r_id;
      const updateSql = `
        UPDATE ratings
        SET rating_value = ?, comment = ?, updated_at = NOW()
        WHERE r_id = ?
      `;

      await update(updateSql, [ratingValue, comment || '', ratingId]);

      return successResponse({ message: 'Rating updated', ratingId });
    } else {
      // Create new
      const ratingId = uuidv4();
      const insertSql = `
        INSERT INTO ratings (r_id, u_id, p_id, rating_value, comment, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await insert(insertSql, [ratingId, user.u_id, productId, ratingValue, comment || '']);

      return successResponse({ message: 'Rating created', ratingId }, 201);
    }
  } catch (error) {
    console.error('Create rating error:', error);
    return errorResponse(error.message, 500);
  }
};
