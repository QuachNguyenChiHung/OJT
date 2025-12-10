// Lambda: Get all ratings by a user
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const userId = getPathParam(event, 'userId');

        if (!userId) {
            return errorResponse('userId is required', 400);
        }

        const sql = `
            SELECT r.r_id as rating_id, r.p_id as productId, r.rating_value as ratingValue, 
                   r.review, r.created_at, p.p_name as productName
            FROM Rating r
            LEFT JOIN Product p ON r.p_id = p.p_id
            WHERE r.u_id = ?
            ORDER BY r.created_at DESC
        `;
        const ratings = await getMany(sql, [userId]);

        return successResponse(ratings);
    } catch (error) {
        console.error('Get user ratings error:', error);
        // If table doesn't exist, return empty array
        if (error.message?.includes("doesn't exist")) {
            return successResponse([]);
        }
        return errorResponse(error.message || 'Failed to get user ratings', 500);
    }
};
