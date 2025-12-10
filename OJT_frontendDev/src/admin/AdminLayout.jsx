import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const logoImg = '/img/logo.png';

// Color scheme - Teal/Dark like logo
const colors = {
  primary: '#008B8B',      // Dark Cyan/Teal
  primaryDark: '#006666',  // Darker teal
  secondary: '#1a1a2e',    // Dark navy
  accent: '#00CED1',       // Dark Turquoise
  sidebar: '#0f0f1a',      // Very dark
  sidebarHover: '#1a1a2e',
  text: '#ffffff',
  textMuted: '#a0aec0',
  border: '#2d2d44',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const menuItems = [
  { path: '/admin/products', icon: '📦', label: 'Sản Phẩm' },
  { path: '/admin/categories', icon: '📂', label: 'Danh Mục' },
  { path: '/admin/brands', icon: '🏷️', label: 'Thương Hiệu' },
  { path: '/admin/orders', icon: '🛒', label: 'Đơn Hàng' },
  { path: '/admin/users', icon: '👥', label: 'Người Dùng' },
  { path: '/admin/home-sections', icon: '🏠', label: 'Sections Trang Chủ' },
  { path: '/admin/sale', icon: '🔥', label: 'Sale' },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? '70px' : '250px',
        background: `linear-gradient(180deg, ${colors.sidebar} 0%, ${colors.secondary} 100%)`,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: '12px',
        }}>
          <img src={logoImg} alt="Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
          {!sidebarCollapsed && (
            <span style={{ color: colors.text, fontWeight: 600, fontSize: 16 }}>
              Admin Panel
            </span>
          )}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarCollapsed ? '14px' : '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? colors.text : colors.textMuted,
                  background: isActive ? colors.primary : 'transparent',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = colors.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {!sidebarCollapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 8px', borderTop: `1px solid ${colors.border}` }}>
          <Link
            to="/home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '14px' : '12px 16px',
              marginBottom: '4px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: colors.textMuted,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.sidebarHover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 20 }}>🏠</span>
            {!sidebarCollapsed && <span style={{ fontSize: 14 }}>Về Trang Chủ</span>}
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '14px' : '12px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '8px',
              background: 'transparent',
              color: colors.danger,
              cursor: 'pointer',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.sidebarHover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 20 }}>🚪</span>
            {!sidebarCollapsed && <span style={{ fontSize: 14 }}>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? '70px' : '250px',
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Top Header */}
        <header style={{
          background: '#fff',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              ☰
            </button>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: colors.secondary }}>
              {title || 'Admin Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              background: colors.primary, 
              color: '#fff', 
              padding: '6px 12px', 
              borderRadius: '20px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              ADMIN
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
