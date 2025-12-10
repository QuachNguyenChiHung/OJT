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
        {/* Header with stats and actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-3">
            <span className="badge bg-danger fs-6">👑 Admin: {adminCount}</span>
            <span className="badge bg-primary fs-6">👤 User: {userCount}</span>
            <span className="badge bg-secondary fs-6">📊 Tổng: {users.length}</span>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-info"
              onClick={syncUsers}
              disabled={syncing}
            >
              {syncing ? '⏳ Đang đồng bộ...' : '🔄 Sync RDS ↔ Cognito'}
            </button>
            <button 
              className="btn" 
              style={{ background: '#008B8B', color: '#fff' }} 
              onClick={loadUsers}
            >
              🔄 Làm Mới
            </button>
          </div>
        </div>

        {/* Sync Result Alert */}
        {syncResult && (
          <div className={`alert ${syncResult.success ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
            <strong>{syncResult.success ? '✅' : '❌'}</strong> {syncResult.message}
            {syncResult.details && (
              <div className="mt-2 small">
                {syncResult.details.synced && <div>Đã đồng bộ: {syncResult.details.synced} users</div>}
                {syncResult.details.skipped && <div>Bỏ qua (Admin): {syncResult.details.skipped} users</div>}
                {syncResult.details.errors && <div>Lỗi: {syncResult.details.errors}</div>}
              </div>
            )}
            <button type="button" className="btn-close" onClick={() => setSyncResult(null)}></button>
          </div>
        )}

        {/* Info Box */}
        <div className="alert alert-info mb-3">
          <strong>💡 Lưu ý:</strong> Danh sách này hiển thị users từ RDS database. 
          Click "Sync RDS ↔ Cognito" để đồng bộ dữ liệu giữa RDS và Cognito (trừ Admin vì Admin chỉ tồn tại trong RDS).
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                    Xóa
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-muted">
                Hiển thị {filteredUsers.length} / {users.length} người dùng
              </small>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="mb-4 p-3" style={{ border: '2px solid #008B8B', borderRadius: '8px', background: '#fff' }}>
            <h5>✏️ Chỉnh Sửa Người Dùng</h5>
            <form onSubmit={updateUser}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Email (không thể sửa)</label>
                  <input className="form-control" value={editingUser.email} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Họ Tên *</label>
                  <input
                    className="form-control"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    className="form-control"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Vai Trò</label>
                  <select
                    className="form-select"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="USER">Người Dùng</option>
                    <option value="ADMIN">Quản Trị Viên</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Trạng Thái</label>
                  <select
                    className="form-select"
                    value={String(editingUser.active)}
                    onChange={(e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' })}
                  >
                    <option value="true">Hoạt Động</option>
                    <option value="false">Không Hoạt Động</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ngày Sinh</label>
                  <input
                    className="form-control"
                    type="date"
                    value={editingUser.dateOfBirth || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Địa Chỉ</label>
                  <input
                    className="form-control"
                    value={editingUser.address || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" type="submit">💾 Lưu</button>
                    <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Hủy</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="list-group">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-muted">
              {searchTerm ? `Không tìm thấy người dùng với "${searchTerm}"` : 'Không có người dùng nào'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0 me-3">{user.fullName || '(Chưa có tên)'}</h5>
                      <span className={`badge bg-${getRoleColor(user.role)} me-2`}>
                        {user.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                      </span>
                      <span className={`badge bg-${getStatusColor(user.active)}`}>
                        {user.active ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                      </span>
                      {user.role === 'ADMIN' && (
                        <span className="badge bg-dark ms-2" title="Admin chỉ tồn tại trong RDS">
                          📦 RDS Only
                        </span>
                      )}
                    </div>
                    <div className="text-muted small">
                      <span className="me-3">📧 {user.email}</span>
                      {user.phoneNumber && <span className="me-3">📱 {user.phoneNumber}</span>}
                      {user.dateOfBirth && (
                        <span className="me-3">🎂 {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>
                    {user.address && (
                      <div className="text-muted small mt-1">📍 {user.address}</div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => startEditUser(user)}
                      disabled={editingUser?.id === user.id}
                    >
                      ✏️ Sửa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
