import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN') {
          navigate('/login');
          return;
        }
      } catch {
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      const data = res?.data?.users || res?.data;
      if (Array.isArray(data) && data.length > 0) {
        const mappedUsers = data.map(u => ({
          id: u.userId || u.u_id || u.id,
          email: u.email,
          fullName: u.name || u.fullName || u.full_name || '',
          phoneNumber: u.phoneNumber || u.phone_number || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth || u.date_of_birth || null,
          role: u.role,
          active: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true)
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Load users failed:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Sync users between RDS and Cognito
  const syncUsers = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.post('/users/sync');
      setSyncResult({
        success: true,
        message: res.data?.message || 'Đồng bộ thành công!',
        details: res.data
      });
      // Reload users after sync
      await loadUsers();
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncResult({
        success: false,
        message: err?.response?.data?.message || 'Đồng bộ thất bại'
      });
    } finally {
      setSyncing(false);
    }
  };

  const startEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.fullName.trim()) {
      alert('Tên là bắt buộc');
      return;
    }

    const payload = {
      fullName: editingUser.fullName.trim(),
      isActive: Boolean(editingUser.active),
      phoneNumber: editingUser.phoneNumber?.trim() || null,
      role: editingUser.role || 'USER',
      dateOfBirth: editingUser.dateOfBirth || null,
      address: editingUser.address?.trim() || null
    };

    try {
      await api.put(`/users/${editingUser.id}`, payload);
      setUsers(users => users.map(u => u.id === editingUser.id ? ({
        ...u,
        ...payload,
        active: payload.isActive
      }) : u));
      setEditingUser(null);
      alert('Cập nhật thành công!');
    } catch (err) {
      console.error('Update user failed', err);
      alert('Không thể cập nhật người dùng');
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'USER': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (active) => {
    return active ? 'success' : 'warning';
  };

  // Count by role
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  return (
    <AdminLayout title="Quản Lý Người Dùng">
      <div style={{ maxWidth: 1200 }}>
        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Tổng người dùng', value: users.length, icon: '👥', color: '#0d9488', bg: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' },
            { label: 'Admin', value: adminCount, icon: '👑', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' },
            { label: 'User', value: userCount, icon: '👤', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
            { label: 'Hoạt động', value: users.filter(u => u.active).length, icon: '✅', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
          ].map((stat, idx) => (
            <div key={idx} className="col-md-3">
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `${stat.color}10`,
                }}></div>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: `0 4px 12px ${stat.color}40`,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            Danh sách users từ RDS database. Click "Sync" để đồng bộ với Cognito.
          </div>
          <div className="d-flex gap-3">
            <button 
              style={{
                background: syncing ? '#f1f5f9' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: syncing ? '#64748b' : '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: syncing ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.3)',
              }}
              onClick={syncUsers}
              disabled={syncing}
            >
              {syncing ? '⏳ Đang đồng bộ...' : '🔄 Sync RDS ↔ Cognito'}
            </button>
            <button 
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              }}
              onClick={loadUsers}
            >
              🔄 Làm Mới
            </button>
          </div>
        </div>

        {/* Sync Result Alert */}
        {syncResult && (
          <div style={{
            background: syncResult.success ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: `1px solid ${syncResult.success ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ fontWeight: 600, color: syncResult.success ? '#059669' : '#dc2626', marginBottom: 4 }}>
                {syncResult.success ? '✅ Thành công!' : '❌ Thất bại'}
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{syncResult.message}</div>
              {syncResult.details && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                  {syncResult.details.synced && <span style={{ marginRight: 16 }}>📥 Đã đồng bộ: {syncResult.details.synced}</span>}
                  {syncResult.details.skipped && <span style={{ marginRight: 16 }}>⏭️ Bỏ qua: {syncResult.details.skipped}</span>}
                  {syncResult.details.errors && <span>⚠️ Lỗi: {syncResult.details.errors}</span>}
                </div>
              )}
            </div>
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}
              onClick={() => setSyncResult(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: 48,
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    padding: '12px 16px 12px 48px',
                    fontSize: 14,
                  }}
                />
                {searchTerm && (
                  <button
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    onClick={() => setSearchTerm('')}
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <span style={{
                background: '#f1f5f9',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: 13,
                color: '#64748b',
                fontWeight: 500,
              }}>
                📊 {filteredUsers.length} / {users.length} người dùng
              </span>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #0d9488',
          }}>
            <h5 style={{ marginBottom: 20, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}>✏️</span>
              Chỉnh Sửa Người Dùng
            </h5>
            <form onSubmit={updateUser}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Email (không thể sửa)</label>
                  <input className="form-control" value={editingUser.email} disabled style={{ borderRadius: 10, background: '#f8fafc', border: '2px solid #e2e8f0' }} />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Họ Tên *</label>
                  <input
                    className="form-control"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    required
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Số Điện Thoại</label>
                  <input
                    className="form-control"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Vai Trò</label>
                  <select
                    className="form-select"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  >
                    <option value="USER">👤 Người Dùng</option>
                    <option value="ADMIN">👑 Quản Trị Viên</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Trạng Thái</label>
                  <select
                    className="form-select"
                    value={String(editingUser.active)}
                    onChange={(e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' })}
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  >
                    <option value="true">✅ Hoạt Động</option>
                    <option value="false">⏸️ Không Hoạt Động</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Ngày Sinh</label>
                  <input
                    className="form-control"
                    type="date"
                    value={editingUser.dateOfBirth || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value })}
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Địa Chỉ</label>
                  <input
                    className="form-control"
                    value={editingUser.address || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-md-12" style={{ marginTop: 16 }}>
                  <div className="d-flex gap-3">
                    <button 
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      💾 Lưu Thay Đổi
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelEdit}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
            padding: '16px 24px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}>
            👥 Danh Sách Người Dùng
          </div>
          
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ color: '#64748b' }}>
                {searchTerm ? `Không tìm thấy người dùng với "${searchTerm}"` : 'Không có người dùng nào'}
              </div>
            </div>
          ) : (
            filteredUsers.map((user, idx) => (
              <div key={user.id} style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                transition: 'all 0.2s ease',
              }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: user.role === 'ADMIN' 
                        ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' 
                        : 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: '#fff',
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: user.role === 'ADMIN' 
                        ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                        : '0 4px 12px rgba(13, 148, 136, 0.3)',
                    }}>
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 16, color: '#1e293b' }}>
                          {user.fullName || '(Chưa có tên)'}
                        </span>
                        <span style={{
                          background: user.role === 'ADMIN' 
                            ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' 
                            : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {user.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                        </span>
                        <span style={{
                          background: user.active ? '#dcfce7' : '#fef3c7',
                          color: user.active ? '#16a34a' : '#d97706',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {user.active ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                        </span>
                        {user.role === 'ADMIN' && (
                          <span style={{
                            background: '#1e293b',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: 10,
                            fontWeight: 600,
                          }}>
                            📦 RDS Only
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#64748b' }}>
                        <span>📧 {user.email}</span>
                        {user.phoneNumber && <span>📱 {user.phoneNumber}</span>}
                        {user.dateOfBirth && (
                          <span>🎂 {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                        )}
                      </div>
                      {user.address && (
                        <div style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>📍 {user.address}</div>
                      )}
                    </div>
                  </div>
                  <button
                    style={{
                      background: editingUser?.id === user.id ? '#f1f5f9' : 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                      color: editingUser?.id === user.id ? '#94a3b8' : '#fff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      cursor: editingUser?.id === user.id ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      boxShadow: editingUser?.id === user.id ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.3)',
                    }}
                    onClick={() => startEditUser(user)}
                    disabled={editingUser?.id === user.id}
                  >
                    ✏️ Sửa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
