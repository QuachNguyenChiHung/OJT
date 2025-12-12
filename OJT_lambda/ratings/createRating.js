// Lambda: Create/Update Rating
const { executeStatement } = require('../shared/database');
const { verifyToken } = require('../shared/auth');
const { successResponse, errorResponse, parseBody } = require('../shared/response');
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
    const checkSql = `
      SELECT r_id FROM Ratings 
      WHERE u_id = @userId AND p_id = @productId
    `;

    const checkResult = await executeStatement(checkSql, [
      { name: 'userId', value: { stringValue: user.u_id } },
      { name: 'productId', value: { stringValue: productId } }
    ]);

    if (checkResult.records && checkResult.records.length > 0) {
      // Update existing
      const ratingId = checkResult.records[0][0].stringValue;
      const updateSql = `
        UPDATE Ratings
        SET rating_value = @ratingValue, comment = @comment, updated_at = GETDATE()
        WHERE r_id = @ratingId
      `;

      await executeStatement(updateSql, [
        { name: 'ratingValue', value: { longValue: ratingValue } },
        { name: 'comment', value: { stringValue: comment || '' } },
        { name: 'ratingId', value: { stringValue: ratingId } }
      ]);

      return successResponse({ message: 'Rating updated', ratingId });
    } else {
      // Create new
      const ratingId = uuidv4();
      const insertSql = `
        INSERT INTO Ratings (r_id, u_id, p_id, rating_value, comment, created_at, updated_at)
        VALUES (@ratingId, @userId, @productId, @ratingValue, @comment, GETDATE(), GETDATE())
      `;

      await executeStatement(insertSql, [
        { name: 'ratingId', value: { stringValue: ratingId } },
        { name: 'userId', value: { stringValue: user.u_id } },
        { name: 'productId', value: { stringValue: productId } },
        { name: 'ratingValue', value: { longValue: ratingValue } },
        { name: 'comment', value: { stringValue: comment || '' } }
      ]);

      return successResponse({ message: 'Rating created', ratingId }, 201);
    }
  } catch (error) {
    console.error('Create rating error:', error);
    return errorResponse(error.message, 500);
  }
};
