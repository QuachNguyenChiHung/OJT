const { v4: uuidv4 } = require('uuid');
const { insert, getOne } = require('./shared/database');

module.exports = async (body, corsHeaders) => {
    const { userId, productId, productName, price, thumbnail } = body;

    if (!userId || !productId) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'userId and productId are required' })
        };
    }

    try {
        // Check if already exists
        const existing = await getOne(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Already in wishlist', id: existing.id })
            };
        }

        // Add to wishlist
        const id = uuidv4();
        await insert(
            'INSERT INTO wishlist (id, user_id, product_id, product_name, price, thumbnail) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, productId, productName || null, price || null, thumbnail || null]
        );

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: 'Added to wishlist',
                id,
                productId
            })
        };
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
