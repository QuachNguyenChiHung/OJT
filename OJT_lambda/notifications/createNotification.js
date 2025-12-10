// Lambda: Create Notification (Internal use)
const { insert } = require('./shared/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a notification for a user
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (ORDER_UPDATE, ORDER_CREATED, etc.)
 * @param {string} referenceId - Reference ID (e.g., order ID)
 */
const createNotification = async (userId, title, message, type = 'ORDER_UPDATE', referenceId = null) => {
    try {
        const notificationId = uuidv4();
        const createdAt = Math.floor(Date.now() / 1000);

        const sql = `
            INSERT INTO notifications (n_id, u_id, title, message, type, reference_id, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
        `;

        await insert(sql, [notificationId, userId, title, message, type, referenceId, createdAt]);

        return { success: true, notificationId };
    } catch (error) {
        console.error('Create notification error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { createNotification };
