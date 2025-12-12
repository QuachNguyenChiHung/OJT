// Lambda: Get Product Ratings - MySQL
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const sql = `
      SELECT r.r_id, r.rating_value, r.review, 
             u.user_id, u.u_name, u.email
      FROM Rating r
      LEFT JOIN Users u ON r.u_id = u.user_id
      WHERE r.p_id = ?
      ORDER BY r.r_id DESC
    `;

    const rows = await getMany(sql, [productId]);

    const ratings = (rows || []).map(row => ({
      ratingId: row.r_id,
      ratingValue: parseInt(row.rating_value || 0),
      comment: row.review || '',
      user: {
        userId: row.user_id,
        name: row.u_name || 'Anonymous',
        email: row.email || ''
      }
    }));

    return successResponse({ ratings });
  } catch (error) {
    console.error('Get ratings error:', error);
    return errorResponse(error.message || 'Failed to get ratings', 500);
  }
};
