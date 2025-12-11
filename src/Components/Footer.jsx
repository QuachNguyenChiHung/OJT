import React from 'react';
import '../styles/theme.css';

const logoImg = '/img/logo.png';

const Footer = () => {
    return (
        <footer className="footer-themed" style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
            color: '#fff',
            paddingTop: '60px', 
            paddingBottom: '30px',
            marginTop: '0'
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="row">
                    <div className="col-lg-4 col-md-6 mb-4">
                        <img src={logoImg} alt="FFF" style={{ height: '60px', marginBottom: '25px' }} />
                        <p style={{ opacity: 0.8, lineHeight: 1.8, marginBottom: '25px' }}>
                            <strong>Furious Five Fashion</strong> - Thương hiệu thời trang hàng đầu. 
                            Cam kết mang đến phong cách hiện đại và chất lượng cao cấp.
                        </p>
                    </div>
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h5 style={{ fontWeight: '600', marginBottom: '25px', color: '#00D4AA' }}>Liên Kết</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '12px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Trang Chủ</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="/search" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sản Phẩm</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="/cart" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Giỏ Hàng</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="/orders" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Đơn Hàng</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h5 style={{ fontWeight: '600', marginBottom: '25px', color: '#00D4AA' }}>Hỗ Trợ</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Hướng Dẫn Mua Hàng</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Chính Sách Đổi Trả</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Chính Sách Bảo Mật</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h5 style={{ fontWeight: '600', marginBottom: '25px', color: '#00D4AA' }}>Liên Hệ</h5>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>📍 123 Đường ABC, Q.1, TP.HCM</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>📞 1900 1234 56</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>✉️ support@fff-fashion.com</p>
                    </div>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 25px' }} />
                <p className="text-center" style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
                    © 2025 Furious Five Fashion. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
