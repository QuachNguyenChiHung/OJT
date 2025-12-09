// Lambda: Get Rating Stats - MySQL
const { getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    const sql = `
      SELECT 
        AVG(rating_value) as avg_rating,
        COUNT(*) as total_ratings,
        SUM(CASE WHEN rating_value = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating_value = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating_value = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating_value = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating_value = 1 THEN 1 ELSE 0 END) as one_star
      FROM ratings
      WHERE p_id = ?
    `;

    const row = await getOne(sql, [productId]);

    if (!row || row.total_ratings === 0) {
      return successResponse({
        avgRating: 0,
        totalRatings: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }

    return successResponse({
      avgRating: parseFloat(row.avg_rating || 0).toFixed(1),
      totalRatings: parseInt(row.total_ratings || 0),
      distribution: {
        5: parseInt(row.five_star || 0),
        4: parseInt(row.four_star || 0),
        3: parseInt(row.three_star || 0),
        2: parseInt(row.two_star || 0),
        1: parseInt(row.one_star || 0)
      }
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    return errorResponse(error.message, 500);
  }
};
