// Lambda: Mark Notification as Read
const { update, getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const user = await verifyToken(event);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const notificationId = event.pathParameters?.id;
        if (!notificationId) {
            return errorResponse('Notification ID is required', 400);
        }

        // Verify notification belongs to user
        const checkSql = `SELECT n_id FROM notifications WHERE n_id = ? AND u_id = ?`;
        const notification = await getOne(checkSql, [notificationId, user.u_id]);

        if (!notification) {
            return errorResponse('Notification not found', 404);
        }

        const sql = `UPDATE notifications SET is_read = TRUE WHERE n_id = ?`;
        await update(sql, [notificationId]);

        return successResponse({ message: 'Notification marked as read' });

    } catch (error) {
        console.error('Mark as read error:', error);
        return errorResponse(error.message || 'Failed to mark notification as read', 500);
    }
};
