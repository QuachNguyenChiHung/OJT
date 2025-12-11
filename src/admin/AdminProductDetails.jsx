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
    colorName: '',
    colorCode: '',
    amount: 1,
    status: 'available'
  });
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  // Separate image management state
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedVariantForImages, setSelectedVariantForImages] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
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
                colorCode: d.colorCode ?? null,
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
              colorCode: data.colorCode ?? null,
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
    console.log(files);

    // Count filled slots (images that have either existing URLs or new files)
    const filledSlots = variantImages.filter(img =>
      (img.isExisting && img.url) || (!img.isExisting && img.file)
    ).length;

    if (filledSlots >= 5) {
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

      // Store file locally for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        // Find the first empty slot and fill it
        const updatedImages = [...variantImages];
        const emptySlotIndex = updatedImages.findIndex(img =>
          (!img.isExisting || !img.url) && (!img.file)
        );

        if (emptySlotIndex !== -1) {
          // Fill the empty slot
          updatedImages[emptySlotIndex] = {
            file: file, // Store the actual file for later upload
            preview: event.target.result, // Store preview URL
            name: file.name,
            isExisting: false, // Flag to identify new uploads
            url: null,
            id: `new_${emptySlotIndex}_${Date.now()}`,
            position: emptySlotIndex
          };
        }

        setVariantImages(updatedImages);
        console.log('Updated images after upload:', updatedImages);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
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
    console.log('Removing image at index:', index, variantImages);
    const imageToRemove = variantImages[index];

    // If it's an existing image from server, you might want to handle deletion differently
    if (imageToRemove.isExisting) {
      if (!confirm('Bạn có chắc muốn xóa hình ảnh này? Thao tác này sẽ xóa vĩnh viễn hình ảnh khỏi server.')) {
        return;
      }
    }

    // Instead of filtering, replace the slot with an empty slot to maintain 5-slot structure
    const updatedImages = [...variantImages];
    updatedImages[index] = {
      preview: null,
      url: null,
      isExisting: false,
      file: null,
      name: null,
      id: `empty_${index}_${Date.now()}`,
      position: index
    };

    console.log('Updated images after removal:', updatedImages);
    setVariantImages(updatedImages);
  };

  const handleDragStart = (e, index) => {
    // Only allow dragging if there's actually an image in this slot
    const imageData = variantImages[index];
    if (!imageData.preview && !imageData.url) {
      e.preventDefault();
      return;
    }

    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're actually leaving the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Swap the images
    const updatedImages = [...variantImages];
    const draggedImage = updatedImages[draggedIndex];
    const droppedOnImage = updatedImages[dropIndex];

    // Swap the images while maintaining their position properties
    updatedImages[draggedIndex] = {
      ...droppedOnImage,
      position: draggedIndex,
      id: droppedOnImage.id || `swapped_${draggedIndex}_${Date.now()}`
    };

    updatedImages[dropIndex] = {
      ...draggedImage,
      position: dropIndex,
      id: draggedImage.id || `swapped_${dropIndex}_${Date.now()}`
    };

    setVariantImages(updatedImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    console.log('Images reordered:', updatedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addVariant = async (e) => {
    e.preventDefault();

    // For basic variant addition, don't require images
    // Validate form fields
    if (!variantForm.size || !variantForm.colorName) {
      alert('Please fill in all required fields (size, color name).');
      return;
    }

    try {
      const newVariantLocal = {
        pd_id: generateId(),
        img_list: [], // Empty initially
        size: variantForm.size.trim(),
        color: variantForm.colorName.trim(),
        colorCode: variantForm.colorCode || '#000000',
        amount: Number(variantForm.amount) || 0,
        status: variantForm.status || 'available'
      };

      // Build payload according to backend ProductDetailsDTO
      const payload = {
        productId: product?.p_id || null,
        productName: product?.p_name || null,
        colorName: variantForm.colorName.trim(),
        colorCode: variantForm.colorCode || '#000000',
        imgList: JSON.stringify([]), // Empty initially
        size: variantForm.size.trim(),
        amount: Number(variantForm.amount) || 0,
        inStock: variantForm.status !== 'out_of_stock'
      };

      if (!import.meta.env.VITE_API_URL) throw new Error('API URL not configured');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/product-details`, payload, { withCredentials: true });
      const created = res?.data;
      const createdVariant = {
        pd_id: created?.pdId ?? created?.pd_id ?? newVariantLocal.pd_id,
        img_list: (() => {
          try {
            if (!created?.imgList) return [];
            if (typeof created.imgList === 'string') return JSON.parse(created.imgList);
            if (Array.isArray(created.imgList)) return created.imgList;
            return [];
          } catch (e) { return []; }
        })(),
        size: created?.size ?? newVariantLocal.size,
        color: created?.colorName ?? newVariantLocal.color,
        colorCode: created?.colorCode ?? newVariantLocal.colorCode,
        amount: created?.amount ?? newVariantLocal.amount,
        status: (typeof created?.inStock !== 'undefined') ? (created.inStock ? 'available' : 'out_of_stock') : newVariantLocal.status
      };

      setProduct(prev => ({ ...prev, details: [...(prev?.details || []), createdVariant] }));

      // Reset form
      setVariantForm({ size: '', colorName: '', colorCode: '', amount: 1, status: 'available' });
      setShowVariantForm(false);
    } catch (err) {
      console.error('Create product-detail failed', err);
      alert('Không thể tạo chi tiết sản phẩm. Xem console để biết thêm chi tiết.');
    }
  };

  const startEditVariant = (variant) => {
    // Close image manager if it's open
    setShowImageManager(false);
    setSelectedVariantForImages(null);
    setVariantImages([]);

    // Set variant editing state
    setEditingVariant({ ...variant });
    setShowVariantForm(true);

    // Scroll to top automatically
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }, 100);
  };

  // Separate function for managing images
  const openImageManager = (variant) => {
    // Close variant form if it's open
    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantForm({
      size: '',
      colorName: '',
      colorCode: '',
      amount: 1,
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
      // Separate existing URLs and new files
      const existingUrls = [];
      const newFiles = [];
      const filePositions = []; // Track which positions have new files

      for (let i = 0; i < 5; i++) {
        const imageData = variantImages[i];
        if (imageData.isExisting && imageData.url) {
          // Keep existing image URL
          existingUrls[i] = imageData.url;
        } else if (!imageData.isExisting && imageData.file) {
          // New file to upload
          newFiles.push(imageData.file);
          filePositions.push(i);
        }
      }

      console.log('Existing URLs:', existingUrls);
      console.log('New files count:', newFiles.length);
      console.log('File positions:', filePositions);

      // Always send exactly 5 files to backend as required
      const formData = new FormData();

      // Create exactly 5 files for the backend
      for (let i = 0; i < 5; i++) {
        const imageData = variantImages[i];

        if (imageData && !imageData.isExisting && imageData.file) {
          // New file to upload
          formData.append('files', imageData.file);
        } else {
          // For existing images or empty slots, send a placeholder empty file
          // The backend will know to preserve existing images based on position
          formData.append('files', new File([''], 'placeholder.txt', { type: 'text/plain' }));
        }
      }

      // Send metadata about which positions have existing images
      const existingImageInfo = variantImages.map((img, index) => ({
        position: index,
        isExisting: img.isExisting || false,
        url: img.isExisting ? img.url : null
      }));

      formData.append('existingImageInfo', JSON.stringify(existingImageInfo));

      console.log('Sending image update for variant:', selectedVariantForImages.pd_id);
      console.log('Existing image info:', existingImageInfo);

      // Upload images using backend API
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/product-details/${selectedVariantForImages.pd_id}/images`,
        formData,
        {
          withCredentials: true,
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
      size: '',
      colorName: '',
      colorCode: '',
      amount: 1,
      status: 'available'
    });
    setShowVariantForm(false);
  };

  const updateVariant = async (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    // Get updated values or keep existing ones
    const size = variantForm.size || editingVariant.size;
    const colorName = variantForm.colorName || editingVariant.color;
    const colorCode = variantForm.colorCode || editingVariant.colorCode || '#000000';

    // Validate required fields
    if (!size || !colorName) {
      alert('Please fill in all required fields (size, color name).');
      return;
    }

    try {
      const updatedVariantLocal = {
        ...editingVariant,
        size: size.trim(),
        color: colorName.trim(),
        colorCode: colorCode,
        amount: variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount,
        status: variantForm.status || editingVariant.status
      };

      // Build payload according to backend ProductDetailsDTO - keep existing images
      const payload = {
        productId: product?.p_id || null,
        productName: product?.p_name || null,
        colorName: colorName.trim(),
        colorCode: colorCode,
        imgList: JSON.stringify(editingVariant.img_list || []), // Keep existing images
        size: size.trim(),
        amount: variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount,
        inStock: (variantForm.status || editingVariant.status) !== 'out_of_stock'
      };

      if (!import.meta.env.VITE_API_URL || !editingVariant.pd_id) throw new Error('API URL or pdId missing');
      console.log(payload);
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/product-details/${editingVariant.pd_id}`, payload, { withCredentials: true });
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
        size: updated?.size ?? size.trim(),
        color: updated?.colorName ?? colorName.trim(),
        colorCode: updated?.colorCode ?? colorCode,
        amount: updated?.amount ?? (variantForm.amount ? parseInt(variantForm.amount) : editingVariant.amount),
        status: (typeof updated?.inStock !== 'undefined') ? (updated.inStock ? 'available' : 'out_of_stock') : updatedVariantLocal.status
      };

      setProduct(prev => ({ ...prev, details: (prev?.details || []).map(d => d.pd_id === normalized.pd_id ? normalized : d) }));

      // Reset form after successful update
      cancelEditVariant();
    } catch (err) {
      console.error('Update product-detail failed', err);
      alert('Không thể cập nhật chi tiết sản phẩm. Xem console để biết thêm chi tiết.');
    }
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
            </div>

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
              </tbody>
            </table>
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
                  <div className="col-md-3">
                    <label className="form-label">Kích Cỡ *</label>
                    <input
                      className="form-control"
                      name="size"
                      placeholder="S, M, L, XL"
                      value={editingVariant ? (variantForm.size || editingVariant.size) : variantForm.size}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tên Màu *</label>
                    <input
                      className="form-control"
                      name="colorName"
                      placeholder="Đỏ, Xanh, Vàng..."
                      value={editingVariant ? (variantForm.colorName || editingVariant.color) : variantForm.colorName}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Mã Màu</label>
                    <input
                      className="form-control"
                      name="colorCode"
                      type="color"
                      value={editingVariant ? (variantForm.colorCode || editingVariant.colorCode || '#000000') : (variantForm.colorCode || '#000000')}
                      onChange={handleVariantChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Số Lượng *</label>
                    <input
                      className="form-control"
                      name="amount"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={editingVariant ? (variantForm.amount || editingVariant.amount) : variantForm.amount}
                      onChange={handleVariantChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Trạng Thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={editingVariant ? (variantForm.status || editingVariant.status) : variantForm.status}
                      onChange={handleVariantChange}
                    >
                      <option value="available">Còn Hàng</option>
                      <option value="out_of_stock">Hết Hàng</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    className={`btn ${editingVariant ? 'btn-warning' : 'btn-success'}`}
                    type="submit"
                  >
                    {editingVariant ? 'Cập Nhật Thông Tin' : 'Thêm Phân Loại'}
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
                    disabled={variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length >= 5}
                  />
                  <div className="mb-3">
                    <small className={`${variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length >= 5 ? 'text-warning' : 'text-info'}`}>
                      <strong>{variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length} hình ảnh hiện tại.</strong>
                      {variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length >= 5 ? ' Đã đạt giới hạn tối đa 5 hình!' : ` Có thể chọn thêm ${5 - variantImages.filter(img => (img.isExisting && img.url) || (!img.isExisting && img.file)).length} hình nữa.`}
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
                      <div key={imageData.id || index} className="col-md-2">
                        <div
                          className="position-relative"
                          draggable={(imageData.preview || imageData.url) ? true : false}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          style={{
                            opacity: draggedIndex === index ? 0.5 : 1,
                            cursor: (imageData.preview || imageData.url) ? 'grab' : 'default',
                            transform: dragOverIndex === index && draggedIndex !== index ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                          }}
                        >
                          {/* Show image if there's content, otherwise show empty placeholder */}
                          {(imageData.preview || imageData.url) ? (
                            <>
                              <img
                                src={imageData.preview || imageData.url}
                                alt={`Image ${index + 1}`}
                                className="img-fluid rounded"
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  border: imageData.isExisting ?
                                    (dragOverIndex === index && draggedIndex !== index ? '3px solid #28a745' : '2px solid #28a745') :
                                    (dragOverIndex === index && draggedIndex !== index ? '3px solid #dc3545' : '2px solid #dc3545'),
                                  borderRadius: '5px',
                                  boxShadow: dragOverIndex === index && draggedIndex !== index ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                style={{ borderRadius: '50%', width: '25px', height: '25px', padding: '0', zIndex: 10 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
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
                              {/* Drag handle indicator */}
                              <div className="position-absolute top-0 start-0 m-1 text-white bg-dark rounded px-1" style={{ fontSize: '10px', opacity: 0.7 }}>
                                ⋮⋮
                              </div>
                            </>
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light rounded"
                              style={{
                                width: '100%',
                                height: '120px',
                                border: dragOverIndex === index && draggedIndex !== null ? '3px dashed #007bff' : '2px dashed #ccc',
                                borderRadius: '5px',
                                color: '#666',
                                backgroundColor: dragOverIndex === index && draggedIndex !== null ? '#f8f9fa' : '#e9ecef'
                              }}
                            >
                              <span>Vị trí {index + 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {variantImages.length > 0 && (
                  <div className="alert alert-info py-2 mb-3">
                    <small>
                      <strong>💡 Mẹo:</strong> Kéo thả hình ảnh để thay đổi thứ tự. Hình ảnh có thể được kéo thả giữa các vị trí để sắp xếp lại.
                    </small>
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
              <div key={d.pd_id} className="mb-4 p-3" style={{ border: '2px solid #06BAE9', borderRadius: '5px' }}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Mã Chi Tiết:</strong> {d.pd_id}</p>
                    <p><strong>Kích Cỡ:</strong> {d.size || 'N/A'}</p>
                    <p><strong>Màu Sắc:</strong> {d.color || 'N/A'} {d.colorCode && <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: d.colorCode, border: '1px solid #ccc', marginLeft: '8px', verticalAlign: 'middle' }}></span>}</p>

                    <p><strong>Số Lượng:</strong> {d.amount || 0}</p>
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
                            src={src}
                            alt={`img-${i}`}
                            style={{
                              width: 100,
                              height: 120,
                              objectFit: 'cover',
                              border: '2px solid #06BAE9',
                              borderRadius: '5px'
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
                    className="btn btn-sm btn-outline-primary"
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
