import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const clothesImg = '/img/clothes.png';
const pinkImg = '/img/pink.jpg';

const ProductDetails = () => {
    const [product_details, setProductDetails] = useState({
        id: '',
        name: '',
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
    const [quantity, setQuantity] = useState(0);
    const [rating, setRating] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const id = useParams().id;

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API_URL + '/auth/me', { withCredentials: true });
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
        fetchRatings();
    }, []);

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
        if (clickedImage && clickedImage !== clothesImg) {
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
        setQuantity(prev => Math.max(0, prev - 1));
    };

    const handleStarClick = (starValue) => {
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }
        setRating(starValue);
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
                                        className={`w-25 border-orange`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleThumbnailClick(index)}
                                    >
                                        <div className="w-100">
                                            <img
                                                className="w-100"
                                                src={img}
                                                style={{
                                                    aspectRatio: '1/1',
                                                    objectFit: 'fit',
                                                    opacity: mainImage === img ? 0.6 : 1,
                                                    transition: 'opacity 0.3s'
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
                            className={`btn w-75 ${selectedVariant?.amount > 0 ? 'btn-orange' : 'btn-secondary'}`}
                            type="button"
                            style={{ borderRadius: 0 }}
                            disabled={!selectedVariant || selectedVariant?.amount === 0}
                        >
                            {selectedVariant?.amount > 0 ? 'Đặt Hàng Ngay !' : 'Đã Hết Hàng'}
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
                            Đánh giá sản phẩm {!isLoggedIn && <small className="text-muted">(Vui lòng đăng nhập)</small>}
                        </p>
                        <div className="stars">
                            {stars.map((star) => (
                                <span
                                    key={star}
                                    className="star"
                                    data-value={star}
                                    onClick={() => handleStarClick(star)}
                                    style={{
                                        cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                                        color: star <= rating ? 'orange' : '#ddd',
                                        fontSize: '30px',
                                        transition: 'color 0.2s',
                                        opacity: isLoggedIn ? 1 : 0.5
                                    }}
                                    onMouseEnter={(e) => isLoggedIn && (e.target.style.color = 'orange')}
                                    onMouseLeave={(e) => isLoggedIn && (e.target.style.color = star <= rating ? 'orange' : '#ddd')}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="fw-bolder text-center" style={{ marginBottom: '-13px' }}>
                        {rating > 0 ? `${rating}.00 trên 5` : 'Chưa có đánh giá'}
                    </p>
                </div>
                <div className="col-12">
                    <div>
                        <p className="text-uppercase fw-bolder">Mô tả sản phẩm</p>
                        <p
                            className="text-break"
                            style={{ textAlign: 'justify', hyphens: 'auto' }}
                        >
                            Commodo nostra eget lacus tincidunt, aenean vulputate hendrerit aenean etiam. Vivamus quisque pulvinar donec condimentum vivamus venenatis id, aenean adipiscing pharetra. Mi fusce interdum ligula amet bibendum eu vitae a, non aenean. Augue augue consequat volutpat est. In maecenas elementum diam, magna enim erat ut metus netus. Volutpat pellentesque amet porttitor, dapibus cursus. Scelerisque suscipit leo aenean vehicula. Bibendum semper elementum leo posuere. Consequat fringilla et ut, lacinia augue porta class. Tortor urna dapibus nunc, sem amet iaculis conubia. Sagittis conubia nunc fringilla tincidunt, mattis curabitur malesuada volutpat consectetur quisque. Morbi vehicula phasellus, a cras rhoncus convallis curabitur habitant taciti. Platea luctus lorem habitasse, felis aptent quisque. Egestas leo fames, per libero ante. Euismod ipsum sit senectus primis. Rutrum id blandit ornare ultrices, eget placerat habitasse ligula sem eu. Aliquam pulvinar porta gravida litora, bibendum vivamus pulvinar sollicitudin. Diam rutrum senectus libero conubia ac, curae consequat. Eu viverra volutpat faucibus nunc turpis, hac convallis ad. Amet accumsan auctor rhoncus vehicula semper erat taciti, curabitur duis. Potenti euismod nisl, rutrum vitae pharetra scelerisque. Felis nullam aptent, at elementum vel blandit. Ligula curabitur aenean erat congue condimentum nec, etiam ornare proin. Placerat curabitur felis mi, aliquam curabitur purus ad. Vitae sapien aenean.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductDetails;