const { getMany } = require('./shared/database');

module.exports = async (userId, corsHeaders) => {
    if (!userId) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'userId is required' })
        };
    }

    try {
        // Get wishlist items with product info
        const wishlistItems = await getMany(`
            SELECT 
                w.id,
                w.user_id as userId,
                w.product_id as productId,
                w.product_name as productName,
                w.price,
                w.thumbnail,
                w.created_at as createdAt,
                p.p_name as currentProductName,
                p.price as currentPrice,
                p.thumbnail_1 as currentThumbnail,
                p.is_active as isActive,
                CASE WHEN p.p_id IS NULL THEN 1 ELSE 0 END as isDeleted
            FROM wishlist w
            LEFT JOIN Product p ON w.product_id = p.p_id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);

        // Enrich with current product data or mark as unavailable
        const enrichedItems = wishlistItems.map(item => ({
            id: item.id,
            userId: item.userId,
            productId: item.productId,
            productName: item.currentProductName || item.productName || 'Sản phẩm không khả dụng',
            price: item.currentPrice || item.price || 0,
            thumbnail: item.currentThumbnail || item.thumbnail || '/img/no-image.svg',
            createdAt: item.createdAt,
            isAvailable: !item.isDeleted && item.isActive === 1,
            isDeleted: item.isDeleted === 1
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(enrichedItems)
        };
    } catch (error) {
        console.error('Get wishlist error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
