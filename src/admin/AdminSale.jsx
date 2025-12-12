import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

export default function AdminSale() {
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [discountLevels, setDiscountLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [filterDiscount, setFilterDiscount] = useState(null);
  const [newDiscountPercent, setNewDiscountPercent] = useState('');
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkDiscount, setBulkDiscount] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, saleRes, levelsRes] = await Promise.all([
        api.get('/products'),
        api.get('/sale-products').catch(() => ({ data: [] })),
        api.get('/sale-products/discount-levels').catch(() => ({ data: [] }))
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setSaleProducts(Array.isArray(saleRes.data) ? saleRes.data : []);
      const levels = Array.isArray(levelsRes.data) ? levelsRes.data : [];
      setDiscountLevels(levels);
      if (levels.length > 0 && !selectedDiscount) {
        setSelectedDiscount(levels[0].discountPercent);
        setBulkDiscount(levels[0].discountPercent);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count products by discount level
  const getDiscountCount = (discountPercent) => {
    return saleProducts.filter(sp => (sp.discountPercent || sp.discount_percent) === discountPercent).length;
  };

  const addToSale = async (productId, discountPercent) => {
    try {
      await api.post('/sale-products', { productId, discountPercent });
      fetchData();
    } catch (error) {
      console.error('Error adding to sale:', error);
    }
  };

  const bulkAddToSale = async () => {
    if (selectedProducts.length === 0 || !bulkDiscount) return;
    try {
      await Promise.all(selectedProducts.map(id => api.post('/sale-products', { productId: id, discountPercent: bulkDiscount })));
      setSelectedProducts([]);
      fetchData();
    } catch (error) {
      console.error('Error bulk adding:', error);
    }
  };

  const removeFromSale = async (productId) => {
    try {
      await api.delete(`/sale-products/${productId}`);
      fetchData();
    } catch (error) {
      console.error('Error removing from sale:', error);
    }
  };

  const updateDiscount = async (productId, discountPercent) => {
    try {
      await api.put(`/sale-products/${productId}`, { discountPercent });
      fetchData();
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  };

  const createDiscountLevel = async () => {
    const percent = parseInt(newDiscountPercent);
    if (!percent || percent < 1 || percent > 99) return;
    try {
      await api.post('/sale-products/discount-levels', { discountPercent: percent });
      setNewDiscountPercent('');
      setShowAddDiscount(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi tạo mức giảm giá');
    }
  };

  const deleteDiscountLevel = async (discountPercent) => {
    const count = saleProducts.filter(sp => (sp.discountPercent || sp.discount_percent) === discountPercent).length;
    if (count > 0) {
      alert(`Không thể xóa mức giảm ${discountPercent}% vì có ${count} sản phẩm đang sử dụng.`);
      return;
    }
    try {
      await api.delete(`/sale-products/discount-levels/${discountPercent}`);
      if (filterDiscount === discountPercent) setFilterDiscount(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi xóa mức giảm giá');
    }
  };

  const discountOptions = discountLevels.map(l => l.discountPercent).sort((a, b) => a - b);
  const saleProductIds = saleProducts.map(sp => sp.productId || sp.p_id);
  const availableProducts = products.filter(p => 
    !saleProductIds.includes(p.id) && 
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.pName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredSaleProducts = filterDiscount 
    ? saleProducts.filter(sp => (sp.discountPercent || sp.discount_percent) === filterDiscount)
    : saleProducts;

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const selectAllAvailable = () => {
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(availableProducts.map(p => p.id));
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Quản Lý Sale">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e31837', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản Lý Sale">
      {/* Discount Levels Bar */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e31837" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Mức giảm:
        </span>
        
        {discountLevels.map(level => {
          const count = getDiscountCount(level.discountPercent);
          const isActive = filterDiscount === level.discountPercent;
          const borderColor = isActive ? '#e31837' : '#e5e7eb';
          return (
            <div key={level.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button onClick={() => setFilterDiscount(isActive ? null : level.discountPercent)}
                style={{ padding: '8px 16px', borderRadius: '8px 0 0 8px', 
                  borderTop: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, borderLeft: `2px solid ${borderColor}`, borderRight: 'none',
                  background: isActive ? '#fef2f2' : '#fff', color: isActive ? '#e31837' : '#374151', fontWeight: isActive ? '600' : '500', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                -{level.discountPercent}%
                <span style={{ marginLeft: '6px', background: isActive ? '#e31837' : '#e5e7eb', color: isActive ? '#fff' : '#6b7280', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{count}</span>
              </button>
              <button onClick={() => deleteDiscountLevel(level.discountPercent)} title="Xóa mức giảm"
                style={{ padding: '8px 10px', borderRadius: '0 8px 8px 0', 
                  borderTop: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderLeft: `1px solid #eee`,
                  background: '#fff', color: '#9ca3af', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = '#9ca3af'}>✕</button>
            </div>
          );
        })}

        {showAddDiscount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="number" min="1" max="99" value={newDiscountPercent} onChange={(e) => setNewDiscountPercent(e.target.value)}
              placeholder="%" autoFocus onKeyDown={(e) => e.key === 'Enter' && createDiscountLevel()}
              style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '2px solid #10b981', fontSize: '13px', textAlign: 'center' }} />
            <button onClick={createDiscountLevel} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>✓</button>
            <button onClick={() => { setShowAddDiscount(false); setNewDiscountPercent(''); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setShowAddDiscount(true)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '2px dashed #10b981', background: '#f0fdf4', color: '#10b981', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}>
            + Thêm mức
          </button>
        )}
        
        {filterDiscount && (
          <button onClick={() => setFilterDiscount(null)} style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}>
            Xem tất cả ({saleProducts.length})
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Sale Products */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔥</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                Sản Phẩm Sale {filterDiscount && <span style={{ color: '#e31837' }}>(-{filterDiscount}%)</span>}
              </h3>
              <span style={{ background: '#fef2f2', color: '#e31837', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{filteredSaleProducts.length}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? '#e31837' : '#f3f4f6', color: viewMode === 'grid' ? '#fff' : '#6b7280', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button onClick={() => setViewMode('table')} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: viewMode === 'table' ? '#e31837' : '#f3f4f6', color: viewMode === 'table' ? '#fff' : '#6b7280', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="4"/><rect x="3" y="10" width="18" height="4"/><rect x="3" y="17" width="18" height="4"/></svg>
              </button>
            </div>
          </div>

          <div style={{ padding: '16px', maxHeight: '550px', overflowY: 'auto' }}>
            {filteredSaleProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p style={{ margin: 0, fontWeight: '500' }}>{filterDiscount ? `Chưa có SP giảm ${filterDiscount}%` : 'Chưa có sản phẩm sale'}</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Thêm sản phẩm từ danh sách bên phải</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {filteredSaleProducts.map(sp => {
                  const product = products.find(p => p.id === (sp.productId || sp.p_id));
                  if (!product) return null;
                  const discount = sp.discountPercent || sp.discount_percent || 0;
                  const salePrice = (product.price || 0) * (1 - discount / 100);
                  return (
                    <div key={sp.productId || sp.p_id} style={{ background: '#fef2f2', borderRadius: '10px', padding: '12px', border: '1px solid #fecaca', position: 'relative' }}>
                      <button onClick={() => removeFromSale(sp.productId || sp.p_id)} style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      <img src={product.thumbnail1 || '/img/no-image.svg'} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                      <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name || product.pName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '11px' }}>{(product.price || 0).toLocaleString()}đ</span>
                        <span style={{ color: '#e31837', fontWeight: '600', fontSize: '13px' }}>{Math.round(salePrice).toLocaleString()}đ</span>
                      </div>
                      <select value={discount} onChange={(e) => updateDiscount(sp.productId || sp.p_id, parseInt(e.target.value))}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '12px', background: '#fff', color: '#e31837', fontWeight: '600' }}>
                        {discountOptions.map(d => <option key={d} value={d}>-{d}%</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Sản phẩm</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Giá gốc</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#6b7280' }}>Giảm</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Giá sale</th>
                    <th style={{ padding: '10px', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSaleProducts.map(sp => {
                    const product = products.find(p => p.id === (sp.productId || sp.p_id));
                    if (!product) return null;
                    const discount = sp.discountPercent || sp.discount_percent || 0;
                    const salePrice = (product.price || 0) * (1 - discount / 100);
                    return (
                      <tr key={sp.productId || sp.p_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.thumbnail1 || '/img/no-image.svg'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                          <span style={{ fontWeight: '500', color: '#111827' }}>{product.name || product.pName}</span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#9ca3af', textDecoration: 'line-through' }}>{(product.price || 0).toLocaleString()}đ</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <select value={discount} onChange={(e) => updateDiscount(sp.productId || sp.p_id, parseInt(e.target.value))}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '12px', color: '#e31837', fontWeight: '600' }}>
                            {discountOptions.map(d => <option key={d} value={d}>-{d}%</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#e31837', fontWeight: '600' }}>{Math.round(salePrice).toLocaleString()}đ</td>
                        <td style={{ padding: '10px' }}>
                          <button onClick={() => removeFromSale(sp.productId || sp.p_id)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Available Products */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📦</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Thêm Sản Phẩm</h3>
                <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{availableProducts.length}</span>
              </div>
              <select value={selectedDiscount || ''} onChange={(e) => setSelectedDiscount(parseInt(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #e31837', fontSize: '13px', fontWeight: '600', color: '#e31837', background: '#fef2f2' }}>
                {discountOptions.map(d => <option key={d} value={d}>-{d}%</option>)}
              </select>
            </div>
            <input type="text" placeholder="🔍 Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          
          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div style={{ padding: '12px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>Đã chọn {selectedProducts.length} sản phẩm</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={bulkDiscount || ''} onChange={(e) => setBulkDiscount(parseInt(e.target.value))}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px' }}>
                  {discountOptions.map(d => <option key={d} value={d}>-{d}%</option>)}
                </select>
                <button onClick={bulkAddToSale} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                  Thêm tất cả
                </button>
                <button onClick={() => setSelectedProducts([])} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '12px' }}>Bỏ chọn</button>
              </div>
            </div>
          )}
          
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={selectedProducts.length === availableProducts.length && availableProducts.length > 0} onChange={selectAllAvailable}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Chọn tất cả</span>
          </div>
          
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {availableProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <p style={{ margin: 0 }}>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {availableProducts.map(product => {
                  const salePrice = (product.price || 0) * (1 - (selectedDiscount || 20) / 100);
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #f3f4f6', background: isSelected ? '#f0fdf4' : '#fff', transition: 'background 0.2s' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleProductSelection(product.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <img src={product.thumbnail1 || '/img/no-image.svg'} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name || product.pName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{(product.price || 0).toLocaleString()}đ</span>
                          <span style={{ color: '#9ca3af' }}>→</span>
                          <span style={{ color: '#e31837', fontWeight: '600', fontSize: '12px' }}>{Math.round(salePrice).toLocaleString()}đ</span>
                        </div>
                      </div>
                      <button onClick={() => addToSale(product.id, selectedDiscount)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        + Sale
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
