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
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const navigate = useNavigate();

  const toggleCollapse = (catId) => {
    setCollapsedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catId)) {
        newSet.delete(catId);
      } else {
        newSet.add(catId);
      }
      return newSet;
    });
  };

  // Helper to get all category IDs that have children (for collapsing)
  const getAllParentIds = (categories) => {
    const parentIds = new Set();
    const traverse = (cats) => {
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          parentIds.add(cat.id);
          traverse(cat.children);
        }
      });
    };
    traverse(categories);
    return parentIds;
  };

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
      
      // Collapse all categories with children by default
      const allParentIds = getAllParentIds(treeData);
      setCollapsedIds(allParentIds);
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

  // Level colors - Teal/Navy theme
  const levelColors = ['#0d9488', '#0891b2', '#0284c7', '#0369a1', '#075985'];

  // Render category tree recursively
  const renderCategory = (cat, depth = 0) => {
    const matchesSearch = !searchTerm || 
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = cat.children?.some(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.children?.some(cc => cc.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!matchesSearch && !childrenMatch) return null;

    const levelColor = levelColors[depth % levelColors.length];
    const hasChildren = cat.children?.length > 0;
    const isCollapsed = collapsedIds.has(cat.id);

    return (
      <div key={cat.id}>
        <div 
          style={{ 
            padding: '14px 20px',
            paddingLeft: `${20 + depth * 28}px`,
            borderBottom: '1px solid #f1f5f9',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            {editingId === cat.id ? (
              <div className="d-flex gap-2 align-items-center">
                <input
                  className="form-control form-control-sm"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  style={{ maxWidth: 200, borderRadius: 8 }}
                />
                <select
                  className="form-select form-select-sm"
                  value={editingParentId}
                  onChange={e => setEditingParentId(e.target.value)}
                  style={{ maxWidth: 200, borderRadius: 8 }}
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
              <>
                {/* Collapse/Expand button */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleCollapse(cat.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: 14,
                      color: levelColor,
                      transition: 'transform 0.2s ease',
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▼
                  </button>
                ) : (
                  <span style={{ width: 30, display: 'inline-block', textAlign: 'center', color: '#cbd5e1' }}>•</span>
                )}
                
                {/* Folder icon */}
                <span style={{ fontSize: 18 }}>
                  {hasChildren ? (isCollapsed ? '📁' : '📂') : '📄'}
                </span>
                
                <span style={{ 
                  color: '#1e293b', 
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  {cat.name}
                </span>
                <span style={{
                  background: `${levelColor}15`,
                  color: levelColor,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: 10,
                  fontWeight: 600,
                }}>
                  Level {cat.level || 0}
                </span>
                {hasChildren && (
                  <span style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: 10,
                    fontWeight: 600,
                  }}>
                    {cat.children.length} con
                  </span>
                )}
              </>
            )}
          </div>
          <div className="d-flex gap-2">
            {editingId === cat.id ? (
              <>
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  onClick={() => saveEdit(cat.id)}
                >
                  ✓ Lưu
                </button>
                <button 
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    padding: '6px 14px',
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
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => startEdit(cat)}
                >
                  ✏️
                </button>
                <button 
                  style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => remove(cat.id)}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
        {/* Children - only show if not collapsed */}
        {hasChildren && !isCollapsed && cat.children?.map(child => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <AdminLayout title="Quản Lý Danh Mục">
      <div style={{ maxWidth: 1000 }}>
        {/* Stats */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Tổng danh mục', value: flatCats.length, icon: '📂', color: '#0d9488' },
            { label: 'Level 0', value: flatCats.filter(c => c.level === 0).length, icon: '🏷️', color: '#0891b2' },
            { label: 'Level 1', value: flatCats.filter(c => c.level === 1).length, icon: '📁', color: '#0284c7' },
            { label: 'Level 2+', value: flatCats.filter(c => c.level >= 2).length, icon: '📄', color: '#0369a1' },
          ].map((stat, idx) => (
            <div key={idx} className="col-md-3">
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
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
            <span style={{ fontSize: 20 }}>➕</span> Thêm Danh Mục Mới
          </h6>
          <form onSubmit={add} className="row g-3">
            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Tên danh mục (VD: Quần dài)"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '12px 16px',
                  fontSize: 14,
                }}
              />
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '12px 16px',
                  fontSize: 14,
                }}
              >
                <option value="">🏠 Danh mục gốc (Level 0)</option>
                {flatCats.map(c => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.level || 0)}📁 {c.name} (Level {c.level || 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn w-100" 
                style={{ 
                  background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', 
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontWeight: 600,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                }} 
                type="submit"
              >
                + Thêm
              </button>
            </div>
          </form>
        </div>

        {/* Search */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm danh mục..."
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
          </div>
        </div>

        {/* Category Tree */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
            padding: '14px 20px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>📂 Cây Danh Mục</span>
            <span style={{ fontSize: 12, opacity: 0.9 }}>Click ▼ để thu gọn/mở rộng</span>
          </div>
          <div>
            {cats.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ color: '#64748b' }}>Chưa có danh mục nào</div>
              </div>
            ) : (
              cats.map(cat => renderCategory(cat))
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 24,
          padding: '14px 18px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <strong>Cấu trúc phân cấp:</strong> Level 0 (Giới tính) → Level 1 (Loại SP) → Level 2+ (Chi tiết)
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
