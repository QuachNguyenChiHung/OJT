// Updated: Force rebuild
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import ProductTable from "../Components/ProductTable"
import '../styles/theme.css'

// Top Header with Login/Register buttons
const TopHeader = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (e) {}
        };
        checkUser();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch { /* empty */ }
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/');
    };

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '12px 40px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Logo */}
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/img/logo.png" alt="Logo" style={{ height: '35px' }} />
                </div>

                {/* Auth Buttons */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <span style={{ color: '#666', fontSize: '14px' }}>
                                Xin chào, {user.fullName || user.username}
                            </span>
                            <button
                                onClick={() => navigate('/home')}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '25px',
                                    border: '2px solid #00B4DB',
                                    background: 'transparent',
                                    color: '#00B4DB',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Vào Shop
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: '#e31837',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                Đăng Xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '25px',
                                    border: '2px solid #00B4DB',
                                    background: 'transparent',
                                    color: '#00B4DB',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Đăng Nhập
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,180,219,0.3)'
                                }}
                            >
                                Đăng Ký
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

// Hero Banner Component
const HeroBanner = () => {
    const navigate = useNavigate();
    
    return (
        <section className="hero-banner" style={{
            background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
            padding: '80px 0',
            marginBottom: '0'
        }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 text-white">
                        <p style={{ 
                            fontSize: '1rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '3px',
                            marginBottom: '15px',
                            opacity: 0.9
                        }}>
                            Welcome to
                        </p>
                        <h1 style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: '800', 
                            marginBottom: '20px',
                            lineHeight: 1.1
                        }}>
                            FURIOUS FIVE<br/>
                            <span style={{ fontWeight: '300' }}>FASHION</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', marginBottom: '35px', opacity: 0.9, maxWidth: '450px' }}>
                            Khám phá bộ sưu tập thời trang mới nhất. Phong cách hiện đại, chất lượng cao cấp.
                        </p>
                        <div className="d-flex gap-3 flex-wrap">
                            <button 
                                className="btn btn-light btn-lg"
                                style={{ 
                                    fontWeight: '700', 
                                    padding: '18px 50px',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    fontSize: '1.1rem'
                                }}
                                onClick={() => navigate('/home')}
                            >
                                Khám Phá Ngay
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-6 d-none d-lg-block text-center">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '30px',
                            padding: '50px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <img 
                                src="/img/logo.png" 
                                alt="FFF" 
                                style={{ maxWidth: '180px', marginBottom: '25px' }}
                            />
                            <h3 className="text-white" style={{ fontWeight: '600' }}>New Collection 2025</h3>
                            <p className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                Giảm đến 50%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Features Section
const FeaturesSection = () => {
    const features = [
        { icon: '🚚', title: 'Giao Hàng Nhanh', desc: 'Miễn phí ship đơn từ 500K' },
        { icon: '💎', title: 'Chất Lượng Cao Cấp', desc: 'Cam kết hàng chính hãng' },
        { icon: '🔄', title: 'Đổi Trả Dễ Dàng', desc: 'Đổi trả trong 7 ngày' },
        { icon: '💬', title: 'Hỗ Trợ 24/7', desc: 'Tư vấn nhiệt tình' }
    ];

    return (
        <section className="features-section py-5" style={{ background: '#fff' }}>
            <div className="container">
                <div className="row">
                    {features.map((f, i) => (
                        <div key={i} className="col-6 col-md-3 text-center py-3">
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                background: 'linear-gradient(135deg, rgba(0,180,219,0.1) 0%, rgba(0,212,170,0.1) 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                fontSize: '1.8rem'
                            }}>
                                {f.icon}
                            </div>
                            <h6 style={{ fontWeight: '700', color: '#1a1a2e' }}>{f.title}</h6>
                            <small style={{ color: '#666' }}>{f.desc}</small>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Categories Section
const CategoriesSection = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories((res.data || []).slice(0, 6));
            } catch (e) { /* empty */ }
        };
        fetchCategories();
    }, []);

    if (categories.length === 0) return null;

    return (
        <section className="categories-section py-5" style={{ background: '#f8f9fa' }}>
            <div className="container">
                <h2 className="text-center mb-2" style={{ fontWeight: '700', color: '#1a1a2e' }}>
                    Danh Mục Sản Phẩm
                </h2>
                <p className="text-center mb-5" style={{ color: '#666' }}>
                    Khám phá các danh mục thời trang đa dạng
                </p>
                <div className="row g-4">
                    {categories.map((cat, i) => (
                        <div key={cat.cId || i} className="col-6 col-md-4 col-lg-2">
                            <div 
                                className="category-card text-center p-4"
                                style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate(`/search?category=${cat.cId}`)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,180,219,0.2)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                }}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                                    borderRadius: '50%',
                                    margin: '0 auto 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {(cat.cName || '?')[0].toUpperCase()}
                                </div>
                                <h6 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0, color: '#1a1a2e' }}>
                                    {cat.cName}
                                </h6>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Promo Banner
const PromoBanner = () => {
    const navigate = useNavigate();
    
    return (
        <section className="promo-banner py-5" style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
            color: '#fff' 
        }}>
            <div className="container text-center">
                <h2 style={{ fontWeight: '700', marginBottom: '15px' }}>
                    ✨ Ưu Đãi Thành Viên Mới
                </h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
                    Đăng ký ngay để nhận voucher giảm 10% cho đơn hàng đầu tiên và cập nhật xu hướng thời trang mới nhất!
                </p>
                <button 
                    className="btn btn-lg"
                    style={{ 
                        background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                        color: '#fff',
                        fontWeight: '600', 
                        padding: '14px 45px',
                        borderRadius: '50px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,180,219,0.4)'
                    }}
                    onClick={() => navigate('/register')}
                >
                    Đăng Ký Ngay
                </button>
            </div>
        </section>
    );
};

// Main Page Component
export const MainPage = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [newestItems, setNewestItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bestRes, newRes] = await Promise.all([
                    api.get('/products/best-selling').catch(() => ({ data: [] })),
                    api.get('/products/newest').catch(() => ({ data: [] }))
                ]);
                
                setBestSellers((bestRes.data || []).map(p => ({ ...p, onSale: true })));
                setNewestItems(newRes.data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <main style={{ paddingTop: '60px' }}>
            <TopHeader />
            <HeroBanner />
            <FeaturesSection />
            <CategoriesSection />
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: '#00B4DB' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {bestSellers.length > 0 && (
                        <section style={{ background: '#fff', paddingTop: '40px' }}>
                            <ProductTable 
                                title="🔥 Sản Phẩm Bán Chạy" 
                                data={bestSellers} 
                                pagination={false} 
                            />
                        </section>
                    )}
                    
                    <PromoBanner />
                    
                    {newestItems.length > 0 && (
                        <section style={{ background: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
                            <ProductTable 
                                title="✨ Sản Phẩm Mới Nhất" 
                                data={newestItems} 
                                pagination={false} 
                            />
                        </section>
                    )}
                </>
            )}
            
            {!loading && bestSellers.length === 0 && newestItems.length === 0 && (
                <section className="empty-state py-5" style={{ background: '#fff' }}>
                    <div className="container text-center">
                        <div style={{ fontSize: '5rem', marginBottom: '25px' }}></div>
                        <h3 style={{ color: '#1a1a2e', fontWeight: '600' }}>Sắp Ra Mắt</h3>
                        <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto' }}>
                            Bộ sưu tập thời trang mới sẽ sớm được cập nhật. Hãy đăng ký để nhận thông báo!
                        </p>
                    </div>
                </section>
            )}
        </main>
    );
};

export default MainPage;
