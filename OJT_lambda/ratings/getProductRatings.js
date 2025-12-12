// Lambda: Get Product Ratings
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    const sql = `
      SELECT r.r_id, r.rating_value, r.comment, r.created_at,
             u.u_id, u.u_name, u.email
      FROM Ratings r
      INNER JOIN app_users u ON r.u_id = u.u_id
      WHERE r.p_id = @productId
      ORDER BY r.created_at DESC
    `;

    const result = await executeStatement(sql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    const ratings = (result.records || []).map(record => ({
      ratingId: record[0].stringValue,
      ratingValue: parseInt(record[1].longValue || record[1].stringValue),
      comment: record[2].stringValue || '',
      createdAt: record[3].stringValue,
      user: {
        userId: record[4].stringValue,
        name: record[5].stringValue,
        email: record[6].stringValue
      }
    }));

    return successResponse({ ratings });
  } catch (error) {
    console.error('Get ratings error:', error);
    return errorResponse(error.message, 500);
  }
};
