import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CAT_KEY = 'admin_categories_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) setCats(JSON.parse(raw));
    else {
      const seed = [{ c_id: generateId(), c_name: 'Quần áo' }];
      setCats(seed);
      localStorage.setItem(CAT_KEY, JSON.stringify(seed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CAT_KEY, JSON.stringify(cats));
  }, [cats]);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCats(cats);
    } else {
      const filtered = cats.filter(cat =>
        cat.c_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.c_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCats(filtered);
    }
  }, [cats, searchTerm]);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCats((c) => [{ c_id: generateId(), c_name: name.trim() }, ...c]);
    setName('');
  };

  const remove = (c_id) => {
    if (!confirm('Xóa category?')) return;
    setCats((c) => c.filter(x => x.c_id !== c_id));
  };

  const startEdit = (cat) => {
    setEditingId(cat.c_id);
    setEditingName(cat.c_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = (c_id) => {
    if (!editingName.trim()) return alert('Tên không được rỗng');
    setCats(c => c.map(item => item.c_id === c_id ? { ...item, c_name: editingName.trim() } : item));
    cancelEdit();
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin - Categories</h2>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary me-2">Users</Link>
          <Link to="/admin/brands" className="btn btn-outline-secondary me-2">Brands</Link>
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
                placeholder="Search categories by name or ID..."
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
              Showing {filteredCats.length} of {cats.length} categories
            </small>
          </div>
        </div>
      </div>

      <form onSubmit={add} className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder="New category name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button className="btn btn-orange" type="submit">Add Category</button>
      </form>

      <div className="list-group">
        {filteredCats.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `No categories found matching "${searchTerm}"` : 'No categories available'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search to show all categories
              </button>
            )}
          </div>
        ) : (
          filteredCats.map(c => (
            <div key={c.c_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ flex: 1 }}>
                {editingId === c.c_id ? (
                  <input
                    className="form-control"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(c.c_id)}
                    autoFocus
                  />
                ) : (
                  <div>
                    <strong>{c.c_name}</strong>
                    <div className="text-muted small">ID: {c.c_id}</div>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {editingId === c.c_id ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => saveEdit(c.c_id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(c)}>Edit</button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(c.c_id)}
                      title="Delete category"
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
