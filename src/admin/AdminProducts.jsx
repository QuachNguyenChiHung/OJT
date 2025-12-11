import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdminLayout from './AdminLayout';

const MAX_IMAGES = 5;

// Column headers by level
const LEVEL_HEADERS = ['Tất cả', 'Giới tính', 'Loại SP', 'Phân loại', 'Chi tiết', 'Cụ thể'];
// Column colors by level
const LEVEL_COLORS = [
  { hover: '#e3f2fd', selected: '#bbdefb' },
  { hover: '#e8f5e9', selected: '#c8e6c9' },
  { hover: '#fff3e0', selected: '#ffe0b2' },
  { hover: '#fce4ec', selected: '#f8bbd9' },
  { hover: '#e1f5fe', selected: '#b3e5fc' },
  { hover: '#f3e5f5', selected: '#e1bee7' }
];

// Cascading Category Selector Component - Supports unlimited levels
const CascadingCategorySelector = ({ categories, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // hoveredPath[level] = categoryId being hovered at that level
  const [hoveredPath, setHoveredPath] = useState({});
  const containerRef = useRef(null);

  // Build children map: parentId -> [children]
  const childrenMap = useMemo(() => {
    const map = { root: [] };
    categories.forEach(cat => {
      const parentKey = cat.parentId || 'root';
      if (!map[parentKey]) map[parentKey] = [];
      map[parentKey].push(cat);
    });
    // Sort children by name
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    return map;
  }, [categories]);

  // Find max level in categories
  const maxLevel = useMemo(() => {
    return Math.max(0, ...categories.map(c => c.level || 0));
  }, [categories]);

  // Get full path for display
  const getFullPath = (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return '';
    const parts = [cat.name];
    let current = cat;
    while (current.parentId) {
      const parent = categories.find(c => c.id === current.parentId);
      if (parent) {
        parts.unshift(parent.name);
        current = parent;
      } else break;
    }
    return parts.join(' → ');
  };

  // Get children of a category
  const getChildren = (parentId) => childrenMap[parentId] || [];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (catId) => {
    onChange({ target: { name: 'categoryId', value: catId } });
    setIsOpen(false);
  };

  const handleHover = (level, catId) => {
    // Clear all levels after this one and set current
    const newPath = {};
    for (let i = 0; i < level; i++) {
      if (hoveredPath[i]) newPath[i] = hoveredPath[i];
    }
    newPath[level] = catId;
    setHoveredPath(newPath);
  };

  // Build columns to render
  const buildColumns = () => {
    const columns = [];
    
    // Level 0: root categories
    const rootCats = getChildren('root');
    if (rootCats.length > 0) {
      columns.push({ level: 0, parentId: 'root', categories: rootCats });
    }

    // Subsequent levels based on hovered path
    for (let level = 0; level <= maxLevel; level++) {
      const hoveredCatId = hoveredPath[level];
      if (hoveredCatId) {
        const children = getChildren(hoveredCatId);
        if (children.length > 0) {
          columns.push({ level: level + 1, parentId: hoveredCatId, categories: children });
        }
      }
    }

    return columns;
  };

  const columns = isOpen ? buildColumns() : [];

  // Get color for gender categories
  const getGenderColor = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower === 'women' || lower === 'nữ') return '#e91e63';
    if (lower === 'men' || lower === 'nam') return '#2196f3';
    if (lower === 'unisex') return '#9c27b0';
    return '#333';
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '38px',
          fontSize: '14px'
        }}
      >
        <span style={{ color: value ? '#212529' : '#6c757d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? getFullPath(value) : '-- Chọn danh mục --'}
        </span>
        <span style={{ marginLeft: '8px', color: '#6c757d', flexShrink: 0 }}>▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && columns.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 1000,
          display: 'flex',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          marginTop: '4px',
          maxWidth: '90vw',
          overflowX: 'auto'
        }}>
          {columns.map((col, colIdx) => {
            const levelColors = LEVEL_COLORS[col.level % LEVEL_COLORS.length];
            const header = LEVEL_HEADERS[col.level] || `Cấp ${col.level}`;
            
            return (
              <div
                key={`col-${col.level}-${col.parentId}`}
                style={{
                  minWidth: '130px',
                  maxWidth: '180px',
                  borderRight: colIdx < columns.length - 1 ? '1px solid #eee' : 'none',
                  maxHeight: '350px',
                  overflowY: 'auto'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '8px 12px',
                  background: '#f8f9fa',
                  fontWeight: '600',
                  fontSize: '11px',
                  color: '#666',
                  borderBottom: '1px solid #eee',
                  position: 'sticky',
                  top: 0
                }}>
                  {header}
                </div>
                
                {/* Category Items */}
                {col.categories.map(cat => {
                  const hasChildren = getChildren(cat.id).length > 0;
                  const isHovered = hoveredPath[col.level] === cat.id;
                  const isSelected = value === cat.id;
                  
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => handleHover(col.level, cat.id)}
                      onClick={() => handleSelect(cat.id)}
                      style={{
                        padding: '9px 12px',
                        cursor: 'pointer',
                        background: isHovered ? levelColors.hover : (isSelected ? levelColors.selected : '#fff'),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        transition: 'background 0.15s',
                        borderBottom: '1px solid #f5f5f5'
                      }}
                    >
                      <span style={{
                        color: col.level === 1 ? getGenderColor(cat.name) : '#333',
                        fontWeight: isSelected ? '600' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {cat.name}
                      </span>
                      {hasChildren && (
                        <span style={{ color: '#999', marginLeft: '4px', flexShrink: 0 }}>›</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    PName: '',
    pName: '',
    description: '',
    price: '',
    categoryId: '',
    brandId: ''
  });
  // Color variants: [{ colorName, colorCode, images: [File], previews: [url] }]
  const [colorVariants, setColorVariants] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [uploading, setUploading] = useState(false);
  // Thumbnail states (2 images for home page hover effect)
  const [thumbnail1, setThumbnail1] = useState(null);
  const [thumbnail1Preview, setThumbnail1Preview] = useState(null);
  const [thumbnail2, setThumbnail2] = useState(null);
  const [thumbnail2Preview, setThumbnail2Preview] = useState(null);
  const [homeSections, setHomeSections] = useState([]);
  const thumb1InputRef = useRef(null);
  const thumb2InputRef = useRef(null);
  const navigate = useNavigate();
  
  // Form collapse state
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Category filter state (cascading like create form)
  const [filterCategoryPath, setFilterCategoryPath] = useState([]);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res?.data.role !== 'ADMIN') {
          navigate('/login');
          return;
        }
      } catch {
        navigate('/login');
      }
    };
    fetchCurrentUser();
  }, [navigate]);
  // fetch products, categories and brands in parallel and normalize
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [pRes, cRes, bRes, sectionsRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories?flat=true'),
          api.get('/brands'),
          api.get('/home-sections').catch(() => ({ data: [] }))
        ]);

        // normalize categories with hierarchy info
        const rawCats = Array.isArray(cRes.data) ? cRes.data : [];
        const normalizedCats = rawCats.map(item => {
          if (!item) return null;
          const level = item.level || 0;
          const indent = '  '.repeat(level);
          const displayName = `${indent}${item.name || item.c_name || item.cName}`;
          return { 
            id: item.id || item.c_id || item.cId, 
            name: item.name || item.c_name || item.cName,
            displayName,
            level,
            parentId: item.parentId,
            raw: item 
          };
        }).filter(Boolean);

        // normalize brands
        const rawBrands = Array.isArray(bRes.data) ? bRes.data : [];
        const normalizedBrands = rawBrands.map(item => {
          if (!item) return null;
          if (item.id !== undefined && item.name !== undefined) return { id: item.id, name: item.name, raw: item };
          if (item.brand_id !== undefined && item.brand_name !== undefined) return { id: item.brand_id, name: item.brand_name, raw: item };
          if (item.b_id !== undefined && item.b_name !== undefined) return { id: item.b_id, name: item.b_name, raw: item };
          const idKey = Object.keys(item).find(k => /id$/i.test(k)) || Object.keys(item)[0];
          const nameKey = Object.keys(item).find(k => /name$/i.test(k)) || Object.keys(item)[1] || idKey;
          return { id: item[idKey], name: item[nameKey], raw: item };
        }).filter(Boolean);

        // normalize products into a lightweight list (strip heavy nested fields like details/images)
        const rawProducts = Array.isArray(pRes.data) ? pRes.data : [];
        const normalizedProducts = rawProducts.map(item => {
          const id = item.id ?? item.p_id ?? item.PId ?? item.pId;
          const name = item.name ?? item.PName ?? item.pName ?? item.p_name ?? null;
          const description = item.description ?? item.pDesc ?? item.p_desc ?? item.desc ?? null;
          const price = item.price ?? null;
          const categoryId = item.categoryId ?? item.c_id ?? item.cId ?? item.category_id ?? item.category?.id ?? item.category?.c_id ?? null;
          const categoryName = item.categoryName ?? item.category?.c_name ?? item.category?.name ?? null;
          const brandName = item.brandName ?? item.brand?.brand_name ?? item.brand?.name ?? null;
          const isActive = item.isActive ?? item.is_active ?? item.isAvailable ?? item.available ?? false;
          const averageRating = item.averageRating ?? null;
          // Ưu tiên lấy thumbnail_1 từ product, fallback sang ảnh từ variants
          let thumbnail = item.thumbnail1 ?? item.thumbnail_1 ?? null;
          if (!thumbnail && item.variants && Array.isArray(item.variants)) {
            for (const v of item.variants) {
              const imgs = v.imgList || v.img_list || [];
              if (imgs.length > 0) {
                thumbnail = imgs[0];
                break;
              }
            }
          }
          return { id, name, description, price, categoryId, categoryName, brandName, isActive, averageRating, thumbnail };
        });

        if (!mounted) return;
        setCategories(normalizedCats);
        setBrands(normalizedBrands);
        setProducts(normalizedProducts);
        setHomeSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
        
        // Chỉ fetch ảnh từ product-details cho các sản phẩm chưa có thumbnail
        const productsWithoutThumbnail = normalizedProducts.filter(p => !p.thumbnail && p.id);
        for (const product of productsWithoutThumbnail) {
          try {
            const detailsRes = await api.get(`/product-details/product/${product.id}`);
            const details = Array.isArray(detailsRes.data) ? detailsRes.data : [];
            if (details.length > 0) {
              let imgList = details[0].imgList || details[0].img_list || [];
              if (typeof imgList === 'string') {
                try { imgList = JSON.parse(imgList); } catch { imgList = []; }
              }
              if (Array.isArray(imgList) && imgList.length > 0 && imgList[0]) {
                if (mounted) {
                  setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, thumbnail: imgList[0] } : p
                  ));
                }
              }
            }
          } catch {
            // Ignore errors for individual product details
          }
        }
      } catch (err) {
        console.error('Failed to fetch product/category/brand lists', err);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);


  // Get selected filter category ID (last in path)
  const filterCategoryId = filterCategoryPath.length > 0 ? filterCategoryPath[filterCategoryPath.length - 1] : null;

  // Get all descendant category IDs for filtering
  const getDescendantIds = useCallback((parentId, cats) => {
    const ids = [parentId];
    const children = cats.filter(c => c.parentId === parentId);
    children.forEach(child => {
      ids.push(...getDescendantIds(child.id, cats));
    });
    return ids;
  }, []);

  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Filter by category (include all descendants)
    if (filterCategoryId) {
      const allowedCategoryIds = getDescendantIds(filterCategoryId, categories).map(id => String(id));
      result = result.filter(p => p.categoryId && allowedCategoryIds.includes(String(p.categoryId)));
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product =>
        (product.name || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term) ||
        (product.categoryName || '').toLowerCase().includes(term) ||
        (product.brandName || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [products, searchTerm, filterCategoryId, categories, getDescendantIds]);

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle thumbnail selection (for home page hover effect)
  const handleThumbnailSelect = (e, thumbNum) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const preview = URL.createObjectURL(file);
    if (thumbNum === 1) {
      setThumbnail1(file);
      setThumbnail1Preview(preview);
    } else {
      setThumbnail2(file);
      setThumbnail2Preview(preview);
    }
  };

  const clearThumbnails = () => {
    setThumbnail1(null);
    setThumbnail1Preview(null);
    setThumbnail2(null);
    setThumbnail2Preview(null);
    if (thumb1InputRef.current) thumb1InputRef.current.value = '';
    if (thumb2InputRef.current) thumb2InputRef.current.value = '';
  };



  const addProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Tên sản phẩm là bắt buộc');
      return;
    }
    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price) || 0,
      categoryId: productForm.categoryId || '',
      brandId: productForm.brandId || '',
      isActive: true
    };
    try {
      console.log(payload);
      const res = await api.post('/products', payload);
      const data = res?.data || {};
      const productId = data.id || data.productId || data.p_id || data.pId;

      // Upload thumbnails if selected
      if ((thumbnail1 || thumbnail2) && productId) {
        await uploadThumbnailsToProduct(productId);
      }


      // Normalize created product for display
      const categoryName = categories.find(c => String(c.id) === String(payload.categoryId))?.name || '';
      const brandName = brands.find(b => String(b.id) === String(payload.brandId))?.name || '';
      const normalizedProduct = {
        id: productId,
        name: data.name || payload.name,
        description: data.description || payload.description,
        price: data.price ?? payload.price,
        categoryName,
        brandName,
        isActive: data.isActive ?? payload.isActive,
        averageRating: null,
        thumbnail: thumbnail1Preview || null
      };

      // Upload color variants if any
      if (colorVariants.length > 0 && productId) {
        await uploadColorVariants(productId);
      }

      setProducts(p => [normalizedProduct, ...p]);
      setProductForm({ name: '', description: '', price: '', categoryId: '', brandId: '' });
      clearThumbnails();
      setColorVariants([]);
      alert('Tạo sản phẩm thành công!');
    } catch (err) {
      console.error('Add product failed', err);
      alert('Không thể thêm sản phẩm: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Upload thumbnails to product (for home page hover effect)
  const uploadThumbnailsToProduct = async (productId) => {
    if (!thumbnail1 && !thumbnail2) return;
    
    try {
      const thumbnailData = {};
      
      if (thumbnail1) {
        const base64_1 = await fileToBase64(thumbnail1);
        thumbnailData.thumbnail1 = { data: base64_1, contentType: thumbnail1.type || 'image/jpeg' };
      }
      
      if (thumbnail2) {
        const base64_2 = await fileToBase64(thumbnail2);
        thumbnailData.thumbnail2 = { data: base64_2, contentType: thumbnail2.type || 'image/jpeg' };
      }
      
      await api.post(`/products/${productId}/thumbnails`, thumbnailData);
      console.log('Thumbnails uploaded successfully');
    } catch (err) {
      console.error('Upload thumbnails failed:', err);
      // Don't alert, just log - product was created successfully
    }
  };

  // Helper to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload color variants (create ONE product detail per color with sizes array)
  const uploadColorVariants = async (productId) => {
    if (colorVariants.length === 0) return;
    
    setUploading(true);
    try {
      for (const variant of colorVariants) {
        if (!variant.colorName.trim()) continue;
        
        // Lấy tất cả sizes (kể cả amount = 0)
        const allSizes = (variant.sizes || []).filter(s => s.size);
        const sizesWithStock = allSizes.filter(s => s.amount > 0);
        
        if (sizesWithStock.length === 0) {
          console.log(`Skipping variant ${variant.colorName} - no sizes with stock`);
          continue;
        }
        
        try {
          // Create ONE product detail with sizes array
          const createRes = await api.post('/product-details', {
            productId: productId,
            colorName: variant.colorName.trim(),
            colorCode: variant.colorCode || '#000000',
            description: variant.description?.trim() || '',
            sizes: allSizes, // Send full sizes array
            imgList: JSON.stringify([]),
            inStock: variant.status !== 'out_of_stock'
          });
          
          const newDetail = createRes.data;
          const pdId = newDetail.pdId || newDetail.pd_id || newDetail.id;
          
          // Upload images for this color variant
          if (pdId && variant.images.length > 0) {
            const images = await Promise.all(
              variant.images.map(file => {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve({ data: base64, contentType: file.type || 'image/jpeg' });
                  };
                  reader.readAsDataURL(file);
                });
              })
            );
            await api.post(`/product-details/${pdId}/images`, { images });
          }
        } catch (err) {
          console.error(`Failed to create variant ${variant.colorName}:`, err);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  // Available sizes - hiển thị sẵn tất cả
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Free Size'];

  // Tạo object sizes với tất cả size, amount mặc định = 0
  const createDefaultSizes = () => {
    return availableSizes.map(size => ({ size, amount: 0 }));
  };

  // Color variant management
  const addColorVariant = () => {
    setColorVariants([...colorVariants, { 
      colorName: '', 
      colorCode: '#000000', 
      description: '', // Mô tả cho phân loại
      sizes: createDefaultSizes(), // Tất cả sizes với amount = 0
      status: 'available',
      images: [], 
      previews: [] 
    }]);
  };

  const removeColorVariant = (index) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  const updateColorVariant = (index, field, value) => {
    const updated = [...colorVariants];
    updated[index][field] = value;
    setColorVariants(updated);
  };

  // Handle size amount changes within a color variant
  const updateVariantSizeAmount = (variantIndex, sizeIndex, amount) => {
    const updated = [...colorVariants];
    updated[variantIndex].sizes[sizeIndex].amount = parseInt(amount) || 0;
    setColorVariants(updated);
  };

  const addImagesToVariant = (index, files) => {
    const updated = [...colorVariants];
    const newImages = [...updated[index].images, ...Array.from(files)].slice(0, 5);
    updated[index].images = newImages;
    updated[index].previews = newImages.map(f => URL.createObjectURL(f));
    setColorVariants(updated);
  };

  const removeImageFromVariant = (variantIndex, imageIndex) => {
    const updated = [...colorVariants];
    updated[variantIndex].images = updated[variantIndex].images.filter((_, i) => i !== imageIndex);
    updated[variantIndex].previews = updated[variantIndex].images.map(f => URL.createObjectURL(f));
    setColorVariants(updated);
  };

  // Add product to home section
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedProductForSection, setSelectedProductForSection] = useState(null);

  const openSectionModal = (product) => {
    setSelectedProductForSection(product);
    setShowSectionModal(true);
  };

  const addToSection = async (sectionId) => {
    if (!selectedProductForSection) return;
    try {
      await api.post(`/home-sections/${sectionId}/products`, { productId: selectedProductForSection.id });
      // Refresh sections
      const sectionsRes = await api.get('/home-sections');
      setHomeSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
      setShowSectionModal(false);
      setSelectedProductForSection(null);
      alert('Đã thêm sản phẩm vào section!');
    } catch (err) {
      console.error('Add to section failed:', err);
      alert('Không thể thêm vào section: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Check if product is in any section
  const getProductSections = (productId) => {
    return homeSections.filter(s => s.products?.some(p => p.id === productId));
  };

  // Note: Edit functionality moved to AdminProductDetails page

  const remove = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete product failed', err);
      setProducts((p) => p.filter(x => x.id !== id));
      alert(err?.response?.data?.message || 'Failed to delete product on server');
    }
  };

  // Helper functions to get names from IDs
  const getCategoryName = (idOrName) => {
    if (!idOrName) return 'N/A';
    const found = categories.find(c => String(c.id) === String(idOrName) || String(c.name) === String(idOrName));
    return found ? found.name : String(idOrName);
  };

  const getBrandName = (idOrName) => {
    if (!idOrName) return 'N/A';
    const found = brands.find(b => String(b.id) === String(idOrName) || String(b.name) === String(idOrName));
    return found ? found.name : String(idOrName);
  };

  return (
    <AdminLayout title="Quản Lý Sản Phẩm">
      <div style={{ maxWidth: 1200 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <button className="btn" style={{ background: '#008B8B', color: '#fff' }} onClick={() => navigate('/admin/products')}>
            🔄 Làm Mới
          </button>
        </div>

      {/* Search Bar & Category Filter */}
      <div className="mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>
          </div>
          <div className="col-md-5">
            {/* Cascading Category Filter */}
            <div className="d-flex gap-2 align-items-center">
              <small className="text-muted">Lọc danh mục:</small>
              <div style={{ flex: 1 }}>
                <CascadingCategorySelector
                  categories={categories}
                  value={filterCategoryId}
                  onChange={(e) => {
                    const catId = e.target?.value ?? e;
                    if (catId) {
                      setFilterCategoryPath([catId]);
                    } else {
                      setFilterCategoryPath([]);
                    }
                  }}
                />
              </div>
              {filterCategoryId && (
                <button 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={() => setFilterCategoryPath([])}
                  title="Xóa bộ lọc"
                >×</button>
              )}
            </div>
          </div>
          <div className="col-md-3 text-end">
            <small className="text-muted me-2">
              {filteredProducts.length}/{products.length} SP
            </small>
            <button
              className="btn btn-sm"
              style={{ background: showCreateForm ? '#dc3545' : '#008B8B', color: '#fff' }}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '▲ Thu gọn' : '▼ Tạo sản phẩm'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Creation Form - Collapsible */}
      {showCreateForm && (
      <div className="mb-4 p-3" style={{ border: '2px solid #008B8B', borderRadius: '8px', background: '#fff' }}>
        <h4>Tạo Sản Phẩm Mới</h4>
        <form onSubmit={addProduct}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                name="name"
                placeholder="Tên sản phẩm"
                value={productForm.name}
                onChange={handleProductChange}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                name="price"
                placeholder="Price"
                type="number"
                value={productForm.price}
                onChange={handleProductChange}
              />
            </div>
            <div className="col-md-3">
              <CascadingCategorySelector
                categories={categories}
                value={productForm.categoryId}
                onChange={handleProductChange}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="brandId"
                value={productForm.brandId}
                onChange={handleProductChange}
                required
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="col-md-12">
              <textarea
                className="form-control"
                name="description"
                placeholder="Product description"
                value={productForm.description}
                onChange={handleProductChange}
                rows="2"
              />
            </div>
            
            {/* Thumbnail Upload Section - 2 images for home page hover effect */}
            {(
              <div className="col-md-12 mt-3">
                <label className="form-label fw-bold">🖼️ Ảnh nền trang chủ (2 ảnh - hover để đổi)</label>
                <small className="d-block text-muted mb-2">Ảnh 1: hiển thị mặc định | Ảnh 2: hiển thị khi di chuột vào</small>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="border rounded p-2" style={{ background: '#f8f9fa' }}>
                      <label className="form-label small">Ảnh 1 (Mặc định)</label>
                      <input
                        ref={thumb1InputRef}
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) => handleThumbnailSelect(e, 1)}
                      />
                      {thumbnail1Preview && (
                        <div className="mt-2 text-center">
                          <img src={thumbnail1Preview} alt="Thumb 1" style={{ maxHeight: 100, borderRadius: 4 }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded p-2" style={{ background: '#f8f9fa' }}>
                      <label className="form-label small">Ảnh 2 (Khi hover)</label>
                      <input
                        ref={thumb2InputRef}
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) => handleThumbnailSelect(e, 2)}
                      />
                      {thumbnail2Preview && (
                        <div className="mt-2 text-center">
                          <img src={thumbnail2Preview} alt="Thumb 2" style={{ maxHeight: 100, borderRadius: 4 }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {(thumbnail1 || thumbnail2) && (
                  <button type="button" className="btn btn-outline-danger btn-sm mt-2" onClick={clearThumbnails}>
                    Xóa ảnh nền
                  </button>
                )}
              </div>
            )}

            {/* Color Variants Section - Each color has its own images */}
            <div className="col-md-12 mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <label className="form-label fw-bold mb-0">🎨 Phân loại sản phẩm (Màu sắc, Size, Số lượng)</label>
                    <small className="d-block text-muted">Mỗi phân loại có: màu, size, số lượng, trạng thái và ảnh riêng (tối đa 5 ảnh)</small>
                  </div>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={addColorVariant}>
                    + Thêm phân loại
                  </button>
                </div>
                
                {colorVariants.length === 0 ? (
                  <div className="text-muted small p-3 border rounded" style={{ background: '#f8f9fa' }}>
                    <p className="mb-2">💡 <strong>Hướng dẫn:</strong></p>
                    <ul className="mb-0 ps-3">
                      <li>Click "Thêm phân loại" để thêm biến thể sản phẩm</li>
                      <li>Mỗi phân loại gồm: Màu sắc, Size, Số lượng, Trạng thái</li>
                      <li>Mỗi phân loại có thể upload tối đa 5 ảnh riêng</li>
                    </ul>
                  </div>
                ) : (
                  <div className="border rounded p-2" style={{ background: '#f8f9fa' }}>
                    {colorVariants.map((variant, vIdx) => (
                      <div key={vIdx} className="mb-3 p-3 border rounded bg-white" style={{ borderLeft: `4px solid ${variant.colorCode} !important` }}>
                        {/* Color info row */}
                        <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                          <span className="badge" style={{ background: variant.colorCode, color: '#fff', padding: '8px 12px' }}>
                            Phân loại {vIdx + 1}
                          </span>
                          <input
                            type="color"
                            value={variant.colorCode}
                            onChange={(e) => updateColorVariant(vIdx, 'colorCode', e.target.value)}
                            style={{ width: 36, height: 30, padding: 0, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
                            title="Chọn mã màu"
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Tên màu *"
                            value={variant.colorName}
                            onChange={(e) => updateColorVariant(vIdx, 'colorName', e.target.value)}
                            style={{ maxWidth: 140 }}
                            required
                          />
                          <select
                            className="form-select form-select-sm"
                            value={variant.status || 'available'}
                            onChange={(e) => updateColorVariant(vIdx, 'status', e.target.value)}
                            style={{ maxWidth: 110 }}
                          >
                            <option value="available">Còn hàng</option>
                            <option value="out_of_stock">Hết hàng</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm ms-auto"
                            onClick={() => removeColorVariant(vIdx)}
                            title="Xóa phân loại"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Description input */}
                        <div className="mt-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Mô tả phân loại (chất liệu, đặc điểm...)"
                            value={variant.description || ''}
                            onChange={(e) => updateColorVariant(vIdx, 'description', e.target.value)}
                          />
                        </div>

                        {/* Sizes section - hiển thị tất cả sizes */}
                        <div className="mt-2 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                          <small className="fw-bold d-block mb-2">📏 Số lượng theo size (nhập 0 nếu không có):</small>
                          <div className="d-flex flex-wrap gap-2">
                            {(variant.sizes || []).map((sizeItem, sIdx) => (
                              <div key={sIdx} className="d-flex align-items-center gap-1" style={{ minWidth: '100px' }}>
                                <span className="badge bg-secondary" style={{ minWidth: '55px', textAlign: 'center' }}>
                                  {sizeItem.size}
                                </span>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="0"
                                  value={sizeItem.amount}
                                  onChange={(e) => updateVariantSizeAmount(vIdx, sIdx, e.target.value)}
                                  style={{ width: '60px' }}
                                  title={`Số lượng size ${sizeItem.size}`}
                                />
                              </div>
                            ))}
                          </div>
                          <small className="text-muted mt-1 d-block">
                            Tổng: {(variant.sizes || []).reduce((sum, s) => sum + (s.amount || 0), 0)} sản phẩm | 
                            {' '}{(variant.sizes || []).filter(s => s.amount > 0).length} size có hàng
                          </small>
                        </div>
                        
                        {/* Image upload for this color */}
                        <div className="mt-2">
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              accept="image/*"
                              multiple
                              onChange={(e) => addImagesToVariant(vIdx, e.target.files)}
                              disabled={variant.images.length >= 5}
                              style={{ maxWidth: 300 }}
                            />
                            <small className="text-muted">{variant.images.length}/5 ảnh</small>
                          </div>
                        </div>
                        
                        {/* Image previews for this color */}
                        {variant.previews.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {variant.previews.map((src, imgIdx) => (
                              <div key={imgIdx} style={{ position: 'relative' }}>
                                <img
                                  src={src}
                                  alt={`${variant.colorName} ${imgIdx + 1}`}
                                  style={{ 
                                    width: 70, height: 70, objectFit: 'cover', borderRadius: 6, 
                                    border: `3px solid ${variant.colorCode}`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImageFromVariant(vIdx, imgIdx)}
                                  style={{
                                    position: 'absolute', top: -8, right: -8,
                                    background: '#dc3545', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: 20, height: 20, fontSize: 11,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                  }}
                                >×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {uploading && <div className="text-info mt-2">⏳ Đang upload ảnh...</div>}
              </div>

            {/* Submit Button - Moved to bottom */}
            <div className="col-md-12 mt-3">
              <button className="btn btn-lg" style={{ background: '#008B8B', color: '#fff', width: '100%' }} type="submit">
                🚀 Tạo Sản Phẩm
              </button>
            </div>
          </div>
        </form>
      </div>
      )}

      <div className="list-group">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              {searchTerm ? `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}"` : 'Không có sản phẩm nào'}
            </div>
            {searchTerm && (
              <button
                className="btn btn-link btn-sm"
                onClick={() => setSearchTerm('')}
              >
                Xóa tìm kiếm để hiển thị tất cả sản phẩm
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                {/* Product Thumbnail */}
                <div style={{ marginRight: 15, flexShrink: 0 }}>
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/no-image.svg';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 80,
                      height: 80,
                      background: '#f0f0f0',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: 12
                    }}>
                      No Image
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/admin/products/${p.id}`} className="h5 d-block text-decoration-none">{p.name}</Link>
                  <div className="text-muted small">
                    Category: {p.categoryName || getCategoryName(p.categoryName)} — Brand: {p.brandName || getBrandName(p.brandName)}
                  </div>
                  {p.description && <div className="text-muted small mt-1">{p.description.length > 120 ? `${p.description.substring(0, 120)}...` : p.description}</div>}

                  <div className="mt-2">
                    <span className="badge bg-success me-2">{p.price ? `${p.price.toLocaleString()} VND` : 'No price'}</span>

                    {/* averageRating shown below price */}
                    <div className="small text-muted mt-1">
                      {typeof p.averageRating === 'number'
                        ? `⭐ ${p.averageRating.toFixed(1)} / 5`
                        : (p.averageRating ? `⭐ ${Number(p.averageRating).toFixed(1)} / 5` : 'No rating')}
                    </div>


                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  {/* Add to Home button */}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openSectionModal(p)}
                    title="Quản lý hiển thị trên trang chủ"
                  >
                    {getProductSections(p.id).length > 0 
                      ? `📍 ${getProductSections(p.id).length} Section` 
                      : '+ Hiển thị trang chủ'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.id)}>Xóa</button>
                  <Link to={`/admin/products/${p.id}`} className="btn btn-sm btn-primary">Chi tiết</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Section Selection Modal */}
      {showSectionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowSectionModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, minWidth: 450, maxWidth: 550
          }} onClick={e => e.stopPropagation()}>
            <h5 className="mb-3">🏠 Hiển thị trên Trang Chủ</h5>
            <p className="text-muted small mb-2">
              Sản phẩm: <strong>{selectedProductForSection?.name}</strong>
            </p>
            
            {/* Check if product is already in any section */}
            {(() => {
              const productSections = homeSections.filter(s => s.products?.some(p => p.id === selectedProductForSection?.id));
              if (productSections.length > 0) {
                return (
                  <div className="alert alert-success py-2 mb-3">
                    <small>✅ Đã có trong: {productSections.map(s => s.title).join(', ')}</small>
                  </div>
                );
              }
              return (
                <div className="alert alert-info py-2 mb-3">
                  <small>ℹ️ Sản phẩm chưa thuộc section nào. Chọn cách hiển thị:</small>
                </div>
              );
            })()}

            {/* Option 1: Add to Section */}
            <div className="mb-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
              <h6 className="mb-2">📂 Thêm vào Section (hiển thị đầu trang)</h6>
              {homeSections.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-muted small mb-2">Chưa có section nào.</p>
                  <Link to="/admin/home-sections" className="btn btn-primary btn-sm">
                    Tạo Section mới
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {homeSections.map(section => {
                    const isInSection = section.products?.some(p => p.id === selectedProductForSection?.id);
                    return (
                      <button
                        key={section.id}
                        className={`btn btn-sm ${isInSection ? 'btn-success' : 'btn-outline-primary'}`}
                        onClick={() => !isInSection && addToSection(section.id)}
                        disabled={isInSection}
                      >
                        {isInSection ? '✓ ' : '+ '}{section.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Option 2: Show without section */}
            <div className="mb-3 p-3 border rounded" style={{ background: '#fff3cd' }}>
              <h6 className="mb-2">📦 Không thêm vào Section</h6>
              <p className="text-muted small mb-2">
                Sản phẩm sẽ hiển thị ở <strong>cuối trang chủ</strong> (dưới các sections).
                Chỉ cần sản phẩm có trạng thái Active là sẽ tự động hiển thị.
              </p>
              <div className="d-flex gap-2">
                <span className={`badge ${selectedProductForSection?.isActive ? 'bg-success' : 'bg-warning'}`}>
                  {selectedProductForSection?.isActive ? '✅ Đang Active' : '⚠️ Chưa Active'}
                </span>
              </div>
            </div>
            
            <div className="d-flex justify-content-between">
              <Link to="/admin/home-sections" className="btn btn-outline-primary btn-sm">
                ⚙️ Quản lý Sections
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSectionModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
