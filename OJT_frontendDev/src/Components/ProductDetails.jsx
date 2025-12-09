import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const clothesImg = '/img/clothes.png';
const pinkImg = '/img/pink.jpg';

const ProductDetails = () => {
    const [product_details, setProductDetails] = useState({
        id: '',
        name: '',
        description: '',
        price: 0.0,
        productDetails: [
            {
                id: '',
                colorName: '',
                colorCode: '',
                size: '',
                amount: 0,
                inStock: false,
                images: []
            }
        ]
    });

    const [ratings, setRatings] = useState({
        averageRating: 0,
        totalRatings: 0
    });
    /**
     * 
     * {
    "id": "a9b1f45a-863d-4ee0-a0c6-c2399decec38",
    "name": "Product 10",
    "price": 100.00,
    "productDetails": [
        {
            "pdId": "9a4320f5-01d7-425d-bd11-19ddd27439ce",
            "colorName": "Cyan 1",
            "colorCode": "#00FFFF",
            "size": "XXL",
            "amount": 6,
            "inStock": true,
            "images": [
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\""
            ]
        },
        {
            "pdId": "aea77690-fa11-4799-9442-32327dcad8cf",
            "colorName": "Purple 1",
            "colorCode": "#800080",
            "size": "M",
            "amount": 9,
            "inStock": true,
            "images": [
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\""
            ]
        },
        {
            "pdId": "b8d7e387-cee1-40a6-a849-3f1f5e0e8000",
            "colorName": "Gray 1",
            "colorCode": "#808080",
            "size": "XL",
            "amount": 7,
            "inStock": true,
            "images": [
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\""
            ]
        },
        {
            "pdId": "d8b14493-9f0e-4875-91c1-41f3c934c7d3",
            "colorName": "Yellow 1",
            "colorCode": "#FFFF00",
            "size": "S",
            "amount": 10,
            "inStock": true,
            "images": [
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\""
            ]
        },
        {
            "pdId": "675d6563-f55c-464d-9209-7389a2b079df",
            "colorName": "Orange 1",
            "colorCode": "#FFA500",
            "size": "L",
            "amount": 8,
            "inStock": false,
            "images": [
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\"",
                "\"/img/clothes.png\""
            ]
        }
    ]
}
     */
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState(clothesImg);
    const [thumbnails, setThumbnails] = useState([clothesImg, clothesImg, clothesImg, clothesImg]);
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0); // User's actual submitted rating
    const [hasUserRated, setHasUserRated] = useState(false);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        email: '',
        fullName: '',
        role: '',
        phoneNumber: '',
        address: ''
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const id = useParams().id;

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res?.data) {
                    setCurrentUser(res.data);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        fetchCurrentUser();
        const fetchRatings = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API_URL + `/ratings/product/` + id + '/stats');
                setRatings(res.data);
            } catch (error) {
                alert(error);
            }
        };

        const checkUserRating = async () => {
            if (currentUser) {
                // Check for user ID in various possible fields
                const userId = currentUser?.id || currentUser?.userId || currentUser?.u_id || currentUser?.email;
                if (userId) {
                    try {
                        // Check if user has rated this product
                        const checkRes = await api.get(`/ratings/check?userId=${userId}&productId=${id}`);
                        setHasUserRated(checkRes.data.hasRated);

                        // If user has rated, get their rating
                        if (checkRes.data.hasRated) {
                            const userRatingsRes = await api.get(`/ratings/user/${userId}`);
                            console.log('User ratings response:', userRatingsRes.data);
                            const userProductRating = userRatingsRes.data.find(r => r.productId === id);
                            console.log('Found user product rating:', userProductRating);
                            if (userProductRating) {
                                // Try different possible field names for rating value
                                const ratingValue = userProductRating.ratingValue || userProductRating.rating || userProductRating.rate;
                                console.log('Extracted rating value:', ratingValue);
                                setUserRating(ratingValue);
                                setRating(ratingValue);
                            }
                        }
                    } catch (error) {
                        console.error('Error checking user rating:', error);
                    }
                }
            }
        };

        fetchRatings();
        if (currentUser) {
            checkUserRating();
        }
    }, [id, currentUser]);

    useEffect(() => {
        const fetchdetails = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API_URL + `/products/detail/` + id);
                setProductDetails(res.data);

                // Set initial selections if productDetails exist
                if (res.data.productDetails && res.data.productDetails.length > 0) {
                    const firstVariant = res.data.productDetails[0];
                    setSelectedSize(firstVariant.size);
                    setSelectedColor(firstVariant.colorName);
                    setSelectedVariant(firstVariant);
                    updateImages(firstVariant.images);
                }
            } catch (error) {
                alert(error);
            }
        }
        fetchdetails();
    }, [id]);

    // Update images based on selected variant
    const updateImages = (images) => {
        if (images && images.length > 0) {
            // Parse images if they're JSON strings
            const parsedImages = images.map(img => {
                try {
                    return img.replace(/^"|"$/g, ''); // Remove extra quotes
                } catch (e) {
                    return img;
                }
            });
            setMainImage(parsedImages[0] || clothesImg);
            setThumbnails(parsedImages.slice(0, 4).concat(Array(4).fill(clothesImg)).slice(0, 4));
        }
    };

    // Handle size selection
    const handleSizeChange = (size) => {
        setSelectedSize(size);

        // Find available colors for this size
        const availableColorsForSize = product_details.productDetails.filter(
            pd => pd.size === size && Boolean(pd.colorName)
        );

        // If current selected color is not available for this size, select the first available color
        const colorStillAvailable = availableColorsForSize.some(pd => pd.colorName === selectedColor);

        if (!colorStillAvailable && availableColorsForSize.length > 0) {
            const firstAvailableColor = availableColorsForSize[0].colorName;
            setSelectedColor(firstAvailableColor);
            findAndSetVariant(size, firstAvailableColor);
        } else {
            findAndSetVariant(size, selectedColor);
        }
    };

    // Handle color selection
    const handleColorChange = (colorName) => {
        setSelectedColor(colorName);
        findAndSetVariant(selectedSize, colorName);
    };

    // Find variant based on size and color
    const findAndSetVariant = (size, colorName) => {
        if (!size || !colorName) return;

        const variant = product_details.productDetails.find(
            pd => pd.size === size && pd.colorName === colorName
        );

        if (variant) {
            setSelectedVariant(variant);
            updateImages(variant.images);
        }
    };

    // Handle thumbnail click
    const handleThumbnailClick = (index) => {
        const clickedImage = thumbnails[index];
        if (clickedImage) {
            setMainImage(clickedImage);
        }
    };

    // Get unique sizes
    const getAvailableSizes = () => {
        const sizes = [...new Set(product_details.productDetails.map(pd => pd.size))];
        return sizes.filter(Boolean);
    };

    // Get unique colors for the selected size
    const getAvailableColors = () => {
        if (!selectedSize) {
            return [];
        }

        const colors = product_details.productDetails.filter(
            pd => pd.size === selectedSize && Boolean(pd.colorName)
        );

        // Remove duplicates based on colorName
        return colors.filter((color, index, self) =>
            index === self.findIndex((c) => c.colorName === color.colorName)
        );
    };
    const stars = [1, 2, 3, 4, 5];

    const incrementQuantity = () => {
        const maxQuantity = selectedVariant?.amount || 0;
        setQuantity(prev => Math.min(prev + 1, maxQuantity));
    };

    const decrementQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleStarClick = async (starValue) => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }

        // Check for user ID in various possible fields
        const userId = currentUser?.id || currentUser?.userId || currentUser?.u_id || currentUser?.email;
        if (!currentUser || !userId) {
            alert('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.');
            console.log('Current user object:', currentUser);
            return;
        }

        setSubmittingRating(true);
        try {
            // Submit rating to server
            const ratingData = {
                userId: userId,
                productId: id,
                ratingValue: starValue, // Changed from 'rating' to 'ratingValue'
                comment: '' // You can add comment functionality later
            };

            const response = await api.post('/ratings', ratingData);

            if (response.data) {
                setRating(starValue);
                setUserRating(starValue);
                setHasUserRated(true);

                // Refresh ratings stats
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/ratings/product/${id}/stats`);
                setRatings(statsRes.data);

                alert(`Cảm ơn bạn đã đánh giá ${starValue} sao cho sản phẩm!`);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmittingRating(false);
        }
    };    // Add to cart function
    const addToCart = async () => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            return;
        }

        if (!selectedVariant) {
            alert('Vui lòng chọn kích thước và màu sắc');
            return;
        }

        if (quantity <= 0) {
            alert('Vui lòng chọn số lượng');
            return;
        }

        if (quantity > selectedVariant.amount) {
            alert(`Chỉ còn ${selectedVariant.amount} sản phẩm trong kho`);
            return;
        }

        try {
            const cartData = {
                productDetailsId: selectedVariant.pdId,
                quantity: quantity
            };

            const response = await api.post('/cart', cartData);

            if (response.data.success) {
                alert('Đã thêm sản phẩm vào giỏ hàng!');
                // Reset quantity after successful add
                setQuantity(1);
            } else {
                alert(response.data.message || 'Không thể thêm sản phẩm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                alert(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
            }
        }
    };

    // Render star with full, half, or empty based on rating
    const renderStar = (position, ratingValue) => {
        const diff = ratingValue - position + 1;

        if (diff >= 1) {
            // Full star
            return '★';
        } else if (diff > 0 && diff < 1) {
            // Half star - use special character or overlay
            return (
                <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{ color: '#ddd' }}>★</span>
                    <span style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${diff * 100}%`,
                        overflow: 'hidden',
                        color: 'orange'
                    }}>★</span>
                </span>
            );
        } else {
            // Empty star
            return '☆';
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '1200px' }}>
            <div className="row d-flex justify-content-center">
                <div className="col-8 col-md-5">
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <div className="w-100">
                                <div className="w-100">
                                    <img
                                        className="w-100 border-orange"
                                        src={mainImage}
                                        style={{ aspectRatio: '1/1', objectFit: 'fit', cursor: 'pointer' }}
                                        alt="Main Product"
                                    />
                                </div>
                            </div>
                            <div className="item-groups d-flex justify-content-around mt-3 w-100">
                                {thumbnails.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`w-25 ${mainImage === img ? 'border-primary' : 'border-orange'}`}
                                        style={{
                                            cursor: 'pointer',
                                            borderWidth: mainImage === img ? '3px' : '1px',
                                            transition: 'border 0.3s'
                                        }}
                                        onClick={() => handleThumbnailClick(index)}
                                    >
                                        <div className="w-100">
                                            <img
                                                className="w-100"
                                                src={img}
                                                style={{
                                                    aspectRatio: '1/1',
                                                    objectFit: 'fit'
                                                }}
                                                alt={`Product thumbnail ${index + 1}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-7">
                    <div>
                        <h1 className="fw-normal">
                            <span style={{ color: 'rgb(32, 32, 32)', backgroundColor: 'rgb(252, 252, 252)' }}>
                                {product_details.name}
                            </span>
                        </h1>
                    </div>
                    <div>
                        <p className="fw-light">
                            <span style={{ color: 'rgb(32, 32, 32)', backgroundColor: 'rgb(252, 252, 252)' }}>
                                {product_details.price} VND
                            </span>
                        </p>
                        <div className="d-flex align-items-center">
                            <h2 style={{ marginBottom: '0px' }}>{ratings.averageRating.toFixed(1)}</h2>
                            <div className="stars">
                                {stars.map((star) => {
                                    const diff = ratings.averageRating - star + 1;
                                    const isFull = diff >= 1;
                                    const isHalf = diff > 0 && diff < 1;

                                    return (
                                        <span
                                            key={star}
                                            className="star"
                                            data-value={star}
                                            style={{ position: 'relative', display: 'inline-block' }}
                                        >
                                            {isFull ? (
                                                <span style={{ color: 'orange' }}>★</span>
                                            ) : isHalf ? (
                                                <>
                                                    <span style={{ color: '#ddd' }}>★</span>
                                                    <span style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        width: `${diff * 100}%`,
                                                        overflow: 'hidden',
                                                        color: 'orange'
                                                    }}>★</span>
                                                </>
                                            ) : (
                                                <span style={{ color: '#ddd' }}>★</span>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="panel" style={{ padding: 0 }}>
                        <div>
                            <div className="label">
                                <span>Size</span>
                            </div>
                            <div className="sizes" role="radiogroup" aria-label="Choose size">
                                {getAvailableSizes().map((size) => (
                                    <button
                                        key={size}
                                        className={`size-btn small ${selectedSize === size ? 'active' : ''}`}
                                        data-size={size}
                                        aria-pressed={selectedSize === size}
                                        onClick={() => handleSizeChange(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="qty-wrap">
                            <div className="qty-label">
                                <span>Số lượng: Có {selectedVariant?.amount || 0}</span>
                            </div>
                            <div className="qty-box" role="group" aria-label="Quantity selector">
                                <button
                                    className="qty-btn"
                                    id="dec"
                                    aria-label="Decrease"
                                    onClick={decrementQuantity}
                                >
                                    <span className="icon">−</span>
                                </button>
                                <div className="qty-display" id="qty">
                                    <span>{quantity}</span>
                                </div>
                                <button
                                    className="qty-btn"
                                    id="inc"
                                    aria-label="Increase"
                                    onClick={incrementQuantity}
                                >
                                    <span className="icon">+</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center my-4">
                        <button
                            className={`btn w-75 ${selectedVariant?.amount > 0 && quantity > 0 ? 'btn-orange' : 'btn-secondary'}`}
                            type="button"
                            style={{ borderRadius: 0 }}
                            onClick={addToCart}
                            disabled={!selectedVariant || selectedVariant?.amount === 0 || quantity <= 0}
                        >
                            {!isLoggedIn ? 'Đăng nhập để thêm vào giỏ' :
                                !selectedVariant ? 'Chọn size và màu' :
                                    selectedVariant?.amount === 0 ? 'Hết hàng' :
                                        quantity <= 0 ? 'Chọn số lượng' :
                                            'Thêm vào giỏ hàng'}
                        </button>
                    </div>
                    <div>
                        <div>
                            <p className="fw-light">
                                <span style={{ color: 'rgb(32, 32, 32)', backgroundColor: 'rgb(252, 252, 252)' }}>
                                    Chọn màu sắc
                                </span>
                            </p>
                        </div>
                        <div className="d-flex flex-wrap" style={{ marginTop: '-1rem', gap: '8px' }}>
                            {getAvailableColors().map((variant, index) => (
                                <div
                                    key={index}
                                    className="mx-1"
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={() => handleColorChange(variant.colorName)}
                                >
                                    <div
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: variant.colorCode,
                                            border: selectedColor === variant.colorName ? '3px solid orange' : '2px solid #ddd',
                                            borderRadius: '4px',
                                            transition: 'all 0.3s',
                                            boxShadow: selectedColor === variant.colorName ? '0 0 8px rgba(255, 165, 0, 0.6)' : 'none'
                                        }}
                                        title={variant.colorName}
                                    />
                                    {selectedColor === variant.colorName && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: 'orange',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {variant.colorName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='mt-5'>
                        <p className="fw-bolder text-center" >
                            Đã có {ratings.totalRatings} đánh giá
                        </p>
                        <p className="fw-bolder text-center" style={{ marginBottom: '-13px' }}>
                            Đánh giá sản phẩm
                            {!isLoggedIn && <small className="text-muted">(Vui lòng đăng nhập)</small>}
                            {hasUserRated && <small className="text-success">(Đã đánh giá: {userRating} sao)</small>}
                            {submittingRating && <small className="text-info">(Đang gửi...)</small>}
                        </p>
                        <div className="stars">
                            {stars.map((star) => (
                                <span
                                    key={star}
                                    className="star"
                                    data-value={star}
                                    onClick={() => !submittingRating && handleStarClick(star)}
                                    style={{
                                        cursor: (isLoggedIn && !submittingRating) ? 'pointer' : 'not-allowed',
                                        color: star <= rating ? 'orange' : '#ddd',
                                        fontSize: '30px',
                                        transition: 'color 0.2s',
                                        opacity: (isLoggedIn && !submittingRating) ? 1 : 0.5
                                    }}
                                    onMouseEnter={(e) => (isLoggedIn && !submittingRating) && (e.target.style.color = 'orange')}
                                    onMouseLeave={(e) => (isLoggedIn && !submittingRating) && (e.target.style.color = star <= rating ? 'orange' : '#ddd')}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="fw-bolder text-center" style={{ marginBottom: '-13px' }}>
                        {hasUserRated ?
                            `Bạn đã đánh giá ${userRating}.0 trên 5` :
                            (rating > 0 ? `${rating}.0 trên 5 (chưa gửi)` : 'Chưa có đánh giá')
                        }
                    </p>
                </div>
                <div className="col-12">
                    <div>
                        <p className="text-uppercase fw-bolder">Mô tả sản phẩm</p>
                        <p
                            className="text-break"
                            style={{ textAlign: 'justify', hyphens: 'auto' }}
                        >
                            {product_details.description || 'Chưa có mô tả sản phẩm'}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductDetails;