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
        if (Array.isArray(data) && data.length > 0) {
          // normalize into the product shape used by this component
          const first = data[0];
          let p = null;
          try {
            p = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);

          } catch (error) {

          }
          const normalized = {
            p_id: first.productId,
            p_name: first.productName,
            c_id: p?.data?.categoryId ?? '',
            brand_id: p?.data?.brandID ?? '',
            // also keep readable names when backend provides them
            categoryName: p?.data?.categoryName ?? first.categoryName ?? '',
            brandName: p?.data?.brandName ?? first.brandName ?? '',
            desc: p?.data?.desc ?? p?.data?.description ?? '',
            price: (p?.data?.price) + " VND" ?? null,
            details: data.map(d => {
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
          if (mounted) {
            setProduct(normalized);
          }
        } else {
          // fallback to local if API returns nothing useful
          loadFromLocal();
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
    // Local delete is disabled. Please use the backend API to remove variants.
    alert('Tính năng xóa chi tiết sản phẩm cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ để xóa biến thể.');
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (variantImages.length >= 5) {
      alert('Cần đúng 5 ảnh. Vui lòng xóa ảnh trước khi thêm.');
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
    setVariantImages(variantImages.filter((_, i) => i !== index));
  };

  const addVariant = (e) => {
    e.preventDefault();

    // Validate exactly 5 images
    if (variantImages.length !== 5) {
      alert('Mỗi biến thể yêu cầu đúng 5 ảnh.');
      return;
    }

    // Validate form fields
    if (!variantForm.size || !variantForm.color) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (kích thước, màu sắc).');
      return;
    }

    // Local creation is disabled. Implement server-side API integration to add variants.
    alert('Tính năng tạo biến thể cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ để thêm biến thể.');
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
      price: '',
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
      alert('Mỗi biến thể yêu cầu đúng 5 ảnh.');
      return;
    }

    // Get updated values or keep existing ones
    const size = variantForm.size || editingVariant.size;
    const color = variantForm.color || editingVariant.color;

    // Validate required fields
    if (!size || !color) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (kích thước, màu sắc).');
      return;
    }

    const updatedVariant = {
      ...editingVariant,
      img_list: variantImages,
      size: size.trim(),
      color: color.trim(),
      amount: variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount,
      status: variantForm.status || editingVariant.status
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    // Local update is disabled. Implement server-side API integration to update variants.
    alert('Tính năng cập nhật biến thể cục bộ đã bị vô hiệu hoá. Vui lòng sử dụng API máy chủ để cập nhật biến thể.');
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
    <div className="container py-4"><p>Không tìm thấy sản phẩm. <Link to="/admin/products">Quay về danh sách</Link></p></div>
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
            {editingVariant ? 'Hủy chỉnh sửa' : (showVariantForm ? 'Ẩn biểu mẫu' : 'Thêm biến thể')}
          </button>
          <Link to="/admin/products" className="btn btn-outline-secondary">Quay lại</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Thông tin sản phẩm</h4>
            </div>

            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: '30%' }}>Mã sản phẩm</th>
                  <td>{product.p_id}</td>
                </tr>
                <tr>
                  <th>Tên sản phẩm</th>
                  <td>{product.p_name}</td>
                </tr>
                <tr>
                  <th>Danh mục</th>
                  <td>{product.categoryName || getCategoryName(product.c_id)}</td>
                </tr>
                <tr>
                  <th>Thương hiệu</th>
                  <td>{product.brandName || getBrandName(product.brand_id)}</td>
                </tr>
                <tr>
                  <th>Mô tả</th>
                  <td>{product.desc || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Giá</th>
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
                  <h4>{editingVariant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}</h4>
                  <div className="alert alert-info py-2 mb-0">
                    <small>
                      <strong>⚠️ Lưu ý:</strong> Mỗi biến thể phải có đúng 5 ảnh.
                      Các trường có dấu * là bắt buộc.
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
                {/* Image Upload Section */}
                <div className="mb-4">
                  <label className="form-label">
                    <strong>Ảnh sản phẩm (Cần đúng 5 ảnh, định dạng vuông) *</strong>
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
                        <strong>{variantImages.length}/5 ảnh đã thêm.</strong>
                        {variantImages.length < 5 ? ` Còn ${5 - variantImages.length} ảnh cần thêm.` : ' ✓ Sẵn sàng gửi!'}
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

                  <div className="col-md-2">
                    <select
                      className="form-select"
                      name="status"
                      value={editingVariant ? (variantForm.status || editingVariant.status) : variantForm.status}
                      onChange={handleVariantChange}
                    >
                      <option value="available">Còn hàng</option>
                      <option value="out_of_stock">Hết hàng</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-grid">
                    <button
                      className={`btn ${editingVariant ? 'btn-warning' : 'btn-success'}`}
                      type="submit"
                      disabled={variantImages.length !== 5}
                      title={variantImages.length !== 5 ? 'Vui lòng tải đúng 5 ảnh' : ''}
                    >
                      {editingVariant ? 'Cập nhật biến thể' : 'Thêm biến thể'}
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
                        <strong>Mẹo:</strong> Kéo hộp cắt để di chuyển, hoặc kéo góc để thay đổi kích thước.
                        Tỷ lệ khung hình được khoá 1:1 (hình vuông).
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

          <h4>Chi tiết sản phẩm (Biến thể)</h4>
          {product.details && product.details.length > 0 ? (
            product.details.map((d) => (
              <div key={d.pd_id} className="mb-4 p-3" style={{ border: '2px solid orange', borderRadius: '5px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Detail ID:</strong> {d.pd_id}</p>
                    <p><strong>Size:</strong> {d.size || 'N/A'}</p>
                    <p><strong>Color:</strong> {d.color || 'N/A'}</p>

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
                        <p className="text-muted">Không có ảnh</p>
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
                    Chỉnh sửa biến thể
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeDetail(d.pd_id)}>
                    Xóa biến thể
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
