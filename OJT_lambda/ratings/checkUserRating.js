// Lambda: Check if user has rated a product
const { getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};
        const productId = queryParams.productId;

        if (!productId) {
            return errorResponse('productId is required', 400);
        }

        // Get userId from token or query param
        let userId = queryParams.userId;
        if (!userId) {
            const user = await verifyToken(event);
            if (user) {
                userId = user.u_id;
            }
        }

        if (!userId) {
            return successResponse({ hasRated: false, ratingId: null, rating: null });
        }

        const sql = `SELECT r_id, rating_value, review FROM Rating WHERE u_id = ? AND p_id = ?`;
        const rating = await getOne(sql, [userId, productId]);

        return successResponse({
            hasRated: !!rating,
            ratingId: rating?.r_id || null,
            rating: rating ? {
                ratingValue: rating.rating_value,
                comment: rating.review || ''
            } : null
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
