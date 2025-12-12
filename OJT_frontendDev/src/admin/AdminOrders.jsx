import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';
import { useToast } from '../Components/Toast';

export default function AdminOrders() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingStatus, setEditingStatus] = useState('');
    const navigate = useNavigate();

    const statuses = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            // Backend returns array directly or { orders: [...] }
            const data = response?.data?.orders || response?.data;
            if (Array.isArray(data)) {
                // Map backend field names to frontend expected names
                const mappedOrders = data.map(o => ({
                    id: o.id || o.o_id,
                    userId: o.userId || o.u_id,
                    status: o.status || o.order_status,
                    total: o.totalPrice || o.total_price || o.total || 0,
                    dateCreated: o.dateCreated || o.created_at,
                    itemCount: o.itemCount || o.item_count || 0,
                    customerName: o.customerName || o.u_name || '',
                    customerEmail: o.customerEmail || o.email || '',
                    shippingAddress: o.shippingAddress || o.shipping_address || '',
                    paymentMethod: o.paymentMethod || o.payment_method || ''
                }));
                setOrders(mappedOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error('Fetch orders failed:', err);
            setOrders([]); // Set empty array on error to prevent crash
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res?.data.role !== 'ADMIN') {
                    navigate('/login');
                    return;
                }
            } catch {
                navigate('/login');
            }
        };
        fetchCurrentUser();
    }, [navigate]);

    // Filter orders based on search term and status
    useEffect(() => {
        let filtered = orders;

        if (searchTerm.trim()) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [orders, searchTerm, statusFilter]);

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { bg: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', text: 'Chờ Xử Lý', icon: '⏳' },
            PROCESSING: { bg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', text: 'Đang Xử Lý', icon: '⚙️' },
            SHIPPING: { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', text: 'Đang Giao', icon: '🚚' },
            DELIVERED: { bg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', text: 'Đã Giao', icon: '✅' },
            CANCELLED: { bg: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', text: 'Đã Hủy', icon: '❌' }
        };

        const config = statusConfig[status] || { bg: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', text: status, icon: '📋' };
        return (
            <span style={{
                background: config.bg,
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
                <span>{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const startEdit = (order) => {
        setEditingId(order.id);
        setEditingStatus(order.status);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingStatus('');
    };

    const getStatusText = (status) => {
        const statusTexts = {
            PENDING: 'Chờ Xử Lý',
            PROCESSING: 'Đang Xử Lý',
            SHIPPING: 'Đang Giao',
            DELIVERED: 'Đã Giao',
            CANCELLED: 'Đã Hủy'
        };
        return statusTexts[status] || status;
    };

    const saveEdit = async (orderId) => {
        if (!editingStatus) return toast.warning('Trạng thái không được để trống');
        try {
            // Use PATCH /orders/{id}/status endpoint
            await api.patch(`/orders/${orderId}/status`, { status: editingStatus });
            setOrders(o => o.map(item => item.id === orderId ? { ...item, status: editingStatus } : item));
            cancelEdit();
            toast.success(`Cập nhật trạng thái thành "${getStatusText(editingStatus)}" thành công!`);
        } catch (err) {
            console.error('Update order failed', err);
            toast.warning('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    return (
        <AdminLayout title="Quản Lý Đơn Hàng">
            <div style={{ maxWidth: 1400 }}>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                {[
                    { label: 'Tổng đơn hàng', value: orders.length, icon: '📦', color: '#0d9488' },
                    { label: 'Chờ xử lý', value: orders.filter(o => o.status === 'PENDING').length, icon: '⏳', color: '#0891b2' },
                    { label: 'Đang giao', value: orders.filter(o => o.status === 'SHIPPING').length, icon: '🚚', color: '#06b6d4' },
                    { label: 'Đã giao', value: orders.filter(o => o.status === 'DELIVERED').length, icon: '✅', color: '#10b981' },
                ].map((stat, idx) => (
                    <div key={idx} className="col-md-3">
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '20px 24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: '12px',
                                background: `${stat.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter Bar */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo Order ID hoặc User ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: 48,
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    padding: '12px 16px 12px 48px',
                                    fontSize: 14,
                                    transition: 'all 0.2s ease',
                                }}
                            />
                            {searchTerm && (
                                <button
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                    }}
                                    onClick={() => setSearchTerm('')}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                padding: '12px 16px',
                                fontSize: 14,
                            }}
                        >
                            <option value="">🏷️ Tất cả trạng thái</option>
                            <option value="PENDING">⏳ Chờ Xử Lý</option>
                            <option value="PROCESSING">⚙️ Đang Xử Lý</option>
                            <option value="SHIPPING">🚚 Đang Giao</option>
                            <option value="DELIVERED">✅ Đã Giao</option>
                            <option value="CANCELLED">❌ Đã Hủy</option>
                        </select>
                    </div>
                    <div className="col-md-3 text-end">
                        <span style={{
                            background: '#f1f5f9',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: 13,
                            color: '#64748b',
                            fontWeight: 500,
                        }}>
                            📊 {filteredOrders.length} / {orders.length} đơn
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                <table className="table table-hover mb-0">
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' }}>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Order ID</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>User ID</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Trạng Thái</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Ngày Tạo</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Tổng Tiền</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Số Lượng</th>
                            <th style={{ color: "#fff", padding: '16px 20px', fontWeight: 600, fontSize: 13, border: 'none' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                                    <div style={{ color: '#64748b', fontSize: 15, marginBottom: 12 }}>
                                        {searchTerm || statusFilter
                                            ? `Không tìm thấy đơn hàng nào khớp với bộ lọc`
                                            : 'Không có đơn hàng nào'
                                        }
                                    </div>
                                    {(searchTerm || statusFilter) && (
                                        <button
                                            style={{
                                                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('');
                                            }}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order, idx) => (
                                <tr key={order.id} style={{
                                    background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                        <code style={{
                                            background: '#f1f5f9',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: 12,
                                            color: '#0d9488',
                                            fontWeight: 600,
                                        }}>{order.id.substring(0, 8)}...</code>
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                        <code style={{
                                            background: '#f1f5f9',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: 12,
                                            color: '#64748b',
                                        }}>{order.userId.substring(0, 8)}...</code>
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                        {editingId === order.id ? (
                                            <select
                                                className="form-select form-select-sm"
                                                value={editingStatus}
                                                onChange={(e) => setEditingStatus(e.target.value)}
                                                autoFocus
                                                style={{ borderRadius: '10px', fontSize: 13 }}
                                            >
                                                {statuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status === 'PENDING' && '⏳ Chờ Xử Lý'}
                                                        {status === 'PROCESSING' && '⚙️ Đang Xử Lý'}
                                                        {status === 'SHIPPING' && '🚚 Đang Giao'}
                                                        {status === 'DELIVERED' && '✅ Đã Giao'}
                                                        {status === 'CANCELLED' && '❌ Đã Hủy'}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getStatusBadge(order.status)
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle', color: '#64748b', fontSize: 13 }}>
                                        📅 {formatDate(order.dateCreated)}
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: '#10b981',
                                            fontSize: 14,
                                        }}>{formatCurrency(order.total)}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                        <span style={{
                                            background: '#ccfbf1',
                                            color: '#0d9488',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}>{order.itemCount}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                        <div className="d-flex gap-2">
                                            {editingId === order.id ? (
                                                <>
                                                    <button
                                                        style={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                        onClick={() => saveEdit(order.id)}
                                                    >
                                                        ✓ Lưu
                                                    </button>
                                                    <button
                                                        style={{
                                                            background: '#f1f5f9',
                                                            color: '#64748b',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                        }}
                                                        onClick={cancelEdit}
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        style={{
                                                            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                    >
                                                        👁️ Chi Tiết
                                                    </button>
                                                    <button
                                                        style={{
                                                            background: '#f1f5f9',
                                                            color: '#64748b',
                                                            border: 'none',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onClick={() => startEdit(order)}
                                                    >
                                                        ✏️ Sửa
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </AdminLayout>
    );
}
