import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_users_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    phone_number: '',
    u_name: '',
    address: '',
    role: 'USER',
    status: 'ACTIVE',
    date_of_birth: '',
    password: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setUsers(JSON.parse(raw));
    } else {
      // Seed sample data
      const sampleUsers = [
        {
          user_id: generateId(),
          email: 'john.doe@example.com',
          phone_number: '0123456789',
          u_name: 'John Doe',
          address: '123 Main St, City',
          role: 'USER',
          status: 'ACTIVE',
          date_of_birth: '1990-05-15',
          password: 'hashed_password_123'
        },
        {
          user_id: generateId(),
          email: 'admin@example.com',
          phone_number: '0987654321',
          u_name: 'Admin User',
          address: '456 Admin Ave, City',
          role: 'ADMIN',
          status: 'ACTIVE',
          date_of_birth: '1985-03-20',
          password: 'hashed_admin_pass'
        }
      ];
      setUsers(sampleUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleUsers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.u_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((f) => ({ ...f, [name]: value }));
  };

  const addUser = (e) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.u_name.trim()) {
      alert('Email và tên là bắt buộc');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === userForm.email.toLowerCase());
    if (emailExists) {
      alert('Email đã tồn tại');
      return;
    }

    const newUser = {
      user_id: generateId(),
      email: userForm.email.trim(),
      phone_number: userForm.phone_number.trim() || null,
      u_name: userForm.u_name.trim(),
      address: userForm.address.trim() || null,
      role: userForm.role,
      status: userForm.status,
      date_of_birth: userForm.date_of_birth || null,
      password: userForm.password.trim() || 'default_password_123'
    };
    // Local creation disabled - use server API instead
    alert('Tính năng tạo người dùng cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ.');
  };

  const startEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const updateUser = (e) => {
    e.preventDefault();
    if (!editingUser.email.trim() || !editingUser.u_name.trim()) {
      alert('Email và tên là bắt buộc');
      return;
    }

    // Check if email already exists (excluding current user)
    const emailExists = users.some(user =>
      user.user_id !== editingUser.user_id &&
      user.email.toLowerCase() === editingUser.email.toLowerCase()
    );
    if (emailExists) {
      alert('Email đã tồn tại');
      return;
    }

    // Local update disabled - use server API instead
    alert('Tính năng cập nhật người dùng cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ.');
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const removeUser = (user_id) => {
    if (!confirm('Xóa người dùng này? Hành động này không thể hoàn tác.')) return;
    // Local delete disabled - use server API instead
    alert('Tính năng xóa người dùng cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ.');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'USER': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'BANNED': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quản trị - Người dùng</h2>
        <div>
          <Link to="/admin/products" className="btn btn-outline-secondary me-2">Sản phẩm</Link>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Danh mục</Link>
          <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Thương hiệu</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/users')}>Làm mới</button>
        </div>
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
                placeholder="Tìm người dùng theo tên, email, điện thoại, vai trò hoặc trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6 text-end">
            <small className="text-muted">
              Hiển thị {filteredUsers.length} trên {users.length} người dùng
            </small>
          </div>
        </div>
      </div>

      {/* User Creation/Edit Form */}
      <div className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
        <h4>{editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</h4>
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
              <label className="form-label">Họ và tên *</label>
              <input
                className="form-control"
                name="u_name"
                placeholder="Full Name"
                value={editingUser ? editingUser.u_name : userForm.u_name}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, u_name: e.target.value }) :
                  handleUserChange
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-control"
                name="phone_number"
                placeholder="0123456789"
                maxLength="13"
                value={editingUser ? (editingUser.phone_number || '') : userForm.phone_number}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, phone_number: e.target.value }) :
                  handleUserChange
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Vai trò</label>
              <select
                className="form-select"
                name="role"
                value={editingUser ? editingUser.role : userForm.role}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, role: e.target.value }) :
                  handleUserChange
                }
              >
                <option value="USER">Người dùng</option>
                <option value="ADMIN">Quản trị</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                name="status"
                value={editingUser ? editingUser.status : userForm.status}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, status: e.target.value }) :
                  handleUserChange
                }
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="BANNED">Bị cấm</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-control"
                name="date_of_birth"
                type="date"
                value={editingUser ? (editingUser.date_of_birth || '') : userForm.date_of_birth}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, date_of_birth: e.target.value }) :
                  handleUserChange
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mật khẩu {!editingUser && '*'}</label>
              <input
                className="form-control"
                name="password"
                type="password"
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                value={editingUser ? (editingUser.password || '') : userForm.password}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, password: e.target.value }) :
                  handleUserChange
                }
                required={!editingUser}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Địa chỉ</label>
              <textarea
                className="form-control"
                name="address"
                placeholder="Full address"
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
                  <button className="btn btn-success" type="submit">Cập nhật người dùng</button>
                  <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Hủy</button>
                </div>
              ) : (
                <button className="btn btn-orange" type="submit">Tạo người dùng</button>
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
              {searchTerm ? `Không tìm thấy người dùng phù hợp "${searchTerm}"` : 'Không có người dùng'}
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
            <div key={user.user_id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-3">{user.u_name}</h5>
                    <span className={`badge bg-${getRoleColor(user.role)} me-2`}>{user.role}</span>
                    <span className={`badge bg-${getStatusColor(user.status)}`}>{user.status}</span>
                  </div>
                  <div className="text-muted small mb-1">
                    <strong>Email:</strong> {user.email}
                  </div>
                  {user.phone_number && (
                    <div className="text-muted small mb-1">
                      <strong>Phone:</strong> {user.phone_number}
                    </div>
                  )}
                  {user.date_of_birth && (
                    <div className="text-muted small mb-1">
                      <strong>Birth Date:</strong> {new Date(user.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                  {user.address && (
                    <div className="text-muted small">
                      <strong>Address:</strong> {user.address.length > 100 ? `${user.address.substring(0, 100)}...` : user.address}
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => startEditUser(user)}
                    disabled={editingUser && editingUser.user_id === user.user_id}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeUser(user.user_id)}
                  >
                    Xóa
                  </button>
                  <Link
                    to={`/admin/users/${user.user_id}`}
                    className="btn btn-sm btn-primary"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}