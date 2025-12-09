import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CartPage() {
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Not logged in - show empty cart
            setIsLoggedIn(false);
            setCartData({ items: [], totalItems: 0, totalPrice: 0 });
            setLoading(false);
            return;
        }
        
        setIsLoggedIn(true);
        try {
            setLoading(true);
            const response = await api.get('/cart/me');
            setCartData(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                // Token expired or invalid
                setIsLoggedIn(false);
                setCartData({ items: [], totalItems: 0, totalPrice: 0 });
            } else {
                alert('Không thể tải giỏ hàng');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setUpdating(prev => ({ ...prev, [cartId]: true }));
            await api.put(`/cart/${cartId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Không thể cập nhật số lượng');
        } finally {
            setUpdating(prev => ({ ...prev, [cartId]: false }));
        }
    };

    const removeItem = async (cartId) => {
        if (!confirm('Xóa sản phẩm khỏi giỏ hàng?')) return;

        try {
            setUpdating(prev => ({ ...prev, [cartId]: true }));
            await api.delete(`/cart/${cartId}`);
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Không thể xóa sản phẩm');
        } finally {
            setUpdating(prev => ({ ...prev, [cartId]: false }));
        }
    };

    const proceedToCheckout = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để thanh toán');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        
        if (!cartData?.items || cartData.items.length === 0) {
            alert('Giỏ hàng trống');
            return;
        }
        navigate('/checkout');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="mb-4">
                        <i className="fas fa-shopping-cart fa-5x text-muted"></i>
                    </div>
                    <h3 className="mb-3">Giỏ hàng trống</h3>
                    <p className="text-muted mb-4">
                        {isLoggedIn 
                            ? 'Bạn chưa có sản phẩm nào trong giỏ hàng'
                            : 'Đăng nhập để xem giỏ hàng của bạn'}
                    </p>
                    {!isLoggedIn && (
                        <button
                            className="btn btn-primary btn-lg me-2"
                            onClick={() => navigate('/login', { state: { from: '/cart' } })}
                        >
                            Đăng nhập
                        </button>
                    )}
                    <button
                        className="btn btn-orange btn-lg"
                        onClick={() => navigate('/')}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Giỏ hàng của bạn</h2>
                        <span className="text-muted">{cartData.totalItems} sản phẩm</span>
                    </div>
                    {cartData.items.map((item) => (
                        <div className="card mb-3">

                            <div className="card-body p-0">

                                <div key={item.cartId} className="p-3">
                                    <div className="row align-items-center">
                                        <div className="col-md-2">
                                            <img
                                                src={item.image}
                                                alt={item.productName}
                                                className="img-fluid rounded"
                                                style={{ aspectRatio: '1/1.5', objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <h6 className="mb-1">{item.productName}</h6>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span>Size: <strong>{item.size}</strong></span>
                                                <div
                                                    className="rounded-circle border"
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        backgroundColor: item.colorCode,
                                                        border: '2px solid #ddd'
                                                    }}
                                                    title={item.colorName}
                                                ></div>
                                                <span>{item.colorName}</span>
                                            </div>
                                        </div>

                                        <div className="col-md-2">
                                            <div className="text-center">
                                                <div className="fw-bold">{formatCurrency(item.price)}</div>
                                                <div className="text-muted small">đơn giá</div>
                                            </div>
                                        </div>

                                        <div className="col-md-2">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                    disabled={updating[item.cartId] || item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="mx-2 fw-bold">{item.quantity}</span>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                    disabled={updating[item.cartId]}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-md-2">
                                            <div className="text-center">
                                                <div className="fw-bold">{formatCurrency(item.itemTotal)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-1">
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removeItem(item.cartId)}
                                                disabled={updating[item.cartId]}
                                                title="Xóa sản phẩm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="col-lg-4">
                    <div className="card sticky-top" style={{ top: '1rem' }}>
                        <div className="card-header">
                            <h5 className="mb-0">Tóm tắt đơn hàng</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính ({cartData.totalItems} sản phẩm)</span>
                                <span>{formatCurrency(cartData.totalPrice)}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Phí vận chuyển</span>
                                <span>{formatCurrency(cartData.estimatedShipping)}</span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between mb-3">
                                <strong>Tổng cộng</strong>
                                <strong className="text-orange">{formatCurrency(cartData.grandTotal)}</strong>
                            </div>

                            <button
                                className="btn btn-orange w-100 mb-3"
                                onClick={proceedToCheckout}
                            >
                                Tiến hành thanh toán
                            </button>

                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => navigate('/')}
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}