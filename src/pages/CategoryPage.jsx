import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CategoryPage() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('admin_categories_v1');
    if (raw) setCats(JSON.parse(raw));
    else setCats([]);
  }, []);

  return (
  <div className="container py-5" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <Link to="/admin/categories" className="btn btn-outline-secondary">Manage Categories</Link>
      </div>

      {cats.length === 0 ? (
        <div className="alert alert-info">No categories found.</div>
      ) : (
        <div className="row g-3">
          {cats.map((c) => (
            <div key={c.c_id} className="col-6 col-md-4">
              <div className="card h-100" style={{ border: '2px solid orange' }}>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h5 className="card-title mb-0">{c.c_name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
