import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
      console.debug('UserDetails auth check:', {
        role: res?.data?.role,
        isAdmin: res?.data?.role === 'ADMIN',
        willRedirect: res?.data?.role !== 'ADMIN'
      });
      if (res?.data.role !== 'ADMIN') {
        console.debug('UserDetails: Redirecting to /login - not admin');
        navigate('/login');
        return;
      }
      // Remove setCurrentUser since we're not using currentUser state anymore
    } catch (error) {
      console.debug('UserDetails: Error fetching user, redirecting to /login:', error.message);
      navigate('/login');
    }
  }
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    // Load user data from API
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      }
    };
    fetchUser();

    // Load orders data from API
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/user/${id}`, { withCredentials: true });
        const orders = res.data || [];
        setUserOrders(orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setUserOrders([]);
      }
    };
    fetchOrders();
  }, [id]);

  const handleEditUser = () => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.email.trim() || !editingUser.fullName.trim()) {
      alert('Email và họ tên là bắt buộc');
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

    try {
      const payload = {
        email: editingUser.email.trim(),
        fullName: editingUser.fullName.trim(),
        phoneNumber: editingUser.phoneNumber?.trim() || null,
        role: editingUser.role,
        isActive: Boolean(editingUser.active),
        dateOfBirth: editingUser.dateOfBirth || null,
        address: editingUser.address?.trim() || null
      };

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/${editingUser.id}`, payload, { withCredentials: true });
      setUser(res.data);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Không thể cập nhật người dùng');
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'SHIPPING': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getVietnameseStatus = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ Xử Lý';
      case 'PROCESSING': return 'Đang Xử Lý';
      case 'SHIPPING': return 'Đang Giao';
      case 'DELIVERED': return 'Đã Giao';
      case 'CANCELLED': return 'Đã Hủy';
      default: return status;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'USER': return 'primary';
      default: return 'secondary';
    }
  };

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'BANNED': return 'danger';
      default: return 'secondary';
    }
  };

  const toggleOrderDetails = async (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      return;
    }

    setSelectedOrder(orderId);

    // Fetch order details if not already loaded
    if (!orderDetails[orderId]) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}/details`, { withCredentials: true });
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: res.data || []
        }));
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: []
        }));
      }
    }
  };

  if (!user) {
    return (
      <div className="container py-4">
        <p>Không tìm thấy người dùng. <Link to="/admin/users">Quay lại danh sách người dùng</Link></p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Chi Tiết Người Dùng</h2>
        <div>
          <button
            className="btn btn-outline-success me-2"
            onClick={editingUser ? cancelEdit : handleEditUser}
          >
            {editingUser ? 'Hủy Chỉnh Sửa' : 'Chỉnh Sửa Người Dùng'}
          </button>
          <Link to="/admin/users" className="btn btn-outline-secondary">Quay Lại Danh Sách</Link>
        </div>
      </div>

      <div className="row">
        {/* User Information */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Thông Tin Người Dùng</h5>
            </div>
            <div className="card-body">
              {editingUser ? (
                <form onSubmit={handleUpdateUser}>
                  <div className="mb-3">
                    <label className="form-label">Họ Tên *</label>
                    <input
                      className="form-control"
                      value={editingUser.fullName}
                      onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      className="form-control"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số Điện Thoại</label>
                    <input
                      className="form-control"
                      value={editingUser.phoneNumber || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
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
                  <div className="mb-3">
                    <label className="form-label">Trạng Thái</label>
                    <select
                      className="form-select"
                      value={editingUser.active ? 'ACTIVE' : 'INACTIVE'}
                      onChange={(e) => setEditingUser({ ...editingUser, active: e.target.value === 'ACTIVE' })}
                    >
                      <option value="ACTIVE">Hoạt Động</option>
                      <option value="INACTIVE">Không Hoạt Động</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày Sinh (18-100 tuổi)</label>
                    <input
                      className="form-control"
                      type="date"
                      value={editingUser.dateOfBirth || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, dateOfBirth: e.target.value })}
                      min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                      max={new Date(new Date().getFullYear() - 18, 11, 31).toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa Chỉ</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingUser.address || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">Lưu Thay Đổi</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Hủy</button>
                  </div>
                </form>
              ) : (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: '40%' }}>Mã Người Dùng:</th>
                      <td>{user.id}</td>
                    </tr>
                    <tr>
                      <th>Họ Tên:</th>
                      <td>{user.fullName}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <th>Điện Thoại:</th>
                      <td>{user.phoneNumber || 'Chưa có'}</td>
                    </tr>
                    <tr>
                      <th>Vai Trò:</th>
                      <td><span className={`badge bg-${getRoleColor(user.role)}`}>{user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Người Dùng'}</span></td>
                    </tr>
                    <tr>
                      <th>Trạng Thái:</th>
                      <td><span className={`badge bg-${getUserStatusColor(user.active ? 'ACTIVE' : 'INACTIVE')}`}>{user.active ? 'Hoạt Động' : 'Không Hoạt Động'}</span></td>
                    </tr>
                    <tr>
                      <th>Ngày Sinh:</th>
                      <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa có'}</td>
                    </tr>
                    <tr>
                      <th>Địa Chỉ:</th>
                      <td>{user.address || 'Chưa có'}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Orders Information */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Lịch Sử Đơn Hàng</h5>
              <span className="badge bg-info">{userOrders.length} Đơn Hàng</span>
            </div>
            <div className="card-body">
              {userOrders.length === 0 ? (
                <p className="text-muted">Không tìm thấy đơn hàng nào cho người dùng này.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {userOrders.map((order) => (
                    <div key={order.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center mb-2">
                            <strong className="me-2">Đơn Hàng #{order.id.substring(0, 8)}...</strong>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>{getVietnameseStatus(order.status)}</span>
                          </div>
                          <div className="small text-muted mb-1">
                            Ngày: {new Date(order.dateCreated * 1000).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="small text-muted">
                            Tổng: <strong>{order.total.toLocaleString('vi-VN')}₫</strong> ({order.itemCount} sản phẩm)
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          {selectedOrder === order.id ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}
                        </button>
                      </div>

                      {/* Order Details */}
                      {selectedOrder === order.id && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="mb-3">Chi Tiết Đơn Hàng:</h6>
                          {orderDetails[order.id] && orderDetails[order.id].length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Sản Phẩm</th>
                                    <th>Số Lượng</th>
                                    <th>Đơn Giá</th>
                                    <th>Thành Tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderDetails[order.id].map((detail, index) => (
                                    <tr key={detail.productDetailsId || index}>
                                      <td>
                                        <div className="small">
                                          <strong>{detail.productName || 'Sản phẩm'}</strong>
                                        </div>
                                      </td>
                                      <td>{detail.quantity}</td>
                                      <td>{detail.unitPrice.toLocaleString('vi-VN')}₫</td>
                                      <td><strong>{detail.subtotal.toLocaleString('vi-VN')}₫</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="table-active">
                                    <td colSpan="3"><strong>Tổng Cộng:</strong></td>
                                    <td><strong>{orderDetails[order.id].reduce((sum, detail) => sum + detail.subtotal, 0).toLocaleString('vi-VN')}₫</strong></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          ) : orderDetails[order.id] ? (
                            <p className="text-muted small">Không có chi tiết đơn hàng.</p>
                          ) : (
                            <p className="text-muted small">Đang tải chi tiết đơn hàng...</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Thống Kê Đơn Hàng</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h4 className="text-primary">{userOrders.length}</h4>
                  <p className="text-muted mb-0">Tổng Đơn Hàng</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-success">
                    {userOrders.reduce((sum, order) => sum + parseFloat(order.total), 0).toLocaleString('vi-VN')}₫
                  </h4>
                  <p className="text-muted mb-0">Tổng Chi Tiêu</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">
                    {userOrders.filter(order => order.status === 'DELIVERED').length}
                  </h4>
                  <p className="text-muted mb-0">Đơn Hoàn Thành</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-warning">
                    {userOrders.filter(order => ['PENDING', 'PROCESSING', 'SHIPPING'].includes(order.status)).length}
                  </h4>
                  <p className="text-muted mb-0">Đơn Đang Xử Lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}