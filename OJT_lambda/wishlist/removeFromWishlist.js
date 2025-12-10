const { remove } = require('./shared/database');

module.exports = async (userId, productId, corsHeaders) => {
    if (!userId || !productId) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'userId and productId are required' })
        };
    }

    try {
        await remove('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: 'Removed from wishlist',
                productId
            })
        };
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
