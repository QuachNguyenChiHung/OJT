const getWishlist = require('./getWishlist');
const addToWishlist = require('./addToWishlist');
const removeFromWishlist = require('./removeFromWishlist');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    const method = event.httpMethod;
    const path = event.path || '';
    const pathParams = event.pathParameters || {};

    try {
        // GET /wishlist/user/{userId} - Get user's wishlist
        if (method === 'GET' && path.includes('/wishlist/user/')) {
            const userId = pathParams.userId || path.split('/wishlist/user/')[1];
            return await getWishlist(userId, corsHeaders);
        }

        // POST /wishlist - Add to wishlist
        if (method === 'POST' && path.endsWith('/wishlist')) {
            const body = JSON.parse(event.body || '{}');
            return await addToWishlist(body, corsHeaders);
        }

        // DELETE /wishlist/{userId}/{productId} - Remove from wishlist
        if (method === 'DELETE') {
            const userId = pathParams.userId;
            const productId = pathParams.productId;
            return await removeFromWishlist(userId, productId, corsHeaders);
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Not found' })
        };
    } catch (error) {
        console.error('Wishlist error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
