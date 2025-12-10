// Lambda: Get User Notifications
const { query } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const user = await verifyToken(event);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const limit = parseInt(event.queryStringParameters?.limit) || 20;
        const offset = parseInt(event.queryStringParameters?.offset) || 0;

        const sql = `
            SELECT n_id, title, message, type, reference_id, is_read, created_at
            FROM notifications
            WHERE u_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const notifications = await query(sql, [user.u_id, limit, offset]);

        return successResponse({
            notifications: notifications.map(n => ({
                id: n.n_id,
                title: n.title,
                message: n.message,
                type: n.type,
                referenceId: n.reference_id,
                isRead: !!n.is_read,
                createdAt: n.created_at
            }))
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return errorResponse(error.message || 'Failed to get notifications', 500);
    }
};
