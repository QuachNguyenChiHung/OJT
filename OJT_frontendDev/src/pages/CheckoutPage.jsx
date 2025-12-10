import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CheckoutPage() {
    const [cartData, setCartData] = useState(null);
    const [saleProducts, setSaleProducts] = useState([]);
    const [userInfo, setUserInfo] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    // Sale helper functions
    const getSaleInfo = (productId) => {
        const sale = saleProducts.find(s => 
            String(s.productId || s.product_id || s.id) === String(productId)
        );
        if (sale) {
            return { onSale: true, discountPercent: sale.discountPercent || sale.discount_percent || 0 };
        }
        return { onSale: false, discountPercent: 0 };
    };

    const calculateSalePrice = (originalPrice, discountPercent) => {
        return originalPrice * (1 - discountPercent / 100);
    };

    const fetchCartAndUserData = useCallback(async () => {
        try {
            setLoading(true);
            const [cartResponse, userResponse, saleResponse] = await Promise.all([
                api.get('/cart/me'),
                api.get('/auth/me'),
                api.get('/sale-products').catch(() => ({ data: [] }))
            ]);

            setCartData(cartResponse.data.data);
            setUserInfo(userResponse.data);
            setShippingAddress(userResponse.data.address || '');
            setSaleProducts(Array.isArray(saleResponse.data) ? saleResponse.data : []);
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
    }, [navigate]);

    useEffect(() => {
        fetchCartAndUserData();
    }, [fetchCartAndUserData]);

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
    };

    const handleCheckout = async () => {
        if (!validateForm()) return;

        try {
            setProcessing(true);

            const orderData = {
                items: cartData.items.map(item => ({
                    productDetailsId: item.productDetailsId || item.pdId,
                    quantity: item.quantity,
                    size: item.selectedSize || item.size || null
                })),
                shippingAddress: shippingAddress,
                phoneNumber: userInfo?.phoneNumber || '',
                paymentMethod: paymentMethod,
                additionalFee: cartData.estimatedShipping || 0,
                note: note
            };

            console.log('Order Data:', orderData);
            const response = await api.post('/orders', orderData);

            await api.delete('/cart');

            alert('Đặt hàng thành công!');
            navigate('/orders', {
                state: {
                    message: 'Đơn hàng đã được tạo thành công!',
                    orderId: response.data.id
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

    // Calculate totals with sale prices
    const calculateTotals = () => {
        if (!cartData?.items) return { subtotal: 0, originalTotal: 0, discount: 0, shipping: 0, total: 0 };
        
        let subtotal = 0;
        let originalTotal = 0;
        
        cartData.items.forEach(item => {
            const originalItemTotal = item.price * item.quantity;
            originalTotal += originalItemTotal;
            
            const saleInfo = getSaleInfo(item.productId);
            if (saleInfo.onSale) {
                const salePrice = calculateSalePrice(item.price, saleInfo.discountPercent);
                subtotal += salePrice * item.quantity;
            } else {
                subtotal += originalItemTotal;
            }
        });
        
        const discount = originalTotal - subtotal;
        const shipping = cartData.estimatedShipping || 0;
        const total = subtotal + shipping;
        
        return { subtotal, originalTotal, discount, shipping, total };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border" style={{ color: '#f59e0b' }}></div>
                    <p style={{ marginTop: '15px', color: '#666' }}>Đang tải thông tin đặt hàng...</p>
                </div>
            </div>
        );
    }

    if (!cartData?.items || cartData.items.length === 0) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8' }}>
                <div style={{ textAlign: 'center', background: '#fff', padding: '50px', borderRadius: '16px', maxWidth: '450px' }}>
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#222' }}>Giỏ hàng trống</h3>
                    <p style={{ color: '#666', marginBottom: '25px' }}>Bạn cần có sản phẩm trong giỏ hàng để thanh toán.</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '12px 24px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '30px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#222', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Thanh toán đơn hàng
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                    {/* Left Column - Order Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Order Items */}
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>
                                    Thông tin đơn hàng ({cartData.items.length} sản phẩm)
                                </h5>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {cartData.items.map((item, index) => {
                                    const saleInfo = getSaleInfo(item.productId);
                                    const displayPrice = saleInfo.onSale ? calculateSalePrice(item.price, saleInfo.discountPercent) : item.price;
                                    const itemTotal = displayPrice * item.quantity;
                                    const originalItemTotal = item.price * item.quantity;
                                    
                                    let imageUrl = item.image || '';
                                    if (!imageUrl && item.images && Array.isArray(item.images) && item.images.length > 0) {
                                        imageUrl = item.images[0];
                                    }

                                    return (
                                        <div key={item.cartId || index} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '80px 1fr auto', 
                                            gap: '16px', 
                                            alignItems: 'center',
                                            padding: '16px 0',
                                            borderBottom: index < cartData.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                                        }}>
                                            {/* Image */}
                                            <div style={{ position: 'relative' }}>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.productName}
                                                        style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', background: '#f5f5f5' }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '80px', height: '100px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                                            <polyline points="21 15 16 10 5 21"/>
                                                        </svg>
                                                    </div>
                                                )}
                                                {saleInfo.onSale && (
                                                    <span style={{ 
                                                        position: 'absolute', top: '4px', left: '4px', 
                                                        background: '#e31837', color: '#fff', 
                                                        padding: '2px 6px', borderRadius: '4px', 
                                                        fontSize: '10px', fontWeight: '600' 
                                                    }}>
                                                        -{saleInfo.discountPercent}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div>
                                                <h6 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#222' }}>
                                                    {item.productName}
                                                </h6>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                    {item.size && (
                                                        <span style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                                                            Size: <strong>{item.size}</strong>
                                                        </span>
                                                    )}
                                                    {item.colorName && (
                                                        <span style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.colorCode || '#ccc', border: '1px solid #ddd' }}></span>
                                                            {item.colorName}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                                                        SL: <strong>{item.quantity}</strong>
                                                    </span>
                                                </div>
                                                {/* Price display */}
                                                {saleInfo.onSale ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#e31837' }}>{formatPrice(displayPrice)}</span>
                                                        <span style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through' }}>{formatPrice(item.price)}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>{formatPrice(item.price)}</span>
                                                )}
                                            </div>

                                            {/* Item Total */}
                                            <div style={{ textAlign: 'right', minWidth: '110px' }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: saleInfo.onSale ? '#e31837' : '#222' }}>
                                                    {formatPrice(itemTotal)}
                                                </div>
                                                {saleInfo.onSale && (
                                                    <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                                                        {formatPrice(originalItemTotal)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                                </svg>
                                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>Thông tin giao hàng</h5>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Người nhận</label>
                                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>
                                            {userInfo?.fullName || userInfo?.uName || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'block' }}>Số điện thoại</label>
                                        <div style={{ fontSize: '15px', fontWeight: '600', color: userInfo?.phoneNumber ? '#222' : '#e31837' }}>
                                            {userInfo?.phoneNumber || 'Chưa cập nhật'}
                                        </div>
                                        {!userInfo?.phoneNumber && (
                                            <span style={{ fontSize: '11px', color: '#e31837' }}>⚠️ Cần cập nhật số điện thoại</span>
                                        )}
                                    </div>
                                </div>
                                {errors.phone && (
                                    <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                                        {errors.phone}
                                    </div>
                                )}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'block' }}>
                                        Địa chỉ giao hàng <span style={{ color: '#e31837' }}>*</span>
                                    </label>
                                    <textarea
                                        value={shippingAddress || userInfo?.address || ''}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ giao hàng chi tiết..."
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            border: errors.shippingAddress ? '1px solid #e31837' : '1px solid #e5e5e5',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            minHeight: '80px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                                        onBlur={(e) => e.target.style.borderColor = errors.shippingAddress ? '#e31837' : '#e5e5e5'}
                                    />
                                    {errors.shippingAddress && (
                                        <span style={{ fontSize: '12px', color: '#e31837', marginTop: '4px', display: 'block' }}>{errors.shippingAddress}</span>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'block' }}>Ghi chú đơn hàng</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            minHeight: '60px',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>Phương thức thanh toán</h5>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <label 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            gap: '12px', 
                                            padding: '16px', 
                                            border: paymentMethod === 'COD' ? '2px solid #f59e0b' : '1px solid #e5e5e5',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            background: paymentMethod === 'COD' ? '#fffbeb' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            style={{ marginTop: '3px', accentColor: '#f59e0b' }}
                                        />
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                                </svg>
                                                <span style={{ fontWeight: '600', color: '#222' }}>Thanh toán khi nhận hàng (COD)</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Thanh toán bằng tiền mặt khi nhận hàng</span>
                                        </div>
                                    </label>
                                    <label 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            gap: '12px', 
                                            padding: '16px', 
                                            border: paymentMethod === 'CARD' ? '2px solid #f59e0b' : '1px solid #e5e5e5',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            background: paymentMethod === 'CARD' ? '#fffbeb' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CARD"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            style={{ marginTop: '3px', accentColor: '#f59e0b' }}
                                        />
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                                </svg>
                                                <span style={{ fontWeight: '600', color: '#222' }}>Thanh toán qua thẻ</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Thanh toán trực tuyến qua thẻ tín dụng/ghi nợ</span>
                                        </div>
                                    </label>
                                </div>
                                {errors.paymentMethod && (
                                    <span style={{ fontSize: '12px', color: '#e31837', marginTop: '8px', display: 'block' }}>{errors.paymentMethod}</span>
                                )}
                            </div>
                        </div>
                    </div>
    


                    {/* Right Column - Order Summary */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e5e5' }}>
                                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                    Tổng đơn hàng
                                </h5>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                {/* Price breakdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#666' }}>Tạm tính ({cartData.items.length} sản phẩm)</span>
                                        <span style={{ color: '#222', fontWeight: '500' }}>{formatPrice(totals.originalTotal)}</span>
                                    </div>
                                    {totals.discount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                            <span style={{ color: '#e31837', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                                                </svg>
                                                Giảm giá Sale
                                            </span>
                                            <span style={{ color: '#e31837', fontWeight: '600' }}>-{formatPrice(totals.discount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#666' }}>Phí vận chuyển</span>
                                        <span style={{ color: totals.shipping > 0 ? '#222' : '#22c55e', fontWeight: '500' }}>
                                            {totals.shipping > 0 ? formatPrice(totals.shipping) : 'Miễn phí'}
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div style={{ borderTop: '2px solid #222', paddingTop: '16px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>Tổng cộng</span>
                                        <span style={{ fontSize: '26px', fontWeight: '700', color: '#f59e0b' }}>{formatPrice(totals.total)}</span>
                                    </div>
                                    {totals.discount > 0 && (
                                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#e31837', background: '#fff0f0', padding: '4px 10px', borderRadius: '4px' }}>
                                                🎉 Bạn tiết kiệm được {formatPrice(totals.discount)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: processing ? '#ccc' : '#f59e0b',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => !processing && (e.target.style.background = '#e8930a')}
                                    onMouseLeave={e => !processing && (e.target.style.background = '#f59e0b')}
                                >
                                    {processing ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm" role="status"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            Xác nhận đặt hàng
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/cart')}
                                    disabled={processing}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#fff',
                                        color: '#222',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.target.style.background = '#f8f8f8'; e.target.style.borderColor = '#ccc'; }}
                                    onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e5e5e5'; }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                                    </svg>
                                    Quay lại giỏ hàng
                                </button>

                                {/* Trust badges */}
                                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                            </svg>
                                            Thanh toán an toàn & bảo mật
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                                            </svg>
                                            Giao hàng nhanh toàn quốc
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            Đổi trả miễn phí trong 30 ngày
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
