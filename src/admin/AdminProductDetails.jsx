import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'admin_products_v1';

export default function AdminProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const products = JSON.parse(raw);
    const found = products.find(p => p.p_id === id);
    setProduct(found || null);
    
    const cat = localStorage.getItem('admin_categories_v1');
    if (cat) setCategories(JSON.parse(cat));
    
    const br = localStorage.getItem('admin_brands_v1');
    if (br) setBrands(JSON.parse(br));
  }, [id]);

  const removeDetail = (pd_id) => {
    if (!confirm('Xóa chi tiết sản phẩm này?')) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const products = JSON.parse(raw);
    const idx = products.findIndex(p => p.p_id === id);
    if (idx === -1) return;
    products[idx].details = products[idx].details.filter(d => d.pd_id !== pd_id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    setProduct(products[idx]);
  };

  const getCategoryName = (c_id) => {
    const cat = categories.find(c => c.c_id === c_id);
    return cat ? cat.c_name : 'N/A';
  };

  const getBrandName = (brand_id) => {
    const brand = brands.find(b => b.brand_id === brand_id);
    return brand ? brand.brand_name : 'N/A';
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
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <h4>Product Information</h4>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: '30%' }}>Product ID</th>
                  <td>{product.p_id}</td>
                </tr>
                <tr>
                  <th>Product Name</th>
                  <td>{product.p_name}</td>
                </tr>
                <tr>
                  <th>Category</th>
                  <td>{getCategoryName(product.c_id)}</td>
                </tr>
                <tr>
                  <th>Brand</th>
                  <td>{getBrandName(product.brand_id)}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{product.desc || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>Product Details (Variants)</h4>
          {product.details && product.details.length > 0 ? (
            product.details.map((d) => (
              <div key={d.pd_id} className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Detail ID:</strong> {d.pd_id}</p>
                    <p><strong>Size:</strong> {d.size || 'N/A'}</p>
                    <p><strong>Color:</strong> {d.color || 'N/A'}</p>
                    <p><strong>Price:</strong> {d.price ? `${d.price.toLocaleString()} VND` : 'N/A'}</p>
                    <p><strong>Amount:</strong> {d.amount || 0}</p>
                    <p><strong>Status:</strong> <span className={`badge ${d.status === 'available' ? 'bg-success' : 'bg-danger'}`}>{d.status}</span></p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Images:</strong></p>
                    <div className="d-flex gap-2 flex-wrap">
                      {Array.isArray(d.img_list) && d.img_list.length > 0 ? (
                        d.img_list.map((src, i) => (
                          <img 
                            key={i} 
                            src={src} 
                            alt={`img-${i}`} 
                            style={{ 
                              width: 100, 
                              height: 120, 
                              objectFit: 'cover', 
                              border: '2px solid orange',
                              borderRadius: '5px'
                            }} 
                          />
                        ))
                      ) : (
                        <p className="text-muted">No images</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeDetail(d.pd_id)}>
                    Remove Detail
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No product details available</p>
          )}
        </div>
      </div>
    </div>
  );
}
