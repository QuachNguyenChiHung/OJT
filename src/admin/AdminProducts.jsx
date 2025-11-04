import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_products_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    p_name: '',
    c_id: '',
    brand_id: '',
    desc: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setProducts(JSON.parse(raw));
    else {
      // seed sample
      const sample = [
        {
          p_id: generateId(),
          p_name: 'Áo Thun Sample',
          c_id: 'c1',
          brand_id: 'b1',
          desc: 'Sample product description',
          details: [
            {
              pd_id: generateId(),
              img_list: ['/img/clothes.png', '/img/clothes.png', '/img/clothes.png', '/img/clothes.png', '/img/clothes.png'],
              size: 'M',
              color: 'Đỏ',
              amount: 10,
              price: 157000,
              status: 'available'
            },
            {
              pd_id: generateId(),
              img_list: ['/img/clothes.png', '/img/clothes.png', '/img/clothes.png', '/img/clothes.png', '/img/clothes.png'],
              size: 'L',
              color: 'Xanh',
              amount: 5,
              price: 157000,
              status: 'available'
            }
          ]
        }
      ];
      setProducts(sample);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    }
  }, []);

  useEffect(() => {
    const br = localStorage.getItem('admin_brands_v1');
    if (br) setBrands(JSON.parse(br));

    const cat = localStorage.getItem('admin_categories_v1');
    if (cat) setCategories(JSON.parse(cat));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.p_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(product.c_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getBrandName(product.brand_id).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, brands, categories]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((f) => ({ ...f, [name]: value }));
  };

  const addProduct = (e) => {
    e.preventDefault();
    if (!productForm.p_name.trim()) {
      alert('Product name is required');
      return;
    }
    const newProduct = {
      p_id: generateId(),
      p_name: productForm.p_name.trim(),
      c_id: productForm.c_id || '',
      brand_id: productForm.brand_id || '',
      desc: productForm.desc.trim() || '',
      details: [] // Start with no variants
    };
    setProducts((p) => [newProduct, ...p]);
    setProductForm({
      p_name: '',
      c_id: '',
      brand_id: '',
      desc: ''
    });
  };

  const startEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const updateProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.p_name.trim()) {
      alert('Product name is required');
      return;
    }
    setProducts(products =>
      products.map(p =>
        p.p_id === editingProduct.p_id
          ? {
            ...p,
            p_name: editingProduct.p_name.trim(),
            c_id: editingProduct.c_id,
            brand_id: editingProduct.brand_id,
            desc: editingProduct.desc.trim()
          }
          : p
      )
    );
    setEditingProduct(null);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  }; const remove = (p_id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    setProducts((p) => p.filter(x => x.p_id !== p_id));
  };

  // Helper functions to get names from IDs
  const getCategoryName = (c_id) => {
    const cat = categories.find(c => c.c_id === c_id);
    return cat ? cat.c_name : 'N/A';
  };

  const getBrandName = (brand_id) => {
    const brand = brands.find(b => b.brand_id === brand_id);
    return brand ? brand.brand_name : 'N/A';
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Products</h2>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary me-2">Users</Link>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Categories</Link>
          <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Brands</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/products')}>Refresh</button>
        </div>
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
                placeholder="Search products by name, description, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6 text-end">
            <small className="text-muted">
              Showing {filteredProducts.length} of {products.length} products
            </small>
          </div>
        </div>
      </div>

      {/* Product Creation/Edit Form */}
      <div className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
        <h4>{editingProduct ? 'Edit Product' : 'Create New Product'}</h4>
        <form onSubmit={editingProduct ? updateProduct : addProduct}>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                className="form-control"
                name="p_name"
                placeholder="Product name"
                value={editingProduct ? editingProduct.p_name : productForm.p_name}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, p_name: e.target.value }) :
                  handleProductChange
                }
                required
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="c_id"
                value={editingProduct ? editingProduct.c_id : productForm.c_id}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, c_id: e.target.value }) :
                  handleProductChange
                }
                required
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.c_id} value={c.c_id}>{c.c_name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="brand_id"
                value={editingProduct ? editingProduct.brand_id : productForm.brand_id}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, brand_id: e.target.value }) :
                  handleProductChange
                }
                required
              >
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              {editingProduct ? (
                <div className="d-flex gap-1">
                  <button className="btn btn-success btn-sm" type="submit">Update</button>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-orange" type="submit">Create Product</button>
              )}
            </div>
            <div className="col-md-12">
              <textarea
                className="form-control"
                name="desc"
                placeholder="Product description"
                value={editingProduct ? editingProduct.desc : productForm.desc}
                onChange={editingProduct ?
                  (e) => setEditingProduct({ ...editingProduct, desc: e.target.value }) :
                  handleProductChange
                }
                rows="2"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="list-group">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `No products found matching "${searchTerm}"` : 'No products available'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search to show all products
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.p_id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <Link to={`/admin/products/${p.p_id}`} className="h5 d-block text-decoration-none">{p.p_name}</Link>
                  <div className="text-muted small">
                    Category: {getCategoryName(p.c_id)} — Brand: {getBrandName(p.brand_id)}
                  </div>
                  {p.desc && <div className="text-muted small mt-1">{p.desc.length > 100 ? `${p.desc.substring(0, 100)}...` : p.desc}</div>}

                  {/* Variants Summary */}
                  <div className="mt-2">
                    <span className="badge bg-info me-2">{p.details?.length || 0} Variants</span>
                    {p.details && p.details.length > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Variants: {p.details.map((d, idx) => (
                            <span key={d.pd_id}>
                              {d.color} {d.size} ({d.amount} in stock)
                              {idx < p.details.length - 1 && ', '}
                            </span>
                          ))}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => startEditProduct(p)}
                    disabled={editingProduct && editingProduct.p_id === p.p_id}
                  >
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.p_id)}>Delete</button>
                  <Link to={`/admin/products/${p.p_id}`} className="btn btn-sm btn-primary">View Details</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
