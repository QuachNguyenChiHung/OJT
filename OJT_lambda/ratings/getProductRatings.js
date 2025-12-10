// Lambda: Get Product Ratings - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    const sql = `
      SELECT r.r_id, r.rating_value, r.review as comment, r.created_at,
             u.user_id as u_id, u.u_name, u.email
      FROM Rating r
      INNER JOIN Users u ON r.u_id = u.user_id
      WHERE r.p_id = ?
      ORDER BY r.created_at DESC
    `;

    const rows = await getMany(sql, [productId]);

    const ratings = rows.map(row => ({
      ratingId: row.r_id,
      ratingValue: parseInt(row.rating_value),
      comment: row.comment || '',
      createdAt: row.created_at,
      user: {
        userId: row.u_id,
        name: row.u_name,
        email: row.email
      }
    }));

    return successResponse({ ratings });
  } catch (error) {
    console.error('Get ratings error:', error);
    return errorResponse(error.message, 500);
  }
};
