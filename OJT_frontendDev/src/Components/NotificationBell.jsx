import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Check if JWT token is expired


// Simple check if token exists (don't validate - let server decide)
const hasToken = () => {
    return !!localStorage.getItem('token');
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(hasToken());
    const navigate = useNavigate();

    // Check login status
    useEffect(() => {
        const checkAuth = () => {
            setIsLoggedIn(hasToken());
        };
        window.addEventListener('storage', checkAuth);
        const interval = setInterval(checkAuth, 3000);
        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        if (!hasToken()) return;
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data?.unreadCount || 0);
        } catch {
            // Silently ignore errors - axios interceptor handles 401
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!hasToken()) return;
        try {
            setLoading(true);
            const res = await api.get('/notifications?limit=10');
            setNotifications(res.data?.notifications || []);
        } catch {
            // Silently ignore errors - axios interceptor handles 401
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, fetchUnreadCount]);

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

    const handleDeleteAll = async () => {
        setDeleting(true);
        try {
            await api.put('/notifications/read-all?action=delete');
            setNotifications([]);
            setUnreadCount(0);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Delete all notifications error:', error);
            alert('Không thể xóa thông báo. Vui lòng thử lại.');
        } finally {
            setDeleting(false);
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

    // Don't render if not logged in
    if (!isLoggedIn) {
        return null;
    }

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
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
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
                                    Xem đơn hàng →
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#e31837',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    🗑️ Xóa tất cả
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <>
                    <div 
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div 
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '24px',
                                width: '360px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ 
                                    fontSize: '48px', 
                                    marginBottom: '12px'
                                }}>⚠️</div>
                                <h3 style={{ 
                                    margin: '0 0 8px', 
                                    fontSize: '18px', 
                                    fontWeight: '600',
                                    color: '#222'
                                }}>
                                    Xóa toàn bộ thông báo?
                                </h3>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '14px', 
                                    color: '#666',
                                    lineHeight: '1.5'
                                }}>
                                    Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
                                </p>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e5e5',
                                        background: '#fff',
                                        color: '#666',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    disabled={deleting}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: deleting ? '#fca5a5' : '#e31837',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: deleting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {deleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Đang xóa...
                                        </>
                                    ) : (
                                        '🗑️ Xác nhận xóa'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
