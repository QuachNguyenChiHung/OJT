import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const USERS_KEY = 'admin_users_v1';
const ORDERS_KEY = 'admin_orders_v1';
const ORDER_DETAILS_KEY = 'admin_order_details_v1';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data
    const usersRaw = localStorage.getItem(USERS_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const foundUser = users.find(u => u.user_id === id);
      setUser(foundUser || null);
    }

    // Load orders data
    const ordersRaw = localStorage.getItem(ORDERS_KEY);
    let orders = [];
    if (ordersRaw) {
      orders = JSON.parse(ordersRaw);
    } else {
      // Create sample orders for demo
      orders = [
        {
          o_id: `order_${Date.now()}_1`,
          u_id: id,
          status: 'DELIVERED',
          date_created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_price: 299.99
        },
        {
          o_id: `order_${Date.now()}_2`,
          u_id: id,
          status: 'PROCESSING',
          date_created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_price: 159.50
        },
        {
          o_id: `order_${Date.now()}_3`,
          u_id: id,
          status: 'PENDING',
          date_created: new Date().toISOString(),
          total_price: 89.99
        }
      ];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    // Filter orders for this user
    const userSpecificOrders = orders.filter(order => order.u_id === id);
    setUserOrders(userSpecificOrders);

    // Load order details
    const orderDetailsRaw = localStorage.getItem(ORDER_DETAILS_KEY);
    let allOrderDetails = [];
    if (orderDetailsRaw) {
      allOrderDetails = JSON.parse(orderDetailsRaw);
    } else {
      // Create sample order details for demo
      allOrderDetails = userSpecificOrders.flatMap(order => [
        {
          od_id: `od_${order.o_id}_1`,
          o_id: order.o_id,
          pd_id: 'product_1',
          quantity: 2,
          price: 79.99,
          product_name: 'Premium T-Shirt',
          product_size: 'L',
          product_color: 'Navy Blue'
        },
        {
          od_id: `od_${order.o_id}_2`,
          o_id: order.o_id,
          pd_id: 'product_2',
          quantity: 1,
          price: 129.99,
          product_name: 'Denim Jeans',
          product_size: 'M',
          product_color: 'Dark Blue'
        }
      ]);
      localStorage.setItem(ORDER_DETAILS_KEY, JSON.stringify(allOrderDetails));
    }

    // Group order details by order ID
    const groupedDetails = {};
    allOrderDetails.forEach(detail => {
      if (!groupedDetails[detail.o_id]) {
        groupedDetails[detail.o_id] = [];
      }
      groupedDetails[detail.o_id].push(detail);
    });
    setOrderDetails(groupedDetails);
  }, [id]);

  const handleEditUser = () => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser.email.trim() || !editingUser.u_name.trim()) {
      alert('Email và tên là bắt buộc');
      return;
    }
    // Local update disabled - use server API instead
    alert('Tính năng cập nhật người dùng cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ.');
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

  const toggleOrderDetails = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const calculateOrderTotal = (orderId) => {
    const details = orderDetails[orderId] || [];
    return details.reduce((total, detail) => total + (detail.quantity * detail.price), 0).toFixed(2);
  };

  if (!user) {
    return (
      <div className="container py-4">
        <p>Không tìm thấy người dùng. <Link to="/admin/users">Quay về danh sách người dùng</Link></p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Chi tiết người dùng</h2>
        <div>
          <button
            className="btn btn-outline-success me-2"
            onClick={editingUser ? cancelEdit : handleEditUser}
          >
            {editingUser ? 'Hủy chỉnh sửa' : 'Chỉnh sửa người dùng'}
          </button>
          <Link to="/admin/users" className="btn btn-outline-secondary">Quay lại danh sách</Link>
        </div>
      </div>

      <div className="row">
        {/* User Information */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Thông tin người dùng</h5>
            </div>
            <div className="card-body">
              {editingUser ? (
                <form onSubmit={handleUpdateUser}>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      className="form-control"
                      value={editingUser.u_name}
                      onChange={(e) => setEditingUser({ ...editingUser, u_name: e.target.value })}
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
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-control"
                      value={editingUser.phone_number || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vai trò</label>
                    <select
                      className="form-select"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="USER">Người dùng</option>
                      <option value="ADMIN">Quản trị</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                      <option value="BANNED">Bị cấm</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      className="form-control"
                      type="date"
                      value={editingUser.date_of_birth || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingUser.address || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Hủy</button>
                  </div>
                </form>
              ) : (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: '40%' }}>Mã người dùng:</th>
                      <td>{user.user_id}</td>
                    </tr>
                    <tr>
                      <th>Họ và tên:</th>
                      <td>{user.u_name}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <th>Số điện thoại:</th>
                      <td>{user.phone_number || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Vai trò:</th>
                      <td><span className={`badge bg-${getRoleColor(user.role)}`}>{user.role}</span></td>
                    </tr>
                    <tr>
                      <th>Trạng thái:</th>
                      <td><span className={`badge bg-${getUserStatusColor(user.status)}`}>{user.status}</span></td>
                    </tr>
                    <tr>
                      <th>Ngày sinh:</th>
                      <td>{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Địa chỉ:</th>
                      <td>{user.address || 'N/A'}</td>
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
              <h5 className="mb-0">Lịch sử đơn hàng</h5>
              <span className="badge bg-info">{userOrders.length} đơn</span>
            </div>
            <div className="card-body">
              {userOrders.length === 0 ? (
                <p className="text-muted">Không tìm thấy đơn hàng cho người dùng này.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {userOrders.map((order) => (
                    <div key={order.o_id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center mb-2">
                            <strong className="me-2">Order #{order.o_id.substring(0, 8)}...</strong>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                          <div className="small text-muted mb-1">
                            Ngày: {new Date(order.date_created).toLocaleDateString()}
                          </div>
                          <div className="small text-muted">
                            Tổng: <strong>${order.total_price}</strong>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleOrderDetails(order.o_id)}
                        >
                          {selectedOrder === order.o_id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                        </button>
                      </div>

                      {/* Order Details */}
                      {selectedOrder === order.o_id && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="mb-3">Chi tiết đơn hàng:</h6>
                          {orderDetails[order.o_id] && orderDetails[order.o_id].length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Sản phẩm</th>
                                    <th>Kích thước</th>
                                    <th>Màu</th>
                                    <th>Số</th>
                                    <th>Giá</th>
                                    <th>Tạm tính</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderDetails[order.o_id].map((detail) => (
                                    <tr key={detail.od_id}>
                                      <td>
                                        <div className="small">
                                          <strong>{detail.product_name || 'Product'}</strong>
                                        </div>
                                      </td>
                                      <td><span className="badge bg-secondary">{detail.product_size || 'N/A'}</span></td>
                                      <td><span className="badge bg-info">{detail.product_color || 'N/A'}</span></td>
                                      <td>{detail.quantity}</td>
                                      <td>${detail.price}</td>
                                      <td><strong>${(detail.quantity * detail.price).toFixed(2)}</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="table-active">
                                    <td colSpan="5"><strong>Tổng:</strong></td>
                                    <td><strong>${calculateOrderTotal(order.o_id)}</strong></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          ) : (
                            <p className="text-muted small">Không có chi tiết đơn hàng.</p>
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
              <h5 className="mb-0">Thống kê đơn hàng</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h4 className="text-primary">{userOrders.length}</h4>
                  <p className="text-muted mb-0">Tổng đơn hàng</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-success">
                    ${userOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0).toFixed(2)}
                  </h4>
                  <p className="text-muted mb-0">Tổng chi tiêu</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">
                    {userOrders.filter(order => order.status === 'DELIVERED').length}
                  </h4>
                  <p className="text-muted mb-0">Đơn đã hoàn thành</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-warning">
                    {userOrders.filter(order => ['PENDING', 'PROCESSING', 'SHIPPING'].includes(order.status)).length}
                  </h4>
                  <p className="text-muted mb-0">Đơn đang xử lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}