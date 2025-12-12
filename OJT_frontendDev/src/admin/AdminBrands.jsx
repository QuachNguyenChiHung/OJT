import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';
import { useToast } from '../Components/Toast';

export default function AdminBrands() {
  const toast = useToast();
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
      toast.warning('Thêm thương hiệu thành công');
    } catch (err) {
      console.error('Add brand failed', err);
      toast.warning('Không thể thêm thương hiệu');
    }
  };

  const remove = async (brandId) => {
    if (!confirm('Xóa brand?')) return;
    try {
      await api.delete(`/brands/${brandId}`);
      setBrands((b) => b.filter(x => (x.brandId || x.id) !== brandId));
      toast.success('Xóa thương hiệu thành công');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa thương hiệu');
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
    if (!editingName.trim()) return toast.warning('Tên thương hiệu không được để trống');
    try {
      const res = await api.put(`/brands/${brandId}`, { brandName: editingName.trim() });
      setBrands(b => b.map(item => (item.brandId || item.id) === brandId ? res.data : item));
      cancelEdit();
      toast.warning('Cập nhật thương hiệu thành công');
    } catch (err) {
      console.error('Update brand failed', err);
      toast.warning('Không thể cập nhật thương hiệu');
    }
  };

  return (
    <AdminLayout title="Quản Lý Thương Hiệu">
      <div style={{ maxWidth: 1000 }}>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}>
              🏷️
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b' }}>{brands.length}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Tổng thương hiệu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <h6 style={{ marginBottom: 16, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>➕</span> Thêm Thương Hiệu Mới
        </h6>
        <form onSubmit={add} className="d-flex gap-3">
          <input
            className="form-control"
            placeholder="Nhập tên thương hiệu..."
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              padding: '12px 16px',
              fontSize: 14,
              flex: 1,
            }}
          />
          <button 
            style={{ 
              background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', 
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 600,
              border: 'none',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }} 
            type="submit"
          >
            + Thêm Thương Hiệu
          </button>
        </form>
      </div>

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
                placeholder="Tìm kiếm thương hiệu..."
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
              📊 {filteredBrands.length} / {brands.length}
            </span>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
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
          🏷️ Danh Sách Thương Hiệu
        </div>
        
        {filteredBrands.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#64748b', marginBottom: 12 }}>
              {searchTerm ? `Không tìm thấy thương hiệu nào khớp với "${searchTerm}"` : 'Không có thương hiệu nào'}
            </div>
            {searchTerm && (
              <button
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="row g-0">
            {filteredBrands.map((b, idx) => {
              const bId = b.brandId || b.id;
              const bName = b.brandName || b.name;
              return (
                <div key={bId} className="col-md-6">
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    borderRight: idx % 2 === 0 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                  }}>
                    <div style={{ flex: 1 }}>
                      {editingId === bId ? (
                        <input
                          className="form-control"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(bId)}
                          autoFocus
                          style={{ borderRadius: 10, fontSize: 14 }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: `hsl(${(bName.charCodeAt(0) * 10) % 360}, 70%, 95%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: `hsl(${(bName.charCodeAt(0) * 10) % 360}, 70%, 45%)`,
                            fontSize: 16,
                          }}>
                            {bName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{bName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {bId.substring(0, 8)}...</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      {editingId === bId ? (
                        <>
                          <button 
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                            onClick={() => saveEdit(bId)}
                          >
                            ✓ Lưu
                          </button>
                          <button 
                            style={{
                              background: '#f1f5f9',
                              color: '#64748b',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                            onClick={cancelEdit}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            style={{
                              background: '#f1f5f9',
                              color: '#0d9488',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                            onClick={() => startEdit(b)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                            onClick={() => remove(bId)}
                          >
                            🗑️ Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
