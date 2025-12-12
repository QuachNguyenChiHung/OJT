import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

// Format price in VND
const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function WishlistPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/auth/me');
                if (res?.data) {
                    setUser(res.data);
                    setIsLoggedIn(true);
                    // Fetch wishlist
                    fetchWishlist(res.data.id || res.data.userId || res.data.u_id);
                }
            } catch {
                setIsLoggedIn(false);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const fetchWishlist = async (userId) => {
        try {
            const res = await api.get(`/wishlist/user/${userId}`);
            setWishlist(Array.isArray(res.data) ? res.data : []);
        } catch {
            // Wishlist API may not exist yet, use localStorage fallback
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setWishlist(localWishlist);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const userId = user?.id || user?.userId || user?.u_id;
            await api.delete(`/wishlist/${userId}/${productId}`);
            setWishlist(prev => prev.filter(item => 
                (item.productId || item.product_id || item.id) !== productId
            ));
        } catch {
            // Fallback to localStorage
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const updated = localWishlist.filter(item => item.id !== productId);
            localStorage.setItem('wishlist', JSON.stringify(updated));
            setWishlist(updated);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border" role="status" style={{ color: '#222' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '15px', color: '#888' }}>Đang tải...</p>
                </div>
            </div>
        );
    }

    // Not logged in - show login prompt
    if (!isLoggedIn) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: '#f8f8f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '50px 40px',
                    maxWidth: '450px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    {/* Heart Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#fff0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#e31837" stroke="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </div>

                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: '600', 
                        color: '#222',
                        marginBottom: '12px'
                    }}>
                        Danh sách yêu thích
                    </h2>

                    <p style={{ 
                        fontSize: '15px', 
                        color: '#666',
                        lineHeight: '1.6',
                        marginBottom: '8px'
                    }}>
                        Đăng nhập để lưu các sản phẩm yêu thích của bạn và truy cập chúng từ bất kỳ thiết bị nào.
                    </p>

                    <p style={{ 
                        fontSize: '14px', 
                        color: '#888',
                        marginBottom: '30px'
                    }}>
                        Bạn sẽ không bao giờ bỏ lỡ những sản phẩm mình yêu thích!
                    </p>

                    {/* Login Button */}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: '#222',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '12px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#000'}
                        onMouseLeave={e => e.target.style.background = '#222'}
                    >
                        Đăng nhập
                    </button>

                    {/* Register Button */}
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: '#fff',
                            color: '#222',
                            border: '2px solid #222',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.color = '#fff'; }}
                        onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#222'; }}
                    >
                        Đăng ký tài khoản mới
                    </button>

                    {/* Back to Home */}
                    <p style={{ marginTop: '24px', marginBottom: 0 }}>
                        <Link 
                            to="/home" 
                            style={{ 
                                color: '#666', 
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            ← Quay lại trang chủ
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    // Logged in - show wishlist
    return (
        <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
            {/* Header */}
            <div style={{ 
                background: '#fff', 
                borderBottom: '1px solid #e5e5e5',
                padding: '20px 0'
            }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <Link to="/home" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
                                ← Quay lại trang chủ
                            </Link>
                            <h1 style={{ 
                                fontSize: '28px', 
                                fontWeight: '600', 
                                color: '#222',
                                marginTop: '8px',
                                marginBottom: 0
                            }}>
                                Danh sách yêu thích
                            </h1>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#e31837" stroke="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {wishlist.length} sản phẩm
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ maxWidth: '1200px', padding: '30px 15px' }}>
                {wishlist.length === 0 ? (
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '60px 40px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#f8f8f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '18px', color: '#222', marginBottom: '8px' }}>
                            Chưa có sản phẩm yêu thích
                        </h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Hãy khám phá và thêm sản phẩm vào danh sách yêu thích của bạn
                        </p>
                        <Link
                            to="/home"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                background: '#222',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {wishlist.map((item, index) => {
                            const productId = item.productId || item.product_id || item.id;
                            const productName = item.productName || item.product_name || item.name || 'Sản phẩm';
                            const productPrice = item.price || 0;
                            const productImage = item.thumbnail || item.thumbnail1 || item.image || '/img/no-image.svg';
                            const isAvailable = item.isAvailable !== false && item.isDeleted !== true;
                            
                            return (
                                <div 
                                    key={`${productId}-${index}`}
                                    style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        opacity: isAvailable ? 1 : 0.6,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Unavailable badge */}
                                    {!isAvailable && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            background: '#666',
                                            color: '#fff',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            zIndex: 10
                                        }}>
                                            Không khả dụng
                                        </div>
                                    )}
                                    
                                    {isAvailable ? (
                                        <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
                                            <div style={{ 
                                                aspectRatio: '1/1', 
                                                background: '#f5f5f5',
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover',
                                                        filter: isAvailable ? 'none' : 'grayscale(100%)'
                                                    }}
                                                    onError={(e) => { e.target.src = '/img/no-image.svg'; }}
                                                />
                                            </div>
                                        </Link>
                                    ) : (
                                        <div style={{ 
                                            aspectRatio: '1/1', 
                                            background: '#f5f5f5',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover',
                                                    filter: 'grayscale(100%)'
                                                }}
                                                onError={(e) => { e.target.src = '/img/no-image.svg'; }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div style={{ padding: '16px' }}>
                                        {isAvailable ? (
                                            <Link 
                                                to={`/product/${productId}`} 
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <h4 style={{ 
                                                    fontSize: '14px', 
                                                    color: '#222',
                                                    marginBottom: '8px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {productName}
                                                </h4>
                                            </Link>
                                        ) : (
                                            <h4 style={{ 
                                                fontSize: '14px', 
                                                color: '#999',
                                                marginBottom: '8px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {productName}
                                            </h4>
                                        )}
                                        
                                        <p style={{ 
                                            fontSize: '16px', 
                                            fontWeight: '600', 
                                            color: isAvailable ? '#e31837' : '#999',
                                            marginBottom: '12px',
                                            textDecoration: isAvailable ? 'none' : 'line-through'
                                        }}>
                                            {formatPrice(productPrice)}
                                        </p>
                                        
                                        {!isAvailable && (
                                            <p style={{ 
                                                fontSize: '12px', 
                                                color: '#e31837',
                                                marginBottom: '12px'
                                            }}>
                                                Sản phẩm này đã bị xóa hoặc ngừng kinh doanh
                                            </p>
                                        )}
                                        
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {isAvailable ? (
                                                <Link
                                                    to={`/product/${productId}`}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: '#222',
                                                        color: '#fff',
                                                        textDecoration: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </Link>
                                            ) : (
                                                <span
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        background: '#ccc',
                                                        color: '#666',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        textAlign: 'center',
                                                        cursor: 'not-allowed'
                                                    }}
                                                >
                                                    Không khả dụng
                                                </span>
                                            )}
                                            <button
                                                onClick={() => removeFromWishlist(productId)}
                                                style={{
                                                    padding: '10px 14px',
                                                    background: '#fff',
                                                    color: '#e31837',
                                                    border: '1px solid #e31837',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                                title="Xóa khỏi yêu thích"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
