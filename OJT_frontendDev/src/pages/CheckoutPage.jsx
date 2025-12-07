import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function CheckoutPage() {
    const [cartData, setCartData] = useState(null);
    const [userInfo, setUserInfo] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
    const [shippingAddress, setShippingAddress] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchCartAndUserData();
    }, []);

    const fetchCartAndUserData = async () => {
        try {
            setLoading(true);
            const [cartResponse, userResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/cart/me`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, { withCredentials: true })
            ]);

            setCartData(cartResponse.data.data);
            setUserInfo(userResponse.data);
            setShippingAddress(userResponse.data.address || '');
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Không thể tải thông tin. Vui lòng thử lại.');
                navigate('/cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!shippingAddress.trim()) {
            newErrors.shippingAddress = 'Địa chỉ giao hàng là bắt buộc';
        }

        if (!paymentMethod) {
            newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
        }

        if (!userInfo?.phoneNumber) {
            newErrors.phone = 'Số điện thoại là bắt buộc. Vui lòng cập nhật thông tin cá nhân.';
        }

        if (!cartData?.items || cartData.items.length === 0) {
            newErrors.cart = 'Giỏ hàng trống';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }; const handleCheckout = async () => {
        if (!validateForm()) return;

        try {
            setProcessing(true);

            // Prepare order data according to OrderDTO.OrderRequest
            const orderData = {
                items: cartData.items.map(item => ({
                    productDetailsId: item.productDetailsId,
                    quantity: item.quantity
                })),
                shippingAddress: shippingAddress,
                phone: userInfo?.phoneNumber || '', // Add phone field
                paymentMethod: paymentMethod,
                additionalFee: cartData.estimatedShipping,
                note: note
            };

            // Use /api/orders endpoint as defined in CustomerOrderController
            console.log('Order Data:', orderData); // For debugging
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/orders`,
                orderData,
                { withCredentials: true }
            );

            // Clear cart after successful order
            await axios.delete(`${import.meta.env.VITE_API_URL}/cart`, { withCredentials: true });

            alert('Đặt hàng thành công!');
            navigate('/orders', {
                state: {
                    message: 'Đơn hàng đã được tạo thành công!',
                    orderId: response.data.id // Use 'id' field from OrderResponse
                }
            });

        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        if (!cartData?.items) return 0;
        // Use cartData.totalPrice or grandTotal if available, otherwise calculate
        return cartData.totalPrice || cartData.grandTotal || cartData.items.reduce((total, item) => {
            return total + (item.itemTotal || item.price * item.quantity) + cartData.estimatedShipping;
        }, 0);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải thông tin đặt hàng...</p>
                </div>
            </div>
        );
    }

    if (!cartData?.items || cartData.items.length === 0) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <h4>Giỏ hàng trống</h4>
                    <p>Bạn cần có sản phẩm trong giỏ hàng để thanh toán.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="mb-4">
                        <i className="fas fa-credit-card me-2"></i>
                        Thanh toán đơn hàng
                    </h2>
                </div>
            </div>

            <div className="row">
                {/* Order Summary */}
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-shopping-bag me-2"></i>
                                Thông tin đơn hàng
                            </h5>
                        </div>
                        <div className="card-body">
                            {cartData.items.map((item) => (
                                <div key={item.cartId} className="row mb-3 align-items-center border-bottom pb-3">
                                    <div className="col-md-2">
                                        <img
                                            src={item.image || '/placeholder.png'}
                                            alt={item.productName}
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '80px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <h6 className="mb-1">{item.productName}</h6>
                                        <small className="text-muted">
                                            Size: {item.size} |
                                            Màu: {item.colorName}
                                        </small>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <span className="fw-bold">x{item.quantity}</span>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <span>{formatPrice(item.price)}</span>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <span className="fw-bold text-primary">
                                            {formatPrice(item.itemTotal || item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-truck me-2"></i>
                                Thông tin giao hàng
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Người nhận:</strong> {userInfo?.fullName || userInfo?.uName || 'N/A'}
                                </div>
                                <div className="col-md-6">
                                    <strong>Số điện thoại:</strong> {userInfo?.phoneNumber || 'N/A'}
                                    {!userInfo?.phoneNumber && (
                                        <div className="text-danger mt-1">
                                            <small>⚠️ Cần cập nhật số điện thoại</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.phone && (
                                <div className="alert alert-warning mt-2">
                                    <small>{errors.phone}</small>
                                </div>
                            )}
                            <div className="row mt-2">
                                <div className="col-md-12">
                                    <label htmlFor="shippingAddress" className="form-label">
                                        <strong>Địa chỉ giao hàng *</strong>
                                    </label>
                                    <textarea
                                        id="shippingAddress"
                                        className={`form-control ${errors.shippingAddress ? 'is-invalid' : ''}`}
                                        rows="3"
                                        value={shippingAddress || userInfo?.address || ''}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ giao hàng chi tiết..."
                                    />
                                    {errors.shippingAddress && (
                                        <div className="invalid-feedback">
                                            {errors.shippingAddress}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <label htmlFor="note" className="form-label">
                                        <strong>Ghi chú đơn hàng</strong>
                                    </label>
                                    <textarea
                                        id="note"
                                        className="form-control"
                                        rows="2"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-credit-card me-2"></i>
                                Phương thức thanh toán
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="paymentMethod"
                                            id="cod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="cod">
                                            <i className="fas fa-money-bill-wave me-2 text-success"></i>
                                            <strong>Thanh toán khi nhận hàng (COD)</strong>
                                            <br />
                                            <small className="text-muted">
                                                Thanh toán bằng tiền mặt khi nhận hàng
                                            </small>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="paymentMethod"
                                            id="card"
                                            value="CARD"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="card">
                                            <i className="fas fa-credit-card me-2 text-primary"></i>
                                            <strong>Thanh toán qua thẻ</strong>
                                            <br />
                                            <small className="text-muted">
                                                Thanh toán trực tuyến qua thẻ tín dụng/ghi nợ
                                            </small>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {errors.paymentMethod && (
                                <div className="text-danger mt-2">
                                    <small>{errors.paymentMethod}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Total */}
                <div className="col-md-4">
                    <div className="card sticky-top" style={{ top: '20px' }}>
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-receipt me-2"></i>
                                Tổng đơn hàng
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(calculateTotal())}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Phí vận chuyển:</span>
                                <span className="text-success">{formatPrice(cartData.estimatedShipping)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Tổng cộng:</strong>
                                <strong className="text-primary fs-5">
                                    {formatPrice(calculateTotal() + cartData.estimatedShipping)}
                                </strong>
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-100"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check me-2"></i>
                                        Xác nhận đặt hàng
                                    </>
                                )}
                            </button>

                            <div className="mt-3 text-center">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate('/cart')}
                                    disabled={processing}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Quay lại giỏ hàng
                                </button>
                            </div>

                            <div className="mt-3">
                                <small className="text-muted">
                                    <i className="fas fa-shield-alt me-1 text-success"></i>
                                    Thông tin của bạn được bảo mật an toàn
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}