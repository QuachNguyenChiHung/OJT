import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const logoImg = '/img/logo.png';

// CSS to hide scrollbar and override Bootstrap focus colors
const adminStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* Override ALL orange/primary colors to teal in admin */
  .form-control:focus,
  .form-select:focus,
  .btn:focus,
  input:focus,
  select:focus,
  textarea:focus,
  input[type="file"]:focus {
    border-color: #0d9488 !important;
    box-shadow: 0 0 0 0.2rem rgba(13, 148, 136, 0.25) !important;
    outline: none !important;
  }
  
  /* Override Bootstrap primary colors */
  .btn-primary {
    background-color: #0d9488 !important;
    border-color: #0d9488 !important;
  }
  
  .btn-outline-primary {
    color: #0d9488 !important;
    border-color: #0d9488 !important;
  }
  
  .btn-outline-primary:hover,
  .btn-primary:hover {
    background-color: #0f766e !important;
    border-color: #0f766e !important;
    color: #fff !important;
  }
  
  /* Override orange borders */
  .border-orange,
  .border-warning {
    border-color: #0d9488 !important;
  }
  
  /* Override form-control default border - styles.min.css has orange #E49400 */
  .form-control,
  .form-select,
  input[type="file"],
  input,
  select,
  textarea {
    border: 1px solid #e2e8f0 !important;
  }
  
  .form-control:focus,
  .form-select:focus,
  input:focus,
  select:focus,
  textarea:focus {
    border-color: #0d9488 !important;
    box-shadow: 0 0 0 0.2rem rgba(13, 148, 136, 0.25) !important;
  }
`;

// Premium Color Scheme - Dark Teal/Navy Theme
const colors = {
  primary: '#0d9488',        // Teal
  primaryLight: '#14b8a6',   // Light Teal
  primaryDark: '#0f766e',    // Dark Teal
  secondary: '#0f172a',      // Slate 900
  accent: '#06b6d4',         // Cyan
  gold: '#0d9488',           // Teal accent
  sidebar: '#0f172a',
  sidebarSolid: '#0f172a',
  sidebarHover: 'rgba(13, 148, 136, 0.15)',
  sidebarActive: 'linear-gradient(90deg, rgba(13, 148, 136, 0.3) 0%, rgba(13, 148, 136, 0.1) 100%)',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: 'rgba(148, 163, 184, 0.1)',
  success: '#10b981',
  warning: '#64748b',
  danger: '#ef4444',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  glassBg: 'rgba(255, 255, 255, 0.05)',
};

const menuItems = [
  { path: '/admin/products', icon: '📦', label: 'Sản Phẩm', badge: null },
  { path: '/admin/categories', icon: '📂', label: 'Danh Mục', badge: null },
  { path: '/admin/brands', icon: '🏷️', label: 'Thương Hiệu', badge: null },
  { path: '/admin/orders', icon: '🛒', label: 'Đơn Hàng', badge: null },
  { path: '/admin/users', icon: '👥', label: 'Người Dùng', badge: null },
  { path: '/admin/home-sections', icon: '🏠', label: 'Sections Trang Chủ', badge: null },
  { path: '/admin/sale', icon: '🔥', label: 'Sale', badge: 'HOT' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.pageBg }}>
      <style>{adminStyles}</style>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? '80px' : '260px',
        background: colors.sidebar,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        overflowY: 'hidden',
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '20px 16px' : '20px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
          }}>
            <img src={logoImg} alt="Logo" style={{ width: 24, height: 24, borderRadius: 4 }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <span style={{ color: colors.text, fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px', display: 'block' }}>
                Admin Panel
              </span>
              <span style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Dashboard
              </span>
            </div>
          )}
        </div>

        {/* Menu Section Label */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 20px 6px', color: colors.textMuted, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', flexShrink: 0 }}>
            Menu chính
          </div>
        )}

        {/* Menu */}
        <nav style={{ 
          flex: 1, 
          padding: sidebarCollapsed ? '8px 6px' : '6px 10px', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE/Edge */
        }} className="hide-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: sidebarCollapsed ? '14px' : '14px 18px',
                  marginBottom: '6px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? colors.text : colors.textMuted,
                  background: isActive ? colors.sidebarActive : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  borderLeft: isActive ? `3px solid ${colors.primary}` : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = colors.sidebarHover;
                    e.currentTarget.style.color = colors.text;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.textMuted;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ fontSize: 18, filter: isActive ? 'none' : 'grayscale(30%)' }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span style={{ fontSize: 13, flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${colors.border}`, flexShrink: 0 }}>
          <Link
            to="/home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              marginBottom: '4px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: colors.textMuted,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.sidebarHover;
              e.currentTarget.style.color = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <span style={{ fontSize: 18 }}>🏠</span>
            {!sidebarCollapsed && <span style={{ fontSize: 13 }}>Về Trang Chủ</span>}
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: colors.danger,
              cursor: 'pointer',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            {!sidebarCollapsed && <span style={{ fontSize: 13 }}>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Top Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: colors.pageBg,
                border: 'none',
                fontSize: 16,
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '8px',
                color: colors.secondary,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primary;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.pageBg;
                e.currentTarget.style.color = colors.secondary;
              }}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.secondary, letterSpacing: '-0.5px' }}>
                {title || 'Admin Dashboard'}
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
                Quản lý hệ thống của bạn
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Admin Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
              padding: '6px 14px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}>
                👑
              </div>
              <span style={{ 
                color: '#fff', 
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}>
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
