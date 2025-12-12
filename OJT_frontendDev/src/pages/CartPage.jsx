import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../Components/Toast';

export default function CartPage() {
    const toast = useToast();
    const [cartData, setCartData] = useState(null);
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

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

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            setCartData({ items: [], totalItems: 0, totalPrice: 0 });
            setLoading(false);
            return;
        }
        setIsLoggedIn(true);
        try {
            setLoading(true);
            const [cartRes, saleRes] = await Promise.all([
                api.get('/cart/me'),
                api.get('/sale-products').catch(() => ({ data: [] }))
            ]);
            console.log('Cart API response:', cartRes.data);
            setCartData(cartRes.data.data);
            setSaleProducts(Array.isArray(saleRes.data) ? saleRes.data : []);
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                setIsLoggedIn(false);
                setCartData({ items: [], totalItems: 0, totalPrice: 0 });
            } else {
                toast.error('Không thể tải giỏ hàng');
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const updateQuantity = async (cartId, newQuantity, maxStock) => {
        if (newQuantity < 1) return;
        // Block if exceeds stock (frontend check)
        if (maxStock !== undefined && maxStock !== null && newQuantity > maxStock) {
            toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho`);
            return;
        }
        try {
            setUpdating(prev => ({ ...prev, [cartId]: true }));
            await api.put(`/cart/${cartId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            // Show error message from API if available
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể cập nhật số lượng';
            toast.error(errorMsg);
            // Refresh cart to get latest stock info
            await fetchCart();
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
            toast.error('Không thể xóa sản phẩm');
        } finally {
            setUpdating(prev => ({ ...prev, [cartId]: false }));
        }
    };

    const proceedToCheckout = () => {
        if (!isLoggedIn) {
            toast.warning('Vui lòng đăng nhập để thanh toán');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        if (!cartData?.items || cartData.items.length === 0) {
            toast.warning('Giỏ hàng trống');
            return;
        }
        // Check if any item is out of stock
        const outOfStock = cartData.items.find(item => item.stock !== undefined && item.stock <= 0);
        if (outOfStock) {
            toast.warning('Có sản phẩm đã hết hàng trong giỏ. Vui lòng xóa trước khi thanh toán.');
            return;
        }
        navigate('/checkout');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const calculateTotals = () => {
        if (!cartData?.items) return { subtotal: 0, discount: 0, total: 0 };
        let subtotal = 0, discountTotal = 0;
        cartData.items.forEach(item => {
            const originalTotal = item.price * item.quantity;
            const saleInfo = getSaleInfo(item.productId);
            if (saleInfo.onSale) {
                const salePrice = calculateSalePrice(item.price, saleInfo.discountPercent);
                const saleTotal = salePrice * item.quantity;
                subtotal += saleTotal;
                discountTotal += (originalTotal - saleTotal);
            } else {
                subtotal += originalTotal;
            }
        });
        return { subtotal, discount: discountTotal, total: subtotal + (cartData.estimatedShipping || 0) };
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border" style={{ color: '#f59e0b' }}></div>
                    <p style={{ marginTop: '15px', color: '#666' }}>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8' }}>
                <div style={{ textAlign: 'center', background: '#fff', padding: '50px', borderRadius: '16px', maxWidth: '450px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#222' }}>Giỏ hàng trống</h3>
                    <p style={{ color: '#666', marginBottom: '25px' }}>
                        {isLoggedIn ? 'Bạn chưa có sản phẩm nào trong giỏ hàng' : 'Đăng nhập để xem giỏ hàng của bạn'}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        {!isLoggedIn && (
                            <button onClick={() => navigate('/login', { state: { from: '/cart' } })} style={{ padding: '12px 24px', background: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                Đăng nhập
                            </button>
                        )}
                        <button onClick={() => navigate('/home')} style={{ padding: '12px 24px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '30px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
                    {/* Cart Items */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#222', margin: 0 }}>Giỏ hàng của bạn</h2>
                            <span style={{ color: '#666', fontSize: '14px' }}>{cartData.totalItems} sản phẩm</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cartData.items.map((item, index) => {
                                const saleInfo = getSaleInfo(item.productId);
                                const displayPrice = saleInfo.onSale ? calculateSalePrice(item.price, saleInfo.discountPercent) : item.price;
                                const itemTotal = displayPrice * item.quantity;
                                // Get first image from images array or use placeholder
                                let imageUrl = '';
                                if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                                    imageUrl = item.image;
                                } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                                    imageUrl = item.images[0];
                                }
                                const stock = typeof item.stock === 'number' ? item.stock : null;
                                const isOutOfStock = stock !== null && stock <= 0;
                                const isLowStock = stock !== null && stock > 0 && stock <= 5;
                                const isMaxQuantity = stock !== null && item.quantity >= stock;

                                return (
                                    <div key={item.cartId || `cart-item-${index}`} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: isOutOfStock ? 0.7 : 1 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '20px', alignItems: 'start' }}>
                                            {/* Product Image */}
                                            <div style={{ position: 'relative' }}>
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={item.productName}
                                                        style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '8px', background: '#f5f5f5', filter: isOutOfStock ? 'grayscale(100%)' : 'none' }}
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div style={{ display: imageUrl ? 'none' : 'flex', width: '100px', height: '130px', background: '#f0f0f0', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#999' }}>
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                                    </svg>
                                                    <span style={{ fontSize: '10px', marginTop: '4px' }}>No Image</span>
                                                </div>
                                                {saleInfo.onSale && (
                                                    <span style={{ position: 'absolute', top: '5px', left: '5px', background: '#e31837', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                                        -{saleInfo.discountPercent}%
                                                    </span>
                                                )}
                                                {isOutOfStock && (
                                                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                                                        HẾT HÀNG
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.productId}`)}>
                                                    {item.productName}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                                    {item.size && (
                                                        <span style={{ fontSize: '13px', color: '#666', background: '#f5f5f5', padding: '4px 10px', borderRadius: '4px' }}>
                                                            Size: <strong>{item.size}</strong>
                                                        </span>
                                                    )}
                                                    {item.colorName && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', padding: '4px 10px', borderRadius: '4px' }}>
                                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.colorCode || '#ccc', border: '1px solid #ddd' }}></div>
                                                            <span style={{ fontSize: '13px', color: '#666' }}>{item.colorName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Price */}
                                                <div style={{ marginBottom: '12px' }}>
                                                    {saleInfo.onSale ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#e31837' }}>{formatCurrency(displayPrice)}</span>
                                                            <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>{formatCurrency(item.price)}</span>
                                                            <span style={{ background: '#fff0f0', color: '#e31837', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                                Tiết kiệm {formatCurrency(item.price - displayPrice)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#222' }}>{formatCurrency(item.price)}</span>
                                                    )}
                                                </div>
                                                {/* Stock Warning */}
                                                {isOutOfStock && (
                                                    <div style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                                        </svg>
                                                        Sản phẩm đã hết hàng
                                                    </div>
                                                )}
                                                {isLowStock && !isOutOfStock && (
                                                    <div style={{ background: '#fffbeb', color: '#d97706', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                                        </svg>
                                                        Chỉ còn {stock} sản phẩm
                                                    </div>
                                                )}

                                                {/* Quantity Controls */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, item.quantity - 1, stock)}
                                                            disabled={updating[item.cartId] || item.quantity <= 1 || isOutOfStock}
                                                            style={{ width: '36px', height: '36px', border: 'none', background: '#f8f8f8', cursor: (item.quantity <= 1 || isOutOfStock) ? 'not-allowed' : 'pointer', fontSize: '18px', color: (item.quantity <= 1 || isOutOfStock) ? '#ccc' : '#666' }}
                                                        >−</button>
                                                        <span style={{ width: '45px', textAlign: 'center', fontWeight: '600', fontSize: '15px' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, item.quantity + 1, stock)}
                                                            disabled={updating[item.cartId] || isMaxQuantity || isOutOfStock}
                                                            style={{ 
                                                                width: '36px', height: '36px', border: 'none', 
                                                                background: (isMaxQuantity || isOutOfStock) ? '#fee2e2' : '#f8f8f8', 
                                                                cursor: (isMaxQuantity || isOutOfStock) ? 'not-allowed' : 'pointer', 
                                                                fontSize: '18px', 
                                                                color: (isMaxQuantity || isOutOfStock) ? '#dc2626' : '#666' 
                                                            }}
                                                            title={isMaxQuantity ? `Chỉ còn ${stock} sản phẩm trong kho` : ''}
                                                        >+</button>
                                                    </div>
                                                    {isMaxQuantity && !isOutOfStock && (
                                                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '500' }}>Đã đạt tối đa ({stock})</span>
                                                    )}
                                                    <button
                                                        onClick={() => removeItem(item.cartId)}
                                                        disabled={updating[item.cartId]}
                                                        style={{ background: 'none', border: 'none', color: '#e31837', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                        </svg>
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Item Total */}
                                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Thành tiền</div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: saleInfo.onSale ? '#e31837' : '#222' }}>
                                                    {formatCurrency(itemTotal)}
                                                </div>
                                                {saleInfo.onSale && (
                                                    <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e5e5' }}>
                                Tóm tắt đơn hàng
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>Tạm tính ({cartData.totalItems} sản phẩm)</span>
                                    <span style={{ color: '#222', fontWeight: '500' }}>{formatCurrency(cartData.totalPrice)}</span>
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
                                        <span style={{ color: '#e31837', fontWeight: '600' }}>-{formatCurrency(totals.discount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>Phí vận chuyển</span>
                                    <span style={{ color: '#222', fontWeight: '500' }}>
                                        {cartData.estimatedShipping > 0 ? formatCurrency(cartData.estimatedShipping) : 'Miễn phí'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ borderTop: '2px solid #222', paddingTop: '15px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>Tổng cộng</span>
                                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{formatCurrency(totals.total)}</span>
                                </div>
                                {totals.discount > 0 && (
                                    <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                        <span style={{ fontSize: '12px', color: '#e31837', background: '#fff0f0', padding: '4px 10px', borderRadius: '4px' }}>
                                            🎉 Bạn tiết kiệm được {formatCurrency(totals.discount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={proceedToCheckout}
                                style={{ width: '100%', padding: '16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.target.style.background = '#e8930a'}
                                onMouseLeave={e => e.target.style.background = '#f59e0b'}
                            >
                                Tiến hành thanh toán
                            </button>
                            <button
                                onClick={() => navigate('/home')}
                                style={{ width: '100%', padding: '14px', background: '#fff', color: '#222', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = '#f8f8f8'; e.target.style.borderColor = '#ccc'; }}
                                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e5e5e5'; }}
                            >
                                Tiếp tục mua sắm
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
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                                            <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
                                            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                                        </svg>
                                        Giao hàng nhanh toàn quốc
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9 22 9 12 15 12 15 22"/>
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
    );
}
