// Notifications Lambda Module
const getNotifications = require('./getNotifications');
const markAsRead = require('./markAsRead');
const markAllAsRead = require('./markAllAsRead');
const getUnreadCount = require('./getUnreadCount');
const createNotification = require('./createNotification');
const deleteAll = require('./deleteAll');

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    createNotification,
    deleteAll
};
