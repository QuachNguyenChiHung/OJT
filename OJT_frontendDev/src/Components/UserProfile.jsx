import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      // First get current user to get the ID
      const authRes = await api.get('/auth/me');
      if (!authRes.data) {
        navigate('/login');
        return;
      }

      // /auth/me returns userId (not u_id)
      const userId = authRes.data.userId || authRes.data.u_id;
      
      // Then get user details
      const userRes = await api.get(`/users/${userId}`);
      setUser(userRes.data);
      setError(null);
    } catch (err) {
      console.error('Không thể tải thông tin người dùng:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <div className="alert alert-danger text-center">
          <h4>Lỗi</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <div className="alert alert-warning text-center">
          <h4>Không tìm thấy thông tin người dùng</h4>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Thông Tin Cá Nhân</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/')}
        >
          Quay Về Trang Chủ
        </button>
      </div>

      {/* User Profile Card */}
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-user me-2"></i>
            Thông Tin Tài Khoản
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '40%' }}>ID:</td>
                    <td>{user.id}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Email:</td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Họ và tên:</td>
                    <td>{user.fullName || 'Chưa có thông tin'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '40%' }}>Số điện thoại:</td>
                    <td>{user.phoneNumber || 'Chưa có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Địa chỉ:</td>
                    <td>{user.address || 'Chưa có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Ngày sinh:</td>
                    <td>{formatDate(user.dateOfBirth)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="mt-4 text-center">
        <button
          className="btn btn-success btn-lg px-5"
          onClick={() => navigate('/update-profile')}
        >
          <i className="fas fa-edit me-2"></i>
          Cập Nhật Thông Tin
        </button>
      </div>
    </div>
  );
}