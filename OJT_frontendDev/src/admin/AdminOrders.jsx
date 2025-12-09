import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminOrders() {
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
                if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
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
            PENDING: { class: 'bg-warning text-dark', text: 'Chờ Xử Lý' },
            PROCESSING: { class: 'bg-info text-white', text: 'Đang Xử Lý' },
            SHIPPING: { class: 'bg-primary text-white', text: 'Đang Giao' },
            DELIVERED: { class: 'bg-success text-white', text: 'Đã Giao' },
            CANCELLED: { class: 'bg-danger text-white', text: 'Đã Hủy' }
        };

        const config = statusConfig[status] || { class: 'bg-secondary text-white', text: status };
        return (
            <span className={`badge ${config.class}`}>
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

    const saveEdit = async (orderId) => {
        if (!editingStatus) return alert('Trạng thái không được để trống');
        try {
            await api.put(`/orders/${orderId}`, { status: editingStatus });
            setOrders(o => o.map(item => item.id === orderId ? { ...item, status: editingStatus } : item));
            cancelEdit();
            alert('Cập nhật trạng thái đơn hàng thành công');
        } catch (err) {
            console.error('Update order failed', err);
            alert('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    return (
        <AdminLayout title="Quản Lý Đơn Hàng">
            <div style={{ maxWidth: 1400 }}>

            {/* Search and Filter Bar */}
            <div className="mb-3">
                <div className="row">
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="fas fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm theo Order ID hoặc User ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ Xử Lý</option>
                            <option value="PROCESSING">Đang Xử Lý</option>
                            <option value="SHIPPING">Đang Giao</option>
                            <option value="DELIVERED">Đã Giao</option>
                            <option value="CANCELLED">Đã Hủy</option>
                        </select>
                    </div>
                    <div className="col-md-5 text-end">
                        <small className="text-muted">
                            Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
                        </small>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Order ID</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>User ID</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Trạng Thái</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Ngày Tạo</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Tổng Tiền</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Số Lượng Item</th>
                            <th style={{ backgroundColor: "#008B8B", color: "#FFFFFF" }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="text-muted">
                                        {searchTerm || statusFilter
                                            ? `Không tìm thấy đơn hàng nào khớp với bộ lọc`
                                            : 'Không có đơn hàng nào'
                                        }
                                    </div>
                                    {(searchTerm || statusFilter) && (
                                        <button
                                            className="btn btn-link btn-sm"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('');
                                            }}
                                        >
                                            Xóa bộ lọc để hiển thị tất cả đơn hàng
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <small className="text-monospace">{order.id.substring(0, 8)}...</small>
                                    </td>
                                    <td>
                                        <small className="text-monospace">{order.userId.substring(0, 8)}...</small>
                                    </td>
                                    <td>
                                        {editingId === order.id ? (
                                            <select
                                                className="form-select form-select-sm"
                                                value={editingStatus}
                                                onChange={(e) => setEditingStatus(e.target.value)}
                                                autoFocus
                                            >
                                                {statuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status === 'PENDING' && 'Chờ Xử Lý'}
                                                        {status === 'PROCESSING' && 'Đang Xử Lý'}
                                                        {status === 'SHIPPING' && 'Đang Giao'}
                                                        {status === 'DELIVERED' && 'Đã Giao'}
                                                        {status === 'CANCELLED' && 'Đã Hủy'}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getStatusBadge(order.status)
                                        )}
                                    </td>
                                    <td>{formatDate(order.dateCreated)}</td>
                                    <td className="fw-bold">{formatCurrency(order.total)}</td>
                                    <td className="text-center">{order.itemCount}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {editingId === order.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => saveEdit(order.id)}
                                                        title="Lưu thay đổi"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={cancelEdit}
                                                        title="Hủy thay đổi"
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                        title="Xem chi tiết"
                                                    >
                                                        Chi Tiết
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => startEdit(order)}
                                                        title="Sửa trạng thái"
                                                    >
                                                        Sửa
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