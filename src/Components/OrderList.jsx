import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OrderList() {
    const [userOrders, setUserOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUserAndOrders();
    }, []);

    const fetchCurrentUserAndOrders = async () => {
        setLoading(true);
        try {
            // Get current user first
            const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, { withCredentials: true });
            if (!userRes.data) {
                navigate('/login');
                return;
            }
            setCurrentUser(userRes.data);

            // Then get their orders
            const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders/user/${userRes.data.u_id}`, { withCredentials: true });
            const orders = ordersRes.data || [];
            setUserOrders(orders);
        } catch (error) {
            console.error('Không thể tải đơn hàng:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setUserOrders([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderDetails = async (orderId) => {
        if (selectedOrder === orderId) {
            setSelectedOrder(null);
            return;
        }

        setSelectedOrder(orderId);

        // Fetch order details if not already loaded
        if (!orderDetails[orderId]) {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}/details`, { withCredentials: true });
                setOrderDetails(prev => ({
                    ...prev,
                    [orderId]: res.data || []
                }));
            } catch (error) {
                console.error('Không thể tải chi tiết đơn hàng:', error);
                setOrderDetails(prev => ({
                    ...prev,
                    [orderId]: []
                }));
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPING': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getVietnameseStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ Xử Lý';
            case 'PROCESSING': return 'Đang Xử Lý';
            case 'SHIPPING': return 'Đang Giao Hàng';
            case 'DELIVERED': return 'Đã Giao Hàng';
            case 'CANCELLED': return 'Đã Hủy';
            default: return status;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Đơn Hàng Của Tôi</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                >
                    Quay Về Trang Chủ
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải đơn hàng...</p>
                </div>
            ) : userOrders.length === 0 ? (
                <div className="text-center py-5">
                    <div className="text-muted">
                        <i className="fas fa-shopping-cart fa-5x mb-4 text-secondary"></i>
                        <h4>Bạn chưa có đơn hàng nào</h4>
                        <p className="mb-4">Hãy khám phá các sản phẩm của chúng tôi và đặt hàng ngay!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                        >
                            Mua Sắm Ngay
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {userOrders.map((order) => (
                        <div key={order.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Đơn hàng #{order.id}</h6>
                                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                                        {getVietnameseStatus(order.status)}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            Ngày đặt: {formatDate(order.dateCreated)}
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        <h5 className="text-primary">{formatCurrency(order.total)}</h5>
                                    </div>

                                    <div className="mb-3">
                                        <small className="text-muted">
                                            <strong>Địa chỉ giao hàng:</strong><br />
                                            {order.shippingAddress || 'Chưa có thông tin'}
                                        </small>
                                    </div>

                                    {order.note && (
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                <strong>Ghi chú:</strong> {order.note}
                                            </small>
                                        </div>
                                    )}
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="btn btn-outline-primary btn-sm w-100"
                                        onClick={() => toggleOrderDetails(order.id)}
                                    >
                                        {selectedOrder === order.id ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}
                                    </button>

                                    {/* Order Details */}
                                    {selectedOrder === order.id && orderDetails[order.id] && (
                                        <div className="mt-3 border-top pt-3">
                                            <h6>Chi Tiết Đơn Hàng:</h6>
                                            {orderDetails[order.id].length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Sản phẩm</th>
                                                                <th>SL</th>
                                                                <th>Đơn giá</th>
                                                                <th>Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {orderDetails[order.id].map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="fw-bold">{item.productName || 'Sản phẩm'}</div>
                                                                        <small className="text-muted">
                                                                            ID: {item.productDetailsId}
                                                                        </small>
                                                                    </td>
                                                                    <td>{item.quantity}</td>
                                                                    <td className="text-end">
                                                                        <small>{formatCurrency(item.unitPrice)}</small>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <small className="fw-bold">{formatCurrency(item.subtotal)}</small>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="d-flex justify-content-end mt-2 pt-2 border-top">
                                                        <strong className="text-primary">
                                                            Tổng cộng: {formatCurrency(order.total)}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <h5>Chuyển khoản ghi chú</h5>
                                                        <h5>ID Đơn hàng: {order.id}</h5>
                                                        <img className="w-100" src="/img/qr.jpg" alt="" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted small">Không có chi tiết đơn hàng</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Loading State for Selected Order */}
                                    {selectedOrder === order.id && !orderDetails[order.id] && (
                                        <div className="mt-3 border-top pt-3">
                                            <h6>Chi Tiết Đơn Hàng:</h6>
                                            <div className="text-center py-2">
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Đang tải...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}