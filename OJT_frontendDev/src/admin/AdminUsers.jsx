import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    address: '',
    role: 'USER',
    active: true,
    dateOfBirth: '',
    password: ''
  });

  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
          navigate('/login');
          return;
        }
      } catch {
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/users');
        // Backend returns { users: [...] } or array directly
        const data = res?.data?.users || res?.data;
        if (Array.isArray(data) && data.length > 0) {
          // Map backend field names to frontend expected names
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
          return;
        }
      } catch (err) {
        console.error('Load users failed:', err);
        // ignore network/backend errors and fallback to local sample data
      }
    };
    load();
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
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.active).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    // Coerce active to boolean when changed via select
    if (name === 'active') {
      setUserForm((f) => ({ ...f, [name]: value === 'true' }));
    } else {
      setUserForm((f) => ({ ...f, [name]: value }));
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.fullName.trim()) {
      alert('Email và tên là bắt buộc');
      return;
    }

    // Validate age if dateOfBirth is provided
    if (userForm.dateOfBirth && userForm.dateOfBirth.trim() !== '') {
      const birthDate = new Date(userForm.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
        ? age - 1 : age;

      if (actualAge < 18 || actualAge > 100) {
        alert('Tuổi phải từ 18 đến 100 tuổi.');
        return;
      }
    }

    // Check if email already exists locally
    const emailExists = users.some(user => user.email.toLowerCase() === userForm.email.toLowerCase());
    if (emailExists) {
      alert('Email đã tồn tại');
      return;
    }

    const payload = {
      email: userForm.email.trim(),
      fullName: userForm.fullName.trim(),
      password: userForm.password.trim(),
      phoneNumber: userForm.phoneNumber.trim() || null,
      role: userForm.role || 'USER',
      dateOfBirth: userForm.dateOfBirth || null,
      address: userForm.address.trim() || null
    };

    try {
      const res = await api.post('/users', payload);
      // ensure created user has `active: true` by default when server doesn't return it
      const created = res?.data ? ({ ...res.data, active: typeof res.data.active !== 'undefined' ? res.data.active : true }) : ({ ...payload, active: true });
      setUsers(u => [created, ...u]);
      setUserForm({
        email: '',
        phoneNumber: '',
        fullName: '',
        address: '',
        role: 'USER',
        active: true,
        dateOfBirth: '',
        password: ''
      });
    } catch (err) {
      console.error('Create user failed', err);
      alert('Không thể tạo người dùng');
      setUserForm({
        email: '',
        phoneNumber: '',
        fullName: '',
        address: '',
        role: 'USER',
        active: true,
        dateOfBirth: '',
        password: ''
      });
      // surface error to user
      alert('Không thể tạo người dùng');
    }
  };

  const startEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.email.trim() || !editingUser.fullName.trim()) {
      alert('Email và tên là bắt buộc');
      return;
    }

    // Validate age if dateOfBirth is provided
    if (editingUser.dateOfBirth && editingUser.dateOfBirth.trim() !== '') {
      const birthDate = new Date(editingUser.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
        ? age - 1 : age;

      if (actualAge < 18 || actualAge > 100) {
        alert('Tuổi phải từ 18 đến 100 tuổi.');
        return;
      }
    }

    // Check if email already exists (excluding current user)
    const emailExists = users.some(user =>
      user.id !== editingUser.id &&
      user.email.toLowerCase() === editingUser.email.toLowerCase()
    );
    if (emailExists) {
      alert('Email đã tồn tại');
      return;
    }

    // Build payload matching backend CreateUserRequest
    const payload = {
      email: editingUser.email.trim(),
      fullName: editingUser.fullName.trim(),
      // include active/boolean field so server can update status
      isActive: Boolean(editingUser.active),
      phoneNumber: editingUser.phoneNumber?.trim() || null,
      role: editingUser.role || 'USER',
      dateOfBirth: editingUser.dateOfBirth || null,
      address: editingUser.address?.trim() || null,
      // only include password when provided (omit to keep current)
      ...(editingUser.password ? { password: editingUser.password.trim() } : {})
    };

    try {
      const res = await api.put(`/users/${editingUser.id}`, payload);
      const updated = res?.data;
      // Update local list from server response if available
      if (updated) {
        setUsers(users => users.map(u => u.id === editingUser.id ? ({
          ...u,
          email: updated.email ?? u.email,
          phoneNumber: updated.phoneNumber ?? u.phoneNumber,
          fullName: updated.fullName ?? u.fullName,
          address: updated.address ?? u.address,
          role: updated.role ?? u.role,
          active: typeof updated.active !== 'undefined' ? updated.active : u.active,
          dateOfBirth: updated.dateOfBirth ?? u.dateOfBirth
        }) : u));
      }
      setEditingUser(null);
    } catch (err) {
      console.error('Update user failed', err);
      alert('Không thể cập nhật người dùng');
      // fallback: update locally
      setUsers(users => users.map(u => u.id === editingUser.id ? ({
        ...u,
        email: editingUser.email.trim(),
        phoneNumber: editingUser.phoneNumber?.trim() || null,
        fullName: editingUser.fullName.trim(),
        address: editingUser.address?.trim() || null,
        role: editingUser.role,
        active: Boolean(editingUser.active),
        dateOfBirth: editingUser.dateOfBirth || null,
        password: editingUser.password?.trim() || u.password
      }) : u));
      setEditingUser(null);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const removeUser = (user_id) => {
    if (!confirm('Xóa người dùng này? Hành động này không thể hoàn tác.')) return;
    setUsers((u) => u.filter(x => x.id !== user_id));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'USER': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (active) => {
    if (active === true || String(active).toLowerCase() === 'true') return 'success';
    return 'warning';
  };

  return (
    <AdminLayout title="Quản Lý Người Dùng">
      <div style={{ maxWidth: 1200 }}>
        <div className="d-flex justify-content-end mb-3">
          <button className="btn" style={{ background: '#008B8B', color: '#fff' }} onClick={() => navigate('/admin/users')}>🔄 Làm Mới</button>
        </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm người dùng theo tên, email, số điện thoại, vai trò hoặc trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6 text-end">
            <small className="text-muted">
              Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
            </small>
          </div>
        </div>
      </div>

      {/* User Creation/Edit Form */}
      <div className="mb-4 p-3" style={{ border: '2px solid #008B8B', borderRadius: '8px', background: '#fff' }}>
        <h4>{editingUser ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}</h4>
        <form onSubmit={editingUser ? updateUser : addUser}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Email *</label>
              <input
                className="form-control"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={editingUser ? editingUser.email : userForm.email}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, email: e.target.value }) :
                  handleUserChange
                }
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Họ Tên *</label>
              <input
                className="form-control"
                name="fullName"
                placeholder="Họ Tên"
                value={editingUser ? editingUser.fullName : userForm.fullName}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, fullName: e.target.value }) :
                  handleUserChange
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Số Điện Thoại</label>
              <input
                className="form-control"
                name="phoneNumber"
                placeholder="0123456789"
                maxLength="13"
                value={editingUser ? (editingUser.phoneNumber || '') : userForm.phoneNumber}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value }) :
                  handleUserChange
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Vai Trò</label>
              <select
                className="form-select"
                name="role"
                value={editingUser ? editingUser.role : userForm.role}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, role: e.target.value }) :
                  handleUserChange
                }
              >
                <option value="USER">Người Dùng</option>
                <option value="ADMIN">Quản Trị Viên</option>
              </select>
            </div>
            {editingUser && (
              <div className="col-md-4">
                <label className="form-label">Trạng Thái</label>
                <select
                  className="form-select"
                  name="active"
                  value={editingUser ? String(editingUser.active) : String(userForm.active)}
                  onChange={editingUser ?
                    (e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' }) :
                    handleUserChange
                  }
                >
                  <option value={true}>Hoạt Động</option>
                  <option value={false}>Không Hoạt Động</option>
                </select>
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label">Ngày Sinh (18-100 tuổi)</label>
              <input
                className="form-control"
                name="dateOfBirth"
                type="date"
                value={editingUser ? (editingUser.dateOfBirth || '') : userForm.dateOfBirth}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value }) :
                  handleUserChange
                }
                min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                max={new Date(new Date().getFullYear() - 18, 11, 31).toISOString().split('T')[0]}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mật Khẩu {!editingUser && '*'}</label>
              <input
                className="form-control"
                name="password"
                type="password"
                placeholder={editingUser ? "Để trống để giữ mật khẩu hiện tại" : "Nhập mật khẩu"}
                value={editingUser ? (editingUser.password || '') : userForm.password}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, password: e.target.value }) :
                  handleUserChange
                }
                required={!editingUser}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Địa Chỉ</label>
              <textarea
                className="form-control"
                name="address"
                placeholder="Địa chỉ đầy đủ"
                rows="2"
                value={editingUser ? (editingUser.address || '') : userForm.address}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, address: e.target.value }) :
                  handleUserChange
                }
              />
            </div>
            <div className="col-md-12">
              {editingUser ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-success" type="submit">Cập Nhật Người Dùng</button>
                  <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Hủy</button>
                </div>
              ) : (
                <button className="btn" style={{ background: '#008B8B', color: '#fff' }} type="submit">Tạo Người Dùng</button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="list-group">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `Không tìm thấy người dùng nào với từ khóa "${searchTerm}"` : 'Không có người dùng nào'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm để hiển thị tất cả người dùng
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-3">{user.fullName || '(Chưa có tên)'}</h5>
                    <span className={`badge bg-${getRoleColor(user.role)} me-2`}>{user.role === 'ADMIN' ? 'QUẢN TRỊ' : 'NGƯÒI DÙNG'}</span>
                    <span className={`badge bg-${getStatusColor(user.active)}`}>{user.active ? 'HOẠT ĐỔNG' : 'KHÔNG HOẠT ĐỔNG'}</span>
                  </div>
                  <div className="text-muted small mb-1">
                    <strong>Email:</strong> {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div className="text-muted small mb-1">
                      <strong>Điện thoại:</strong> {user.phoneNumber}
                    </div>
                  )}
                  {user.dateOfBirth && (
                    <div className="text-muted small mb-1">
                      <strong>Ngày sinh:</strong> {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                  {user.address && (
                    <div className="text-muted small">
                      <strong>Địa chỉ:</strong> {user.address.length > 100 ? `${user.address.substring(0, 100)}...` : user.address}
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => startEditUser(user)}
                    disabled={editingUser && editingUser.id === user.id}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeUser(user.id)}
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      navigate(`/admin/users/${user.id}`);
                      return;
                    }}
                  >
                    Xem Chi Tiết
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