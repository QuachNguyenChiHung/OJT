import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductTable from "../Components/ProductTable";
import '../styles/theme.css';

// Navbar - Main Navigation Header
const Navbar = ({ categories = [], brands = [], user = null }) => {
    const navigate = useNavigate();
    const [activeGender, setActiveGender] = useState('women');
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuTimeout, setMenuTimeout] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userMenuTimeout, setUserMenuTimeout] = useState(null);
    
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
    
    // Mega menu handlers with 1s delay
    const handleMenuEnter = (menuId) => {
        if (menuTimeout) {
            clearTimeout(menuTimeout);
            setMenuTimeout(null);
        }
        setActiveMenu(menuId);
    };
    
    const handleMenuLeave = () => {
        const timeout = setTimeout(() => {
            setActiveMenu(null);
        }, 1000); // 1s delay before hiding
        setMenuTimeout(timeout);
    };
    
    // Click toggle for mobile
    const handleMenuClick = (menuId) => {
        if (activeMenu === menuId) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menuId);
        }
    };
    
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
    
    // Ensure arrays
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeBrands = Array.isArray(brands) ? brands : [];

    // Gender tabs
    const genderTabs = [
        { id: 'women', label: 'Women' },
        { id: 'men', label: 'Men' },
        { id: 'unisex', label: 'Unisex' }
    ];

    // Main navigation items with mega menu content
    const navItems = [
        { 
            id: 'sale', 
            label: 'Sale', 
            isRed: true,
            megaMenu: {
                columns: [
                    {
                        title: 'SALE',
                        items: ['All Sale', 'Clothing', 'Jackets', 'Dresses', 'Tops', 'Shoes', 'Trainers', 'Bags', 'Accessories', 'Previous Season']
                    },
                    {
                        title: "EDITOR'S PICKS",
                        items: ['Favorite brands on sale', 'Sale for you']
                    }
                ],
                featured: {
                    image: '/img/sale-banner.jpg',
                    category: activeGender === 'women' ? 'Women' : 'Men',
                    title: 'FW25 SALE UPDATE: NOW UP TO 60% OFF SELECTED STYLES',
                    link: 'Shop Now'
                }
            }
        },
        { 
            id: 'new', 
            label: 'New in',
            megaMenu: {
                columns: [
                    {
                        title: 'NEW IN',
                        items: ['View All New', 'Clothing', 'Shoes', 'Bags', 'Accessories', 'Jewelry']
                    },
                    {
                        title: 'TRENDING NOW',
                        items: ['Best Sellers', 'Most Wanted', 'Back in Stock']
                    }
                ]
            }
        },
        { 
            id: 'brands', 
            label: 'Brands',
            megaMenu: {
                columns: [
                    {
                        title: 'TOP BRANDS',
                        items: safeBrands.slice(0, 10).map(b => b.bName)
                    },
                    {
                        title: 'MORE BRANDS',
                        items: safeBrands.slice(10, 20).map(b => b.bName)
                    }
                ]
            }
        },
        { 
            id: 'clothing', 
            label: 'Clothing',
            megaMenu: {
                columns: [
                    {
                        title: 'CLOTHING',
                        items: ['All Clothing', ...safeCategories.slice(0, 8).map(c => c.cName)]
                    },
                    {
                        title: 'SHOP BY STYLE',
                        items: ['Casual', 'Formal', 'Streetwear', 'Sportswear']
                    }
                ]
            }
        },
        { 
            id: 'shoes', 
            label: 'Shoes',
            megaMenu: {
                columns: [
                    {
                        title: 'SHOES',
                        items: ['All Shoes', 'Sneakers', 'Boots', 'Sandals', 'Loafers', 'Heels', 'Flats']
                    }
                ]
            }
        },
        { 
            id: 'bags', 
            label: 'Bags',
            megaMenu: {
                columns: [
                    {
                        title: 'BAGS',
                        items: ['All Bags', 'Shoulder Bags', 'Tote Bags', 'Crossbody', 'Backpacks', 'Clutches']
                    }
                ]
            }
        },
        { 
            id: 'accessories', 
            label: 'Accessories',
            megaMenu: {
                columns: [
                    {
                        title: 'ACCESSORIES',
                        items: ['All Accessories', 'Belts', 'Hats', 'Scarves', 'Sunglasses', 'Wallets']
                    }
                ]
            }
        },
        { 
            id: 'watches', 
            label: 'Watches',
            megaMenu: {
                columns: [
                    {
                        title: 'WATCHES',
                        items: ['All Watches', 'Luxury Watches', 'Smart Watches', 'Classic']
                    }
                ]
            }
        },
        { 
            id: 'lifestyle', 
            label: 'Lifestyle',
            megaMenu: {
                columns: [
                    {
                        title: 'LIFESTYLE',
                        items: ['Home Decor', 'Tech', 'Beauty', 'Books', 'Gifts']
                    }
                ]
            }
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            background: '#fff',
            boxShadow: activeMenu ? 'none' : '0 1px 0 #e5e5e5'
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
                                onClick={() => setActiveGender(tab.id)}
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
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#e31837',
                                color: '#fff',
                                fontSize: '10px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>1</span>
                        </div>
                        
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
                                            {/* Logged in: Profile, Change Password, Sign Out */}
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
                                                Change Password
                                            </div>
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
                        {navItems.map(item => (
                            <div
                                key={item.id}
                                style={{ position: 'relative' }}
                                onMouseEnter={() => handleMenuEnter(item.id)}
                                onMouseLeave={handleMenuLeave}
                            >
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0',
                                        fontSize: '13px',
                                        fontWeight: '400',
                                        color: item.isRed ? '#e31837' : '#222',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleMenuClick(item.id)}
                                >
                                    {item.label}
                                </button>
                            </div>
                        ))}
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
                                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Mega Menu Dropdown */}
            {activeMenu && navItems.find(item => item.id === activeMenu)?.megaMenu && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderBottom: '1px solid #e5e5e5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        padding: '30px 40px',
                        zIndex: 999
                    }}
                    onMouseEnter={() => handleMenuEnter(activeMenu)}
                    onMouseLeave={handleMenuLeave}
                >
                    <div style={{ display: 'flex', gap: '60px' }}>
                        {/* Menu Columns */}
                        <div style={{ display: 'flex', gap: '60px', flex: 1 }}>
                            {navItems.find(item => item.id === activeMenu)?.megaMenu.columns.map((col, idx) => (
                                <div key={idx}>
                                    <h4 style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '600', 
                                        color: '#222',
                                        letterSpacing: '0.5px',
                                        marginBottom: '15px'
                                    }}>
                                        {col.title}
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {col.items.map((menuItem, i) => (
                                            <li key={i} style={{ marginBottom: '10px' }}>
                                                <a 
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/search?q=${encodeURIComponent(menuItem)}`);
                                                        setActiveMenu(null);
                                                    }}
                                                    style={{
                                                        fontSize: '13px',
                                                        color: '#222',
                                                        textDecoration: 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                >
                                                    {menuItem}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Featured Image (for Sale menu) */}
                        {navItems.find(item => item.id === activeMenu)?.megaMenu.featured && (
                            <div style={{ width: '350px' }}>
                                <div style={{ 
                                    background: '#f5f5f5', 
                                    height: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <img 
                                        src="/img/logo.png" 
                                        alt="Featured" 
                                        style={{ maxHeight: '120px', opacity: 0.8 }}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                    {navItems.find(item => item.id === activeMenu)?.megaMenu.featured.category}
                                </p>
                                <p style={{ fontSize: '13px', fontWeight: '500', color: '#222', marginBottom: '10px' }}>
                                    {navItems.find(item => item.id === activeMenu)?.megaMenu.featured.title}
                                </p>
                                <a 
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/search?sale=true');
                                        setActiveMenu(null);
                                    }}
                                    style={{ fontSize: '13px', color: '#222', textDecoration: 'underline' }}
                                >
                                    {navItems.find(item => item.id === activeMenu)?.megaMenu.featured.link}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};


// Hero Banner - Elegant Fashion Style
const HeroBanner = () => {
    const navigate = useNavigate();
    
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
                            onClick={() => navigate('/search')}
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

// Promo Banner with Brands Overlay
const PromoBanner = ({ brands = [] }) => {
    const navigate = useNavigate();
    const [showBrands, setShowBrands] = useState(false);
    const bannerUrl = 'https://ojt-ecommerce-images-706302944148.s3.ap-southeast-1.amazonaws.com/banners/page1.png';

    return (
        <section style={{ padding: '40px 0', background: '#fff' }}>
            <div className="container">
                <div 
                    style={{ 
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowBrands(!showBrands)}
                >
                    {/* Banner Image */}
                    <img 
                        src={bannerUrl}
                        alt="Promo Banner"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                            e.target.src = '/img/logo.png';
                            e.target.style.height = '300px';
                            e.target.style.objectFit = 'contain';
                            e.target.style.background = '#f5f5f5';
                        }}
                    />
                    
                    {/* Brands Overlay */}
                    {showBrands && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '30px',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            <h3 style={{
                                color: '#fff',
                                fontSize: '24px',
                                fontWeight: '600',
                                marginBottom: '25px',
                                letterSpacing: '2px'
                            }}>
                                OUR BRANDS
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '15px',
                                maxWidth: '800px'
                            }}>
                                {brands.slice(0, 12).map((brand, idx) => (
                                    <button
                                        key={brand.brandId || idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/search?brand=${brand.brandId || brand.id}`);
                                        }}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: '#fff',
                                            padding: '10px 20px',
                                            borderRadius: '25px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#fff';
                                            e.currentTarget.style.color = '#222';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                    >
                                        {brand.brandName || brand.bName || brand.name}
                                    </button>
                                ))}
                            </div>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '12px',
                                marginTop: '20px'
                            }}>
                                Click anywhere to close
                            </p>
                        </div>
                    )}
                    
                    {/* Click hint when not showing brands */}
                    {!showBrands && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            Click to view brands
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// Newsletter Section
const NewsletterSection = () => {
    return (
        <section style={{ 
            background: '#f8f8f8', 
            padding: '50px 0',
            borderTop: '1px solid #eee'
        }}>
            <div className="container text-center">
                <p style={{ 
                    color: '#888', 
                    fontSize: '11px', 
                    letterSpacing: '2px',
                    marginBottom: '10px'
                }}>
                    STAY UPDATED
                </p>
                <h3 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '400', 
                    color: '#222',
                    marginBottom: '25px',
                    letterSpacing: '0.5px'
                }}>
                    Subscribe for exclusive offers
                </h3>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div className="d-flex">
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            style={{
                                flex: 1,
                                padding: '12px 15px',
                                border: '1px solid #ddd',
                                borderRight: 'none',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                        <button style={{
                            background: '#222',
                            color: '#fff',
                            border: '1px solid #222',
                            padding: '12px 25px',
                            fontSize: '12px',
                            letterSpacing: '0.5px',
                            cursor: 'pointer'
                        }}>
                            SUBSCRIBE
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Main HomePage Component
const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newestItems, setNewestItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

                // Fetch categories, brands, and products from API
                const [catRes, brandRes, bestRes, newRes] = await Promise.all([
                    api.get('/categories').catch(() => ({ data: [] })),
                    api.get('/brands').catch(() => ({ data: [] })),
                    api.get('/products/best-selling').catch(() => ({ data: [] })),
                    api.get('/products/newest').catch(() => ({ data: [] }))
                ]);

                setCategories(catRes.data || []);
                setBrands(brandRes.data || []);
                setBestSellers((bestRes.data || []).slice(0, 8));
                setNewestItems((newRes.data || []).slice(0, 8));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

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
            <Navbar categories={categories} brands={brands} user={user} />
            
            {/* Promo Banner with Brands */}
            <PromoBanner brands={brands} />
            
            {/* Product Grid Section */}
            <section style={{ padding: '30px 0' }}>
                <div className="container">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {[...bestSellers, ...newestItems].slice(0, 12).map((product, index) => (
                            <div key={index} className="col">
                                <a href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img 
                                            src={product.imageUrl || product.image || '/img/clothes.png'} 
                                            alt={product.name}
                                            style={{ 
                                                width: '100%', 
                                                aspectRatio: '3/4',
                                                objectFit: 'cover',
                                                background: '#f5f5f5'
                                            }}
                                        />
                                        {product.onSale && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                background: '#e31837',
                                                color: '#fff',
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                fontWeight: '500'
                                            }}>SALE</span>
                                        )}
                                    </div>
                                    <div style={{ padding: '12px 0' }}>
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: '#666', 
                                            margin: '0 0 4px 0',
                                            textTransform: 'uppercase'
                                        }}>
                                            {product.brandName || 'Brand'}
                                        </p>
                                        <p style={{ 
                                            fontSize: '13px', 
                                            color: '#222', 
                                            margin: '0 0 6px 0',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {product.name}
                                        </p>
                                        <p style={{ 
                                            fontSize: '13px', 
                                            fontWeight: '500', 
                                            color: '#222',
                                            margin: 0
                                        }}>
                                            {typeof product.price === 'number' 
                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
                                                : product.price}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


        </main>
    );
};

export default HomePage;
