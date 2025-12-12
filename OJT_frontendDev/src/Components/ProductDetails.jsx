import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from './Toast';

const clothesImg = '/img/clothes.png';

// Format price in VND
const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductDetails = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [product_details, setProductDetails] = useState({
        id: '',
        name: '',
        description: '',
        price: 0.0,
        productDetails: []
    });

    const [saleInfo, setSaleInfo] = useState({ onSale: false, discountPercent: 0 });
    const [ratings, setRatings] = useState({ averageRating: 0, totalRatings: 0 });
    const [ratingsList, setRatingsList] = useState([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState(clothesImg);
    const [thumbnails, setThumbnails] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hasUserRated, setHasUserRated] = useState(false);
    const [canRate, setCanRate] = useState(false); // User can rate only if confirmed order
    const [submittingRating, setSubmittingRating] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const id = useParams().id;

    // Fetch current user and check if can rate
    useEffect(() => {
        const checkCanRateForUser = async (user) => {
            const userId = user?.id || user?.userId || user?.u_id;
            if (!userId) return;
            
            try {
                const ordersRes = await api.get(`/orders/user/${userId}`);
                const orders = ordersRes.data || [];
                
                const confirmedOrders = orders.filter(o => 
                    ['CONFIRMED', 'DELIVERED', 'COMPLETED', 'confirmed', 'delivered', 'completed'].includes(o.status)
                );
                
                for (const order of confirmedOrders) {
                    const orderItems = order.items || order.orderItems || [];
                    const hasProduct = orderItems.some(item => 
                        item.productId === id || item.product_id === id || item.p_id === id
                    );
                    if (hasProduct) {
                        setCanRate(true);
                        return;
                    }
                }
                setCanRate(false);
            } catch {
                setCanRate(false);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res?.data) {
                    setCurrentUser(res.data);
                    setIsLoggedIn(true);
                    checkCanRateForUser(res.data);
                }
            } catch {
                setIsLoggedIn(false);
            }
        };
        fetchCurrentUser();
    }, [id]);

    // Fetch ratings
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const [statsRes, listRes] = await Promise.all([
                    api.get(`/ratings/product/${id}/stats`).catch(() => ({ data: { averageRating: 0, totalRatings: 0 } })),
                    api.get(`/ratings/product/${id}`).catch(() => ({ data: [] }))
                ]);
                setRatings(statsRes.data);
                setRatingsList(Array.isArray(listRes.data) ? listRes.data : []);
            } catch {
                // Ratings not available
            }
        };
        fetchRatings();
    }, [id]);

    // Check user's existing rating
    useEffect(() => {
        const checkUserRating = async () => {
            if (!currentUser) return;
            const userId = currentUser?.id || currentUser?.userId || currentUser?.u_id;
            if (!userId) return;
            
            try {
                const checkRes = await api.get(`/ratings/check?userId=${userId}&productId=${id}`);
                setHasUserRated(checkRes.data.hasRated);
                if (checkRes.data.hasRated && checkRes.data.rating) {
                    setUserRating(checkRes.data.rating);
                    setRating(checkRes.data.rating);
                }
            } catch {
                // Error checking user rating
            }
        };
        checkUserRating();
    }, [id, currentUser]);

    // Fetch product details and sale info
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const [productRes, saleRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/sale-products').catch(() => ({ data: [] }))
                ]);
                
                const data = productRes.data;
                
                // Check if product is on sale
                const saleProducts = Array.isArray(saleRes.data) ? saleRes.data : [];
                const saleProduct = saleProducts.find(sp => 
                    String(sp.productId || sp.product_id || sp.p_id) === String(id)
                );
                if (saleProduct) {
                    setSaleInfo({
                        onSale: true,
                        discountPercent: saleProduct.discountPercent || saleProduct.discount_percent || 0
                    });
                }
                
                // Map variants
                const productDetails = (data.variants || []).map(v => {
                    let sizes = [];
                    if (v.sizes) {
                        try {
                            sizes = typeof v.sizes === 'string' ? JSON.parse(v.sizes) : v.sizes;
                        } catch { sizes = []; }
                    }
                    if (sizes.length === 0 && v.size) {
                        sizes = [{ size: v.size, amount: v.stock || v.amount || 0 }];
                    }
                    
                    return {
                        pdId: v.pdId,
                        colorName: v.colorName,
                        colorCode: v.colorCode,
                        description: v.description || '',
                        sizes: sizes,
                        size: v.size,
                        amount: sizes.reduce((sum, s) => sum + (s.amount || 0), 0),
                        inStock: v.inStock,
                        images: v.imgList || v.images || []
                    };
                });
                
                setProductDetails({
                    id: data.id || data.productId,
                    name: data.name || data.productName,
                    description: data.description || data.desc || '',
                    price: data.price || 0,
                    thumbnail1: data.thumbnail1,
                    thumbnail2: data.thumbnail2,
                    brandName: data.brandName,
                    categoryName: data.categoryName,
                    productDetails: productDetails
                });

                // Set initial selections
                if (productDetails.length > 0) {
                    const firstVariant = productDetails[0];
                    const firstSizeWithStock = firstVariant.sizes.find(s => s.amount > 0) || firstVariant.sizes[0];
                    const initialSize = firstSizeWithStock?.size || firstVariant.size || '';
                    
                    setSelectedSize(initialSize);
                    setSelectedColor(firstVariant.colorName);
                    setSelectedVariant({
                        ...firstVariant,
                        size: initialSize,
                        amount: firstSizeWithStock?.amount || 0
                    });
                    updateImages(firstVariant.images);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, [id]);

    const updateImages = (images) => {
        if (images && images.length > 0) {
            const parsedImages = images.map(img => {
                try { return img.replace(/^"|"$/g, ''); } 
                catch { return img; }
            }).filter(img => img && !img.includes('no-image'));
            
            setMainImage(parsedImages[0] || clothesImg);
            setThumbnails(parsedImages);
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        const availableColorsForSize = product_details.productDetails.filter(pd => {
            const sizeData = pd.sizes?.find(s => s.size === size);
            return sizeData && sizeData.amount > 0 && Boolean(pd.colorName);
        });

        const colorStillAvailable = availableColorsForSize.some(pd => pd.colorName === selectedColor);
        if (!colorStillAvailable && availableColorsForSize.length > 0) {
            const firstAvailableColor = availableColorsForSize[0].colorName;
            setSelectedColor(firstAvailableColor);
            findAndSetVariant(size, firstAvailableColor);
        } else {
            findAndSetVariant(size, selectedColor);
        }
    };

    const handleColorChange = (colorName) => {
        setSelectedColor(colorName);
        findAndSetVariant(selectedSize, colorName);
    };

    const findAndSetVariant = (size, colorName) => {
        if (!size || !colorName) return;
        const colorVariant = product_details.productDetails.find(pd => pd.colorName === colorName);
        if (colorVariant) {
            const sizeData = colorVariant.sizes?.find(s => s.size === size);
            setSelectedVariant({
                ...colorVariant,
                size: size,
                amount: sizeData?.amount || 0
            });
            updateImages(colorVariant.images);
        }
    };

    const getAvailableSizes = () => {
        const allSizes = new Set();
        product_details.productDetails.forEach(pd => {
            if (pd.sizes && pd.sizes.length > 0) {
                pd.sizes.forEach(s => { if (s.size && s.amount > 0) allSizes.add(s.size); });
            } else if (pd.size) {
                allSizes.add(pd.size);
            }
        });
        const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Free Size'];
        return Array.from(allSizes).sort((a, b) => {
            const indexA = sizeOrder.indexOf(a);
            const indexB = sizeOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };

    const getAvailableColors = () => {
        if (!selectedSize) {
            return product_details.productDetails.filter(pd => Boolean(pd.colorName));
        }
        return product_details.productDetails.filter(pd => {
            if (!pd.colorName) return false;
            const sizeData = pd.sizes?.find(s => s.size === selectedSize);
            return sizeData && sizeData.amount > 0;
        }).filter((color, index, self) =>
            index === self.findIndex((c) => c.colorName === color.colorName)
        );
    };

    const incrementQuantity = () => {
        const maxQuantity = selectedVariant?.amount || 0;
        setQuantity(prev => Math.min(prev + 1, maxQuantity));
    };

    const decrementQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    // Calculate sale price
    const originalPrice = product_details.price;
    const salePrice = saleInfo.onSale 
        ? Math.round(originalPrice * (1 - saleInfo.discountPercent / 100)) 
        : null;

    const addToCart = async () => {
        if (!isLoggedIn) {
            toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (!selectedVariant || !selectedVariant.pdId) {
            toast.warning('Vui lòng chọn kích thước và màu sắc');
            return;
        }
        if (quantity <= 0 || quantity > selectedVariant.amount) {
            toast.warning(`Số lượng không hợp lệ. Còn ${selectedVariant.amount} sản phẩm.`);
            return;
        }

        setAddingToCart(true);
        try {
            const response = await api.post('/cart', {
                productDetailsId: selectedVariant.pdId,
                quantity: quantity,
                selectedSize: selectedSize // Send selected size to cart
            });
            if (response.data.success || response.status === 200 || response.status === 201) {
                toast.success('Đã thêm sản phẩm vào giỏ hàng!');
                setQuantity(1);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setAddingToCart(false);
        }
    };

    const buyNow = async () => {
        if (!isLoggedIn) {
            toast.warning('Vui lòng đăng nhập để mua hàng');
            navigate('/login');
            return;
        }
        if (!selectedVariant || !selectedVariant.pdId) {
            toast.warning('Vui lòng chọn kích thước và màu sắc');
            return;
        }
        
        // Add to cart then navigate to cart/checkout
        setAddingToCart(true);
        try {
            await api.post('/cart', {
                productDetailsId: selectedVariant.pdId,
                quantity: quantity,
                selectedSize: selectedSize // Send selected size to cart
            });
            navigate('/cart');
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Không thể thực hiện');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleStarClick = async (starValue) => {
        if (!isLoggedIn) {
            toast.warning('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }
        if (!canRate) {
            toast.warning('Bạn cần mua và xác nhận nhận hàng trước khi đánh giá sản phẩm này.');
            return;
        }
        if (hasUserRated) {
            toast.info('Bạn đã đánh giá sản phẩm này rồi.');
            return;
        }

        const userId = currentUser?.id || currentUser?.userId || currentUser?.u_id;
        if (!userId) {
            toast.error('Không thể xác định thông tin người dùng.');
            return;
        }

        setSubmittingRating(true);
        try {
            await api.post('/ratings', {
                userId: userId,
                productId: id,
                ratingValue: starValue,
                comment: ''
            });

            setRating(starValue);
            setUserRating(starValue);
            setHasUserRated(true);

            // Refresh ratings
            const statsRes = await api.get(`/ratings/product/${id}/stats`);
            setRatings(statsRes.data);
            toast.success(`Cảm ơn bạn đã đánh giá ${starValue} sao!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmittingRating(false);
        }
    };

    const stars = [1, 2, 3, 4, 5];
    const avgRating = ratings.averageRating || 0;

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1200px', padding: '40px 15px' }}>

                {/* Breadcrumb */}
                <nav style={{ marginBottom: '20px', fontSize: '13px', color: '#666' }}>
                    <a href="/home" style={{ color: '#666', textDecoration: 'none' }}>Trang chủ</a>
                    <span style={{ margin: '0 8px' }}>/</span>
                    {product_details.categoryName && (
                        <>
                            <span>{product_details.categoryName}</span>
                            <span style={{ margin: '0 8px' }}>/</span>
                        </>
                    )}
                    <span style={{ color: '#222' }}>{product_details.name}</span>
                </nav>

                <div className="row">
                    {/* Product Images */}
                    <div className="col-12 col-md-6" style={{ marginBottom: '30px' }}>
                        <div style={{ position: 'relative' }}>
                            {/* Sale Badge */}
                            {saleInfo.onSale && (
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    background: '#e31837',
                                    color: '#fff',
                                    padding: '6px 12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    zIndex: 10,
                                    borderRadius: '4px'
                                }}>
                                    -{saleInfo.discountPercent}%
                                </div>
                            )}
                            
                            {/* Main Image */}
                            <div style={{ 
                                background: '#f8f8f8', 
                                borderRadius: '8px', 
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <img
                                    src={mainImage}
                                    alt={product_details.name}
                                    style={{ 
                                        width: '100%', 
                                        aspectRatio: '1/1', 
                                        objectFit: 'contain',
                                        cursor: 'zoom-in'
                                    }}
                                    onError={(e) => { e.target.src = clothesImg; }}
                                />
                            </div>
                            
                            {/* Thumbnails */}
                            {thumbnails.length > 1 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {thumbnails.slice(0, 5).map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setMainImage(img)}
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: mainImage === img ? '2px solid #222' : '1px solid #e5e5e5',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = clothesImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="col-12 col-md-6">
                        {/* Brand */}
                        {product_details.brandName && (
                            <p style={{ 
                                fontSize: '12px', 
                                color: '#888', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>
                                {product_details.brandName}
                            </p>
                        )}
                        
                        {/* Product Name */}
                        <h1 style={{ 
                            fontSize: '28px', 
                            fontWeight: '600', 
                            color: '#222',
                            marginBottom: '16px',
                            lineHeight: '1.3'
                        }}>
                            {product_details.name}
                        </h1>

                        {/* Rating Summary */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '20px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid #e5e5e5'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {stars.map((star) => {
                                    const diff = avgRating - star + 1;
                                    return (
                                        <span key={star} style={{ 
                                            color: diff >= 1 ? '#ffc107' : diff > 0 ? '#ffc107' : '#ddd',
                                            fontSize: '18px'
                                        }}>★</span>
                                    );
                                })}
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#222' }}>
                                {avgRating.toFixed(1)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                                ({ratings.totalRatings} đánh giá)
                            </span>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '24px' }}>
                            {saleInfo.onSale ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ 
                                        fontSize: '28px', 
                                        fontWeight: '700', 
                                        color: '#e31837' 
                                    }}>
                                        {formatPrice(salePrice)}
                                    </span>
                                    <span style={{ 
                                        fontSize: '18px', 
                                        color: '#999', 
                                        textDecoration: 'line-through' 
                                    }}>
                                        {formatPrice(originalPrice)}
                                    </span>
                                    <span style={{
                                        background: '#fff0f0',
                                        color: '#e31837',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        borderRadius: '4px'
                                    }}>
                                        Tiết kiệm {formatPrice(originalPrice - salePrice)}
                                    </span>
                                </div>
                            ) : (
                                <span style={{ 
                                    fontSize: '28px', 
                                    fontWeight: '700', 
                                    color: '#222' 
                                }}>
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Size Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#222',
                                marginBottom: '10px'
                            }}>
                                Kích thước: <span style={{ fontWeight: '400' }}>{selectedSize}</span>
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {getAvailableSizes().map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        style={{
                                            padding: '10px 20px',
                                            border: selectedSize === size ? '2px solid #222' : '1px solid #ddd',
                                            background: selectedSize === size ? '#222' : '#fff',
                                            color: selectedSize === size ? '#fff' : '#222',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#222',
                                marginBottom: '10px'
                            }}>
                                Màu sắc: <span style={{ fontWeight: '400' }}>{selectedColor}</span>
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {getAvailableColors().map((variant, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleColorChange(variant.colorName)}
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            backgroundColor: variant.colorCode,
                                            border: selectedColor === variant.colorName 
                                                ? '3px solid #222' 
                                                : '2px solid #ddd',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedColor === variant.colorName 
                                                ? '0 0 0 2px #fff, 0 0 0 4px #222' 
                                                : 'none'
                                        }}
                                        title={variant.colorName}
                                    />
                                ))}
                            </div>
                            
                            {/* Color Description */}
                            {selectedVariant?.description && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px 16px',
                                    background: '#f8f8f8',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: '#555',
                                    lineHeight: '1.5'
                                }}>
                                    <strong style={{ color: '#222' }}>{selectedColor}:</strong> {selectedVariant.description}
                                </div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#222',
                                marginBottom: '10px'
                            }}>
                                Số lượng: <span style={{ fontWeight: '400', color: '#666' }}>
                                    (Còn {selectedVariant?.amount || 0} sản phẩm)
                                </span>
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px 0 0 6px',
                                        background: '#fff',
                                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '20px',
                                        color: quantity <= 1 ? '#ccc' : '#222'
                                    }}
                                >−</button>
                                <div style={{
                                    width: '60px',
                                    height: '44px',
                                    border: '1px solid #ddd',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>{quantity}</div>
                                <button
                                    onClick={incrementQuantity}
                                    disabled={quantity >= (selectedVariant?.amount || 0)}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        border: '1px solid #ddd',
                                        borderRadius: '0 6px 6px 0',
                                        background: '#fff',
                                        cursor: quantity >= (selectedVariant?.amount || 0) ? 'not-allowed' : 'pointer',
                                        fontSize: '20px',
                                        color: quantity >= (selectedVariant?.amount || 0) ? '#ccc' : '#222'
                                    }}
                                >+</button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                            <button
                                onClick={addToCart}
                                disabled={!selectedVariant || selectedVariant?.amount === 0 || addingToCart}
                                style={{
                                    flex: 1,
                                    padding: '16px 24px',
                                    border: '2px solid #222',
                                    background: '#fff',
                                    color: '#222',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    cursor: (!selectedVariant || selectedVariant?.amount === 0) ? 'not-allowed' : 'pointer',
                                    opacity: (!selectedVariant || selectedVariant?.amount === 0) ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {addingToCart ? 'Đang thêm...' : 'THÊM VÀO GIỎ'}
                            </button>
                            <button
                                onClick={buyNow}
                                disabled={!selectedVariant || selectedVariant?.amount === 0 || addingToCart}
                                style={{
                                    flex: 1,
                                    padding: '16px 24px',
                                    border: 'none',
                                    background: (!selectedVariant || selectedVariant?.amount === 0) ? '#ccc' : '#e31837',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    cursor: (!selectedVariant || selectedVariant?.amount === 0) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                MUA NGAY
                            </button>
                        </div>

                        {/* Stock Warning */}
                        {selectedVariant && selectedVariant.amount > 0 && selectedVariant.amount <= 5 && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fff8e6',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#b8860b',
                                marginBottom: '20px'
                            }}>
                                ⚠️ Chỉ còn {selectedVariant.amount} sản phẩm - Đặt hàng ngay!
                            </div>
                        )}
                        
                        {selectedVariant && selectedVariant.amount === 0 && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fff0f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#e31837',
                                marginBottom: '20px'
                            }}>
                                ❌ Hết hàng - Vui lòng chọn màu/size khác
                            </div>
                        )}
                    </div>
                </div>


                {/* Product Description */}
                <div style={{ 
                    marginTop: '40px', 
                    paddingTop: '40px', 
                    borderTop: '1px solid #e5e5e5' 
                }}>
                    <h2 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#222',
                        marginBottom: '20px'
                    }}>
                        MÔ TẢ SẢN PHẨM
                    </h2>
                    <div style={{ 
                        fontSize: '15px', 
                        color: '#444', 
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {product_details.description || 'Chưa có mô tả sản phẩm.'}
                    </div>
                </div>

                {/* Ratings Section */}
                <div style={{ 
                    marginTop: '40px', 
                    paddingTop: '40px', 
                    borderTop: '1px solid #e5e5e5' 
                }}>
                    <h2 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#222',
                        marginBottom: '24px'
                    }}>
                        ĐÁNH GIÁ SẢN PHẨM
                    </h2>

                    {/* Rating Summary Box */}
                    <div style={{
                        display: 'flex',
                        gap: '40px',
                        padding: '24px',
                        background: '#fafafa',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Average Rating */}
                        <div style={{ textAlign: 'center', minWidth: '150px' }}>
                            <div style={{ fontSize: '48px', fontWeight: '700', color: '#222' }}>
                                {avgRating.toFixed(1)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>
                                {stars.map((star) => (
                                    <span key={star} style={{ 
                                        color: star <= Math.round(avgRating) ? '#ffc107' : '#ddd',
                                        fontSize: '20px'
                                    }}>★</span>
                                ))}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                {ratings.totalRatings} đánh giá
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingsList.filter(r => 
                                    (r.ratingValue || r.rating || r.rate) === star
                                ).length;
                                const percent = ratings.totalRatings > 0 
                                    ? (count / ratings.totalRatings) * 100 
                                    : 0;
                                return (
                                    <div key={star} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        marginBottom: '6px'
                                    }}>
                                        <span style={{ fontSize: '13px', color: '#666', width: '50px' }}>
                                            {star} sao
                                        </span>
                                        <div style={{ 
                                            flex: 1, 
                                            height: '8px', 
                                            background: '#e5e5e5',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${percent}%`,
                                                height: '100%',
                                                background: '#ffc107',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#666', width: '30px' }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Rating Section */}
                    <div style={{
                        padding: '24px',
                        background: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#222',
                            marginBottom: '16px'
                        }}>
                            Đánh giá của bạn
                        </h3>

                        {!isLoggedIn ? (
                            <div style={{ 
                                padding: '16px', 
                                background: '#f8f8f8', 
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#666', marginBottom: '12px' }}>
                                    Vui lòng đăng nhập để đánh giá sản phẩm
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        padding: '10px 24px',
                                        background: '#222',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        ) : !canRate ? (
                            <div style={{ 
                                padding: '16px', 
                                background: '#fff8e6', 
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#b8860b'
                            }}>
                                <p style={{ marginBottom: '0' }}>
                                    ⚠️ Bạn cần mua sản phẩm và xác nhận đã nhận hàng trước khi đánh giá.
                                </p>
                            </div>
                        ) : hasUserRated ? (
                            <div style={{ 
                                padding: '16px', 
                                background: '#f0fff0', 
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#228b22', marginBottom: '8px' }}>
                                    ✓ Bạn đã đánh giá sản phẩm này
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                    {stars.map((star) => (
                                        <span key={star} style={{ 
                                            color: star <= userRating ? '#ffc107' : '#ddd',
                                            fontSize: '28px'
                                        }}>★</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#666', marginBottom: '12px' }}>
                                    Nhấn vào sao để đánh giá
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {stars.map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => !submittingRating && handleStarClick(star)}
                                            style={{
                                                fontSize: '36px',
                                                cursor: submittingRating ? 'wait' : 'pointer',
                                                color: star <= rating ? '#ffc107' : '#ddd',
                                                transition: 'all 0.2s',
                                                transform: star <= rating ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                            onMouseEnter={() => !submittingRating && setRating(star)}
                                            onMouseLeave={() => !submittingRating && setRating(0)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                {submittingRating && (
                                    <p style={{ color: '#666', marginTop: '12px' }}>Đang gửi đánh giá...</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reviews List */}
                    {ratingsList.length > 0 && (
                        <div>
                            <h3 style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                color: '#222',
                                marginBottom: '16px'
                            }}>
                                Tất cả đánh giá ({ratingsList.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {ratingsList.slice(0, 10).map((review, index) => {
                                    const ratingValue = review.ratingValue || review.rating || review.rate || 0;
                                    return (
                                        <div key={index} style={{
                                            padding: '16px',
                                            background: '#fafafa',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#ddd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#666'
                                                    }}>
                                                        {(review.userName || review.userEmail || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: '500', color: '#222' }}>
                                                        {review.userName || review.userEmail?.split('@')[0] || 'Người dùng'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {stars.map((star) => (
                                                        <span key={star} style={{ 
                                                            color: star <= ratingValue ? '#ffc107' : '#ddd',
                                                            fontSize: '14px'
                                                        }}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p style={{ 
                                                    fontSize: '14px', 
                                                    color: '#444',
                                                    margin: 0,
                                                    lineHeight: '1.5'
                                                }}>
                                                    {review.comment}
                                                </p>
                                            )}
                                            <p style={{ 
                                                fontSize: '12px', 
                                                color: '#999',
                                                marginTop: '8px',
                                                marginBottom: 0
                                            }}>
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
