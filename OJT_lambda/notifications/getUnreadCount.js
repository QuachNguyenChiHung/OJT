// Lambda: Get Unread Notification Count
const { getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const user = await verifyToken(event);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const sql = `SELECT COUNT(*) as count FROM notifications WHERE u_id = ? AND is_read = FALSE`;
        const result = await getOne(sql, [user.u_id]);

        return successResponse({
            unreadCount: result?.count || 0
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        return errorResponse(error.message || 'Failed to get unread count', 500);
    }
};
