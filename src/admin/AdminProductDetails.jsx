import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const STORAGE_KEY = 'admin_products_v1';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function AdminProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    amount: 1,
    status: 'available'
  });
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

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
      if (res?.data.role !== 'ADMIN' && res?.data.role !== 'EMPLOYEE') {
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
      if (!import.meta.env.VITE_API_URL) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/product-details/product/${id}`);
        const data = res && res.data ? res.data : null;
        // backend may return an array of detail objects for the product
        // Always try to fetch the product info so we can display product details
        // even when `data` is an empty array (no variants yet).
        let p = null;
        try {
          p = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
        } catch (error) {
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
            price: (p?.data?.price) + " VND" ?? null,
            details: (data || []).map(d => {
              // imgList may be JSON string or already array
              let imgs = [];
              try {
                if (typeof d.imgList === 'string') imgs = JSON.parse(d.imgList);
                else if (Array.isArray(d.imgList)) imgs = d.imgList;
              } catch (e) {
                imgs = [];
              }
              return {
                pd_id: d.pdId ?? d.pd_id ?? d.pdId,
                img_list: imgs,
                size: d.size ?? d.sz ?? '',
                color: d.colorName ?? d.color ?? '',
                colorId: d.colorId ?? d.color_id ?? null,
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
            price: (p?.data?.price) + " VND" ?? null,
            details: [{
              pd_id: data.pdId ?? data.pd_id ?? null,
              img_list: imgs,
              size: data.size ?? data.sz ?? '',
              color: data.colorName ?? data.color ?? '',
              colorId: data.colorId ?? data.color_id ?? null,
              amount: data.amount ?? data.qty ?? 0,
              price: data.price ?? null,
              status: data.inStock === false ? 'out_of_stock' : 'available'
            }]
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
              price: (p?.data?.price) + " VND" ?? null,
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (variantImages.length >= 5) {
      alert('Exactly 5 images are required. Please remove an image first.');
      return;
    }

    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropperData({
          show: true,
          originalImage: event.target.result,
          croppedImage: null,
          imageIndex: variantImages.length
        });
        // Reset crop to center square
        setCrop({
          unit: '%',
          width: 50,
          height: 50,
          x: 25,
          y: 25,
          aspect: 1
        });
        setCompletedCrop(null);
      };
      reader.readAsDataURL(files[0]);
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
      alert('Please select a crop area first');
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
    setVariantImages(variantImages.filter((_, i) => i !== index));
  };

  const addVariant = (e) => {
    e.preventDefault();

    // Validate exactly 5 images
    if (variantImages.length !== 5) {
      alert('Exactly 5 images are required for each product variant.');
      return;
    }

    // Validate form fields
    if (!variantForm.size || !variantForm.color) {
      alert('Please fill in all required fields (size, color).');
      return;
    }

    const newVariantLocal = {
      pd_id: generateId(),
      img_list: variantImages,
      size: variantForm.size.trim(),
      color: variantForm.color.trim(),
      amount: Number(variantForm.amount) || 0,
      status: variantForm.status || 'available'
    };

    // Build payload according to backend ProductDetailsDTO
    const payload = {
      productId: product?.p_id || null,
      productName: product?.p_name || null,
      colorId: variantForm.colorId || null,
      colorName: variantForm.color || null,
      colorCode: variantForm.colorCode || null,
      imgList: JSON.stringify(variantImages),
      size: variantForm.size.trim(),
      amount: Number(variantForm.amount) || 0,
      inStock: variantForm.status !== 'out_of_stock'
    };

    (async () => {
      try {
        if (!import.meta.env.VITE_API_URL) throw new Error('API URL not configured');
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/product-details`, payload, { withCredentials: true });
        const created = res?.data;
        const createdVariant = {
          pd_id: created?.pdId ?? created?.pd_id ?? newVariantLocal.pd_id,
          img_list: (() => {
            try {
              if (!created?.imgList) return variantImages;
              if (typeof created.imgList === 'string') return JSON.parse(created.imgList);
              if (Array.isArray(created.imgList)) return created.imgList;
              return variantImages;
            } catch (e) { return variantImages; }
          })(),
          size: created?.size ?? newVariantLocal.size,
          color: created?.colorName ?? newVariantLocal.color,
          colorId: created?.colorId ?? null,
          amount: created?.amount ?? newVariantLocal.amount,
          status: (typeof created?.inStock !== 'undefined') ? (created.inStock ? 'available' : 'out_of_stock') : newVariantLocal.status
        };

        setProduct(prev => ({ ...prev, details: [...(prev?.details || []), createdVariant] }));
      } catch (err) {
        console.error('Create product-detail failed', err);
        alert('Failed to create product detail. See console for details.');
      } finally {
        setVariantForm({ size: '', color: '', amount: 1, status: 'available' });
        setVariantImages([]);
        setShowVariantForm(false);
      }
    })();
  };

  const startEditVariant = (variant) => {
    setEditingVariant({ ...variant });
    setVariantImages([...variant.img_list]);
    setShowVariantForm(true);
  };

  const cancelEditVariant = () => {
    setEditingVariant(null);
    setVariantForm({
      size: '',
      color: '',
      amount: 1,
      status: 'available'
    });
    setVariantImages([]);
    setShowVariantForm(false);
  };

  const updateVariant = (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    // Validate exactly 5 images
    if (variantImages.length !== 5) {
      alert('Exactly 5 images are required for each product variant.');
      return;
    }

    // Get updated values or keep existing ones
    const size = variantForm.size || editingVariant.size;
    const color = variantForm.color || editingVariant.color;

    // Validate required fields
    if (!size || !color) {
      alert('Please fill in all required fields (size, color).');
      return;
    }

    const updatedVariantLocal = {
      ...editingVariant,
      img_list: variantImages,
      size: size.trim(),
      color: color.trim(),
      amount: variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount,
      // price removed for variants
      status: variantForm.status || editingVariant.status
    };

    // Build payload according to backend ProductDetailsDTO
    const payload = {
      pdId: editingVariant.pd_id,
      productId: product?.p_id || null,
      productName: product?.p_name || null,
      colorId: editingVariant.colorId || null,
      colorName: variantForm.color || editingVariant.color || null,
      colorCode: variantForm.colorCode || editingVariant.colorCode || null,
      imgList: JSON.stringify(variantImages),
      size: size.trim(),
      amount: variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount,
      inStock: variantForm.status !== 'out_of_stock'
    };

    (async () => {
      try {
        if (!import.meta.env.VITE_API_URL || !editingVariant.pd_id) throw new Error('API URL or pdId missing');
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/product-details/${editingVariant.pd_id}`, payload, { withCredentials: true });
        const updated = res?.data;
        const normalized = {
          pd_id: updated?.pdId ?? updated?.pd_id ?? editingVariant.pd_id,
          img_list: (() => {
            try {
              if (!updated?.imgList) return variantImages;
              if (typeof updated.imgList === 'string') return JSON.parse(updated.imgList);
              if (Array.isArray(updated.imgList)) return updated.imgList;
              return variantImages;
            } catch (e) { return variantImages; }
          })(),
          size: updated?.size ?? size.trim(),
          color: updated?.colorName ?? variantForm.color ?? editingVariant.color,
          colorId: updated?.colorId ?? editingVariant.colorId ?? null,
          amount: updated?.amount ?? (variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount),
          // price removed for variants
          status: (typeof updated?.inStock !== 'undefined') ? (updated.inStock ? 'available' : 'out_of_stock') : updatedVariantLocal.status
        };

        setProduct(prev => ({ ...prev, details: (prev?.details || []).map(d => d.pd_id === normalized.pd_id ? normalized : d) }));
      } catch (err) {
        console.error('Update product-detail failed', err);
        alert('Failed to update product detail. See console for details.');
      } finally {
        cancelEditVariant();
      }
    })();
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
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{product.p_name}</h2>
        <div>
          <button
            className="btn btn-success me-2"
            onClick={() => {
              if (editingVariant) {
                cancelEditVariant();
              } else {
                setShowVariantForm(!showVariantForm);
              }
            }}
          >
            {editingVariant ? 'Cancel Edit' : (showVariantForm ? 'Hide Form' : 'Add Variant')}
          </button>
          <Link to="/admin/products" className="btn btn-outline-secondary">Back</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Product Information</h4>
            </div>

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
                  <td>{product.categoryName || getCategoryName(product.c_id)}</td>
                </tr>
                <tr>
                  <th>Brand</th>
                  <td>{product.brandName || getBrandName(product.brand_id)}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{product.desc || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>{product.price || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add/Edit Variant Form */}
          {showVariantForm && (
            <div className="mb-4 p-3" style={{ border: editingVariant ? '2px solid #ffc107' : '2px solid #28a745', borderRadius: '5px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4>{editingVariant ? 'Edit Variant' : 'Add New Variant'}</h4>
                  <div className="alert alert-info py-2 mb-0">
                    <small>
                      <strong>⚠️ Important:</strong> Each variant must have exactly 5 images.
                      All fields marked with * are required.
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={editingVariant ? cancelEditVariant : () => setShowVariantForm(false)}
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={editingVariant ? updateVariant : addVariant}>
                {/* Image Upload Section */}
                <div className="mb-4">
                  <label className="form-label">
                    <strong>Product Images (Exactly 5 Required, Square format) *</strong>
                  </label>
                  <div className="mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={variantImages.length >= 5}
                    />
                    <div className="mt-2">
                      <small className={`${variantImages.length === 5 ? 'text-success' : 'text-warning'}`}>
                        <strong>{variantImages.length}/5 images added.</strong>
                        {variantImages.length < 5 ? ` ${5 - variantImages.length} more required.` : ' ✓ Ready to submit!'}
                      </small>
                      <br />
                      <small className="text-muted">
                        Each image will be cropped to square format. Upload images one by one.
                      </small>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {variantImages.length > 0 && (
                    <div className="row g-2 mb-3">
                      {variantImages.map((img, index) => (
                        <div key={index} className="col-md-2">
                          <div className="position-relative">
                            <img
                              src={img}
                              alt={`Variant ${index + 1}`}
                              className="img-fluid rounded"
                              style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                border: '2px solid #28a745'
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="row g-2">
                  <div className="col-md-2">
                    <input
                      className="form-control"
                      name="size"
                      placeholder="Size (S, M, L, XL)"
                      value={editingVariant ? (variantForm.size || editingVariant.size) : variantForm.size}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      className="form-control"
                      name="color"
                      placeholder="Color"
                      value={editingVariant ? (variantForm.color || editingVariant.color) : variantForm.color}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      className="form-control"
                      name="amount"
                      type="number"
                      min="0"
                      placeholder="Stock amount"
                      value={editingVariant ? (variantForm.amount || editingVariant.amount) : variantForm.amount}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  {/* price removed for variants per request */}
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      name="status"
                      value={editingVariant ? (variantForm.status || editingVariant.status) : variantForm.status}
                      onChange={handleVariantChange}
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-grid">
                    <button
                      className={`btn ${editingVariant ? 'btn-warning' : 'btn-success'}`}
                      type="submit"
                      disabled={variantImages.length !== 5}
                      title={variantImages.length !== 5 ? 'Please upload exactly 5 images' : ''}
                    >
                      {editingVariant ? 'Update Variant' : 'Add Variant'}
                    </button>
                    {variantImages.length !== 5 && (
                      <small className="text-warning mt-1">
                        {5 - variantImages.length} more images needed
                      </small>
                    )}
                  </div>
                </div>
              </form>
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
                    <h5 className="modal-title">Crop Image to Square</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 })}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="text-center mb-3">
                      <p className="text-muted">
                        Drag the corners to adjust the crop area. The image will be cropped to a square format.
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
                        <strong>Tips:</strong> Drag the crop box to reposition, or drag the corners to resize.
                        The aspect ratio is locked to 1:1 (square).
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCropperData({ show: false, originalImage: null, croppedImage: null, imageIndex: -1 })}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={saveCroppedImage}
                      disabled={!completedCrop}
                    >
                      Crop & Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h4>Product Details (Variants)</h4>
          {product.details && product.details.length > 0 ? (
            product.details.map((d) => (
              <div key={d.pd_id} className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Detail ID:</strong> {d.pd_id}</p>
                    <p><strong>Size:</strong> {d.size || 'N/A'}</p>
                    <p><strong>Color:</strong> {d.color || 'N/A'}</p>

                    <p><strong>Amount:</strong> {d.amount || 0}</p>
                    {(() => {
                      const inStock = (d.status === 'available') && (Number(d.amount || 0) > 0);
                      const statusText = inStock ? 'In Stock' : 'Out of Stock';
                      return (
                        <p>
                          <strong>Stock:</strong> <span className={`badge ${inStock ? 'bg-success' : 'bg-danger'}`}>{statusText}</span>
                        </p>
                      );
                    })()}
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
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => startEditVariant(d)}
                    disabled={editingVariant && editingVariant.pd_id === d.pd_id}
                  >
                    Edit Variant
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeDetail(d.pd_id)}>
                    Remove Variant
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
