import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import OrderTimeline from './OrderTimeline';

export default function OrderList() {
    const [userOrders, setUserOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchCurrentUserAndOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-expand order if orderId is in URL params (from notification click)
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId && userOrders.length > 0) {
            // Find order by any id field
            const orderExists = userOrders.find(o => o.id === orderId);
            if (orderExists && selectedOrder !== orderExists.id) {
                setSelectedOrder(orderExists.id);
                // Fetch order details
                if (!orderDetails[orderExists.id]) {
                    api.get(`/orders/${orderExists.id}/details`)
                        .then(res => {
                            const items = res.data?.items || res.data || [];
                            setOrderDetails(prev => ({
                                ...prev,
                                [orderExists.id]: items
                            }));
                        })
                        .catch(err => {
                            console.error('Không thể tải chi tiết đơn hàng:', err);
                        });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, userOrders]);

    const fetchCurrentUserAndOrders = async () => {
        setLoading(true);
        try {
            // Get current user first
            const userRes = await api.get('/auth/me');
            if (!userRes.data) {
                navigate('/login');
                return;
            }
            setCurrentUser(userRes.data);

            // Then get their orders - use userId from response
            const userId = userRes.data.userId || userRes.data.u_id || userRes.data.id;
            const ordersRes = await api.get(`/orders/user/${userId}`);
            // Handle both array and object responses
            const ordersData = ordersRes.data;
            const rawOrders = Array.isArray(ordersData) 
                ? ordersData 
                : (ordersData?.orders || ordersData?.data || []);
            // Normalize order data - handle different field names from API
            const orders = rawOrders.map(order => ({
                id: order.orderId || order.id || order.o_id,
                status: order.status || order.order_status,
                total: order.totalPrice || order.total || order.total_price || 0,
                dateCreated: order.createdAt || order.dateCreated || order.date_created,
                shippingAddress: order.shippingAddress || order.shipping_address,
                note: order.note,
                paymentMethod: order.paymentMethod || order.payment_method,
                itemCount: order.itemCount || 0
            }));
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
        if (!orderId) return;
        
        if (selectedOrder === orderId) {
            setSelectedOrder(null);
            return;
        }

        setSelectedOrder(orderId);

        // Fetch order details if not already loaded
        if (!orderDetails[orderId]) {
            try {
                const res = await api.get(`/orders/${orderId}/details`);
                const items = res.data?.items || res.data || [];
                setOrderDetails(prev => ({
                    ...prev,
                    [orderId]: items
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
                                            {order.shippingAddress  || 'Chưa có thông tin'}
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
                                    {selectedOrder === order.id && (
                                        <div className="mt-3 border-top pt-3">
                                            {/* Order Timeline */}
                                            <OrderTimeline 
                                                status={order.status} 
                                                dateCreated={order.dateCreated}
                                            />

                                            <hr style={{ margin: '16px 0' }} />

                                            <h6>Chi Tiết Sản Phẩm:</h6>
                                            {orderDetails[order.id] ? (
                                                orderDetails[order.id].length > 0 ? (
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
                                                                    <tr key={item.orderDetailId || index}>
                                                                        <td>
                                                                            <div className="fw-bold">{item.product?.name || item.productName || 'Sản phẩm'}</div>
                                                                            <small className="text-muted">
                                                                                {item.productDetails?.colorName && `Màu: ${item.productDetails.colorName}`}
                                                                                {item.productDetails?.colorName && item.productDetails?.size && ' | '}
                                                                                {item.productDetails?.size && `Size: ${item.productDetails.size}`}
                                                                                {!item.productDetails?.colorName && !item.productDetails?.size && 'Không có thông tin'}
                                                                            </small>
                                                                        </td>
                                                                        <td>{item.quantity}</td>
                                                                        <td className="text-end">
                                                                            <small>{formatCurrency(item.price || item.unitPrice)}</small>
                                                                        </td>
                                                                        <td className="text-end">
                                                                            <small className="fw-bold">{formatCurrency(item.itemTotal || item.subtotal)}</small>
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
                                                    </div>
                                                ) : (
                                                    <p className="text-muted small">Không có chi tiết đơn hàng</p>
                                                )
                                            ) : (
                                                <div className="text-center py-2">
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Đang tải...</span>
                                                    </div>
                                                </div>
                                            )}
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