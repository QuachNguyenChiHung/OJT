import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function BrandPage() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('admin_brands_v1');
    if (raw) setBrands(JSON.parse(raw));
    else setBrands([]);
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Brands</h2>
        <Link to="/admin/brands" className="btn btn-outline-secondary">Manage Brands</Link>
      </div>

      {brands.length === 0 ? (
        <div className="alert alert-info">No brands found.</div>
      ) : (
        <div className="row g-3">
          {brands.map((b) => (
            <div key={b.brand_id} className="col-6 col-md-4">
              <div className="card h-100" style={{ border: '2px solid orange' }}>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h5 className="card-title mb-0">{b.brand_name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
