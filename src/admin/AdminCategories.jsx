import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


export default function AdminCategories() {
  //add post, delete, put with credentials
  const [cats, setCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCats(response.data);
    }
    catch (error) {
      console.error('Failed to fetch categories', error);
      alert('Failed to fetch categories');
    }
  }
  useEffect(() => {
    fetchCategories();
  }, []);

  const [currentUser, setCurrentUser] = useState({
    email: '',
    fullName: '',
    role: '',
    phoneNumber: '',
    address: ''
  });
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
      if (res?.data.role !== 'ADMIN' ||res?.data.role !== 'EMPLOYEE') {
        navigate('/login');
        return;
      }
      setCurrentUser(res.data);
    } catch (error) {
      navigate('/login');
    }
  }
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCats(cats);
    } else {
      const filtered = cats.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCats(filtered);
    }
  }, [cats, searchTerm]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/categories`, { name: name.trim() }, { withCredentials: true });
      setCats((c) => [{ id: res.data.id, name: res.data.name }, ...c]);
    } catch (error) {
      console.error('Add category failed', error);
      alert('Failed to add category');
    }
    setCats((c) => [{ id: res.data.id, name: res.data.name }, ...c]);
    setName('');
  };

  const remove = async (id) => {
    if (!confirm('Xóa category?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, { withCredentials: true });
      setCats((c) => c.filter(x => x.id !== id));
    } catch (error) {
      console.error('Delete category failed', error);
      if (!error.response || !error.response.data || !error.response.data.message)
        alert('Failed to delete category');
      else
        alert(error.response.data.message);
    }

  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return alert('Tên không được rỗng');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/categories/${id}`, { name: editingName.trim() }, { withCredentials: true });
      setCats(c => c.map(item => item.id === id ? { ...item, name: editingName.trim() } : item));
    } catch (error) {
      console.error('Update category failed', error);
      if (!error.response || !error.response.data || !error.response.data.message)
        alert('Failed to update category');
      else
        alert(error.response.data.message);
    }
    setCats(c => c.map(item => item.id === id ? { ...item, name: editingName.trim() } : item));
    cancelEdit();
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
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
            <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div style={{ flex: 1 }}>
                {editingId === c.id ? (
                  <input
                    className="form-control"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(c.id)}
                    autoFocus
                  />
                ) : (
                  <div>
                    <strong>{c.name}</strong>
                    <div className="text-muted small">ID: {c.id}</div>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                {editingId === c.id ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => saveEdit(c.id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(c)}>Edit</button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(c.id)}
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
