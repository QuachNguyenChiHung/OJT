import React from 'react';
import { Button } from 'react-bootstrap';

const clothesImg = '/img/clothes.png';

const ProductTable = ({ title, data, pagination }) => {
    // Format price for display
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
        }
        return price; // Return as-is if it's already formatted
    };

    // Sample product data - used as a fallback when `data` prop is empty
    

    const items = data;

    

    return (
        <div className="container py-2" style={{ maxWidth: '1200px' }}>
            <div className="row mb-5">
                <div className="col-md-8 col-xl-6 text-center mx-auto">
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="row gy-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                {items.map((product, index) => (

                    <div key={index} className="col">
                        {/** Replace products with data prop when available */}
                        <a href={`/product/${product.id}`}>
                            <div
                                className="card"
                                style={{
                                    position: 'relative',
                                    borderWidth: '3px',
                                    borderStyle: 'none',
                                    borderRadius: 0
                                }}
                            >
                                <img
                                    className="card-img-top w-100 d-block fit-cover cloth-img"
                                    style={{ borderRadius: '19px' }}
                                    src={product.thumbnail1 || product.imageUrl || product.image || '/img/no-image.svg'}
                                    alt={product.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/img/no-image.svg'; }}
                                />
                                {product.onSale && (
                                    <div
                                        className="text-white"
                                        style={{
                                            width: '90px',
                                            left: '0px',
                                            position: 'absolute'
                                        }}
                                    >
                                        <p
                                            className="text-center"
                                            style={{
                                                padding: '9px',
                                                borderRadius: 0,
                                                borderTopLeftRadius: '18.5px',
                                                background: '#e31837',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {product.discountPercent ? `-${product.discountPercent}%` : 'SALE'}
                                        </p>
                                    </div>
                                )}
                                <div
                                    className="card-body d-flex flex-column justify-content-center w-100"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0
                                    }}
                                >
                                    <h4 className="text-center text-white card-title">
                                        {product.name}
                                    </h4>
                                    {product.onSale && product.salePrice ? (
                                        <div className="text-center">
                                            <span style={{ textDecoration: 'line-through', color: '#ccc', fontSize: '12px', marginRight: '8px' }}>
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="text-white card-text" style={{ fontWeight: '600', color: '#ff6b6b' }}>
                                                {formatPrice(product.salePrice)}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-center text-white card-text">
                                            {formatPrice(product.price)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>





        </div>
    );
};

export default ProductTable;