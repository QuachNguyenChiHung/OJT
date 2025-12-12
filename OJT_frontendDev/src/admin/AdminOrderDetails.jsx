import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const [orderRes, detailsRes] = await Promise.all([
                    api.get('/orders'),
                    api.get(`/orders/${id}/details`)
                ]);
                
                console.log('[AdminOrderDetails] Order details response:', detailsRes.data);
                
                const orderData = orderRes.data?.find(o => o.id === id || o.orderId === id);
                setOrder(orderData);
                setItems(detailsRes.data?.items || []);
            } catch (err) {
                console.error('Fetch order details error:', err);
                setError(err.response?.data?.error || 'Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#f59e0b',
            'CONFIRMED': '#3b82f6',
            'SHIPPING': '#8b5cf6',
            'DELIVERED': '#10b981',
            'CANCELLED': '#ef4444'
        };
        return colors[status] || '#666';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner-border" style={{ color: '#f59e0b' }}></div>
                <p style={{ marginTop: '10px' }}>Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                <p>{error}</p>
                <button onClick={() => navigate('/admin/orders')} style={{ marginTop: '10px', padding: '8px 16px', background: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ← Quay lại
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '8px' }}>
                        ← Quay lại danh sách
                    </button>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Chi tiết đơn hàng</h2>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>#{order?.orderNumber || id}</p>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '20px', background: getStatusColor(order?.status) + '20', color: getStatusColor(order?.status), fontWeight: '600', fontSize: '14px' }}>
                    {order?.status}
                </span>
            </div>

            {/* Order Info */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e5e5' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>Thông tin đơn hàng</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                    <div><span style={{ color: '#666' }}>Khách hàng:</span> {order?.customerName || 'N/A'}</div>
                    <div><span style={{ color: '#666' }}>Email:</span> {order?.customerEmail || 'N/A'}</div>
                    <div><span style={{ color: '#666' }}>SĐT:</span> {order?.phone || 'N/A'}</div>
                    <div><span style={{ color: '#666' }}>Ngày đặt:</span> {formatDate(order?.dateCreated)}</div>
                    <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#666' }}>Địa chỉ:</span> {order?.shippingAddress || 'N/A'}</div>
                    <div><span style={{ color: '#666' }}>Thanh toán:</span> {order?.paymentMethod || 'COD'}</div>
                    <div><span style={{ color: '#666' }}>Tổng tiền:</span> <strong style={{ color: '#e31837' }}>{formatPrice(order?.total || 0)}</strong></div>
                </div>
            </div>

            {/* Order Items */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e5e5' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>Sản phẩm ({items.length})</h4>
                {items.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Không có sản phẩm</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: '#eee', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.product?.imageUrl ? (
                                        <img 
                                            src={item.product.imageUrl} 
                                            alt={item.product?.name || 'Product'} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px;">No img</div>';
                                            }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '10px' }}>No img</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.product?.name || 'N/A'}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                        Size: {item.productDetails?.size || 'N/A'} | Màu: {item.productDetails?.colorName || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                        SL: {item.quantity} x {formatPrice(item.price)}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '600', color: '#e31837' }}>{formatPrice(item.itemTotal)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
