import axios from 'axios';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrderRow from './components/OrderRow';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingStatus, setEditingStatus] = useState('');
    const [viewingDetailsId, setViewingDetailsId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({});
    const navigate = useNavigate();

    // Memoize statuses to prevent recreation
    const statuses = useMemo(() => ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'], []);

    // Memoize fetch functions to prevent recreation
    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, { withCredentials: true });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Không thể tải đơn hàng');
        }
    }, []);

    const fetchOrderDetails = useCallback(async (orderId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}/details`, { withCredentials: true });
            setOrderDetails(prev => ({
                ...prev,
                [orderId]: response.data || []
            }));
        } catch (error) {
            console.error('Error fetching order details:', error);
            setOrderDetails(prev => ({
                ...prev,
                [orderId]: []
            }));
        }
    }, []);

    const toggleOrderDetails = useCallback(async (orderId) => {
        if (viewingDetailsId === orderId) {
            setViewingDetailsId(null);
            return;
        }

        setViewingDetailsId(orderId);

        // Fetch details if not already loaded
        if (!orderDetails[orderId]) {
            await fetchOrderDetails(orderId);
        }
    }, [viewingDetailsId, orderDetails, fetchOrderDetails]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
            if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
                navigate('/login');
                return;
            }
            setCurrentUser(res.data);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });

    // Optimize useEffects
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Memoize filtered orders to prevent expensive operations
    const memoizedFilteredOrders = useMemo(() => {
        let filtered = orders;

        if (searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(lowerSearchTerm) ||
                order.userId.toLowerCase().includes(lowerSearchTerm)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        return filtered;
    }, [orders, searchTerm, statusFilter]);

    // Update filteredOrders when memoized result changes
    useEffect(() => {
        setFilteredOrders(memoizedFilteredOrders);
    }, [memoizedFilteredOrders]);

    // Memoize utility functions
    const formatDate = useCallback((timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }, []);

    // Memoize status config to prevent recreation
    const statusConfig = useMemo(() => ({
        PENDING: { class: 'bg-warning text-dark', text: 'Chờ Xử Lý' },
        PROCESSING: { class: 'bg-info text-white', text: 'Đang Xử Lý' },
        SHIPPING: { class: 'bg-primary text-white', text: 'Đang Giao' },
        DELIVERED: { class: 'bg-success text-white', text: 'Đã Giao' },
        CANCELLED: { class: 'bg-danger text-white', text: 'Đã Hủy' }
    }), []);

    const getStatusBadge = useCallback((status) => {
        const config = statusConfig[status] || { class: 'bg-secondary text-white', text: status };
        return (
            <span className={`badge ${config.class}`}>
                {config.text}
            </span>
        );
    }, [statusConfig]);

    // Memoize event handlers
    const startEdit = useCallback((order) => {
        setEditingId(order.id);
        setEditingStatus(order.status);
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditingStatus('');
    }, []);

    const saveEdit = useCallback(async (orderId) => {
        if (!editingStatus) return alert('Trạng thái không được để trống');
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
                { status: editingStatus },
                { withCredentials: true }
            );
            setOrders(o => o.map(item => item.id === orderId ? { ...item, status: editingStatus } : item));
            cancelEdit();
            alert('Cập nhật trạng thái đơn hàng thành công');
        } catch (err) {
            console.error('Update order failed', err);
            alert('Không thể cập nhật trạng thái đơn hàng');
        }
    }, [editingStatus, cancelEdit]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('');
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleStatusFilterChange = useCallback((e) => {
        setStatusFilter(e.target.value);
    }, []);

    return (
        <div className="container py-4" style={{ maxWidth: 1400 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản Trị - Đơn Hàng</h2>
                <div>
                    <Link to="/admin/users" className="btn btn-outline-secondary me-2">Người Dùng</Link>
                    <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Danh Mục</Link>
                    <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Thương Hiệu</Link>
                    <Link to="/admin/products" className="btn btn-outline-secondary">Sản Phẩm</Link>
                </div>
            </div>

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
                                onChange={handleSearchChange}
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
                            onChange={handleStatusFilterChange}
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
                    <thead className="">
                        <tr>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Order ID</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>User ID</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Trạng Thái</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Ngày Tạo</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Tổng Tiền</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Số Lượng Item</th>
                            <th style={{ backgroundColor: "#06BAE9", color: "#FFFFFF" }}>Thao Tác</th>
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
                                            onClick={clearFilters}
                                        >
                                            Xóa bộ lọc để hiển thị tất cả đơn hàng
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <React.Fragment key={order.id}>
                                    <OrderRow
                                        order={order}
                                        editingId={editingId}
                                        editingStatus={editingStatus}
                                        setEditingStatus={setEditingStatus}
                                        statuses={statuses}
                                        getStatusBadge={getStatusBadge}
                                        formatDate={formatDate}
                                        formatCurrency={formatCurrency}
                                        startEdit={startEdit}
                                        saveEdit={saveEdit}
                                        cancelEdit={cancelEdit}
                                        toggleOrderDetails={toggleOrderDetails}
                                        viewingDetailsId={viewingDetailsId}
                                    />
                                    {/* Order Details Row */}
                                    {viewingDetailsId === order.id && (
                                        <tr>
                                            <td colSpan="7" className="p-0">
                                                <div className="bg-light border-top">
                                                    <div className="p-3">
                                                        <h6 className="mb-3">Chi Tiết Đơn Hàng #{order.id}</h6>
                                                        {orderDetails[order.id] ? (
                                                            orderDetails[order.id].length > 0 ? (
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-bordered">
                                                                        <thead className="table-secondary">
                                                                            <tr>
                                                                                <th>Product Details ID</th>
                                                                                <th>Tên Sản Phẩm</th>
                                                                                <th className="text-center">Số Lượng</th>
                                                                                <th className="text-end">Đơn Giá</th>
                                                                                <th className="text-end">Thành Tiền</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {orderDetails[order.id].map((item, index) => (
                                                                                <tr key={index}>
                                                                                    <td>
                                                                                        <small className="text-monospace">{item.productDetailsId}</small>
                                                                                    </td>
                                                                                    <td className="fw-bold">{item.productName}</td>
                                                                                    <td className="text-center">{item.quantity}</td>
                                                                                    <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                                                                                    <td className="text-end fw-bold">{formatCurrency(item.subtotal)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot>
                                                                            <tr className="table-info">
                                                                                <td colSpan="4" className="text-end fw-bold">Tổng cộng:</td>
                                                                                <td className="text-end fw-bold fs-6">
                                                                                    {formatCurrency(order.total)}
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <div className="text-muted text-center py-3">
                                                                    <i className="fas fa-inbox fa-2x mb-2"></i>
                                                                    <p>Không có chi tiết đơn hàng</p>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="text-center py-3">
                                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                                    <span className="visually-hidden">Đang tải...</span>
                                                                </div>
                                                                Đang tải chi tiết đơn hàng...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}