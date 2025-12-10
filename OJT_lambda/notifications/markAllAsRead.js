// Lambda: Mark All Notifications as Read
const { update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const user = await verifyToken(event);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const sql = `UPDATE notifications SET is_read = TRUE WHERE u_id = ? AND is_read = FALSE`;
        await update(sql, [user.u_id]);

        return successResponse({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all as read error:', error);
        return errorResponse(error.message || 'Failed to mark all notifications as read', 500);
    }
};
