// Lambda: Delete All Notifications for User
const { update } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
    try {
        const user = await verifyToken(event);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const sql = `DELETE FROM notifications WHERE u_id = ?`;
        const result = await update(sql, [user.u_id]);

        return successResponse({ 
            message: 'All notifications deleted successfully',
            deletedCount: result.affectedRows || 0
        });

    } catch (error) {
        console.error('Delete all notifications error:', error);
        return errorResponse(error.message || 'Failed to delete all notifications', 500);
    }
};
