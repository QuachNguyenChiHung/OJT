import React, { useState } from 'react';

const clothesImg = '/img/clothes.png';
const xImg = '/img/x.png';

// Small reusable OrderItem component
const OrderItem = ({ item, onRemove }) => {
    const [quantity, setQuantity] = useState(item.quantity || 1);

    const increment = () => setQuantity((q) => q + 1);
    const decrement = () => setQuantity((q) => Math.max(1, q - 1));

    return (
        <div className="align-items-center row my-4">
            <div
                className="col-6 col-xs-5 col-sm-4 col-lg-2"
                style={{
                    marginBottom: '1rem',
                    paddingLeft: 0
                }}
            >
                <img
                    className="w-100"
                    style={{ aspectRatio: '1/1.3', height: '100%', border: '3px solid orange' }}
                    src={clothesImg}
                    width="168"
                    height="218"
                    alt={item.name}
                />
            </div>
            <div className="col-lg-10 col-12" style={{ borderLeft: '3px solid orange' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-normal">{item.name}</h2>
                    <button
                        className="btn"
                        type="button"
                        style={{ border: '2px solid orange', padding: 0 }}
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                    >
                        <img className='logo' src={xImg} alt="remove" />
                    </button>
                </div>
                <div className="d-flex">
                    <p style={{ paddingRight: '1rem' }}>Size: {item.size}</p>
                    <p className="mx-1">Màu: {item.color}</p>
                </div>
                <p className="mx-1">Giá: {item.price}</p>
                <div className="qty-wrap">
                    <div className="qty-label">
                        <span>Số lượng</span>
                    </div>
                    <div className="qty-box" role="group" aria-label="Quantity selector">
                        <button id={`dec-${item.id}`} className="qty-btn" aria-label="Decrease" onClick={decrement}>
                            <span className="icon">−</span>
                        </button>
                        <div id={`qty-${item.id}`} className="qty-display">
                            <span style={{ color: 'orange' }}>{quantity}</span>
                        </div>
                        <button id={`inc-${item.id}`} className="qty-btn" aria-label="Increase" onClick={increment}>
                            <span className="icon">+</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function OrderList() {
    const [items, setItems] = useState([
        {
            id: 1,
            name: 'Áo Thun Pique Thoáng Mát Seventy Seven 13 Xanh Rêu',
            size: 'S',
            color: 'Nâu',
            price: '990.000đ',
            quantity: 0
        },
        {
            id: 2,
            name: 'Áo Thun Pique Thoáng Mát Seventy Seven 13 Xanh Rêu',
            size: 'S',
            color: 'Nâu',
            price: '990.000đ',
            quantity: 0
        }
    ]);

    const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

    const placeOrder = () => {
        // collect order data (in a real app you'd gather quantities/prices)
        console.log('Placing order for items:', items);
        alert('Đặt đơn hàng thành công!');
    };

    return (
        <div className="container my-5" style={{ maxWidth: '1200px', paddingRight: '1rem', paddingLeft: '1rem' }}>
            <div className="row">
                <div className="col-12" style={{ padding: '1rem', border: '3px solid orange' }}>
                    <div className="container">
                        <div>
                            <p>Ngày tạo đơn hàng : 26/3/2025</p>
                        </div>

                        {items.map((item) => (
                            <OrderItem key={item.id} item={item} onRemove={removeItem} />
                        ))}
                    </div>

                    <div className="d-flex justify-content-center justify-content-lg-start">
                        <button className="btn btn-orange" type="button" style={{ width: 200, borderRadius: 0 }} onClick={placeOrder}>
                            Đặt đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}