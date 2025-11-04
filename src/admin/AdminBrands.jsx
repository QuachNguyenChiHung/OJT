import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BR_KEY = 'admin_brands_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(BR_KEY);
    if (raw) setBrands(JSON.parse(raw));
    else {
      const seed = [{ brand_id: generateId(), brand_name: 'FURIOUS' }];
      setBrands(seed);
      localStorage.setItem(BR_KEY, JSON.stringify(seed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(BR_KEY, JSON.stringify(brands));
  }, [brands]);

  // Filter brands based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brand_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBrands((b) => [{ brand_id: generateId(), brand_name: name.trim() }, ...b]);
    setName('');
  };

  const remove = (brand_id) => {
    if (!confirm('Xóa brand?')) return;
    setBrands((b) => b.filter(x => x.brand_id !== brand_id));
  };

  const startEdit = (brand) => {
    setEditingId(brand.brand_id);
    setEditingName(brand.brand_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = (brand_id) => {
    if (!editingName.trim()) return alert('Tên không được rỗng');
    setBrands(b => b.map(item => item.brand_id === brand_id ? { ...item, brand_name: editingName.trim() } : item));
    cancelEdit();
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Brands</h2>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary me-2">Users</Link>
          <Link to="/admin/categories" className="btn btn-outline-secondary me-2">Categories</Link>
          <Link to="/admin/products" className="btn btn-outline-secondary">Products</Link>
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
                placeholder="Search brands by name or ID..."
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
              Showing {filteredBrands.length} of {brands.length} brands
            </small>
          </div>
        </div>
      </div>

      <form onSubmit={add} className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder="New brand name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button className="btn btn-orange" type="submit">Add Brand</button>
      </form>

      <div className="list-group">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `No brands found matching "${searchTerm}"` : 'No brands available'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search to show all brands
              </button>
            )}
          </div>
        ) : (
          filteredBrands.map(b => (
            <div key={b.brand_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ flex: 1 }}>
                {editingId === b.brand_id ? (
                  <input
                    className="form-control"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(b.brand_id)}
                    autoFocus
                  />
                ) : (
                  <div>
                    <strong>{b.brand_name}</strong>
                    <div className="text-muted small">ID: {b.brand_id}</div>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {editingId === b.brand_id ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => saveEdit(b.brand_id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(b)}>Edit</button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(b.brand_id)}
                      title="Delete brand"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
