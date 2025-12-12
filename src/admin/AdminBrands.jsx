import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';



export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();
  
  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      // Handle both array and object response
      const data = Array.isArray(response.data) ? response.data : (response.data?.brands || []);
      setBrands(data);
    }
    catch (error) {
      console.error('Fetch brands error:', error);
      setBrands([]);
    }
  }
  useEffect(() => {
    fetchBrands();
  }, []);


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

  // Filter brands based on search term
  useEffect(() => {
    const brandList = Array.isArray(brands) ? brands : [];
    if (!searchTerm.trim()) {
      setFilteredBrands(brandList);
    } else {
      const filtered = brandList.filter(brand =>
        (brand.brandName || brand.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.brandId || brand.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await api.post('/brands', { brandName: name.trim() });
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
      await api.delete(`/brands/${brandId}`);
      setBrands((b) => b.filter(x => (x.brandId || x.id) !== brandId));
      alert('Xóa thương hiệu thành công');
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa thương hiệu');
      console.error('Delete brand failed', err);
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.brandId || brand.id);
    setEditingName(brand.brandName || brand.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (brandId) => {
    if (!editingName.trim()) return alert('Tên thương hiệu không được để trống');
    try {
      const res = await api.put(`/brands/${brandId}`, { brandName: editingName.trim() });
      setBrands(b => b.map(item => (item.brandId || item.id) === brandId ? res.data : item));
      cancelEdit();
      alert('Cập nhật thương hiệu thành công');
    } catch (err) {
      console.error('Update brand failed', err);
      alert('Không thể cập nhật thương hiệu');
    }
  };

  return (
    <AdminLayout title="Quản Lý Thương Hiệu">
      <div style={{ maxWidth: 1200 }}>

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
        <button className="btn" style={{ background: '#008B8B', color: '#fff' }} type="submit">Thêm Thương Hiệu</button>
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
          filteredBrands.map(b => {
            const bId = b.brandId || b.id;
            const bName = b.brandName || b.name;
            return (
              <div key={bId} className="list-group-item d-flex justify-content-between align-items-center">
                <div style={{ flex: 1 }}>
                  {editingId === bId ? (
                    <input
                      className="form-control"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(bId)}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <strong>{bName}</strong>
                      <div className="text-muted small">ID: {bId}</div>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {editingId === bId ? (
                    <>
                      <button className="btn btn-sm btn-success" onClick={() => saveEdit(bId)}>Lưu</button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(b)}>Sửa</button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove(bId)}
                        title="Xóa thương hiệu"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
