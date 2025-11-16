import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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
  const [currentUser, setCurrentUser] = useState({
    email: '',
    fullName: '',
    role: '',
    phoneNumber: '',
    address: ''
  });
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
      if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
        navigate('/login');
        return;
      }
      setCurrentUser(res.data);
    } catch (error) {
      navigate('/login');
    }
  }
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${base}/users`, { withCredentials: true });
        const data = res?.data;
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          return;
        }
      } catch (err) {
        // ignore network/backend errors and fallback to local sample data
      }

      // Seed sample data as last resort (use fixed ids so generateId is not required here)

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
      alert('Email and name are required');
      return;
    }

    // Check if email already exists locally
    const emailExists = users.some(user => user.email.toLowerCase() === userForm.email.toLowerCase());
    if (emailExists) {
      alert('Email already exists');
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users`, payload, { withCredentials: true });
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
      // Fallback to local add with the payload (server unavailable or validation failed)
      setUsers((u) => [{
        ...payload,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
        // default to active for local fallback
        active: true
      }, ...u]);
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
      alert('Failed to create user on server; added locally');
    }
  };

  const startEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.email.trim() || !editingUser.fullName.trim()) {
      alert('Email and name are required');
      return;
    }

    // Check if email already exists (excluding current user)
    const emailExists = users.some(user =>
      user.id !== editingUser.id &&
      user.email.toLowerCase() === editingUser.email.toLowerCase()
    );
    if (emailExists) {
      alert('Email already exists');
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
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/${editingUser.id}`, payload, { withCredentials: true });
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
      } else {
        // fallback: update locally
        setUsers(users => users.map(u => u.id === editingUser.id ? ({
          ...u,
          email: editingUser.email.trim(),
          phoneNumber: editingUser.phoneNumber?.trim() || null,
          fullName: editingUser.fullName.trim(),
          address: editingUser.address?.trim() || null,
          role: editingUser.role,
          active: Boolean(editingUser.active),
          dateOfBirth: editingUser.dateOfBirth || null
        }) : u));
      }
      setEditingUser(null);
    } catch (err) {
      console.error('Update user failed', err);
      alert('Failed to update user on server; updated locally');
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
    if (!confirm('Delete this user? This action cannot be undone.')) return;
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
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Users Management</h2>
        <div>
          <Link to="/admin/products" className="btn btn-outline-secondary me-2">Products</Link>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Categories</Link>
          <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Brands</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/users')}>Refresh</button>
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
                placeholder="Search users by name, email, phone, role, or status..."
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
              Showing {filteredUsers.length} of {users.length} users
            </small>
          </div>
        </div>
      </div>

      {/* User Creation/Edit Form */}
      <div className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
        <h4>{editingUser ? 'Edit User' : 'Create New User'}</h4>
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
              <label className="form-label">Full Name *</label>
              <input
                className="form-control"
                name="fullName"
                placeholder="Full Name"
                value={editingUser ? editingUser.fullName : userForm.fullName}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, fullName: e.target.value }) :
                  handleUserChange
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone Number</label>
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
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={editingUser ? editingUser.role : userForm.role}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, role: e.target.value }) :
                  handleUserChange
                }
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {editingUser && (
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="active"
                  value={editingUser ? String(editingUser.active) : String(userForm.active)}
                  onChange={editingUser ?
                    (e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' }) :
                    handleUserChange
                  }
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label">Date of Birth (18-100 years old)</label>
              <input
                className="form-control"
                name="dateOfBirth"
                type="date"
                value={editingUser ? (editingUser.dateOfBirth || '') : userForm.dateOfBirth}
                onChange={editingUser ?
                  (e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value }) :
                  handleUserChange
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password {!editingUser && '*'}</label>
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
              <label className="form-label">Address</label>
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
                  <button className="btn btn-success" type="submit">Update User</button>
                  <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-orange" type="submit">Create User</button>
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
              {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search to show all users
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center mb-2">
                    <h5 className="mb-0 me-3">{user.fullName || '(No name)'}</h5>
                    <span className={`badge bg-${getRoleColor(user.role)} me-2`}>{user.role}</span>
                    <span className={`badge bg-${getStatusColor(user.active)}`}>{user.active ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <div className="text-muted small mb-1">
                    <strong>Email:</strong> {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div className="text-muted small mb-1">
                      <strong>Phone:</strong> {user.phoneNumber}
                    </div>
                  )}
                  {user.dateOfBirth && (
                    <div className="text-muted small mb-1">
                      <strong>Birth Date:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}
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
                    disabled={editingUser && editingUser.id === user.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeUser(user.id)}
                  >
                    Delete
                  </button>
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    View Details
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