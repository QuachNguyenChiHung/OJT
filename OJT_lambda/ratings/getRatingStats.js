// Lambda: Get Rating Stats
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    const sql = `
      SELECT 
        AVG(CAST(rating_value AS FLOAT)) as avg_rating,
        COUNT(*) as total_ratings,
        SUM(CASE WHEN rating_value = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating_value = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating_value = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating_value = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating_value = 1 THEN 1 ELSE 0 END) as one_star
      FROM Ratings
      WHERE p_id = @productId
    `;

    const result = await executeStatement(sql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    if (!result.records || result.records.length === 0) {
      return successResponse({
        avgRating: 0,
        totalRatings: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }

    const record = result.records[0];
    return successResponse({
      avgRating: parseFloat(record[0].doubleValue || record[0].stringValue || 0).toFixed(1),
      totalRatings: parseInt(record[1].longValue || 0),
      distribution: {
        5: parseInt(record[2].longValue || 0),
        4: parseInt(record[3].longValue || 0),
        3: parseInt(record[4].longValue || 0),
        2: parseInt(record[5].longValue || 0),
        1: parseInt(record[6].longValue || 0)
      }
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    return errorResponse(error.message, 500);
  }
};
