// Lambda: Check if user has rated a product
const { getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};
        const userId = queryParams.userId;
        const productId = queryParams.productId;

        if (!userId || !productId) {
            return errorResponse('userId and productId are required', 400);
        }

        const sql = `SELECT r_id FROM Rating WHERE u_id = ? AND p_id = ?`;
        const rating = await getOne(sql, [userId, productId]);

        return successResponse({
            hasRated: !!rating,
            ratingId: rating?.r_id || null
        });
    } catch (error) {
        console.error('Check user rating error:', error);
        // If table doesn't exist or column error, return hasRated: false
        if (error.message?.includes("doesn't exist") || error.message?.includes("Unknown column")) {
            return successResponse({ hasRated: false, ratingId: null });
        }
        return errorResponse(error.message || 'Failed to check rating', 500);
    }
};
