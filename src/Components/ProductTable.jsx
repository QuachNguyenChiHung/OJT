import React from 'react';
import { Button } from 'react-bootstrap';

const clothesImg = '/img/clothes.png';

const ProductTable = ({ title, data, pagination }) => {
    // Sample product data - in a real app, this would come from props or state
    const products = Array(6).fill({
        id: 1,
        name: 'Áo đen Gucci Deluxe',
        price: '100.000 đ',
        image: clothesImg,
        onSale: true
    });

    const pageNumbers = [1, 2, 3, 4, 5];

    return (
        <div className="container py-4 py-xl-5" style={{ maxWidth: '1200px' }}>
            <div className="row mb-5">
                <div className="col-md-8 col-xl-6 text-center mx-auto">
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="row gy-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                {products.map((product, index) => (

                    <div key={index} className="col">
                        {/** Replace products with data prop when available */}
                        <a href="#">
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
                                    src={product.image}
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
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            {
                pagination ?
                    <nav className="d-flex justify-content-center align-items-center mt-3">
                        <ul className="pagination">
                            <li className="page-item" style={{ color: 'rgb(33, 37, 41)' }}>
                                <a className="page-link" aria-label="Previous" href="#">
                                    <span aria-hidden="true">«</span>
                                </a>
                            </li>
                            {pageNumbers.map((pageNum) => (
                                <li key={pageNum} className="page-item">
                                    <a className="page-link" href="#">
                                        {pageNum}
                                    </a>
                                </li>
                            ))}
                            <li className="page-item">
                                <a className="page-link" aria-label="Next" href="#">
                                    <span aria-hidden="true">»</span>
                                </a>
                            </li>
                        </ul>
                    </nav> :
                    <div className='d-flex justify-content-center mt-3'>
                        <button className='btn btn-orange'>Xem Thêm</button>
                    </div>
            }



        </div>
    );
};

export default ProductTable;