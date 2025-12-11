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
        <div className="mb-4 p-4 rounded-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
          <h4 className="mb-2">🏠 Cấu Hình Hiển Thị Trang Chủ</h4>
          <p className="mb-3 opacity-75">Quản lý các nhóm sản phẩm (sections) hiển thị trên trang chủ của website</p>
          
          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-light text-dark me-2">1</span>
                  <strong>Tạo Section</strong>
                </div>
                <small>Tạo các nhóm sản phẩm như "Bán chạy", "Mới nhất", "Khuyến mãi"...</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-light text-dark me-2">2</span>
                  <strong>Thêm Sản Phẩm</strong>
                </div>
                <small>Chọn section và thêm sản phẩm vào từ danh sách bên phải</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-light text-dark me-2">3</span>
                  <strong>Sắp Xếp Thứ Tự</strong>
                </div>
                <small>Số thứ tự nhỏ hơn sẽ hiển thị trước trên trang chủ</small>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-1">{sections.length}</div>
                <div className="text-muted small">Sections</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-1">{productsInSections.size}</div>
                <div className="text-muted small">SP trong sections</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-1">{productsNotInAnySections.length}</div>
                <div className="text-muted small">SP chưa phân loại</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-1">{products.length}</div>
                <div className="text-muted small">Tổng sản phẩm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form tạo/sửa Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h6 className="mb-0">
              {editingSection ? '✏️ Chỉnh Sửa Section' : '➕ Tạo Section Mới'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={editingSection ? updateSection : createSection}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label small text-muted">Tên Section *</label>
                  <input 
                    className="form-control" 
                    name="title" 
                    placeholder="VD: Sản phẩm bán chạy, Bộ sưu tập mới..." 
                    value={sectionForm.title} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted">Mô tả (tùy chọn)</label>
                  <input 
                    className="form-control" 
                    name="description" 
                    placeholder="Mô tả ngắn về section" 
                    value={sectionForm.description} 
                    onChange={handleFormChange} 
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small text-muted">Thứ tự hiển thị</label>
                  <input 
                    className="form-control" 
                    name="displayOrder" 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    value={sectionForm.displayOrder} 
                    onChange={handleFormChange} 
                  />
                </div>
                <div className="col-md-1">
                  <div className="form-check mt-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      checked={sectionForm.isActive} 
                      onChange={handleFormChange} 
                    />
                    <label className="form-check-label small" htmlFor="isActive">Hiện</label>
                  </div>
                </div>
                <div className="col-md-2">
                  {editingSection ? (
                    <div className="d-flex gap-2">
                      <button className="btn btn-success flex-grow-1" type="submit">Lưu</button>
                      <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit}>Hủy</button>
                    </div>
                  ) : (
                    <button className="btn btn-primary w-100" type="submit">
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
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">📂 Danh Sách Sections</h6>
                  <span className="badge bg-light text-primary">{sections.length}</span>
                </div>
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
                              className={`btn ${selectedSection?.id === section.id ? 'btn-light' : 'btn-outline-primary'} btn-sm`}
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
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3" style={{ background: '#7c3aed', color: '#fff' }}>
                <h6 className="mb-0">
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
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header py-3" style={{ background: '#059669', color: '#fff' }}>
                <h6 className="mb-0">➕ Thêm Sản Phẩm Vào Section</h6>
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
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header py-3" style={{ background: '#f59e0b', color: '#000' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">⚠️ Sản Phẩm Chưa Thuộc Section Nào</h6>
                <span className="badge bg-dark">{productsNotInAnySections.length} sản phẩm</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Các sản phẩm này sẽ hiển thị ở <strong>cuối trang chủ</strong>, sau tất cả các sections. 
                Thêm vào section để hiển thị ở vị trí nổi bật hơn.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {productsNotInAnySections.slice(0, 12).map(p => (
                  <span key={p.id} className="badge bg-light text-dark border py-2 px-3" style={{ fontSize: 12 }}>
                    {p.name}
                  </span>
                ))}
                {productsNotInAnySections.length > 12 && (
                  <span className="badge bg-secondary py-2 px-3">+{productsNotInAnySections.length - 12} sản phẩm khác</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
