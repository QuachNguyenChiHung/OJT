import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [flatCats, setFlatCats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingParentId, setEditingParentId] = useState('');
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      // Get flat list for parent dropdown
      const flatRes = await api.get('/categories?flat=true');
      const flatData = Array.isArray(flatRes.data) ? flatRes.data : [];
      setFlatCats(flatData);

      // Get tree structure for display
      const treeRes = await api.get('/categories');
      const treeData = Array.isArray(treeRes.data) ? treeRes.data : [];
      setCats(treeData);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setCats([]);
      setFlatCats([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN') {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/categories', { 
        name: name.trim(),
        parentId: parentId || null
      });
      setName('');
      setParentId('');
      fetchCategories();
    } catch (error) {
      console.error('Add category failed', error);
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Không thể thêm danh mục';
      alert(msg);
    }
  };

  const remove = async (id) => {
    const cat = flatCats.find(c => c.id === id);
    const childCount = flatCats.filter(c => c.parentId === id).length;
    const confirmMsg = childCount > 0 
      ? `Xóa "${cat?.name}" và ${childCount} danh mục con?\n\n⚠️ Tất cả danh mục con cũng sẽ bị xóa!`
      : `Xóa danh mục "${cat?.name}"?`;
    
    if (!confirm(confirmMsg)) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Delete category failed', error);
      alert(error?.response?.data?.error || error?.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingParentId(cat.parentId || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingParentId('');
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return alert('Tên danh mục không được để trống');
    try {
      await api.put(`/categories/${id}`, { 
        name: editingName.trim(),
        parentId: editingParentId || null
      });
      fetchCategories();
      cancelEdit();
    } catch (error) {
      console.error('Update category failed', error);
      alert(error?.response?.data?.message || 'Không thể cập nhật danh mục');
    }
  };

  // Render category tree recursively
  const renderCategory = (cat, depth = 0) => {
    const matchesSearch = !searchTerm || 
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = cat.children?.some(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.children?.some(cc => cc.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!matchesSearch && !childrenMatch) return null;

    return (
      <div key={cat.id}>
        <div 
          className="list-group-item d-flex justify-content-between align-items-center"
          style={{ paddingLeft: `${20 + depth * 30}px` }}
        >
          <div style={{ flex: 1 }}>
            {editingId === cat.id ? (
              <div className="d-flex gap-2 align-items-center">
                <input
                  className="form-control form-control-sm"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
                <select
                  className="form-select form-select-sm"
                  value={editingParentId}
                  onChange={e => setEditingParentId(e.target.value)}
                  style={{ maxWidth: 200 }}
                >
                  <option value="">-- Không có parent --</option>
                  {flatCats.filter(c => c.id !== cat.id).map(c => (
                    <option key={c.id} value={c.id}>
                      {'  '.repeat(c.level || 0)}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <span style={{ color: depth === 0 ? '#008B8B' : depth === 1 ? '#333' : '#666' }}>
                  {depth > 0 && '└─ '}
                  <strong>{cat.name}</strong>
                </span>
                <span className="badge bg-secondary ms-2">Level {cat.level || 0}</span>
                {cat.children?.length > 0 && (
                  <span className="badge bg-info ms-1">{cat.children.length} con</span>
                )}
              </div>
            )}
          </div>
          <div className="d-flex gap-1">
            {editingId === cat.id ? (
              <>
                <button className="btn btn-sm btn-success" onClick={() => saveEdit(cat.id)}>✓</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>✕</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(cat)}>✏️</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(cat.id)}>🗑️</button>
              </>
            )}
          </div>
        </div>
        {cat.children?.map(child => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <AdminLayout title="Quản Lý Danh Mục (Phân Cấp)">
      <div style={{ maxWidth: 900 }}>
        {/* Add Form */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Thêm Danh Mục Mới</h6>
            <form onSubmit={add} className="row g-2">
              <div className="col-md-5">
                <input
                  className="form-control"
                  placeholder="Tên danh mục (VD: Quần dài)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-5">
                <select
                  className="form-select"
                  value={parentId}
                  onChange={e => setParentId(e.target.value)}
                >
                  <option value="">-- Danh mục gốc (Level 0) --</option>
                  {flatCats.map(c => (
                    <option key={c.id} value={c.id}>
                      {'  '.repeat(c.level || 0)}{c.name} (Level {c.level || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn w-100" style={{ background: '#008B8B', color: '#fff' }} type="submit">
                  + Thêm
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Tree */}
        <div className="list-group">
          {cats.length === 0 ? (
            <div className="text-center py-4 text-muted">Chưa có danh mục nào</div>
          ) : (
            cats.map(cat => renderCategory(cat))
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 p-2 bg-light rounded small">
          <strong>Cấu trúc phân cấp:</strong> Level 0 (Giới tính: Nam/Nữ) → Level 1 (Loại: Áo/Quần) → Level 2 (Chi tiết: Quần dài/Quần short)
        </div>
      </div>
    </AdminLayout>
  );
}
