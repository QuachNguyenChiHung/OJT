import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_products_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ 
    p_name: '', 
    c_id: '', 
    brand_id: '', 
    desc: '', 
    images: '', 
    size: '', 
    color: '', 
    amount: 1, 
    price: '', 
    status: 'available' 
  });
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
              img_list: ['/img/clothes.png'],
              size: 'M',
              color: 'Đỏ',
              amount: 10,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      p_id: generateId(),
      p_name: form.p_name || 'Untitled',
      c_id: form.c_id || '',
      brand_id: form.brand_id || '',
      desc: form.desc || '',
      details: [
        {
          pd_id: generateId(),
          img_list: form.images ? form.images.split(',').map(s => s.trim()) : [],
          size: form.size || '',
          color: form.color || '',
          amount: Number(form.amount) || 0,
          price: Number(form.price) || 0,
          status: form.status || 'available'
        }
      ]
    };
    setProducts((p) => [newProduct, ...p]);
    setForm({ 
      p_name: '', 
      c_id: '', 
      brand_id: '', 
      desc: '', 
      images: '', 
      size: '', 
      color: '', 
      amount: 1, 
      price: '', 
      status: 'available' 
    });
  };

  const remove = (p_id) => {
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
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Categories</Link>
          <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Brands</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/products')}>Refresh</button>
        </div>
      </div>

      <form onSubmit={addProduct} className="mb-4 p-3" style={{ border: '2px solid orange' }}>
        <div className="row g-2">
          <div className="col-md-4">
            <input 
              className="form-control" 
              name="p_name" 
              placeholder="Product name" 
              value={form.p_name} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              name="c_id" 
              value={form.c_id} 
              onChange={handleChange}
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
              value={form.brand_id} 
              onChange={handleChange}
              required
            >
              <option value="">Select brand</option>
              {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
            </select>
          </div>
          <div className="col-md-12">
            <textarea 
              className="form-control" 
              name="desc" 
              placeholder="Product description" 
              value={form.desc} 
              onChange={handleChange}
              rows="2"
            />
          </div>
          <div className="col-md-12">
            <input 
              className="form-control" 
              name="images" 
              placeholder="Image URLs (comma separated)" 
              value={form.images} 
              onChange={handleChange} 
            />
          </div>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-md-2">
            <input 
              className="form-control" 
              name="size" 
              placeholder="Size" 
              value={form.size} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-2">
            <input 
              className="form-control" 
              name="color" 
              placeholder="Color" 
              value={form.color} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-2">
            <input 
              className="form-control" 
              name="amount" 
              type="number" 
              placeholder="Amount" 
              value={form.amount} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-2">
            <input 
              className="form-control" 
              name="price" 
              type="number" 
              placeholder="Price" 
              value={form.price} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="col-md-2">
            <select 
              className="form-select" 
              name="status" 
              value={form.status} 
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-orange" type="submit">Add Product</button>
          </div>
        </div>
      </form>

      <div className="list-group">
        {products.map((p) => (
          <div key={p.p_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <Link to={`/admin/products/${p.p_id}`} className="h5 d-block text-decoration-none">{p.p_name}</Link>
              <div className="text-muted small">
                Category: {getCategoryName(p.c_id)} — Brand: {getBrandName(p.brand_id)}
              </div>
              {p.desc && <div className="text-muted small mt-1">{p.desc.substring(0, 100)}...</div>}
            </div>
            <div>
              <button className="btn btn-sm btn-outline-danger me-2" onClick={() => remove(p.p_id)}>Delete</button>
              <Link to={`/admin/products/${p.p_id}`} className="btn btn-sm btn-primary">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
