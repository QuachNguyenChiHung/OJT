import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_products_v1';

export default function AdminProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const products = JSON.parse(raw);
    const found = products.find(p => p.p_id === id);
    setProduct(found || null);
  }, [id]);

  const removeDetail = (pd_id) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const products = JSON.parse(raw);
    const idx = products.findIndex(p => p.p_id === id);
    if (idx === -1) return;
    products[idx].details = products[idx].details.filter(d => d.pd_id !== pd_id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    setProduct(products[idx]);
  };

  if (!product) return (
    <div className="container py-4"><p>Product not found. <Link to="/admin/products">Back to list</Link></p></div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{product.p_name}</h2>
        <div>
          <Link to="/admin/products" className="btn btn-outline-secondary me-2">Back</Link>
          <button className="btn btn-orange" onClick={() => navigate('/admin/products')}>Edit</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          {product.details.map((d) => (
            <div key={d.pd_id} className="mb-4" style={{ border: '1px solid #eee', padding: 12 }}>
              <div className="mb-2"><strong>Size:</strong> {d.size} — <strong>Color:</strong> {d.color}</div>
              <div className="d-flex gap-2 mb-2">
                {Array.isArray(d.img_list) ? d.img_list.map((src, i) => (
                  <img key={i} src={src} alt={`img-${i}`} style={{ width: 120, height: 140, objectFit: 'cover', border: '2px solid orange' }} />
                )) : null}
              </div>
              <div><strong>Price:</strong> {d.price} — <strong>Amount:</strong> {d.amount}</div>
              <div className="mt-2">
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeDetail(d.pd_id)}>Remove detail</button>
              </div>
            </div>
          ))}
        </div>
        <div className="col-md-6">
          <h4>Meta</h4>
          <p><strong>Category:</strong> {product.c_name}</p>
          <p><strong>Brand:</strong> {product.brand_name}</p>
        </div>
      </div>
    </div>
  );
}
