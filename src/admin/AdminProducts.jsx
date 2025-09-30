import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_products_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ p_name: '', c_name: '', brand_name: '', brand_name_custom: '', images: '', size: '', color: '', amount: 1, price: '', status: 'available' });
  const [brands, setBrands] = useState([]);
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
          c_name: 'Quần áo',
          brand_name: 'FURIOUS',
          details: [
            {
              pd_id: generateId(),
              img_list: ['../assets/img/clothes.png'],
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
    const brandToUse = form.brand_name === '__other' ? (form.brand_name_custom || 'Unknown') : (form.brand_name || 'Unknown');
    const newProduct = {
      p_id: generateId(),
      p_name: form.p_name || 'Untitled',
      c_name: form.c_name || 'Uncategorized',
      brand_name: brandToUse,
      details: [
        {
          pd_id: generateId(),
          img_list: form.images ? form.images.split(',').map(s => s.trim()) : [],
          size: form.size,
          color: form.color,
          amount: Number(form.amount) || 0,
          price: Number(form.price) || 0,
          status: form.status || 'available'
        }
      ]
    };
    setProducts((p) => [newProduct, ...p]);
    setForm({ p_name: '', c_name: '', brand_name: '', brand_name_custom: '', images: '', size: '', color: '', amount: 1, price: '', status: 'available' });
  };

  const remove = (p_id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    setProducts((p) => p.filter(x => x.p_id !== p_id));
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Products</h2>
        <div>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Categories</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/products')}>Refresh</button>
        </div>
      </div>

      <form onSubmit={addProduct} className="mb-4 p-3" style={{ border: '2px solid orange' }}>
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" name="p_name" placeholder="Product name" value={form.p_name} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="c_name" placeholder="Category" value={form.c_name} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <select className="form-select" name="brand_name" value={form.brand_name} onChange={handleChange}>
              <option value="">Select brand</option>
              {brands.map(b => <option key={b.brand_id} value={b.brand_name}>{b.brand_name}</option>)}
              <option value="__other">Other...</option>
            </select>
          </div>
          <div className="col-md-2" style={{ display: form.brand_name === '__other' ? 'block' : 'none' }}>
            <input className="form-control" name="brand_name_custom" placeholder="Brand name" value={form.brand_name_custom || ''} onChange={(e) => setForm(f => ({ ...f, brand_name_custom: e.target.value }))} />
          </div>
          <div className="col-md-4">
            <input className="form-control" name="images" placeholder="Image URLs (comma separated)" value={form.images} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-md-2">
            <input className="form-control" name="size" placeholder="Size" value={form.size} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="color" placeholder="Color" value={form.color} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="available">available</option>
              <option value="out_of_stock">out_of_stock</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-orange" type="submit">Add product</button>
          </div>
        </div>
      </form>

      <div className="list-group">
        {products.map((p) => (
          <div key={p.p_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <Link to={`/admin/products/${p.p_id}`} className="h5 d-block text-decoration-none">{p.p_name}</Link>
              <div className="text-muted small">{p.c_name} — {p.brand_name}</div>
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
