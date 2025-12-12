import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductTable from "../Components/ProductTable";
import NotificationBell from "../Components/NotificationBell";
import '../styles/theme.css';

// Product Image with Hover Effect - shows thumbnail2 on hover
const ProductImageHover = ({ thumbnail1, thumbnail2, alt, badge, badgeColor = '#FFD700' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const img1 = thumbnail1 || '/img/no-image.svg';
    const img2 = thumbnail2 || img1;
    
    return (
        <div 
            style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: '#f5f5f5' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image 1 - Default */}
            <img 
                src={img1}
                alt={alt}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: isHovered ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = '/img/no-image.svg'; }}
            />
            {/* Image 2 - On Hover */}
            <img 
                src={img2}
                alt={alt}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = '/img/no-image.svg'; }}
            />
            {badge && (
                <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: badgeColor,
                    color: '#000',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    zIndex: 1
                }}>
                    {badge}
                </span>
            )}
        </div>
    );
};



// Navbar - Main Navigation Header
const Navbar = ({ brands = [], user = null, activeGender = 'all', onGenderChange, showSaleOnly = false, onSaleToggle, saleDiscounts = [], selectedSaleDiscount = null, onSaleDiscountChange, selectedBrandId = null, onBrandChange, searchQuery = '', onSearchChange }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userMenuTimeout, setUserMenuTimeout] = useState(null);
    const [showSaleMenu, setShowSaleMenu] = useState(false);
    const [saleMenuTimeout, setSaleMenuTimeout] = useState(null);
    const [showBrandMenu, setShowBrandMenu] = useState(false);
    const [brandMenuTimeout, setBrandMenuTimeout] = useState(null);
    
    const isAdmin = user?.role === 'ADMIN';
    
    // User menu handlers with 1s delay
    const handleUserMenuEnter = () => {
        if (userMenuTimeout) {
            clearTimeout(userMenuTimeout);
            setUserMenuTimeout(null);
        }
        setShowUserMenu(true);
    };
    
    const handleUserMenuLeave = () => {
        const timeout = setTimeout(() => {
            setShowUserMenu(false);
        }, 1000); // 1s delay before hiding
        setUserMenuTimeout(timeout);
    };
    
    // Click toggle for mobile
    const handleUserMenuClick = () => {
        setShowUserMenu(prev => !prev);
    };
    
    // Logout handler
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch {
            // Ignore logout errors
        }
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    // Gender tabs - All is default
    const genderTabs = [
        { id: 'all', label: 'All' },
        { id: 'women', label: 'Women' },
        { id: 'men', label: 'Men' },
        { id: 'unisex', label: 'Unisex' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled inline on home page, no navigation needed
    };

    return (
        <header style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            background: '#fff',
            boxShadow: '0 1px 0 #e5e5e5'
        }}>
            {/* Top Bar - Gender Tabs + Logo + Icons */}
            <div style={{ 
                borderBottom: '1px solid #e5e5e5',
                padding: '0 40px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    height: '60px'
                }}>
                    {/* Gender Tabs */}
                    <div style={{ display: 'flex', gap: '25px' }}>
                        {genderTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onGenderChange && onGenderChange(tab.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0',
                                    fontSize: '13px',
                                    fontWeight: activeGender === tab.id ? '600' : '400',
                                    color: '#222',
                                    cursor: 'pointer',
                                    borderBottom: activeGender === tab.id ? '2px solid #222' : '2px solid transparent',
                                    paddingBottom: '3px'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Logo */}
                    <div 
                        style={{ 
                            position: 'absolute', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/home')}
                    >
                        <img 
                            src="/img/logo.png" 
                            alt="Logo" 
                            style={{ height: '40px' }}
                        />
                    </div>

                    {/* Right Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Admin Panel - Only for ADMIN/EMPLOYEE */}
                        {isAdmin && (
                            <div 
                                style={{ cursor: 'pointer' }} 
                                onClick={() => navigate('/admin')}
                                title="Admin Panel"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
                                </svg>
                            </div>
                        )}
                        
                        {/* Notification */}
                        <NotificationBell />
                        
                        {/* Account with Dropdown */}
                        <div 
                            style={{ position: 'relative' }}
                            onMouseEnter={handleUserMenuEnter}
                            onMouseLeave={handleUserMenuLeave}
                        >
                            <div 
                                style={{ cursor: 'pointer' }}
                                onClick={handleUserMenuClick}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            
                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '10px',
                                    background: '#fff',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    minWidth: '180px',
                                    zIndex: 1001,
                                    overflow: 'hidden'
                                }}>
                                    {user ? (
                                        <>
                                            {/* Logged in: Profile, Change Password, Admin Panel (if admin), Sign Out */}
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#222',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                                Profile
                                            </div>
                                            {/* My Orders */}
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#222',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { navigate('/orders'); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                                </svg>
                                                Đơn Hàng Của Tôi
                                            </div>
                                            {/* Change Password */}
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#222',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { navigate('/change-password'); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                </svg>
                                                Đổi Mật Khẩu
                                            </div>
                                            {/* Admin Panel - Only for ADMIN/EMPLOYEE */}
                                            {isAdmin && (
                                                <div 
                                                    style={{
                                                        padding: '14px 18px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: '#7c3aed',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                                                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
                                                    </svg>
                                                    Admin Panel
                                                </div>
                                            )}
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#e31837',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { handleLogout(); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e31837" strokeWidth="1.5">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16 17 21 12 16 7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                Sign Out
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Not logged in: Sign In, Register */}
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#222',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { navigate('/login'); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                                    <polyline points="10 17 15 12 10 7"/>
                                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                                </svg>
                                                Sign In
                                            </div>
                                            <div 
                                                style={{
                                                    padding: '14px 18px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#00B4DB',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => { navigate('/register'); setShowUserMenu(false); }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0faff'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B4DB" strokeWidth="1.5">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="8.5" cy="7" r="4"/>
                                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                                </svg>
                                                Register
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Wishlist */}
                        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </div>
                        
                        {/* Cart */}
                        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/cart')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div style={{ 
                borderBottom: '1px solid #e5e5e5',
                padding: '0 40px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    height: '45px'
                }}>
                    {/* Nav Items */}
                    <div style={{ display: 'flex', gap: '25px' }}>
                        {/* Sale Button with Dropdown */}
                        <div 
                            style={{ position: 'relative' }}
                            onMouseEnter={() => {
                                if (saleMenuTimeout) clearTimeout(saleMenuTimeout);
                                setShowSaleMenu(true);
                            }}
                            onMouseLeave={() => {
                                const timeout = setTimeout(() => setShowSaleMenu(false), 500);
                                setSaleMenuTimeout(timeout);
                            }}
                        >
                            <button
                                onClick={() => setShowSaleMenu(!showSaleMenu)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0',
                                    fontSize: '13px',
                                    fontWeight: showSaleOnly ? '600' : '400',
                                    color: '#e31837',
                                    cursor: 'pointer',
                                    borderBottom: showSaleOnly ? '2px solid #e31837' : '2px solid transparent',
                                    paddingBottom: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Sale
                                {showSaleOnly && selectedSaleDiscount && <span style={{ fontSize: '11px' }}>(-{selectedSaleDiscount}%)</span>}
                                {showSaleOnly && !selectedSaleDiscount && <span style={{ fontSize: '11px' }}>(All)</span>}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e31837" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6"/>
                                </svg>
                            </button>
                            
                            {/* Sale Dropdown */}
                            {showSaleMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '8px',
                                    background: '#fff',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    minWidth: '160px',
                                    zIndex: 1001,
                                    overflow: 'hidden'
                                }}>
                                    {/* All Sale */}
                                    <div
                                        onClick={() => {
                                            onSaleDiscountChange && onSaleDiscountChange(null);
                                            onSaleToggle && onSaleToggle(true);
                                            setShowSaleMenu(false);
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            fontSize: '13px',
                                            color: selectedSaleDiscount === null && showSaleOnly ? '#e31837' : '#222',
                                            fontWeight: selectedSaleDiscount === null && showSaleOnly ? '600' : '400',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            background: selectedSaleDiscount === null && showSaleOnly ? '#fff5f5' : '#fff'
                                        }}
                                        onMouseEnter={e => e.target.style.background = '#fff5f5'}
                                        onMouseLeave={e => e.target.style.background = selectedSaleDiscount === null && showSaleOnly ? '#fff5f5' : '#fff'}
                                    >
                                        🔥 Tất cả Sale
                                    </div>
                                    {/* Discount options */}
                                    {saleDiscounts.length > 0 ? (
                                        saleDiscounts.map(discount => (
                                            <div
                                                key={discount}
                                                onClick={() => {
                                                    onSaleDiscountChange && onSaleDiscountChange(discount);
                                                    onSaleToggle && onSaleToggle(true);
                                                    setShowSaleMenu(false);
                                                }}
                                                style={{
                                                    padding: '12px 16px',
                                                    fontSize: '13px',
                                                    color: selectedSaleDiscount === discount ? '#e31837' : '#222',
                                                    fontWeight: selectedSaleDiscount === discount ? '600' : '400',
                                                    cursor: 'pointer',
                                                    background: selectedSaleDiscount === discount ? '#fff5f5' : '#fff'
                                                }}
                                                onMouseEnter={e => e.target.style.background = '#fff5f5'}
                                                onMouseLeave={e => e.target.style.background = selectedSaleDiscount === discount ? '#fff5f5' : '#fff'}
                                            >
                                                🏷️ Giảm {discount}%
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '12px 16px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                            Chưa có mức giảm giá
                                        </div>
                                    )}
                                    {/* Turn off sale filter */}
                                    {showSaleOnly && (
                                        <div
                                            onClick={() => {
                                                onSaleToggle && onSaleToggle(false);
                                                onSaleDiscountChange && onSaleDiscountChange(null);
                                                setShowSaleMenu(false);
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                fontSize: '13px',
                                                color: '#666',
                                                cursor: 'pointer',
                                                borderTop: '1px solid #f0f0f0',
                                                background: '#f9f9f9'
                                            }}
                                            onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                                            onMouseLeave={e => e.target.style.background = '#f9f9f9'}
                                        >
                                            ✕ Tắt lọc Sale
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Brand Button with Dropdown */}
                        <div 
                            style={{ position: 'relative' }}
                            onMouseEnter={() => {
                                if (brandMenuTimeout) clearTimeout(brandMenuTimeout);
                                setShowBrandMenu(true);
                            }}
                            onMouseLeave={() => {
                                const timeout = setTimeout(() => setShowBrandMenu(false), 500);
                                setBrandMenuTimeout(timeout);
                            }}
                        >
                            <button
                                onClick={() => setShowBrandMenu(!showBrandMenu)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0',
                                    fontSize: '13px',
                                    fontWeight: selectedBrandId ? '600' : '400',
                                    color: '#222',
                                    cursor: 'pointer',
                                    borderBottom: selectedBrandId ? '2px solid #222' : '2px solid transparent',
                                    paddingBottom: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Brands
                                {selectedBrandId && (
                                    <span style={{ fontSize: '11px', color: '#666' }}>
                                        ({brands.find(b => (b.brandId || b.id) === selectedBrandId)?.brandName || brands.find(b => (b.brandId || b.id) === selectedBrandId)?.bName || '...'})
                                    </span>
                                )}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6"/>
                                </svg>
                            </button>
                            
                            {/* Brand Dropdown */}
                            {showBrandMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '8px',
                                    background: '#fff',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    minWidth: '180px',
                                    maxHeight: '350px',
                                    overflowY: 'auto',
                                    zIndex: 1001
                                }}>
                                    {/* All Brands */}
                                    <div
                                        onClick={() => {
                                            onBrandChange && onBrandChange(null);
                                            setShowBrandMenu(false);
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            fontSize: '13px',
                                            color: !selectedBrandId ? '#222' : '#666',
                                            fontWeight: !selectedBrandId ? '600' : '400',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            background: !selectedBrandId ? '#f5f5f5' : '#fff'
                                        }}
                                        onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                                        onMouseLeave={e => e.target.style.background = !selectedBrandId ? '#f5f5f5' : '#fff'}
                                    >
                                        🏷️ Tất cả thương hiệu
                                    </div>
                                    {/* Brand options */}
                                    {brands.length > 0 ? (
                                        brands.map(brand => {
                                            const brandId = brand.brandId || brand.id;
                                            const brandName = brand.brandName || brand.bName || brand.name;
                                            const isSelected = selectedBrandId === brandId;
                                            return (
                                                <div
                                                    key={brandId}
                                                    onClick={() => {
                                                        onBrandChange && onBrandChange(brandId);
                                                        setShowBrandMenu(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 16px',
                                                        fontSize: '13px',
                                                        color: isSelected ? '#222' : '#444',
                                                        fontWeight: isSelected ? '600' : '400',
                                                        cursor: 'pointer',
                                                        background: isSelected ? '#f5f5f5' : '#fff'
                                                    }}
                                                    onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                                                    onMouseLeave={e => e.target.style.background = isSelected ? '#f5f5f5' : '#fff'}
                                                >
                                                    {brandName}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '12px 16px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                            Chưa có thương hiệu
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            background: '#f5f5f5',
                            borderRadius: '0',
                            padding: '8px 15px',
                            width: '280px'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={searchQuery}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    marginLeft: '10px',
                                    fontSize: '13px',
                                    color: '#222',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </form>
                </div>
            </div>

        </header>
    );
};


// Hero Banner - Elegant Fashion Style
const HeroBanner = () => {
    return (
        <section style={{
            background: '#f8f8f8',
            padding: '60px 0',
            borderBottom: '1px solid #eee'
        }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <p style={{ 
                            color: '#888', 
                            fontSize: '11px', 
                            letterSpacing: '2px',
                            marginBottom: '15px'
                        }}>
                            NEW COLLECTION 2025
                        </p>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '300', 
                            color: '#1a1a1a',
                            lineHeight: 1.2,
                            marginBottom: '20px'
                        }}>
                            Elevate Your<br/>
                            <span style={{ fontWeight: '600' }}>Style</span>
                        </h1>
                        <p style={{ 
                            color: '#666', 
                            fontSize: '14px', 
                            lineHeight: 1.8,
                            marginBottom: '30px',
                            maxWidth: '400px'
                        }}>
                            Discover our curated collection of premium fashion pieces designed for the modern individual.
                        </p>
                        <button 
                            style={{
                                background: '#222',
                                color: '#fff',
                                border: 'none',
                                padding: '14px 35px',
                                fontSize: '12px',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => {
                                // Scroll to products section
                                const productsSection = document.querySelector('section[style*="background: rgb(245, 245, 245)"]');
                                if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#444'}
                            onMouseLeave={e => e.currentTarget.style.background = '#222'}
                        >
                            EXPLORE COLLECTION
                        </button>
                    </div>
                    <div className="col-lg-6 text-center d-none d-lg-block">
                        <img 
                            src="/img/logo.png" 
                            alt="Fashion" 
                            style={{ 
                                maxWidth: '200px',
                                opacity: 0.9
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Service Features - Minimal Style
const ServiceFeatures = () => {
    const features = [
        { title: 'Free Shipping', desc: 'On orders over 500K' },
        { title: 'Easy Returns', desc: '7-day return policy' },
        { title: 'Secure Payment', desc: '100% secure checkout' },
        { title: 'Premium Quality', desc: 'Authentic products' },
    ];

    return (
        <section style={{ background: '#fff', padding: '35px 0', borderBottom: '1px solid #eee' }}>
            <div className="container">
                <div className="row">
                    {features.map((f, i) => (
                        <div key={i} className="col-6 col-md-3 text-center py-2">
                            <h6 style={{ 
                                fontSize: '12px', 
                                fontWeight: '600', 
                                letterSpacing: '0.5px',
                                color: '#222',
                                marginBottom: '5px'
                            }}>
                                {f.title.toUpperCase()}
                            </h6>
                            <p style={{ 
                                fontSize: '12px', 
                                color: '#888',
                                margin: 0
                            }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Product Section - Clean Design
const ProductSection = ({ title, subtitle, products, link }) => {
    const navigate = useNavigate();
    
    if (!products || products.length === 0) return null;

    return (
        <section style={{ background: '#fff', padding: '50px 0' }}>
            <div className="container">
                <div className="text-center mb-4">
                    <p style={{ 
                        color: '#888', 
                        fontSize: '11px', 
                        letterSpacing: '2px',
                        marginBottom: '8px'
                    }}>
                        {subtitle}
                    </p>
                    <h2 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '400', 
                        color: '#222',
                        letterSpacing: '1px'
                    }}>
                        {title.toUpperCase()}
                    </h2>
                </div>
                
                <ProductTable data={products} pagination={false} compact={true} />
                
                {link && (
                    <div className="text-center mt-4">
                        <button 
                            style={{
                                background: 'transparent',
                                color: '#222',
                                border: '1px solid #222',
                                padding: '12px 30px',
                                fontSize: '12px',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => navigate(link)}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#222';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#222';
                            }}
                        >
                            VIEW ALL
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

// Promo Banner - Full width
const PromoBanner = () => {
    const bannerUrl = 'https://ojt-ecommerce-images-706302944148.s3.ap-southeast-1.amazonaws.com/banners/page1.png';

    return (
        <section style={{ background: '#000' }}>
            <img 
                src={bannerUrl}
                alt="Promo Banner"
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                }}
                onError={(e) => {
                    e.target.src = '/img/logo.png';
                    e.target.style.height = '200px';
                    e.target.style.objectFit = 'contain';
                    e.target.style.background = '#f5f5f5';
                }}
            />
        </section>
    );
};



// Main HomePage Component
const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [homeSections, setHomeSections] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [saleProducts, setSaleProducts] = useState([]);
    const [discountLevels, setDiscountLevels] = useState([]);
    const [wishlist, setWishlist] = useState([]); // Wishlist product IDs
    const [loading, setLoading] = useState(true);
    const [activeGender, setActiveGender] = useState('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // For deeper category navigation
    const [showSaleOnly, setShowSaleOnly] = useState(false); // Filter to show only sale products
    const [selectedSaleDiscount, setSelectedSaleDiscount] = useState(null); // Filter by specific discount %
    const [selectedBrandId, setSelectedBrandId] = useState(null); // Filter by brand
    const [searchQuery, setSearchQuery] = useState(''); // Search query for inline search

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Allow public access - only fetch user if token exists
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userRes = await api.get('/auth/me');
                        setUser(userRes.data);
                    } catch {
                        // Token invalid, clear it but don't redirect
                        localStorage.removeItem('token');
                    }
                }
                // No redirect for guests - allow public access to /home

                // Fetch categories (flat for hierarchy), brands, products, home sections, and sale products from API
                const [catRes, brandRes, sectionsRes, productsRes, saleRes, levelsRes] = await Promise.all([
                    api.get('/categories?flat=true').catch(() => ({ data: [] })),
                    api.get('/brands').catch(() => ({ data: [] })),
                    api.get('/home-sections').catch(() => ({ data: [] })),
                    api.get('/products').catch(() => ({ data: [] })),
                    api.get('/sale-products').catch(() => ({ data: [] })),
                    api.get('/sale-products/discount-levels').catch(() => ({ data: [] }))
                ]);
                
                const saleData = Array.isArray(saleRes.data) ? saleRes.data : [];
                setSaleProducts(saleData);
                setDiscountLevels(Array.isArray(levelsRes.data) ? levelsRes.data : []);
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setBrands(brandRes.data || []);
                setHomeSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
                
                // Normalize products with categoryId and brandId
                const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
                const normalizedProducts = rawProducts.map(p => ({
                    id: p.id ?? p.p_id ?? p.pId,
                    name: p.name ?? p.p_name ?? p.PName ?? p.pName,
                    price: p.price,
                    thumbnail1: p.thumbnail_1 || p.thumbnail1,
                    thumbnail2: p.thumbnail_2 || p.thumbnail2,
                    brandId: p.brandId || p.brand_id,
                    brandName: p.brandName || p.brand_name,
                    categoryName: p.categoryName || p.category_name,
                    categoryId: p.categoryId || p.c_id || p.cId,
                    gender: p.gender,
                    isActive: p.isActive ?? p.is_active ?? true
                })).filter(p => p.isActive);
                setAllProducts(normalizedProducts);
                
                // Fetch wishlist if user is logged in
                if (token) {
                    try {
                        const userRes = await api.get('/auth/me');
                        const userId = userRes.data?.id || userRes.data?.userId || userRes.data?.u_id;
                        if (userId) {
                            const wishlistRes = await api.get(`/wishlist/user/${userId}`).catch(() => ({ data: [] }));
                            const wishlistIds = (wishlistRes.data || []).map(w => 
                                String(w.productId || w.product_id || w.id)
                            );
                            setWishlist(wishlistIds);
                        }
                    } catch {
                        // Use localStorage fallback
                        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                        setWishlist(localWishlist.map(w => String(w.id || w.productId)));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Helper: Get all descendant category IDs from a parent (handles UUID strings)
    const getDescendantCategoryIds = (parentId) => {
        if (!parentId) return [];
        const normalizedParentId = String(parentId);
        const ids = [normalizedParentId];
        
        // Find children - compare as strings
        const children = categories.filter(c => {
            const catParentId = String(c.parentId || '');
            return catParentId === normalizedParentId;
        });
        
        children.forEach(child => {
            const childId = String(child.id || child.cId || '');
            if (childId) {
                ids.push(...getDescendantCategoryIds(childId));
            }
        });
        return ids;
    };

    // Find gender category ID (Women, Men, Unisex) - supports both English and Vietnamese names
    const getGenderCategoryId = (genderName) => {
        const genderMappings = {
            'women': ['women', 'woman', 'nữ', 'nu', 'female'],
            'men': ['men', 'man', 'nam', 'male'],
            'unisex': ['unisex']
        };
        const searchTerms = genderMappings[genderName.toLowerCase()] || [genderName.toLowerCase()];
        
        const genderCat = categories.find(c => {
            const catName = (c.name || c.cName || '').toLowerCase();
            return searchTerms.some(term => catName === term || catName.includes(term));
        });
        return genderCat?.id || genderCat?.cId || null;
    };

    // Filter products by selected category (any level in tree)
    const filterProductsByCategory = (products, categoryId) => {
        if (!categoryId) return products;
        const allowedCategoryIds = getDescendantCategoryIds(categoryId);
        return products.filter(p => {
            const productCatId = String(p.categoryId || '');
            return allowedCategoryIds.includes(productCatId);
        });
    };

    // Filter section products by selected category
    const filterSectionByCategory = (section, categoryId) => {
        if (!categoryId) return section;
        const allowedCategoryIds = getDescendantCategoryIds(categoryId);
        const filteredProducts = (section.products || []).filter(p => {
            const productCatId = String(p.categoryId || '');
            return allowedCategoryIds.includes(productCatId);
        });
        return { ...section, products: filteredProducts };
    };

    // Get category by ID (handles UUID strings)
    const getCategoryById = (catId) => {
        if (!catId) return null;
        const strCatId = String(catId);
        return categories.find(c => String(c.id || c.cId) === strCatId);
    };

    // Get children categories of a parent
    const getChildCategories = (parentId) => {
        if (!parentId) return [];
        const strParentId = String(parentId);
        return categories.filter(c => String(c.parentId || '') === strParentId);
    };

    // Build breadcrumb path from root to current category (excludes level 0 "All" category)
    const getBreadcrumbPath = (categoryId) => {
        const path = [];
        let current = getCategoryById(categoryId);
        while (current) {
            // Skip level 0 (All) category from breadcrumb
            if (current.level !== 0) {
                path.unshift(current);
            }
            current = current.parentId ? getCategoryById(current.parentId) : null;
        }
        return path;
    };

    // Handle gender tab change - reset category selection
    const handleGenderChange = (gender) => {
        setActiveGender(gender);
        if (gender === 'all') {
            setSelectedCategoryId(null);
        } else {
            const genderCatId = getGenderCategoryId(gender);
            // Only set if valid category ID found
            setSelectedCategoryId(genderCatId || null);
        }
    };

    // Handle category click - navigate deeper into tree
    const handleCategoryClick = (categoryId) => {
        if (!categoryId) return;
        
        setSelectedCategoryId(String(categoryId));
        // Update activeGender based on root category (level 1: Women/Men/Unisex)
        const path = getBreadcrumbPath(categoryId);
        if (path.length > 0) {
            // First item in path is level 1 (Women/Men/Unisex) since we exclude level 0
            const rootCat = path[0];
            const rootName = (rootCat.name || rootCat.cName || '').toLowerCase();
            if (['women', 'men', 'unisex'].includes(rootName)) {
                setActiveGender(rootName);
            }
        }
    };

    // Get current filter state
    const currentCategoryId = selectedCategoryId;
    const currentCategory = currentCategoryId ? getCategoryById(currentCategoryId) : null;
    const childCategories = currentCategoryId ? getChildCategories(currentCategoryId) : [];
    const breadcrumbPath = currentCategoryId ? getBreadcrumbPath(currentCategoryId) : [];

    // Toggle wishlist for a product
    const toggleWishlist = async (e, productId, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            // Not logged in - redirect to login
            if (confirm('Bạn cần đăng nhập để lưu sản phẩm yêu thích. Đăng nhập ngay?')) {
                navigate('/login');
            }
            return;
        }
        
        const productIdStr = String(productId);
        const isInWishlist = wishlist.includes(productIdStr);
        const userId = user?.id || user?.userId || user?.u_id;
        
        try {
            if (isInWishlist) {
                // Remove from wishlist
                await api.delete(`/wishlist/${userId}/${productId}`).catch(() => {});
                setWishlist(prev => prev.filter(id => id !== productIdStr));
            } else {
                // Add to wishlist
                await api.post('/wishlist', {
                    userId,
                    productId,
                    productName: product?.name,
                    price: product?.price,
                    thumbnail: product?.thumbnail1
                }).catch(() => {});
                setWishlist(prev => [...prev, productIdStr]);
            }
        } catch {
            // Fallback to localStorage
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (isInWishlist) {
                const updated = localWishlist.filter(w => String(w.id) !== productIdStr);
                localStorage.setItem('wishlist', JSON.stringify(updated));
                setWishlist(prev => prev.filter(id => id !== productIdStr));
            } else {
                localWishlist.push({ id: productId, name: product?.name, price: product?.price, thumbnail: product?.thumbnail1 });
                localStorage.setItem('wishlist', JSON.stringify(localWishlist));
                setWishlist(prev => [...prev, productIdStr]);
            }
        }
    };

    // Get discount percentages from DiscountLevel table (admin-managed)
    const saleDiscounts = discountLevels.map(l => l.discountPercent).filter(Boolean).sort((a, b) => a - b);

    // Get sale product IDs for filtering (optionally by specific discount)
    const getSaleProductIds = (discountFilter = null) => {
        let filtered = saleProducts;
        if (discountFilter !== null) {
            filtered = saleProducts.filter(sp => (sp.discountPercent || sp.discount_percent) === discountFilter);
        }
        return filtered.map(sp => String(sp.productId || sp.product_id || sp.p_id));
    };
    const saleProductIds = getSaleProductIds(selectedSaleDiscount);

    // Helper: Get sale info for a product
    const getSaleInfo = (productId) => {
        const saleProduct = saleProducts.find(sp => 
            String(sp.productId || sp.product_id || sp.p_id) === String(productId)
        );
        if (saleProduct) {
            return {
                onSale: true,
                discountPercent: saleProduct.discountPercent || saleProduct.discount_percent || 0
            };
        }
        return { onSale: false, discountPercent: 0 };
    };

    // Helper: Enrich products with sale info
    const enrichWithSaleInfo = (products) => {
        return products.map(p => {
            const saleInfo = getSaleInfo(p.id);
            const salePrice = saleInfo.onSale && p.price 
                ? Math.round(p.price * (1 - saleInfo.discountPercent / 100))
                : null;
            return {
                ...p,
                onSale: saleInfo.onSale,
                discountPercent: saleInfo.discountPercent,
                salePrice
            };
        });
    };

    // Helper: Filter products by search query
    const filterBySearchQuery = (products, query) => {
        if (!query || !query.trim()) return products;
        const searchLower = query.toLowerCase().trim();
        return products.filter(p => {
            const name = (p.name || p.pName || p.p_name || '').toLowerCase();
            const brandName = (p.brandName || p.brand_name || '').toLowerCase();
            const categoryName = (p.categoryName || p.category_name || '').toLowerCase();
            return name.includes(searchLower) || brandName.includes(searchLower) || categoryName.includes(searchLower);
        });
    };

    // Filter sections based on selected category, sale status, brand, and search query
    const filteredSections = (() => {
        // If searching, hide sections and show search results instead
        if (searchQuery && searchQuery.trim()) {
            return [];
        }
        
        let sections = homeSections;
        
        // First filter by category if needed
        if (activeGender !== 'all' || currentCategoryId) {
            const categoryToFilter = currentCategoryId;
            if (!categoryToFilter) {
                return [];
            }
            sections = sections
                .map(s => filterSectionByCategory(s, categoryToFilter))
                .filter(s => s.products?.length > 0);
        }
        
        // Then filter by sale if showSaleOnly is true
        if (showSaleOnly) {
            sections = sections.map(s => ({
                ...s,
                products: (s.products || []).filter(p => saleProductIds.includes(String(p.id)))
            })).filter(s => s.products?.length > 0);
        }
        
        // Filter by brand if selectedBrandId is set
        if (selectedBrandId) {
            sections = sections.map(s => ({
                ...s,
                products: (s.products || []).filter(p => {
                    const productBrandId = p.brandId || p.brand_id;
                    return String(productBrandId) === String(selectedBrandId);
                })
            })).filter(s => s.products?.length > 0);
        }
        
        // Enrich all products with sale info
        sections = sections.map(s => ({
            ...s,
            products: enrichWithSaleInfo(s.products || [])
        }));
        
        return sections;
    })();

    // Filter products based on selected category, sale status, brand, and search query
    const displayProducts = (() => {
        let products;
        
        // If searching, search across ALL products
        if (searchQuery && searchQuery.trim()) {
            products = filterBySearchQuery(allProducts, searchQuery);
        } else if (activeGender === 'all' && !currentCategoryId) {
            // All: show products not in any section
            products = allProducts.filter(product => {
                const productId = product.id;
                for (const section of homeSections) {
                    if (section.products?.some(p => p.id === productId)) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            // Filter by selected category tree
            const categoryToFilter = currentCategoryId;
            if (!categoryToFilter) {
                return [];
            }
            products = filterProductsByCategory(allProducts, categoryToFilter);
        }
        
        // Filter by sale if showSaleOnly is true
        if (showSaleOnly) {
            products = products.filter(p => saleProductIds.includes(String(p.id)));
        }
        
        // Filter by brand if selectedBrandId is set
        if (selectedBrandId) {
            products = products.filter(p => {
                const productBrandId = p.brandId || p.brand_id;
                return String(productBrandId) === String(selectedBrandId);
            });
        }
        
        // Enrich all products with sale info
        return enrichWithSaleInfo(products);
    })();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh', background: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border" role="status" style={{ color: '#222', width: '2rem', height: '2rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '15px', color: '#888', fontSize: '12px', letterSpacing: '1px' }}>LOADING</p>
                </div>
            </div>
        );
    }

    return (
        <main style={{ background: '#fff', minHeight: '100vh' }}>
            <Navbar 
                brands={brands} 
                user={user} 
                activeGender={activeGender} 
                onGenderChange={handleGenderChange} 
                showSaleOnly={showSaleOnly}
                onSaleToggle={(value) => setShowSaleOnly(typeof value === 'boolean' ? value : !showSaleOnly)}
                saleDiscounts={saleDiscounts}
                selectedSaleDiscount={selectedSaleDiscount}
                onSaleDiscountChange={setSelectedSaleDiscount}
                selectedBrandId={selectedBrandId}
                onBrandChange={setSelectedBrandId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            
            {/* Promo Banner - only show when All is selected and not searching */}
            {activeGender === 'all' && !searchQuery && <PromoBanner />}

            {/* Category Navigation - Breadcrumb + Subcategories */}
            {currentCategoryId && (
                <section style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                    <div className="container">
                        {/* Breadcrumb */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: childCategories.length > 0 ? '15px' : '0', flexWrap: 'wrap' }}>
                            <span 
                                onClick={() => { setActiveGender('all'); setSelectedCategoryId(null); }}
                                style={{ fontSize: '13px', color: '#666', cursor: 'pointer' }}
                                onMouseEnter={e => e.target.style.color = '#222'}
                                onMouseLeave={e => e.target.style.color = '#666'}
                            >
                                Tất cả
                            </span>
                            {breadcrumbPath.map((cat, idx) => (
                                <span key={cat.id || cat.cId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#ccc' }}>/</span>
                                    <span 
                                        onClick={() => idx < breadcrumbPath.length - 1 && handleCategoryClick(cat.id || cat.cId)}
                                        style={{ 
                                            fontSize: '13px', 
                                            color: idx === breadcrumbPath.length - 1 ? '#222' : '#666',
                                            fontWeight: idx === breadcrumbPath.length - 1 ? '600' : '400',
                                            cursor: idx < breadcrumbPath.length - 1 ? 'pointer' : 'default'
                                        }}
                                        onMouseEnter={e => idx < breadcrumbPath.length - 1 && (e.target.style.color = '#222')}
                                        onMouseLeave={e => idx < breadcrumbPath.length - 1 && (e.target.style.color = '#666')}
                                    >
                                        {cat.name || cat.cName}
                                    </span>
                                </span>
                            ))}
                        </div>

                        {/* Subcategories */}
                        {childCategories.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {childCategories.map(cat => (
                                    <button
                                        key={cat.id || cat.cId}
                                        onClick={() => handleCategoryClick(cat.id || cat.cId)}
                                        style={{
                                            background: '#f5f5f5',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '20px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            color: '#222',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.target.style.background = '#f5f5f5'; e.target.style.color = '#222'; }}
                                    >
                                        {cat.name || cat.cName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Active Filters Display */}
            {(showSaleOnly || selectedBrandId || searchQuery) && (
                <div style={{ 
                    padding: '15px 40px', 
                    background: '#f8f8f8',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Đang lọc:</span>
                    {searchQuery && (
                        <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            🔍 "{searchQuery}"
                            <span 
                                onClick={() => setSearchQuery('')}
                                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >×</span>
                        </span>
                    )}
                    {showSaleOnly && (
                        <span style={{
                            background: '#fff0f0',
                            color: '#e31837',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            🏷️ Sale {selectedSaleDiscount ? `(-${selectedSaleDiscount}%)` : '(Tất cả)'}
                            <span 
                                onClick={() => { setShowSaleOnly(false); setSelectedSaleDiscount(null); }}
                                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >×</span>
                        </span>
                    )}
                    {selectedBrandId && (
                        <span style={{
                            background: '#f0f0f0',
                            color: '#222',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            🏢 {brands.find(b => (b.brandId || b.id) === selectedBrandId)?.brandName || brands.find(b => (b.brandId || b.id) === selectedBrandId)?.name || 'Brand'}
                            <span 
                                onClick={() => setSelectedBrandId(null)}
                                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >×</span>
                        </span>
                    )}
                    <button
                        onClick={() => { setShowSaleOnly(false); setSelectedSaleDiscount(null); setSelectedBrandId(null); setSearchQuery(''); }}
                        style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#666',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                        }}
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            )}

            {/* Dynamic Home Sections from Admin - filtered by gender */}
            {filteredSections.map((section, sectionIndex) => (
                section.products && section.products.length > 0 && (
                    <section key={section.id || sectionIndex} style={{ padding: '30px 0', background: sectionIndex % 2 === 0 ? '#fafafa' : '#fff' }}>
                        <div className="container">
                            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                                {section.title}
                            </h2>
                            {section.description && (
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>{section.description}</p>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                                {section.products.map((product, index) => (
                                    <div key={`${section.id}-${product.id}-${index}`} style={{ position: 'relative' }}>
                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => toggleWishlist(e, product.id, product)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                zIndex: 10,
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                background: 'rgba(255,255,255,0.9)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s'
                                            }}
                                            title={wishlist.includes(String(product.id)) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" 
                                                fill={wishlist.includes(String(product.id)) ? '#e31837' : 'none'} 
                                                stroke={wishlist.includes(String(product.id)) ? '#e31837' : '#666'} 
                                                strokeWidth="2"
                                            >
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                            </svg>
                                        </button>
                                        <a href={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                            <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                                                <ProductImageHover 
                                                    thumbnail1={product.thumbnail1 || '/img/no-image.svg'}
                                                    thumbnail2={product.thumbnail2 || product.thumbnail1 || '/img/no-image.svg'}
                                                    alt={product.name}
                                                    badge={product.onSale ? `-${product.discountPercent}%` : null}
                                                    badgeColor="#e31837"
                                                />
                                                <div style={{ padding: '10px' }}>
                                                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>
                                                        {product.brandName || 'Brand'}
                                                    </p>
                                                    <p style={{ fontSize: '13px', color: '#222', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {product.name}
                                                    </p>
                                                    {product.onSale && product.salePrice ? (
                                                        <div>
                                                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '11px', marginRight: '6px' }}>
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                            </span>
                                                            <span style={{ fontSize: '13px', color: '#e53935', fontWeight: '600' }}>
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '13px', color: '#e53935', fontWeight: '600', margin: 0 }}>
                                                            {product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : 'Liên hệ'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            ))}

            {/* Empty state when no sections */}
            {homeSections.length === 0 && (
                <section style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div className="container">
                        <p style={{ color: '#888', fontSize: '14px' }}>
                            Chưa có sản phẩm nào được cấu hình. Admin có thể thêm sections tại /admin/home-sections
                        </p>
                    </div>
                </section>
            )}

            {/* Products section - shows different content based on category filter */}
            {displayProducts.length > 0 && (
                <section style={{ padding: '40px 0', background: '#f5f5f5' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <p style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
                                {searchQuery ? 'KẾT QUẢ TÌM KIẾM' : (activeGender === 'all' && !currentCategoryId ? 'KHÁM PHÁ THÊM' : (currentCategory?.name || currentCategory?.cName || activeGender).toUpperCase())}
                            </p>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '400', color: '#222', letterSpacing: '1px' }}>
                                {searchQuery 
                                    ? `"${searchQuery}"`
                                    : (activeGender === 'all' && !currentCategoryId 
                                        ? 'SẢN PHẨM KHÁC' 
                                        : `SẢN PHẨM ${(currentCategory?.name || currentCategory?.cName || activeGender).toUpperCase()}`)}
                            </h2>
                            <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
                                {displayProducts.length} sản phẩm
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {displayProducts.slice(0, searchQuery ? 50 : ((activeGender === 'all' && !currentCategoryId) ? 10 : 20)).map((product, index) => (
                                <div key={`other-${product.id}-${index}`} style={{ position: 'relative' }}>
                                    {/* Wishlist Button */}
                                    <button
                                        onClick={(e) => toggleWishlist(e, product.id, product)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            zIndex: 10,
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.9)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s'
                                        }}
                                        title={wishlist.includes(String(product.id)) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" 
                                            fill={wishlist.includes(String(product.id)) ? '#e31837' : 'none'} 
                                            stroke={wishlist.includes(String(product.id)) ? '#e31837' : '#666'} 
                                            strokeWidth="2"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                    </button>
                                    <a href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                            <ProductImageHover 
                                                thumbnail1={product.thumbnail1 || '/img/no-image.svg'}
                                                thumbnail2={product.thumbnail2 || product.thumbnail1 || '/img/no-image.svg'}
                                                alt={product.name}
                                                badge={product.onSale ? `-${product.discountPercent}%` : null}
                                                badgeColor="#e31837"
                                            />
                                            <div style={{ padding: '12px' }}>
                                                <p style={{ fontSize: '13px', color: '#222', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                                    {product.name}
                                                </p>
                                                <span style={{ fontSize: '10px', color: '#888', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
                                                    {product.categoryName || product.brandName || 'Xem chi tiết'}
                                                </span>
                                                {product.onSale && product.salePrice ? (
                                                    <div style={{ margin: '6px 0 0' }}>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '11px', marginRight: '6px' }}>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                        </span>
                                                        <span style={{ fontSize: '14px', color: '#e53935', fontWeight: '600' }}>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: '14px', color: '#e53935', fontWeight: '600', margin: '6px 0 0' }}>
                                                        {product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : 'Liên hệ'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                        {!searchQuery && displayProducts.length > ((activeGender === 'all' && !currentCategoryId) ? 10 : 20) && (
                            <div className="text-center mt-4">
                                <p style={{ color: '#666', fontSize: '13px' }}>
                                    Hiển thị {(activeGender === 'all' && !currentCategoryId) ? 10 : 20} / {displayProducts.length} sản phẩm. Sử dụng thanh tìm kiếm để tìm sản phẩm cụ thể.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}


        </main>
    );
};

export default HomePage;
