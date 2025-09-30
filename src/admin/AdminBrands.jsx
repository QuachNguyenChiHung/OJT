import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BR_KEY = 'admin_brands_v1';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(BR_KEY);
    if (raw) setBrands(JSON.parse(raw));
    else {
      const seed = [{ brand_id: 'b1', brand_name: 'FURIOUS' }];
      setBrands(seed);
      localStorage.setItem(BR_KEY, JSON.stringify(seed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(BR_KEY, JSON.stringify(brands));
  }, [brands]);

  const add = (e) => { e.preventDefault(); if (!name.trim()) return; setBrands((b)=>[{ brand_id: Date.now().toString(36), brand_name: name.trim() }, ...b]); setName(''); };
  const remove = (brand_id) => { if (!confirm('Xóa brand?')) return; setBrands((b)=>b.filter(x=>x.brand_id!==brand_id)); };

  const startEdit = (brand) => { setEditingId(brand.brand_id); setEditingName(brand.brand_name); };
  const cancelEdit = () => { setEditingId(null); setEditingName(''); };
  const saveEdit = (brand_id) => {
    if (!editingName.trim()) return alert('Tên không được rỗng');
    setBrands(b => b.map(item => item.brand_id === brand_id ? { ...item, brand_name: editingName.trim() } : item));
    cancelEdit();
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Brands</h2>
        <Link to="/admin/products" className="btn btn-outline-secondary">Products</Link>
      </div>

      <form onSubmit={add} className="mb-3 d-flex gap-2">
        <input className="form-control" placeholder="New brand name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn btn-orange" type="submit">Add</button>
      </form>

      <div className="list-group">
        {brands.map(b => (
          <div key={b.brand_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div style={{ flex: 1 }}>
              {editingId === b.brand_id ? (
                <input className="form-control" value={editingName} onChange={e => setEditingName(e.target.value)} />
              ) : (
                <div>{b.brand_name}</div>
              )}
            </div>
            <div className="d-flex gap-2">
              {editingId === b.brand_id ? (
                <>
                  <button className="btn btn-sm btn-primary" onClick={() => saveEdit(b.brand_id)}>Save</button>
                  <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(b)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(b.brand_id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
