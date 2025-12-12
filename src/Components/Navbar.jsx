import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/theme.css';

const logoImg = '/img/logo.png';
const userImg = '/img/user.png';

const Navbar = () => {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoggedIn(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            if (res?.data) {
                setCurrentUser(res.data);
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
        } catch (error) {
            setLoggedIn(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (e) {}
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setLoggedIn(false);
        setCurrentUser({ email: '', fullName: '', role: '', phoneNumber: '', address: '' });
        navigate('/login');
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <header style={{ 
            background: '#fff', 
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="d-flex justify-content-between align-items-center py-3">
                    {/* Logo */}
                    <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src={logoImg} alt="FFF" style={{ height: '45px' }} />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="d-none d-md-block flex-grow-1 mx-4" style={{ maxWidth: '500px' }}>
                        <div className="input-group">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => { 
                                    if (e.key === 'Enter') {
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            navigate('/register');
                                        } else {
                                            navigate('/search?q=' + encodeURIComponent(searchQuery));
                                        }
                                    }
                                }}
                                style={{
                                    border: '2px solid #e0e0e0',
                                    borderRight: 'none',
                                    borderRadius: '50px 0 0 50px',
                                    padding: '10px 20px'
                                }}
                            />
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem('token');
                                    if (!token) {
                                        navigate('/register');
                                    } else {
                                        navigate('/search?q=' + encodeURIComponent(searchQuery));
                                    }
                                }}
                                className="btn"
                                type="button"
                                style={{
                                    background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                                    border: 'none',
                                    borderRadius: '0 50px 50px 0',
                                    padding: '10px 25px',
                                    color: '#fff'
                                }}
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="d-flex align-items-center gap-2">
                        {/* Mobile Search */}
                        <button 
                            className="btn d-md-none"
                            onClick={() => navigate('/search')}
                            style={{ background: 'transparent', border: 'none', fontSize: '1.3rem' }}
                        >
                            🔍
                        </button>

                        {loggedIn ? (
                            <>
                                {/* User Dropdown */}
                                <div className="dropdown">
                                    <button
                                        className="btn dropdown-toggle d-flex align-items-center gap-2"
                                        data-bs-toggle="dropdown"
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none',
                                            padding: '5px 10px'
                                        }}
                                    >
                                        <img
                                            src={currentUser.avatarUrl || userImg}
                                            alt="User"
                                            style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #00D4AA'
                                            }}
                                        />
                                        <span className="d-none d-lg-inline" style={{ color: '#333', fontWeight: '500' }}>
                                            {currentUser.fullName || 'User'}
                                        </span>
                                    </button>
                                    <div className="dropdown-menu dropdown-menu-end" style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                                        <button className="dropdown-item py-2" onClick={() => navigate('/profile')}>
                                            👤 Thông Tin Cá Nhân
                                        </button>
                                        <button className="dropdown-item py-2" onClick={() => navigate('/orders')}>
                                            📦 Đơn Hàng Của Tôi
                                        </button>
                                        {currentUser.role === 'ADMIN' && (
                                            <button className="dropdown-item py-2" onClick={() => navigate('/admin/products')}>
                                                ⚙️ Quản Trị
                                            </button>
                                        )}
                                        <hr className="dropdown-divider" />
                                        <button className="dropdown-item py-2" onClick={logout} style={{ color: '#e74c3c' }}>
                                            🚪 Đăng Xuất
                                        </button>
                                    </div>
                                </div>

                                {/* Cart */}
                                <button
                                    className="btn position-relative"
                                    onClick={() => navigate('/cart')}
                                    style={{ 
                                        background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '42px',
                                        height: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>🛒</span>
                                </button>
                            </>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button 
                                    onClick={() => navigate('/login')}
                                    style={{
                                        background: 'transparent',
                                        border: '2px solid #00D4AA',
                                        color: '#00B4DB',
                                        fontWeight: '600',
                                        borderRadius: '50px',
                                        padding: '8px 20px'
                                    }}
                                >
                                    Đăng Nhập
                                </Button>
                                <Button 
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: 'linear-gradient(135deg, #00B4DB 0%, #00D4AA 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        fontWeight: '600',
                                        borderRadius: '50px',
                                        padding: '8px 20px'
                                    }}
                                >
                                    Đăng Ký
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
