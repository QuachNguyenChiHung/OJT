import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

const MAX_IMAGES = 5;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    PName: '',
    pName: '',
    description: '',
    price: '',
    categoryId: '',
    brandId: '',
    isActive: Boolean(true)
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
          navigate('/login');
          return;
        }
      } catch {
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);
  // fetch products, categories and brands in parallel and normalize
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [pRes, cRes, bRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/brands')
        ]);

        // normalize categories
        const rawCats = Array.isArray(cRes.data) ? cRes.data : [];
        const normalizedCats = rawCats.map(item => {
          if (!item) return null;
          if (item.id !== undefined && item.name !== undefined) return { id: item.id, name: item.name, raw: item };
          if (item.c_id !== undefined && item.c_name !== undefined) return { id: item.c_id, name: item.c_name, raw: item };
          if (item.cId !== undefined && item.cName !== undefined) return { id: item.cId, name: item.cName, raw: item };
          const idKey = Object.keys(item).find(k => /id$/i.test(k)) || Object.keys(item)[0];
          const nameKey = Object.keys(item).find(k => /name$/i.test(k)) || Object.keys(item)[1] || idKey;
          return { id: item[idKey], name: item[nameKey], raw: item };
        }).filter(Boolean);

        // normalize brands
        const rawBrands = Array.isArray(bRes.data) ? bRes.data : [];
        const normalizedBrands = rawBrands.map(item => {
          if (!item) return null;
          if (item.id !== undefined && item.name !== undefined) return { id: item.id, name: item.name, raw: item };
          if (item.brand_id !== undefined && item.brand_name !== undefined) return { id: item.brand_id, name: item.brand_name, raw: item };
          if (item.b_id !== undefined && item.b_name !== undefined) return { id: item.b_id, name: item.b_name, raw: item };
          const idKey = Object.keys(item).find(k => /id$/i.test(k)) || Object.keys(item)[0];
          const nameKey = Object.keys(item).find(k => /name$/i.test(k)) || Object.keys(item)[1] || idKey;
          return { id: item[idKey], name: item[nameKey], raw: item };
        }).filter(Boolean);

        // normalize products into a lightweight list (strip heavy nested fields like details/images)
        const rawProducts = Array.isArray(pRes.data) ? pRes.data : [];
        const normalizedProducts = rawProducts.map(item => {
          const id = item.id ?? item.p_id ?? item.PId ?? item.pId;
          const name = item.name ?? item.PName ?? item.pName ?? item.p_name ?? null;
          const description = item.description ?? item.pDesc ?? item.p_desc ?? item.desc ?? null;
          const price = item.price ?? null;
          const categoryName = item.categoryName ?? item.category?.c_name ?? item.category?.name ?? null;
          const brandName = item.brandName ?? item.brand?.brand_name ?? item.brand?.name ?? null;
          const isActive = item.isActive ?? item.is_active ?? item.isAvailable ?? item.available ?? false;
          const averageRating = item.averageRating ?? null;
          return { id, name, description, price, categoryName, brandName, isActive, averageRating };
        });

        if (!mounted) return;
        setCategories(normalizedCats);
        setBrands(normalizedBrands);
        setProducts(normalizedProducts);
      } catch (err) {
        console.error('Failed to fetch product/category/brand lists', err);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);


  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      (product.name || '').toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term) ||
      (product.categoryName || '').toLowerCase().includes(term) ||
      (product.brandName || '').toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    
    const newImages = [...selectedImages, ...files].slice(0, MAX_IMAGES);
    setSelectedImages(newImages);
    
    // Create previews
    const previews = newImages.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newImages.map(file => URL.createObjectURL(file)));
  };

  const clearImages = () => {
    setSelectedImages([]);
    setImagePreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Tên sản phẩm là bắt buộc');
      return;
    }
    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price) || 0,
      categoryId: productForm.categoryId || '',
      brandId: productForm.brandId || '',
      isActive: Boolean(productForm.isActive)
    };
    try {
      console.log(payload);
      const res = await api.post('/products', payload);
      const data = res?.data || {};
      const productId = data.id || data.productId || data.p_id || data.pId;

      // Upload images if selected and product has details
      if (selectedImages.length > 0 && productId) {
        await uploadImagesToProduct(productId);
      }

      // Normalize created product for display
      const categoryName = categories.find(c => String(c.id) === String(payload.categoryId))?.name || '';
      const brandName = brands.find(b => String(b.id) === String(payload.brandId))?.name || '';
      const normalizedProduct = {
        id: productId,
        name: data.name || payload.name,
        description: data.description || payload.description,
        price: data.price ?? payload.price,
        categoryName,
        brandName,
        isActive: data.isActive ?? payload.isActive,
        averageRating: null
      };

      setProducts(p => [normalizedProduct, ...p]);
      setProductForm({ name: '', description: '', price: '', categoryId: '', brandId: '', isActive: true });
      clearImages();
      alert('Tạo sản phẩm thành công!');
    } catch (err) {
      console.error('Add product failed', err);
      alert('Không thể thêm sản phẩm: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Upload images to product details
  const uploadImagesToProduct = async (productId) => {
    if (selectedImages.length === 0) return;
    
    setUploading(true);
    try {
      // First get product details for this product
      const detailsRes = await api.get(`/product-details/product/${productId}`);
      const details = Array.isArray(detailsRes.data) ? detailsRes.data : [detailsRes.data];
      
      if (details.length === 0 || !details[0]) {
        console.log('No product details found, creating default one...');
        // Create a default product detail
        const createRes = await api.post('/product-details', {
          productId: productId,
          size: 'Default',
          colorName: 'Default',
          amount: 0,
          inStock: true
        });
        const newDetail = createRes.data;
        const pdId = newDetail.pdId || newDetail.pd_id || newDetail.id;
        if (pdId) {
          await uploadToProductDetail(pdId);
        }
      } else {
        // Upload to first product detail
        const pdId = details[0].pdId || details[0].pd_id || details[0].id;
        if (pdId) {
          await uploadToProductDetail(pdId);
        }
      }
    } catch (err) {
      console.error('Upload images failed:', err);
      alert('Sản phẩm đã tạo nhưng upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const uploadToProductDetail = async (pdId) => {
    const formData = new FormData();
    selectedImages.forEach((file, idx) => {
      formData.append(`image${idx}`, file);
    });
    
    await api.post(`/product-details/${pdId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const startEditProduct = (product) => {
    const categoryId = categories.find(c => String(c.name) === String(product.categoryName) || String(c.id) === String(product.categoryName))?.id || '';
    const brandId = brands.find(b => String(b.name) === String(product.brandName) || String(b.id) === String(product.brandName))?.id || '';
    setEditingProduct({ ...product, categoryId, brandId, isActive: product.isActive ?? product.available ?? product.isAvailable ?? true, _originalIsActive: product.isActive ?? product.available ?? product.isAvailable ?? true });
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) {
      alert('Tên sản phẩm là bắt buộc');
      return;
    }
    const payload = {
      id: editingProduct.id,
      // duplicate name/description under keys backend may expect
      PName: editingProduct.name.trim(),
      pDesc: editingProduct.description.trim(),
      price: parseFloat(editingProduct.price) || 0,
      isActive: Boolean(editingProduct.isActive),
    };
    try {
      // backend expects categoryId and brandId as request params
      const categoryParam = editingProduct.categoryId ? `?categoryId=${editingProduct.categoryId}` : '';
      const brandParam = editingProduct.brandId ? `${categoryParam ? '&' : '?'}brandId=${editingProduct.brandId}` : '';
      const query = `${categoryParam}${brandParam}`;
      const res = await api.put(`/products/${editingProduct.id}${query}`, payload);
      console.log(payload)
      const responseObj = res && res.data ? res.data : payload;
      // determine id from multiple possible keys
      const updatedId = responseObj.id ?? responseObj.p_id ?? responseObj.PId ?? responseObj.pId ?? editingProduct.id;
      // normalize resulting object to the lightweight shape used in the list
      const normalizedUpdated = {
        id: updatedId,
        name: responseObj.name ?? responseObj.PName ?? responseObj.pName ?? editingProduct.name,
        description: responseObj.description ?? responseObj.pDesc ?? responseObj.desc ?? editingProduct.description,
        price: responseObj.price ?? editingProduct.price,
        categoryName: responseObj.categoryName ?? editingProduct.categoryName,
        brandName: responseObj.brandName ?? editingProduct.brandName,
        isActive: (typeof responseObj.isActive !== 'undefined') ? responseObj.isActive : ((typeof responseObj.isAvailable !== 'undefined') ? responseObj.isAvailable : (typeof responseObj.available !== 'undefined' ? responseObj.available : editingProduct.isActive)),
        averageRating: responseObj.averageRating ?? editingProduct.averageRating ?? null
      };
      setProducts(products => products.map(p => (String(p.id) === String(updatedId) ? normalizedUpdated : p)));
      setEditingProduct(null);
    } catch (err) {
      console.error('Update product failed', err);
      // revert optimistic change if present
      setProducts(products => products.map(p => p.id === editingProduct.id ? ({ ...p, isActive: editingProduct._originalIsActive ?? p.isActive }) : p));
      setEditingProduct(null);
      alert('Không thể cập nhật sản phẩm');
    }
  };

  const cancelEdit = () => {
    // if we had an original active state stored, restore the product list to that value
    if (editingProduct && typeof editingProduct._originalIsActive !== 'undefined') {
      setProducts(prev => prev.map(p => (String(p.id) === String(editingProduct.id) ? { ...p, isActive: editingProduct._originalIsActive } : p)));
    }
    setEditingProduct(null);
  };

  const remove = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete product failed', err);
      setProducts((p) => p.filter(x => x.id !== id));
      alert(err?.response?.data?.message || 'Failed to delete product on server');
    }
  };

  // Helper functions to get names from IDs
  const getCategoryName = (idOrName) => {
    if (!idOrName) return 'N/A';
    const found = categories.find(c => String(c.id) === String(idOrName) || String(c.name) === String(idOrName));
    return found ? found.name : String(idOrName);
  };

  const getBrandName = (idOrName) => {
    if (!idOrName) return 'N/A';
    const found = brands.find(b => String(b.id) === String(idOrName) || String(b.name) === String(idOrName));
    return found ? found.name : String(idOrName);
  };

  return (
    <AdminLayout title="Quản Lý Sản Phẩm">
      <div style={{ maxWidth: 1200 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <button className="btn" style={{ background: '#008B8B', color: '#fff' }} onClick={() => navigate('/admin/products')}>
            🔄 Làm Mới
          </button>
        </div>

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
                placeholder="Tìm kiếm sản phẩm theo tên, mô tả, giá, danh mục hoặc thương hiệu..."
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
              Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm
            </small>
          </div>
        </div>
      </div>

      {/* Product Creation/Edit Form */}
      <div className="mb-4 p-3" style={{ border: '2px solid #008B8B', borderRadius: '8px', background: '#fff' }}>
        <h4>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Tạo Sản Phẩm Mới'}</h4>
        <form onSubmit={editingProduct ? updateProduct : addProduct}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                name="name"
                placeholder="Tên sản phẩm"
                value={editingProduct ? editingProduct.name : productForm.name}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, name: e.target.value, PName: e.target.value, pName: e.target.value }) :
                  handleProductChange
                }
                required
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                name="price"
                placeholder="Price"
                type="number"
                value={editingProduct ? editingProduct.price : productForm.price}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, price: e.target.value }) :
                  handleProductChange
                }
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="categoryId"
                value={editingProduct ? editingProduct.categoryId : productForm.categoryId}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value }) :
                  handleProductChange
                }
                required
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="brandId"
                value={editingProduct ? editingProduct.brandId : productForm.brandId}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, brandId: e.target.value }) :
                  handleProductChange
                }
                required
              >
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={editingProduct ? !!editingProduct.isActive : !!productForm.isActive}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (editingProduct) {
                      // optimistic update: update both editingProduct and products list so UI reflects change immediately
                      setEditingProduct(prev => ({ ...prev, isActive: checked }));
                      setProducts(prev => prev.map(p => (String(p.id) === String(editingProduct.id) ? { ...p, isActive: checked } : p)));
                    } else setProductForm(f => ({ ...f, isActive: checked }));
                  }}
                />
                <label className="form-check-label ms-2" htmlFor="isActive">Active</label>
              </div>
            </div>
            <div className="col-md-12">
              {editingProduct ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-success" type="submit">Cập Nhật Sản Phẩm</button>
                  <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Hủy</button>
                </div>
              ) : (
                <button className="btn" style={{ background: '#008B8B', color: '#fff' }} type="submit">Tạo Sản Phẩm</button>
              )}
            </div>
            <div className="col-md-12">
              <textarea
                className="form-control"
                name="description"
                placeholder="Product description"
                value={editingProduct ? editingProduct.description : productForm.description}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, description: e.target.value }) :
                  handleProductChange
                }
                rows="2"
              />
            </div>
            
            {/* Image Upload Section */}
            {!editingProduct && (
              <div className="col-md-12 mt-3">
                <label className="form-label fw-bold">Ảnh sản phẩm (tối đa {MAX_IMAGES} ảnh)</label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    disabled={selectedImages.length >= MAX_IMAGES}
                  />
                  {selectedImages.length > 0 && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearImages}>
                      Xóa tất cả
                    </button>
                  )}
                </div>
                <small className="text-muted">Đã chọn: {selectedImages.length}/{MAX_IMAGES} ảnh</small>
                
                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {imagePreview.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{
                            position: 'absolute', top: -8, right: -8,
                            background: '#dc3545', color: '#fff', border: 'none',
                            borderRadius: '50%', width: 20, height: 20, fontSize: 12,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {uploading && <div className="text-info mt-2">⏳ Đang upload ảnh...</div>}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="list-group">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}"` : 'Không có sản phẩm nào'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm để hiển thị tất cả sản phẩm
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <Link to={`/admin/products/${p.id}`} className="h5 d-block text-decoration-none">{p.name}</Link>
                  <div className="text-muted small">
                    Category: {p.categoryName || getCategoryName(p.categoryName)} — Brand: {p.brandName || getBrandName(p.brandName)}
                  </div>
                  {p.description && <div className="text-muted small mt-1">{p.description.length > 120 ? `${p.description.substring(0, 120)}...` : p.description}</div>}

                  <div className="mt-2">
                    <span className="badge bg-success me-2">{p.price ? `${p.price.toLocaleString()} VND` : 'No price'}</span>

                    {/* averageRating shown below price */}
                    <div className="small text-muted mt-1">
                      {typeof p.averageRating === 'number'
                        ? `⭐ ${p.averageRating.toFixed(1)} / 5`
                        : (p.averageRating ? `⭐ ${Number(p.averageRating).toFixed(1)} / 5` : 'No rating')}
                    </div>

                    {typeof p.isActive !== 'undefined' ? (
                      <span className={`badge ${p.isActive ? 'bg-success' : 'bg-secondary'}`} style={{ marginLeft: 8 }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <span className="badge bg-secondary" style={{ marginLeft: 8 }}>Unknown</span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => startEditProduct(p)}
                    disabled={editingProduct && editingProduct.id === p.id}
                  >
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.id)}>Delete</button>
                  <Link to={`/admin/products/${p.id}`} className="btn btn-sm btn-primary">View Details</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
