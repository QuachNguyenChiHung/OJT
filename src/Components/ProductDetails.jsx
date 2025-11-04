import React, { useState } from 'react';

const clothesImg = '/img/clothes.png';
const pinkImg = '/img/pink.jpg';

const ProductDetails = () => {
    const [selectedSize, setSelectedSize] = useState('S');
    const [quantity, setQuantity] = useState(0);
    const [rating, setRating] = useState(0);

    const sizes = ['S', 'M', 'L', 'XL'];
    const stars = [1, 2, 3, 4, 5];

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        setQuantity(prev => Math.max(0, prev - 1));
    };

    const handleStarClick = (starValue) => {
        setRating(starValue);
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
                                        src={clothesImg}
                                        style={{ aspectRatio: '1/1' }}
                                        alt="Main Product"
                                    />
                                </div>
                            </div>
                            <div className="item-groups d-flex justify-content-around mt-3 w-100">
                                {[...Array(4)].map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-25 border-orange `}

                                    >
                                        <div className="w-100">
                                            <img
                                                className="w-100"
                                                src={clothesImg}
                                                style={{ aspectRatio: '1/1' }}
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
                                Áo Thun Pique Thoáng Mát Seventy Seven 13 Xanh Rêu
                            </span>
                        </h1>
                    </div>
                    <div>
                        <p className="fw-light">
                            <span style={{ color: 'rgb(32, 32, 32)', backgroundColor: 'rgb(252, 252, 252)' }}>
                                157.000 VND
                            </span>
                        </p>
                        <div className="d-flex align-items-center">
                            <h2 style={{ marginBottom: '0px' }}>5.0</h2>
                            <div className="stars">
                                {stars.map((star) => (
                                    <span key={star} className="star" data-value={star}>
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="panel" style={{ padding: 0 }}>
                        <div>
                            <div className="label">
                                <span>Size</span>
                            </div>
                            <div className="sizes" role="radiogroup" aria-label="Choose size">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`size-btn small ${selectedSize === size ? 'active' : ''}`}
                                        data-size={size}
                                        aria-pressed={selectedSize === size}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="qty-wrap">
                            <div className="qty-label">
                                <span>Số lượng</span>
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
                            className="btn btn-orange w-75"
                            type="button"
                            style={{ borderRadius: 0 }}
                        >
                            Đặt Hàng Ngay !
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
                        <div className="d-flex" style={{ marginTop: '-1rem' }}>
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="mx-1">
                                    <img
                                        className="choose-color"
                                        src={pinkImg}
                                        alt={`Color option ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="fw-bolder text-center" style={{ marginBottom: '-13px' }}>
                            Đánh giá sản phẩm
                        </p>
                        <div className="stars">
                            {stars.map((star) => (
                                <span
                                    key={star}
                                    className="star"
                                    data-value={star}
                                    onClick={() => handleStarClick(star)}
                                    style={{
                                        cursor: 'pointer',
                                        color: star <= rating ? 'orange' : '#ddd',
                                        fontSize: '30px',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'orange'}
                                    onMouseLeave={(e) => e.target.style.color = star <= rating ? 'orange' : '#ddd'}
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
        </div>
    );
};

export default ProductDetails;