    import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data?.unreadCount || 0);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications?limit=10');
            setNotifications(res.data?.notifications || []);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [fetchUnreadCount]);

    const handleBellClick = () => {
        if (!showDropdown) {
            fetchNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        // Navigate to orders page with orderId to show timeline
        if (notification.referenceId && notification.type?.includes('ORDER')) {
            navigate(`/orders?orderId=${notification.referenceId}`);
        }
        setShowDropdown(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'ORDER_CREATED':
                return '🛒';
            case 'ORDER_UPDATE':
                return '📦';
            default:
                return '🔔';
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <div 
                onClick={handleBellClick}
                style={{ cursor: 'pointer', position: 'relative' }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#e31837',
                        color: '#fff',
                        fontSize: '10px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setShowDropdown(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999
                        }}
                    />
                    
                    {/* Dropdown Content */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '10px',
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        width: '360px',
                        maxHeight: '480px',
                        overflow: 'hidden',
                        zIndex: 1000
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #e5e5e5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>
                                Thông báo
                            </h4>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#00B4DB',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                    <div className="spinner-border spinner-border-sm" style={{ color: '#f59e0b' }}></div>
                                    <p style={{ marginTop: '10px', fontSize: '13px' }}>Đang tải...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔔</div>
                                    <p style={{ fontSize: '14px', margin: 0 }}>Chưa có thông báo nào</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            padding: '14px 20px',
                                            borderBottom: '1px solid #f0f0f0',
                                            cursor: 'pointer',
                                            background: notification.isRead ? '#fff' : '#f0f9ff',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = notification.isRead ? '#f8f8f8' : '#e0f2fe'}
                                        onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? '#fff' : '#f0f9ff'}
                                    >
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: notification.isRead ? '#f0f0f0' : '#dbeafe',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                flexShrink: 0
                                            }}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: notification.isRead ? '400' : '600',
                                                    color: '#222',
                                                    marginBottom: '4px'
                                                }}>
                                                    {notification.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    marginBottom: '6px',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {notification.message}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#999'
                                                }}>
                                                    {formatTime(notification.createdAt)}
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#3b82f6',
                                                    flexShrink: 0,
                                                    marginTop: '6px'
                                                }} />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div style={{
                                padding: '12px 20px',
                                borderTop: '1px solid #e5e5e5',
                                textAlign: 'center'
                            }}>
                                <button
                                    onClick={() => { navigate('/orders'); setShowDropdown(false); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#00B4DB',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Xem tất cả đơn hàng →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
