import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CAT_KEY = 'admin_categories_v1';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) setCats(JSON.parse(raw));
    else {
      const seed = [{ c_id: 'c1', c_name: 'Quần áo' }];
      setCats(seed);
      localStorage.setItem(CAT_KEY, JSON.stringify(seed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CAT_KEY, JSON.stringify(cats));
  }, [cats]);

  const add = (e) => { e.preventDefault(); if (!name.trim()) return; setCats((c)=>[{ c_id: Date.now().toString(36), c_name: name.trim() }, ...c]); setName(''); };
  const remove = (c_id) => { if (!confirm('Xóa category?')) return; setCats((c)=>c.filter(x=>x.c_id!==c_id)); };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Categories</h2>
        <Link to="/admin/products" className="btn btn-outline-secondary">Products</Link>
      </div>

      <form onSubmit={add} className="mb-3 d-flex gap-2">
        <input className="form-control" placeholder="New category name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn btn-orange" type="submit">Add</button>
      </form>

      <div className="list-group">
        {cats.map(c => (
          <div key={c.c_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>{c.c_name}</div>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(c.c_id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
