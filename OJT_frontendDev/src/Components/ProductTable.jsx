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
    const products = Array(6).fill({
        id: 1,
        name: 'Áo đen Gucci Deluxe',
        price: '100.000 đ',
        image: clothesImg,
        onSale: true
    });

    const items = data;

    const pageNumbers = [1, 2, 3, 4, 5];

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
                                    src={product.imageUrl || product.image}
                                    alt={product.name}
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
                                            className="text-center bg-primary"
                                            style={{
                                                padding: '9px',
                                                borderRadius: 0,
                                                borderTopLeftRadius: '18.5px'
                                            }}
                                        >
                                            SALE
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
                                    <p className="text-center text-white card-text">
                                        {formatPrice(product.price)}
                                    </p>
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