import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminHomeSections() {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '', displayOrder: 0, isActive: true });
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN') navigate('/login');
      } catch { navigate('/login'); }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sectionsRes, productsRes, catsRes] = await Promise.all([
        api.get('/home-sections'),
        api.get('/products'),
        api.get('/categories?flat=true')
      ]);
      setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
      const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      setProducts(rawProducts.map(p => ({
        id: p.id ?? p.p_id,
        name: p.name ?? p.p_name ?? p.PName,
        price: p.price,
        categoryId: p.categoryId || p.c_id,
        categoryName: p.categoryName,
        brandName: p.brandName,
        thumbnail1: p.thumbnail_1 || p.thumbnail1
      })));
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (err) {
      console.error('Fetch data failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const productsInSections = useMemo(() => {
    const ids = new Set();
    sections.forEach(s => s.products?.forEach(p => ids.add(p.id)));
    return ids;
  }, [sections]);

  const availableProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !searchTerm || 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || p.categoryId === filterCategory;
      const notInSection = !selectedSection?.products?.some(sp => sp.id === p.id);
      return matchSearch && matchCategory && notInSection;
    });
  }, [products, searchTerm, filterCategory, selectedSection]);

  const productsNotInAnySections = useMemo(() => {
    return products.filter(p => !productsInSections.has(p.id));
  }, [products, productsInSections]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const createSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) return alert('Tiêu đề là bắt buộc');
    try {
      const res = await api.post('/home-sections', {
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim(),
        displayOrder: parseInt(sectionForm.displayOrder) || 0,
        isActive: sectionForm.isActive
      });
      setSections(prev => [...prev, { ...res.data, products: [] }]);
      setSectionForm({ title: '', description: '', displayOrder: 0, isActive: true });
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  const startEdit = (section) => {
    setEditingSection(section);
    setSectionForm({ title: section.title, description: section.description || '', displayOrder: section.displayOrder || 0, isActive: section.isActive });
  };

  const updateSection = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/home-sections/${editingSection.id}`, {
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim(),
        displayOrder: parseInt(sectionForm.displayOrder) || 0,
        isActive: sectionForm.isActive
      });
      fetchData();
      setEditingSection(null);
      setSectionForm({ title: '', description: '', displayOrder: 0, isActive: true });
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  const deleteSection = async (id) => {
    if (!confirm('Xóa section này?')) return;
    try {
      await api.delete(`/home-sections/${id}`);
      setSections(prev => prev.filter(s => s.id !== id));
      if (selectedSection?.id === id) setSelectedSection(null);
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  const addProductToSection = async (productId) => {
    if (!selectedSection || !productId) return;
    try {
      await api.post(`/home-sections/${selectedSection.id}/products`, { productId, displayOrder: selectedSection.products?.length || 0 });
      const res = await api.get('/home-sections');
      setSections(Array.isArray(res.data) ? res.data : []);
      const updated = res.data.find(s => s.id === selectedSection.id);
      if (updated) setSelectedSection(updated);
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  const removeProductFromSection = async (productId) => {
    if (!selectedSection) return;
    try {
      await api.delete(`/home-sections/${selectedSection.id}/products/${productId}`);
      const res = await api.get('/home-sections');
      setSections(Array.isArray(res.data) ? res.data : []);
      const updated = res.data.find(s => s.id === selectedSection.id);
      if (updated) setSelectedSection(updated);
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setSectionForm({ title: '', description: '', displayOrder: 0, isActive: true });
  };

  // Di chuyển section lên/xuống
  const moveSection = async (sectionId, direction) => {
    const sortedSections = [...sections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedSections.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentSection = sortedSections[currentIndex];
    const swapSection = sortedSections[swapIndex];

    try {
      // Swap displayOrder values
      await Promise.all([
        api.put(`/home-sections/${currentSection.id}`, {
          title: currentSection.title,
          description: currentSection.description || '',
          displayOrder: swapSection.displayOrder || swapIndex,
          isActive: currentSection.isActive
        }),
        api.put(`/home-sections/${swapSection.id}`, {
          title: swapSection.title,
          description: swapSection.description || '',
          displayOrder: currentSection.displayOrder || currentIndex,
          isActive: swapSection.isActive
        })
      ]);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.error || err.message));
    }
  };

  if (loading) return <AdminLayout title="Quản Lý Trang Chủ"><div className="text-center p-5">Đang tải...</div></AdminLayout>;

  return (
    <AdminLayout title="Quản Lý Trang Chủ">
      <div style={{ maxWidth: 1400 }}>
        {/* Header với hướng dẫn */}
        <div style={{ 
          marginBottom: 24, 
          padding: 28, 
          borderRadius: 20, 
          background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', 
          color: '#fff',
          boxShadow: '0 10px 40px rgba(13, 148, 136, 0.3)',
        }}>
          <h4 style={{ marginBottom: 8, fontWeight: 700, fontSize: 22 }}>🏠 Cấu Hình Hiển Thị Trang Chủ</h4>
          <p style={{ marginBottom: 20, opacity: 0.85, fontSize: 14 }}>Quản lý các nhóm sản phẩm (sections) hiển thị trên trang chủ của website</p>
          
          <div className="row g-3">
            {[
              { num: 1, title: 'Tạo Section', desc: 'Tạo các nhóm sản phẩm như "Bán chạy", "Mới nhất"...' },
              { num: 2, title: 'Thêm Sản Phẩm', desc: 'Chọn section và thêm sản phẩm vào từ danh sách' },
              { num: 3, title: 'Sắp Xếp Thứ Tự', desc: 'Số thứ tự nhỏ hơn sẽ hiển thị trước trên trang chủ' },
            ].map((step, idx) => (
              <div key={idx} className="col-md-4">
                <div style={{ 
                  padding: 16, 
                  borderRadius: 14, 
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 10 }}>
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}>{step.num}</span>
                    <strong style={{ fontSize: 14 }}>{step.title}</strong>
                  </div>
                  <small style={{ opacity: 0.9, fontSize: 12 }}>{step.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Sections', value: sections.length, icon: '📂', color: '#0d9488', bg: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' },
            { label: 'SP trong sections', value: productsInSections.size, icon: '✅', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
            { label: 'SP chưa phân loại', value: productsNotInAnySections.length, icon: '⚠️', color: '#0891b2', bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' },
            { label: 'Tổng sản phẩm', value: products.length, icon: '📦', color: '#0d9488', bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' },
          ].map((stat, idx) => (
            <div key={idx} className="col-md-3">
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: `0 4px 12px ${stat.color}40`,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form tạo/sửa Section */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: editingSection ? '2px solid #0d9488' : '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 24px',
            background: editingSection ? 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' : '#f8fafc',
            color: editingSection ? '#fff' : '#1e293b',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{editingSection ? '✏️' : '➕'}</span>
            {editingSection ? 'Chỉnh Sửa Section' : 'Tạo Section Mới'}
          </div>
          <div style={{ padding: 24 }}>
            <form onSubmit={editingSection ? updateSection : createSection}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Tên Section *</label>
                  <input 
                    className="form-control" 
                    name="title" 
                    placeholder="VD: Sản phẩm bán chạy..." 
                    value={sectionForm.title} 
                    onChange={handleFormChange} 
                    required 
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0', padding: '10px 14px' }}
                  />
                </div>
                <div className="col-md-3">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Mô tả (tùy chọn)</label>
                  <input 
                    className="form-control" 
                    name="description" 
                    placeholder="Mô tả ngắn" 
                    value={sectionForm.description} 
                    onChange={handleFormChange} 
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0', padding: '10px 14px' }}
                  />
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6, display: 'block' }}>Thứ tự</label>
                  <input 
                    className="form-control" 
                    name="displayOrder" 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    value={sectionForm.displayOrder} 
                    onChange={handleFormChange} 
                    style={{ borderRadius: 10, border: '2px solid #e2e8f0', padding: '10px 14px' }}
                  />
                </div>
                <div className="col-md-1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      checked={sectionForm.isActive} 
                      onChange={handleFormChange}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Hiện</label>
                  </div>
                </div>
                <div className="col-md-2">
                  {editingSection ? (
                    <div className="d-flex gap-2">
                      <button style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }} type="submit">Lưu</button>
                      <button style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: 10,
                        cursor: 'pointer',
                      }} type="button" onClick={cancelEdit}>Hủy</button>
                    </div>
                  ) : (
                    <button style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                    }} type="submit">
                      Tạo Section
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Main Content - 3 columns */}
        <div className="row g-4">
          {/* Column 1: Danh sách Sections */}
          <div className="col-lg-4">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden',
              height: '100%',
            }}>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h6 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>📂 Danh Sách Sections</h6>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}>{sections.length}</span>
              </div>
              <div className="card-body p-0" style={{ maxHeight: 500, overflowY: 'auto' }}>
                {sections.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <div className="mb-2" style={{ fontSize: 48 }}>📭</div>
                    <p className="mb-0">Chưa có section nào</p>
                    <small>Tạo section đầu tiên ở form bên trên</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((section, index, sortedArr) => (
                      <div
                        key={section.id}
                        className={`list-group-item list-group-item-action p-3 ${selectedSection?.id === section.id ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedSection(section)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          {/* Nút di chuyển lên/xuống */}
                          <div className="d-flex flex-column me-2">
                            <button
                              className={`btn btn-sm p-0 ${index === 0 ? 'invisible' : ''}`}
                              style={{ width: 24, height: 20, lineHeight: 1 }}
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                              title="Di chuyển lên"
                              disabled={index === 0}
                            >
                              <span style={{ fontSize: 12 }}>▲</span>
                            </button>
                            <button
                              className={`btn btn-sm p-0 ${index === sortedArr.length - 1 ? 'invisible' : ''}`}
                              style={{ width: 24, height: 20, lineHeight: 1 }}
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                              title="Di chuyển xuống"
                              disabled={index === sortedArr.length - 1}
                            >
                              <span style={{ fontSize: 12 }}>▼</span>
                            </button>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <span className={`badge ${selectedSection?.id === section.id ? 'bg-light text-primary' : 'bg-primary'} me-2`}>
                                #{index + 1}
                              </span>
                              <strong>{section.title}</strong>
                              {!section.isActive && (
                                <span className="badge bg-secondary ms-2">Ẩn</span>
                              )}
                            </div>
                            <div className={`small ${selectedSection?.id === section.id ? 'text-light' : 'text-muted'}`}>
                              {section.products?.length || 0} sản phẩm
                              {section.description && ` • ${section.description}`}
                            </div>
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className={`btn ${selectedSection?.id === section.id ? 'btn-light' : 'btn-outline-secondary'} btn-sm`}
                              onClick={(e) => { e.stopPropagation(); startEdit(section); }}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className={`btn ${selectedSection?.id === section.id ? 'btn-light' : 'btn-outline-danger'} btn-sm`}
                              onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Sản phẩm trong Section đã chọn */}
          <div className="col-lg-4">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden',
              height: '100%',
            }}>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                color: '#fff',
              }}>
                <h6 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                  🛍️ {selectedSection ? `Sản phẩm trong "${selectedSection.title}"` : 'Chọn một Section'}
                </h6>
              </div>
              <div className="card-body p-3" style={{ maxHeight: 500, overflowY: 'auto' }}>
                {!selectedSection ? (
                  <div className="text-center text-muted py-5">
                    <div className="mb-2" style={{ fontSize: 48 }}>👈</div>
                    <p className="mb-0">Chọn một section từ danh sách bên trái</p>
                    <small>để xem và quản lý sản phẩm</small>
                  </div>
                ) : selectedSection.products?.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <div className="mb-2" style={{ fontSize: 48 }}>📦</div>
                    <p className="mb-0">Section này chưa có sản phẩm</p>
                    <small>Thêm sản phẩm từ danh sách bên phải →</small>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {selectedSection.products?.map((product, index) => (
                      <div key={product.id} className="d-flex align-items-center p-2 border rounded bg-light">
                        <span className="badge bg-secondary me-2">{index + 1}</span>
                        {product.thumbnail1 ? (
                          <img src={product.thumbnail1} alt="" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6, marginRight: 10 }} />
                        ) : (
                          <div style={{ width: 45, height: 45, background: '#e9ecef', borderRadius: 6, marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="text-muted small">📷</span>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-truncate" style={{ maxWidth: 150 }}>{product.name}</div>
                          <div className="text-muted small">{product.price?.toLocaleString()}đ</div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => removeProductFromSection(product.id)}
                          title="Xóa khỏi section"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Thêm sản phẩm */}
          <div className="col-lg-4">
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden',
              height: '100%',
            }}>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
              }}>
                <h6 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>➕ Thêm Sản Phẩm Vào Section</h6>
              </div>
              <div className="card-body p-3">
                {/* Bộ lọc */}
                <div className="row g-2 mb-3">
                  <div className="col-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="🔍 Tìm theo tên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-5">
                    <select 
                      className="form-select form-select-sm" 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{'  '.repeat(c.level || 0)}{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {!selectedSection ? (
                    <div className="text-center text-muted py-4">
                      <div className="mb-2" style={{ fontSize: 36 }}>⬅️</div>
                      <small>Chọn section trước để thêm sản phẩm</small>
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <div className="mb-2" style={{ fontSize: 36 }}>🔍</div>
                      <small>Không tìm thấy sản phẩm phù hợp</small>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {availableProducts.slice(0, 15).map(product => (
                        <div
                          key={product.id}
                          className="d-flex align-items-center p-2 border rounded"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onClick={() => addProductToSection(product.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#d1fae5';
                            e.currentTarget.style.borderColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#dee2e6';
                          }}
                        >
                          {product.thumbnail1 ? (
                            <img src={product.thumbnail1} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, marginRight: 10 }} />
                          ) : (
                            <div style={{ width: 40, height: 40, background: '#e9ecef', borderRadius: 6, marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="text-muted small">📷</span>
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-truncate" style={{ maxWidth: 120, fontSize: 13 }}>{product.name}</div>
                            <div className="text-muted" style={{ fontSize: 11 }}>{product.price?.toLocaleString()}đ</div>
                          </div>
                          <span className="badge bg-success">+ Thêm</span>
                        </div>
                      ))}
                      {availableProducts.length > 15 && (
                        <div className="text-center text-muted small py-2">
                          Còn {availableProducts.length - 15} sản phẩm khác...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sản phẩm chưa phân loại */}
        {productsNotInAnySections.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            marginTop: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h6 style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff' }}>⚠️ Sản Phẩm Chưa Thuộc Section Nào</h6>
              <span style={{
                background: '#1e293b',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}>{productsNotInAnySections.length} sản phẩm</span>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                Các sản phẩm này sẽ hiển thị ở <strong>cuối trang chủ</strong>, sau tất cả các sections. 
                Thêm vào section để hiển thị ở vị trí nổi bật hơn.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {productsNotInAnySections.slice(0, 12).map(p => (
                  <span key={p.id} style={{
                    background: '#f8fafc',
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {p.name}
                  </span>
                ))}
                {productsNotInAnySections.length > 12 && (
                  <span style={{
                    background: '#64748b',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>+{productsNotInAnySections.length - 12} sản phẩm khác</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
