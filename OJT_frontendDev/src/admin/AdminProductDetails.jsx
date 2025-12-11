import React, { useEffect, useState, useRef, useMemo } from 'react';
import 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import api from '../api/axios';

const STORAGE_KEY = 'admin_products_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

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

// Cascading Category Selector Component
const CascadingCategorySelector = ({ categories, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState({});
  const containerRef = useRef(null);

  const childrenMap = useMemo(() => {
    const map = { root: [] };
    categories.forEach(cat => {
      const parentKey = cat.parentId || 'root';
      if (!map[parentKey]) map[parentKey] = [];
      map[parentKey].push(cat);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    return map;
  }, [categories]);

  const maxLevel = useMemo(() => {
    return Math.max(0, ...categories.map(c => c.level || 0));
  }, [categories]);

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

  const getChildren = (parentId) => childrenMap[parentId] || [];

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
    onChange(catId);
    setIsOpen(false);
  };

  const handleHover = (level, catId) => {
    const newPath = {};
    for (let i = 0; i < level; i++) {
      if (hoveredPath[i]) newPath[i] = hoveredPath[i];
    }
    newPath[level] = catId;
    setHoveredPath(newPath);
  };

  const buildColumns = () => {
    const columns = [];
    const rootCats = getChildren('root');
    if (rootCats.length > 0) {
      columns.push({ level: 0, parentId: 'root', categories: rootCats });
    }
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

  const getGenderColor = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower === 'women' || lower === 'nữ') return '#e91e63';
    if (lower === 'men' || lower === 'nam') return '#2196f3';
    if (lower === 'unisex') return '#9c27b0';
    return '#333';
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
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

// Resize image to max dimensions while maintaining aspect ratio
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.85) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
          const preview = canvas.toDataURL('image/jpeg', quality);
          resolve({ file: resizedFile, preview, width, height });
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  // Default sizes với tất cả options
  const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Free Size'].map(size => ({ size, amount: 0 }));
  
  const [variantForm, setVariantForm] = useState({
    colorName: '',
    colorCode: '',
    description: '', // Mô tả cho phân loại
    sizes: defaultSizes, // Tất cả sizes với amount = 0
    status: 'available'
  });
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  
  // Product edit state
  const [editingProduct, setEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    brandId: ''
  });

  // Separate image management state
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedVariantForImages, setSelectedVariantForImages] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [cropperData, setCropperData] = useState({
    show: false,
    originalImage: null,
    croppedImage: null,
    imageIndex: -1
  });
  const [crop, setCrop] = useState({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: 1 // Square aspect ratio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  const [, setCurrentUser] = useState({
    email: '',
    fullName: '',
    role: '',
    phoneNumber: '',
    address: ''
  });
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.data.role !== 'ADMIN') {
        navigate('/login');
        return;
      }
      setCurrentUser(res.data);
    } catch {
      navigate('/login');
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    let mounted = true;

    const loadFromLocal = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const products = JSON.parse(raw);
      const found = products.find(p => p.p_id === id);
      if (mounted) setProduct(found || null);

      const cat = localStorage.getItem('admin_categories_v1');
      if (cat) setCategories(JSON.parse(cat));

      const br = localStorage.getItem('admin_brands_v1');
      if (br) setBrands(JSON.parse(br));
    };

    const tryFetchFromApi = async () => {
      try {
        // Fetch categories and brands from API
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories?flat=true').catch(() => ({ data: [] })),
          api.get('/brands').catch(() => ({ data: [] }))
        ]);
        
        // Normalize categories with hierarchy info
        const cats = (Array.isArray(catRes.data) ? catRes.data : []).map(c => ({
          c_id: c.id || c.cId || c.c_id,
          c_name: c.name || c.cName || c.c_name,
          id: c.id || c.cId || c.c_id,
          name: c.name || c.cName || c.c_name,
          parentId: c.parentId || c.parent_id || null,
          level: c.level || 0
        }));
        if (mounted) setCategories(cats);
        
        // Normalize brands
        const brs = (Array.isArray(brandRes.data) ? brandRes.data : []).map(b => ({
          brand_id: b.brandId || b.id || b.brand_id,
          brand_name: b.brandName || b.name || b.brand_name
        }));
        if (mounted) setBrands(brs);

        const res = await api.get(`/product-details/product/${id}`);
        const data = res && res.data ? res.data : null;
        // backend may return an array of detail objects for the product
        // Always try to fetch the product info so we can display product details
        // even when `data` is an empty array (no variants yet).
        let p = null;
        try {
          p = await api.get(`/products/${id}`);
        } catch {
          // ignore product fetch errors for now; we'll decide fallback below
        }

        if (Array.isArray(data)) {
          // build normalized product using product info when available
          const first = data.length > 0 ? data[0] : null;
          const normalized = {
            p_id: first?.productId ?? p?.data?.id ?? p?.data?.productId ?? id,
            p_name: first?.productName ?? p?.data?.name ?? p?.data?.productName ?? '',
            c_id: p?.data?.categoryId ?? '',
            brand_id: p?.data?.brandID ?? '',
            categoryName: p?.data?.categoryName ?? first?.categoryName ?? '',
            brandName: p?.data?.brandName ?? first?.brandName ?? '',
            desc: p?.data?.desc ?? p?.data?.description ?? '',
            price: p?.data?.price ? `${p.data.price} VND` : null,
            thumbnail1: p?.data?.thumbnail1 || null,
            thumbnail2: p?.data?.thumbnail2 || null,
            details: (data || []).map(d => {
              // imgList may be JSON string or already array
              let imgs = [];
              try {
                if (typeof d.imgList === 'string') imgs = JSON.parse(d.imgList);
                else if (Array.isArray(d.imgList)) imgs = d.imgList;
              } catch (e) {
                imgs = [];
              }
              // Parse sizes array
              let sizes = [];
              if (d.sizes) {
                try {
                  sizes = typeof d.sizes === 'string' ? JSON.parse(d.sizes) : d.sizes;
                } catch (e) { sizes = []; }
              }
              // Fallback: if no sizes but has single size/amount
              if (sizes.length === 0 && d.size) {
                sizes = [{ size: d.size, amount: d.amount || 0 }];
              }
              
              return {
                pd_id: d.pdId ?? d.pd_id ?? d.pdId,
                img_list: imgs,
                sizes: sizes,
                size: d.size ?? d.sz ?? '', // Keep for backward compatibility
                color: d.colorName ?? d.color ?? '',
                colorId: d.colorId ?? d.color_id ?? null,
                colorCode: d.colorCode ?? null,
                description: d.description ?? d.desc ?? '',
                amount: d.amount ?? d.qty ?? 0,
                price: d.price ?? null,
                status: d.inStock === false ? 'out_of_stock' : 'available'
              };
            })
          };

          // If there are no details but we have product info, still show product
          if (mounted) {
            setProduct(normalized);
          } else {
            // fallback to local if we couldn't construct a useful product
            if (!first && !p) loadFromLocal();
          }
        } else if (data && typeof data === 'object') {
          // backend returned a single detail object
          let imgs = [];
          try {
            if (typeof data.imgList === 'string') imgs = JSON.parse(data.imgList);
            else if (Array.isArray(data.imgList)) imgs = data.imgList;
          } catch (e) { imgs = []; }

          const normalized = {
            p_id: data.productId ?? p?.data?.id ?? id,
            p_name: data.productName ?? p?.data?.name ?? '',
            c_id: p?.data?.categoryId ?? '',
            brand_id: p?.data?.brandID ?? '',
            categoryName: p?.data?.categoryName ?? data.categoryName ?? '',
            brandName: p?.data?.brandName ?? data.brandName ?? '',
            desc: p?.data?.desc ?? p?.data?.description ?? '',
            thumbnail1: p?.data?.thumbnail1 || null,
            thumbnail2: p?.data?.thumbnail2 || null,
            price: p?.data?.price ? `${p.data.price} VND` : null,
            details: [(() => {
              // Parse sizes array
              let sizes = [];
              if (data.sizes) {
                try {
                  sizes = typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes;
                } catch (e) { sizes = []; }
              }
              if (sizes.length === 0 && data.size) {
                sizes = [{ size: data.size, amount: data.amount || 0 }];
              }
              return {
                pd_id: data.pdId ?? data.pd_id ?? null,
                img_list: imgs,
                sizes: sizes,
                size: data.size ?? data.sz ?? '',
                color: data.colorName ?? data.color ?? '',
                colorId: data.colorId ?? data.color_id ?? null,
                colorCode: data.colorCode ?? null,
                description: data.description ?? data.desc ?? '',
                amount: data.amount ?? data.qty ?? 0,
                price: data.price ?? null,
                status: data.inStock === false ? 'out_of_stock' : 'available'
              };
            })()]
          };

          if (mounted) setProduct(normalized);
        } else {
          // no useful product-details response; if product endpoint succeeded show product, else fallback to local
          if (p && p.data) {
            const normalized = {
              p_id: p.data.id ?? p.data.productId ?? id,
              p_name: p.data.name ?? p.data.productName ?? '',
              c_id: p.data.categoryId ?? '',
              brand_id: p.data.brandID ?? '',
              categoryName: p.data.categoryName ?? '',
              brandName: p.data.brandName ?? '',
              desc: p.data.desc ?? p.data.description ?? '',
              price: p?.data?.price ? `${p.data.price} VND` : null,
              thumbnail1: p.data.thumbnail1 || null,
              thumbnail2: p.data.thumbnail2 || null,
              details: []
            };
            if (mounted) setProduct(normalized);
          } else {
            loadFromLocal();
          }
        }
      } catch (err) {
        // network or server error; fallback to local
        loadFromLocal();
      }
    };

    // try API first, then localStorage fallback
    tryFetchFromApi();

    return () => { mounted = false; };
  }, [id]);

  const removeDetail = (pd_id) => {
    if (!confirm('Xóa chi tiết sản phẩm này?')) return;
    // Update UI only; backend deletion can be implemented separately if desired
    if (!product) return;
    const newDetails = (product.details || []).filter(d => d.pd_id !== pd_id);
    setProduct({ ...product, details: newDetails });
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((f) => ({ ...f, [name]: value }));
  };

  // Available sizes - hiển thị sẵn tất cả
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Free Size'];

  // Tạo object sizes với tất cả size, amount mặc định = 0
  const createDefaultSizes = () => {
    return availableSizes.map(size => ({ size, amount: 0 }));
  };

  // Handle size amount changes
  const handleSizeAmountChange = (index, amount) => {
    setVariantForm((f) => {
      const newSizes = [...f.sizes];
      newSizes[index] = { ...newSizes[index], amount: parseInt(amount) || 0 };
      return { ...f, sizes: newSizes };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log(files);
    // Count existing images (both from server and newly added)
    const totalImages = variantImages.length;
    if (totalImages >= 5) {
      alert('Cần đúng 5 hình ảnh. Vui lòng xóa hình ảnh trước.');
      return;
    }

    if (files.length > 0) {
      const file = files[0];

      // Validate image format
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ cho phép tải lên các định dạng hình ảnh: JPG, PNG, GIF');
        return;
      }

      // Validate file size (optional - e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Resize image before storing (max 800x800, quality 85%)
      resizeImage(file, 800, 800, 0.85).then(({ file: resizedFile, preview, width, height }) => {
        console.log(`Image resized: ${file.name} -> ${width}x${height}, size: ${(resizedFile.size / 1024).toFixed(1)}KB`);
        
        const newImages = [...variantImages, {
          file: resizedFile, // Store the resized file for later upload
          preview: preview, // Store preview URL
          name: file.name,
          isExisting: false // Flag to identify new uploads
        }];
        setVariantImages(newImages);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!crop || !canvas || !ctx) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const saveCroppedImage = () => {
    if (!completedCrop || !imgRef.current) {
      alert('Vui lòng chọn vùng cắt trước');
      return;
    }

    const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop);
    if (croppedImageUrl) {
      const newImages = [...variantImages, croppedImageUrl];
      setVariantImages(newImages);
      setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;

    // Set initial crop to center square
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height) * 0.8;
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;

    const newCrop = {
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: x,
      y: y,
      aspect: 1
    };

    setCrop(newCrop);
    setCompletedCrop(newCrop);
  };

  const removeImage = (index) => {
    console.log(variantImages);
    const imageToRemove = variantImages[index];

    // If it's an existing image from server, you might want to handle deletion differently
    if (imageToRemove.isExisting) {
      if (!confirm('Bạn có chắc muốn xóa hình ảnh này? Thao tác này sẽ xóa vĩnh viễn hình ảnh khỏi server.')) {
        return;
      }
      // Here you could call an API to delete the image from server
      // For now, we'll just remove it from the UI
    }

    const updatedImages = variantImages.filter((_, i) => i !== index);
    console.log("yo:" + updatedImages);
    setVariantImages(updatedImages);
  };

  const addVariant = async (e) => {
    e.preventDefault();

    // Validate form fields - lấy tất cả sizes (kể cả amount = 0)
    const allSizes = variantForm.sizes.filter(s => s.size);
    const sizesWithStock = allSizes.filter(s => s.amount > 0);
    if (!variantForm.colorName || sizesWithStock.length === 0) {
      alert('Vui lòng điền tên màu và ít nhất 1 size có số lượng > 0.');
      return;
    }

    try {
      // Create ONE product-detail with sizes array (new structure)
      const payload = {
        productId: product?.p_id || null,
        productName: product?.p_name || null,
        colorName: variantForm.colorName.trim(),
        colorCode: variantForm.colorCode || '#000000',
        description: variantForm.description?.trim() || '',
        sizes: allSizes, // Send full sizes array
        imgList: JSON.stringify([]),
        inStock: variantForm.status !== 'out_of_stock'
      };

      if (!import.meta.env.VITE_API_URL) throw new Error('API URL not configured');
      const res = await api.post('/product-details', payload);
      const created = res?.data;
      
      // Parse sizes from response
      let createdSizes = [];
      if (created?.sizes) {
        try {
          createdSizes = typeof created.sizes === 'string' ? JSON.parse(created.sizes) : created.sizes;
        } catch (e) { createdSizes = allSizes; }
      } else {
        createdSizes = allSizes;
      }
      
      const createdVariant = {
        pd_id: created?.pdId ?? created?.pd_id ?? generateId(),
        img_list: (() => {
          try {
            if (!created?.imgList) return [];
            if (typeof created.imgList === 'string') return JSON.parse(created.imgList);
            if (Array.isArray(created.imgList)) return created.imgList;
            return [];
          } catch (e) { return []; }
        })(),
        sizes: createdSizes,
        color: created?.colorName ?? variantForm.colorName.trim(),
        colorCode: created?.colorCode ?? (variantForm.colorCode || '#000000'),
        description: created?.description ?? variantForm.description?.trim() ?? '',
        amount: created?.amount ?? sizesWithStock.reduce((sum, s) => sum + (s.amount || 0), 0),
        status: (typeof created?.inStock !== 'undefined') ? (created.inStock ? 'available' : 'out_of_stock') : variantForm.status
      };

      setProduct(prev => ({ ...prev, details: [...(prev?.details || []), createdVariant] }));

      // Reset form
      setVariantForm({ colorName: '', colorCode: '', description: '', sizes: createDefaultSizes(), status: 'available' });
      setShowVariantForm(false);
      alert('Đã tạo phân loại thành công!');
    } catch (err) {
      console.error('Create product-detail failed', err);
      alert('Không thể tạo chi tiết sản phẩm. Xem console để biết thêm chi tiết.');
    }
  };

  const startEditVariant = (variant) => {
    startEditVariantSingle(variant);
  };

  // Separate function for managing images
  const openImageManager = (variant) => {
    // Close variant form if it's open
    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantForm({
      colorName: '',
      colorCode: '',
      description: '',
      sizes: createDefaultSizes(),
      status: 'available'
    });

    // Set image manager state - show existing images plus space for new uploads
    setSelectedVariantForImages(variant);

    // Backend requires exactly 5 images, so prepare 5 slots
    const existingImageUrls = variant.img_list || [];
    const imageSlots = Array(5).fill(null).map((_, index) => {
      if (index < existingImageUrls.length && existingImageUrls[index]) {
        return {
          preview: existingImageUrls[index],
          url: existingImageUrls[index],
          isExisting: true,
          name: `existing_image_${index + 1}.jpg`,
          id: `existing_${index}_${Date.now()}`,
          position: index
        };
      } else {
        return {
          preview: null,
          url: null,
          isExisting: false,
          file: null,
          name: null,
          id: `empty_${index}_${Date.now()}`,
          position: index
        };
      }
    });

    setVariantImages(imageSlots);
    setShowImageManager(true);

    // Scroll to top automatically
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  };

  const closeImageManager = () => {
    setSelectedVariantForImages(null);
    setVariantImages([]);
    setShowImageManager(false);
  };

  // Close all editing modes
  const closeAllEditingModes = () => {
    if (showVariantForm) {
      cancelEditVariant();
    }
    if (showImageManager) {
      closeImageManager();
    }
  };

  // Start editing variant - load all sizes from variant
  const startEditVariantSingle = (variant) => {
    console.log('Editing variant:', variant); // Debug log
    setShowImageManager(false);
    setSelectedVariantForImages(null);
    setVariantImages([]);
    
    // Load sizes from variant or create default with existing data
    let editSizes = [];
    if (variant.sizes && variant.sizes.length > 0) {
      // Merge with default sizes to show all options
      editSizes = availableSizes.map(size => {
        const existing = variant.sizes.find(s => s.size === size);
        return { size, amount: existing ? (existing.amount || 0) : 0 };
      });
    } else if (variant.size) {
      // Old format - convert to new format
      editSizes = availableSizes.map(size => ({
        size,
        amount: size === variant.size ? (parseInt(variant.amount) || 0) : 0
      }));
    } else {
      editSizes = createDefaultSizes();
    }
    
    setEditingVariant({ ...variant });
    setVariantForm({
      colorName: variant.color || '',
      colorCode: variant.colorCode || '#000000',
      description: variant.description || '',
      sizes: editSizes,
      status: variant.status || 'available'
    });
    setShowVariantForm(true);

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  };

  // Update variant images separately - backend expects exactly 5 files
  const updateVariantImages = async () => {
    if (!selectedVariantForImages) {
      alert('Không tìm thấy phân loại sản phẩm.');
      return;
    }

    if (!selectedVariantForImages?.pd_id) {
      alert('Không tìm thấy ID phân loại sản phẩm');
      return;
    }

    // Check that we have exactly 5 slots and ALL slots must have images
    if (variantImages.length !== 5) {
      alert('Lỗi: Phải có đúng chính xác 5 hình ảnh.');
      return;
    }

    // Check if ALL 5 positions have images (existing or new)
    const allSlotsFilled = variantImages.every(img =>
      (img.isExisting && img.url) || (!img.isExisting && img.file)
    );

    if (!allSlotsFilled) {
      alert('Bắt buộc phải có đúng 5 hình ảnh. Vui lòng thêm hình ảnh cho tất cả vị trí trống.');
      return;
    }

    try {
      // Prepare exactly 5 files for backend (null for empty positions)
      const formData = new FormData();

      // Backend expects exactly 5 files in the array
      for (let i = 0; i < 5; i++) {
        const imageData = variantImages[i];

        if (imageData && !imageData.isExisting && imageData.file) {
          // New file to upload
          formData.append('files', imageData.file);
        } else {
          // Existing image or empty position - send empty file
          formData.append('files', new File([], '', { type: 'application/octet-stream' }));
        }
      }

      console.log('Sending image update for variant:', selectedVariantForImages.pd_id);
      console.log('Image slots:', variantImages);

      // Upload images using backend API
      const res = await api.post(
        `/product-details/${selectedVariantForImages.pd_id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res?.data?.success) {
        const updatedImageUrls = res.data.imageUrls || [];

        // Update the product state with the new image URLs
        setProduct(prev => ({
          ...prev,
          details: (prev?.details || []).map(d =>
            d.pd_id === selectedVariantForImages.pd_id
              ? { ...d, img_list: updatedImageUrls.filter(url => url != null) }
              : d
          )
        }));

        closeImageManager();
        alert(`Cập nhật hình ảnh thành công! ${res.data.message}`);
      } else {
        alert('Lỗi: ' + (res?.data?.message || 'Không thể cập nhật hình ảnh'));
      }
    } catch (err) {
      console.error('Update variant images failed', err);
      alert('Không thể cập nhật hình ảnh. Xem console để biết thêm chi tiết.');
    }
  };

  const cancelEditVariant = () => {
    setEditingVariant(null);
    setVariantForm({
      colorName: '',
      colorCode: '',
      description: '',
      sizes: createDefaultSizes(),
      status: 'available'
    });
    setShowVariantForm(false);
  };

  const updateVariant = async (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    const colorName = variantForm.colorName || editingVariant.color;
    const colorCode = variantForm.colorCode || editingVariant.colorCode || '#000000';
    const description = variantForm.description?.trim() || editingVariant.description || '';
    
    // Get sizes - use form sizes or existing variant sizes
    const allSizes = variantForm.sizes.filter(s => s.size);
    const totalAmount = allSizes.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Validate required fields
    if (!colorName) {
      alert('Vui lòng điền tên màu.');
      return;
    }

    try {
      const updatedVariantLocal = {
        ...editingVariant,
        sizes: allSizes,
        color: colorName.trim(),
        colorCode: colorCode,
        description: description,
        amount: totalAmount,
        status: variantForm.status || editingVariant.status
      };

      // Build payload with sizes array
      const payload = {
        productId: product?.p_id || null,
        productName: product?.p_name || null,
        colorName: colorName.trim(),
        colorCode: colorCode,
        description: description,
        sizes: allSizes, // Send sizes array
        imgList: JSON.stringify(editingVariant.img_list || []),
        inStock: (variantForm.status || editingVariant.status) !== 'out_of_stock'
      };

      if (!import.meta.env.VITE_API_URL || !editingVariant.pd_id) throw new Error('API URL or pdId missing');
      console.log(payload);
      const res = await api.put(`/product-details/${editingVariant.pd_id}`, payload);
      const updated = res?.data;
      const normalized = {
        pd_id: updated?.pdId ?? updated?.pd_id ?? editingVariant.pd_id,
        img_list: (() => {
          try {
            if (!updated?.imgList) return editingVariant.img_list || [];
            if (typeof updated.imgList === 'string') return JSON.parse(updated.imgList);
            if (Array.isArray(updated.imgList)) return updated.imgList;
            return editingVariant.img_list || [];
          } catch (e) { return editingVariant.img_list || []; }
        })(),
        sizes: (() => {
          try {
            if (updated?.sizes) {
              return typeof updated.sizes === 'string' ? JSON.parse(updated.sizes) : updated.sizes;
            }
            return allSizes;
          } catch (e) { return allSizes; }
        })(),
        color: updated?.colorName ?? colorName.trim(),
        colorCode: updated?.colorCode ?? colorCode,
        description: updated?.description ?? description,
        amount: updated?.amount ?? totalAmount,
        status: (typeof updated?.inStock !== 'undefined') ? (updated.inStock ? 'available' : 'out_of_stock') : updatedVariantLocal.status
      };

      setProduct(prev => ({ ...prev, details: (prev?.details || []).map(d => d.pd_id === normalized.pd_id ? normalized : d) }));

      // Reset form after successful update
      cancelEditVariant();
      alert('Cập nhật thành công!');
    } catch (err) {
      console.error('Update product-detail failed', err);
      alert('Không thể cập nhật chi tiết sản phẩm. Xem console để biết thêm chi tiết.');
    }
  };

  const getCategoryName = (c_id) => {
    const cat = categories.find(c => (c.c_id || c.id) === c_id);
    return cat ? (cat.c_name || cat.name) : 'N/A';
  };

  const getBrandName = (brand_id) => {
    const brand = brands.find(b => b.brand_id === brand_id);
    return brand ? brand.brand_name : 'N/A';
  };

  // Product edit functions
  const startEditProduct = () => {
    setProductForm({
      name: product.p_name || '',
      description: product.desc || '',
      price: product.price?.toString().replace(' VND', '') || '',
      categoryId: product.c_id || '',
      brandId: product.brand_id || ''
    });
    setEditingProduct(true);
  };

  const cancelEditProduct = () => {
    setEditingProduct(false);
    setProductForm({ name: '', description: '', price: '', categoryId: '', brandId: '' });
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Tên sản phẩm là bắt buộc');
      return;
    }
    try {
      const payload = {
        PName: productForm.name.trim(),
        pDesc: productForm.description.trim(),
        price: parseFloat(productForm.price) || 0,
        isActive: true
      };
      const categoryParam = productForm.categoryId ? `?categoryId=${productForm.categoryId}` : '';
      const brandParam = productForm.brandId ? `${categoryParam ? '&' : '?'}brandId=${productForm.brandId}` : '';
      const query = `${categoryParam}${brandParam}`;
      
      await api.put(`/products/${product.p_id}${query}`, payload);
      
      // Update local state
      const selectedCat = categories.find(c => (c.c_id || c.id) === productForm.categoryId);
      const selectedBrand = brands.find(b => b.brand_id === productForm.brandId);
      setProduct(prev => ({
        ...prev,
        p_name: productForm.name.trim(),
        desc: productForm.description.trim(),
        price: `${productForm.price} VND`,
        c_id: productForm.categoryId,
        brand_id: productForm.brandId,
        categoryName: selectedCat?.c_name || selectedCat?.name || prev.categoryName,
        brandName: selectedBrand?.brand_name || prev.brandName
      }));
      
      setEditingProduct(false);
      alert('Cập nhật sản phẩm thành công!');
    } catch (err) {
      console.error('Update product failed', err);
      alert('Không thể cập nhật sản phẩm');
    }
  };

  if (!product) return (
    <div className="container py-4"><p>Không tìm thấy sản phẩm. <Link to="/admin/products">Quay lại danh sách</Link></p></div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{product.p_name}</h2>
        <div>
          <button
            className="btn btn-success me-2"
            onClick={() => {
              if (editingVariant) {
                cancelEditVariant();
              } else if (showVariantForm) {
                // Close all editing modes
                closeAllEditingModes();
              } else {
                // Close any open image manager before opening variant form
                if (showImageManager) {
                  closeImageManager();
                }
                setShowVariantForm(true);
              }
            }}
          >
            {editingVariant ? 'Hủy Chỉnh Sửa' : (showVariantForm ? 'Ẩn Biểu Mẫu' : 'Thêm Phân Loại')}
          </button>
          <Link to="/admin/products" className="btn btn-outline-secondary">Quay Lại</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Thông Tin Sản Phẩm</h4>
              {!editingProduct && (
                <button className="btn btn-sm" style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #0d9488' }} onClick={startEditProduct}>
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {editingProduct ? (
              <form onSubmit={updateProduct} className="p-3 border rounded" style={{ background: '#f8f9fa' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên Sản Phẩm *</label>
                    <input
                      className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Giá (VND)</label>
                    <input
                      className="form-control"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Danh Mục</label>
                    <CascadingCategorySelector
                      categories={categories.map(c => ({
                        id: c.c_id || c.id,
                        name: c.c_name || c.name,
                        parentId: c.parentId || c.parent_id || null,
                        level: c.level || 0
                      }))}
                      value={productForm.categoryId}
                      onChange={(catId) => setProductForm({ ...productForm, categoryId: catId })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Thương Hiệu</label>
                    <select
                      className="form-select"
                      value={productForm.brandId}
                      onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.map(b => (
                        <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Mô Tả</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                  <div className="col-md-12">
                    <div className="d-flex gap-2">
                      <button className="btn btn-success" type="submit">💾 Lưu</button>
                      <button className="btn btn-secondary" type="button" onClick={cancelEditProduct}>Hủy</button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>Mã Sản Phẩm</th>
                    <td>{product.p_id}</td>
                  </tr>
                  <tr>
                    <th>Tên Sản Phẩm</th>
                    <td>{product.p_name}</td>
                  </tr>
                  <tr>
                    <th>Danh Mục</th>
                    <td>{product.categoryName || getCategoryName(product.c_id)}</td>
                  </tr>
                  <tr>
                    <th>Thương Hiệu</th>
                    <td>{product.brandName || getBrandName(product.brand_id)}</td>
                  </tr>
                  <tr>
                    <th>Mô Tả</th>
                    <td>{product.desc || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Giá</th>
                    <td>{product.price || 'N/A'}</td>
                  </tr>
                <tr>
                  <th>Ảnh Thumbnail</th>
                  <td>
                    <div className="d-flex gap-3">
                      <div className="text-center">
                        <small className="d-block text-muted mb-1">Ảnh 1 (Mặc định)</small>
                        {product.thumbnail1 ? (
                          <img 
                            src={product.thumbnail1} 
                            alt="Thumbnail 1" 
                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                          />
                        ) : (
                          <div style={{ width: 100, height: 100, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
                            <span className="text-muted small">Chưa có</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <small className="d-block text-muted mb-1">Ảnh 2 (Khi hover)</small>
                        {product.thumbnail2 ? (
                          <img 
                            src={product.thumbnail2} 
                            alt="Thumbnail 2" 
                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                          />
                        ) : (
                          <div style={{ width: 100, height: 100, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
                            <span className="text-muted small">Chưa có</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Add/Edit Variant Form - Basic Info Only */}
          {showVariantForm && (
            <div className="mb-4 p-3" style={{ border: editingVariant ? '2px solid #ffc107' : '2px solid #28a745', borderRadius: '5px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4>{editingVariant ? 'Chỉnh Sửa Thông Tin Cơ Bản' : 'Thêm Phân Loại Mới'}</h4>
                  <div className="alert alert-info py-2 mb-0">
                    <small>
                      <strong>ℹ️ Lưu ý:</strong> Chỉ cập nhật thông tin cơ bản (size, màu sắc, số lượng).
                      Hình ảnh sẽ được quản lý riêng biệt.
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={editingVariant ? cancelEditVariant : () => setShowVariantForm(false)}
                >
                  Hủy
                </button>
              </div>
              <form onSubmit={editingVariant ? updateVariant : addVariant}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Tên Màu *</label>
                    <input
                      className="form-control"
                      name="colorName"
                      placeholder="Đỏ, Xanh, Vàng..."
                      value={variantForm.colorName}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Mã Màu</label>
                    <input
                      className="form-control"
                      name="colorCode"
                      type="color"
                      value={variantForm.colorCode || '#000000'}
                      onChange={handleVariantChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Trạng Thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={variantForm.status}
                      onChange={handleVariantChange}
                    >
                      <option value="available">Còn Hàng</option>
                      <option value="out_of_stock">Hết Hàng</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Mô Tả Phân Loại</label>
                    <textarea
                      className="form-control"
                      name="description"
                      placeholder="Mô tả chi tiết cho phân loại này (chất liệu, đặc điểm...)"
                      value={variantForm.description}
                      onChange={handleVariantChange}
                      rows="2"
                    />
                  </div>
                </div>

                {/* Size and Amount Section */}
                <div className="mt-3">
                  <label className="form-label mb-2"><strong>📏 Số lượng theo size (nhập 0 nếu không có):</strong></label>
                  
                  <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                    {/* Hiện tất cả sizes có thể sửa - cả khi thêm mới và edit */}
                    {variantForm.sizes.map((sizeItem, index) => (
                      <div key={index} className="d-flex align-items-center gap-1" style={{ minWidth: '100px' }}>
                        <span 
                          className={`badge ${sizeItem.amount > 0 ? 'bg-primary' : 'bg-secondary'}`} 
                          style={{ minWidth: '60px', textAlign: 'center' }}
                        >
                          {sizeItem.size}
                        </span>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          value={sizeItem.amount}
                          onChange={(e) => handleSizeAmountChange(index, e.target.value)}
                          style={{ width: '65px' }}
                          title={`Số lượng size ${sizeItem.size}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {editingVariant ? (
                    <small className="text-muted mt-1 d-block">
                      Đang chỉnh sửa size <strong>{variantForm.sizes[0]?.size}</strong> - Số lượng: {variantForm.sizes[0]?.amount || 0}
                    </small>
                  ) : (
                    <small className="text-muted mt-1 d-block">
                      Tổng: {variantForm.sizes.reduce((sum, s) => sum + (s.amount || 0), 0)} sản phẩm | 
                      {' '}{variantForm.sizes.filter(s => s.amount > 0).length} size có hàng sẽ được tạo
                    </small>
                  )}
                </div>

                <div className="mt-3">
                  <button
                    className={`btn ${editingVariant ? 'btn-warning' : 'btn-success'}`}
                    type="submit"
                  >
                    {editingVariant ? 'Cập Nhật Thông Tin' : `Thêm ${variantForm.sizes.filter(s => s.amount > 0).length || 0} Phân Loại`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Image Management Section */}
          {showImageManager && selectedVariantForImages && (
            <div className="mb-4 p-3" style={{ border: '2px solid #dc3545', borderRadius: '5px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4>Quản Lý Hình Ảnh - {selectedVariantForImages.color} (Size: {selectedVariantForImages.size})</h4>
                  <div className="alert alert-warning py-2 mb-0">
                    <small>
                      <strong>⚠️ Quan trọng:</strong> Mỗi phân loại phải có đúng 5 hình ảnh vuông.
                      Tất cả hình ảnh sẽ được cắt tự động.
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={closeImageManager}
                >
                  Đóng
                </button>
              </div>

              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="form-label">
                  <strong>Tải Hình Ảnh Sản Phẩm (Đúng 5 Hình Bắt Buộc)</strong>
                </label>
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageUpload}
                    disabled={variantImages.length >= 5}
                  />
                  <div className="mb-3">
                    <small className={`${variantImages.length >= 5 ? 'text-warning' : 'text-info'}`}>
                      <strong>{variantImages.length} hình ảnh hiện tại.</strong>
                      {variantImages.length >= 5 ? ' Đã đạt giới hạn tối đa 5 hình!' : ` Có thể chọn thêm ${5 - variantImages.length} hình nữa.`}
                    </small>
                    <br />
                    <small className="text-muted">
                      Chỉ cho phép tải lên các định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB.
                    </small>
                    {variantImages.some(img => img.isExisting) && (
                      <>
                        <br />
                        <small className="text-success">
                          <strong>Hình ảnh hiện có:</strong> {variantImages.filter(img => img.isExisting).length} |
                          <strong> Hình ảnh mới:</strong> {variantImages.filter(img => !img.isExisting).length}
                        </small>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                {variantImages.length > 0 && (
                  <div className="row g-2 mb-3">
                    {variantImages.map((imageData, index) => (
                      <div key={index} className="col-md-2">
                        <div className="position-relative">
                          <img
                            src={imageData.preview || imageData} // Handle both file objects and direct URLs
                            alt={`Image ${index + 1}`}
                            className="img-fluid rounded"
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              border: imageData.isExisting ? '2px solid #28a745' : '2px solid #dc3545'
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                            style={{ borderRadius: '50%', width: '25px', height: '25px', padding: '0' }}
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                          {imageData.isExisting && (
                            <small className="badge bg-success position-absolute bottom-0 start-0 m-1">
                              Đã có
                            </small>
                          )}
                          {!imageData.isExisting && imageData.name && (
                            <small className="text-muted d-block text-center mt-1">
                              {imageData.name.length > 15 ? imageData.name.substring(0, 15) + '...' : imageData.name}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={updateVariantImages}
                    disabled={variantImages.length !== 5 || !variantImages.every(img => (img.isExisting && img.url) || (!img.isExisting && img.file))}
                    title={variantImages.length !== 5 ? 'Cần đúng 5 hình ảnh' : !variantImages.every(img => (img.isExisting && img.url) || (!img.isExisting && img.file)) ? 'Tất cả 5 vị trí phải có hình ảnh' : ''}
                  >
                    Lưu Hình Ảnh ({variantImages.filter(img => !img.isExisting && img.file).length} mới, {variantImages.filter(img => img.isExisting && img.url).length} hiện có)
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={closeImageManager}
                  >
                    Đóng
                  </button>
                  {(variantImages.length !== 5 || !variantImages.every(img => (img.isExisting && img.url) || (!img.isExisting && img.file))) && (
                    <small className="text-warning align-self-center ms-2">
                      Cần đủ 5 hình ảnh để lưu ({variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length}/5)
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Cropper Modal */}
          {cropperData.show && (
            <div
              className="modal show d-block"
              style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}
              onClick={() => setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 })}
            >
              <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Cắt Hình ảnh Thành Hình Vuông</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 })}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="text-center mb-3">
                      <p className="text-muted">
                        Kéo các góc để điều chỉnh vùng cắt. Hình ảnh sẽ được cắt thành định dạng vuông.
                      </p>
                    </div>

                    {cropperData.originalImage && (
                      <div className="d-flex justify-content-center">
                        <ReactCrop
                          crop={crop}
                          onChange={(newCrop) => setCrop(newCrop)}
                          onComplete={(newCrop) => setCompletedCrop(newCrop)}
                          aspect={1}
                          keepSelection={true}
                          style={{ maxWidth: '100%', maxHeight: '500px' }}
                        >
                          <img
                            ref={imgRef}
                            src={cropperData.originalImage}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '500px',
                              display: 'block'
                            }}
                          />
                        </ReactCrop>
                      </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div className="mt-3">
                      <small className="text-muted">
                        <strong>Mẹo:</strong> Kéo hộp cắt để di chuyển, hoặc kéo góc để thay đổi kích thước.
                        Tỷ lệ không đổi là 1:1 (hình vuông).
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 })}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={saveCroppedImage}
                      disabled={!completedCrop}
                    >
                      Cắt & Lưu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h4>Chi Tiết Sản Phẩm (Phân Loại)</h4>
          {product.details && product.details.length > 0 ? (
            product.details.map((d) => (
              <div key={d.pd_id} className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Mã Chi Tiết:</strong> {d.pd_id}</p>
                    <p><strong>Màu Sắc:</strong> {d.color || 'N/A'} {d.colorCode && <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: d.colorCode, border: '1px solid #ccc', marginLeft: '8px', verticalAlign: 'middle' }}></span>}</p>
                    <p><strong>Mô Tả:</strong> {d.description || <span className="text-muted">Chưa có mô tả</span>}</p>
                    <div className="mb-2">
                      <strong>Kích Cỡ & Số Lượng:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {(d.sizes && d.sizes.length > 0) ? (
                          d.sizes.map((s, idx) => (
                            <span key={idx} className={`badge ${s.amount > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                              {s.size}: {s.amount}
                            </span>
                          ))
                        ) : (
                          <span className="badge bg-secondary">{d.size || 'N/A'}: {d.amount || 0}</span>
                        )}
                      </div>
                    </div>
                    <p><strong>Tổng Số Lượng:</strong> {d.sizes ? d.sizes.reduce((sum, s) => sum + (s.amount || 0), 0) : (d.amount || 0)}</p>
                    {(() => {
                      const inStock = (d.status === 'available') && (Number(d.amount || 0) > 0);
                      const statusText = inStock ? 'Còn Hàng' : 'Hết Hàng';
                      return (
                        <p>
                          <strong>Tồn Kho:</strong> <span className={`badge ${inStock ? 'bg-success' : 'bg-danger'}`}>{statusText}</span>
                        </p>
                      );
                    })()}
                  </div>
                  <div className="col-md-6">
                    <p><strong>Hình ảnh:</strong></p>
                    <div className="d-flex gap-2 flex-wrap">
                      {Array.isArray(d.img_list) && d.img_list.length > 0 ? (
                        d.img_list.map((src, i) => (
                          <img
                            key={i}
                            src={src || '/img/no-image.svg'}
                            alt={`img-${i}`}
                            style={{
                              width: 100,
                              height: 120,
                              objectFit: 'cover',
                              border: '2px solid orange',
                              borderRadius: '5px',
                              background: '#f0f0f0'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/img/no-image.svg';
                            }}
                          />
                        ))
                      ) : (
                        <p className="text-muted">Không có hình ảnh</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => startEditVariant(d)}
                    disabled={editingVariant && editingVariant.pd_id === d.pd_id}
                  >
                    Sửa Thông Tin
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #0d9488' }}
                    onClick={() => openImageManager(d)}
                    disabled={showImageManager && selectedVariantForImages?.pd_id === d.pd_id}
                  >
                    Quản Lý Hình Ảnh ({Array.isArray(d.img_list) ? d.img_list.length : 0}/5)
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeDetail(d.pd_id)}
                  >
                    Xóa Phân Loại
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Không có chi tiết sản phẩm</p>
          )}
        </div>
      </div>
    </div>
  );
}
