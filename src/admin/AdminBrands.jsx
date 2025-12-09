import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';



export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/brands`);
      setBrands(response.data);
    }
    catch (error) {
      alert('Không thể tải thương hiệu');
    }
  }
  useEffect(() => {
    fetchBrands();
  }, []);


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

  // Filter brands based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brandId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/brands`, { brandName: name.trim() }, { withCredentials: true });
      // assume API returns created brand
      setBrands(b => [res.data, ...b]);
      setName('');
      alert('Thêm thương hiệu thành công');
    } catch (err) {
      console.error('Add brand failed', err);
      alert('Không thể thêm thương hiệu');
    }
  };

  const remove = async (brandId) => {
    if (!confirm('Xóa brand?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/brands/${brandId}`, { withCredentials: true });
      setBrands((b) => b.filter(x => x.brandId !== brandId));
      alert('Xóa thương hiệu thành công');
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa thương hiệu');
      console.error('Delete brand failed', err);
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.brandId);
    setEditingName(brand.brandName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (brandId) => {
    if (!editingName.trim()) return alert('Tên thương hiệu không được để trống');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/brands/${brandId}`, { brandName: editingName.trim() }, { withCredentials: true });
      setBrands(b => b.map(item => item.brandId === brandId ? res.data : item));
      cancelEdit();
      alert('Cập nhật thương hiệu thành công');
    } catch (err) {
      console.error('Update brand failed', err);
      alert('Không thể cập nhật thương hiệu');
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quản Trị - Thương Hiệu</h2>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary me-2">Người Dùng</Link>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Danh Mục</Link>
          <Link to="/admin/orders" className="btn btn-outline-secondary me-2">Đơn Hàng</Link>
          <Link to="/admin/products" className="btn btn-outline-secondary">Sản Phẩm</Link>
        </div>
      </div>
      {/* inline editing (Edit toggles row into input) */}

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
                placeholder="Tìm kiếm thương hiệu theo tên hoặc ID..."
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
              Hiển thị {filteredBrands.length} trong tổng số {brands.length} thương hiệu
            </small>
          </div>
        </div>
      </div>

      <form onSubmit={add} className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder="Tên thương hiệu mới"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button className="btn btn-#06BAE9" type="submit">Thêm Thương Hiệu</button>
      </form>

      <div className="list-group">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `Không tìm thấy thương hiệu nào khớp với "${searchTerm}"` : 'Không có thương hiệu nào'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm để hiển thị tất cả thương hiệu
              </button>
            )}
          </div>
        ) : (
          filteredBrands.map(b => (
            <div key={b.brandId} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ flex: 1 }}>
                {editingId === b.brandId ? (
                  <input
                    className="form-control"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(b.brandId)}
                    autoFocus
                  />
                ) : (
                  <div>
                    <strong>{b.brandName}</strong>
                    <div className="text-muted small">ID: {b.brandId}</div>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {editingId === b.brandId ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => saveEdit(b.brandId)}>Lưu</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(b)}>Sửa</button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(b.brandId)}
                      title="Xóa thương hiệu"
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
