-- Sample Data for OJT E-commerce (MySQL)
-- Run after schema creation

-- =============================================
-- Categories (10 records)
-- =============================================
INSERT INTO categories (c_id, c_name) VALUES
('22222222-2222-2222-2222-222222222221', 'Áo thun'),
('22222222-2222-2222-2222-222222222222', 'Áo sơ mi'),
('22222222-2222-2222-2222-222222222223', 'Quần jeans'),
('22222222-2222-2222-2222-222222222224', 'Quần kaki'),
('22222222-2222-2222-2222-222222222225', 'Váy đầm'),
('22222222-2222-2222-2222-222222222226', 'Áo khoác'),
('22222222-2222-2222-2222-222222222227', 'Quần short'),
('22222222-2222-2222-2222-222222222228', 'Áo len'),
('22222222-2222-2222-2222-222222222229', 'Đồ thể thao'),
('22222222-2222-2222-2222-222222222230', 'Phụ kiện');

-- =============================================
-- Brands (10 records)
-- =============================================
INSERT INTO brands (b_id, b_name) VALUES
('33333333-3333-3333-3333-333333333331', 'Nike'),
('33333333-3333-3333-3333-333333333332', 'Adidas'),
('33333333-3333-3333-3333-333333333333', 'Uniqlo'),
('33333333-3333-3333-3333-333333333334', 'Zara'),
('33333333-3333-3333-3333-333333333335', 'H&M'),
('33333333-3333-3333-3333-333333333336', 'Gucci'),
('33333333-3333-3333-3333-333333333337', 'Louis Vuitton'),
('33333333-3333-3333-3333-333333333338', 'Puma'),
('33333333-3333-3333-3333-333333333339', 'Levi\'s'),
('33333333-3333-3333-3333-333333333340', 'Calvin Klein');

-- =============================================
-- Products (10 records)
-- =============================================
INSERT INTO products (p_id, p_name, p_desc, price, category_id, brand_id, is_active) VALUES
('55555555-5555-5555-5555-555555555551', 'Áo thun Nike Dri-FIT', 'Áo thun thể thao thoáng khí', 450000, '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', TRUE),
('55555555-5555-5555-5555-555555555552', 'Áo sơ mi Uniqlo', 'Áo sơ mi cotton cao cấp', 590000, '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', TRUE),
('55555555-5555-5555-5555-555555555553', 'Quần jeans Levi\'s 501', 'Quần jeans classic fit', 1290000, '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333339', TRUE),
('55555555-5555-5555-5555-555555555554', 'Quần kaki Zara', 'Quần kaki slim fit', 890000, '22222222-2222-2222-2222-222222222224', '33333333-3333-3333-3333-333333333334', TRUE),
('55555555-5555-5555-5555-555555555555', 'Váy đầm H&M', 'Váy đầm dự tiệc', 750000, '22222222-2222-2222-2222-222222222225', '33333333-3333-3333-3333-333333333335', TRUE),
('55555555-5555-5555-5555-555555555556', 'Áo khoác Adidas', 'Áo khoác gió thể thao', 1450000, '22222222-2222-2222-2222-222222222226', '33333333-3333-3333-3333-333333333332', TRUE),
('55555555-5555-5555-5555-555555555557', 'Quần short Puma', 'Quần short thể thao', 550000, '22222222-2222-2222-2222-222222222227', '33333333-3333-3333-3333-333333333338', TRUE),
('55555555-5555-5555-5555-555555555558', 'Áo len Calvin Klein', 'Áo len cổ tròn', 1890000, '22222222-2222-2222-2222-222222222228', '33333333-3333-3333-3333-333333333340', TRUE),
('55555555-5555-5555-5555-555555555559', 'Bộ đồ thể thao Nike', 'Bộ đồ tập gym', 1250000, '22222222-2222-2222-2222-222222222229', '33333333-3333-3333-3333-333333333331', TRUE),
('55555555-5555-5555-5555-555555555560', 'Túi xách Gucci', 'Túi xách da cao cấp', 25000000, '22222222-2222-2222-2222-222222222230', '33333333-3333-3333-3333-333333333336', TRUE);

-- =============================================
-- Product Details (5 variants per product)
-- =============================================
INSERT INTO product_details (pd_id, product_id, color_name, color_code, size, amount, in_stock, img_list) VALUES
-- Product 1 variants
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'Đen', '#000000', 'S', 10, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555551', 'Đen', '#000000', 'M', 15, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555551', 'Trắng', '#FFFFFF', 'M', 12, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555551', 'Trắng', '#FFFFFF', 'L', 8, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666665', '55555555-5555-5555-5555-555555555551', 'Xanh', '#0000FF', 'XL', 5, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),

-- Product 2 variants
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555552', 'Trắng', '#FFFFFF', 'S', 20, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666667', '55555555-5555-5555-5555-555555555552', 'Trắng', '#FFFFFF', 'M', 18, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666668', '55555555-5555-5555-5555-555555555552', 'Xanh nhạt', '#ADD8E6', 'M', 15, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666669', '55555555-5555-5555-5555-555555555552', 'Xanh nhạt', '#ADD8E6', 'L', 10, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666670', '55555555-5555-5555-5555-555555555552', 'Hồng', '#FFC0CB', 'XL', 7, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),

-- Product 3 variants
('66666666-6666-6666-6666-666666666671', '55555555-5555-5555-5555-555555555553', 'Xanh đậm', '#00008B', '28', 12, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666672', '55555555-5555-5555-5555-555555555553', 'Xanh đậm', '#00008B', '30', 15, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666673', '55555555-5555-5555-5555-555555555553', 'Xanh đậm', '#00008B', '32', 10, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666674', '55555555-5555-5555-5555-555555555553', 'Đen', '#000000', '30', 8, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]'),
('66666666-6666-6666-6666-666666666675', '55555555-5555-5555-5555-555555555553', 'Đen', '#000000', '32', 6, TRUE, '["https://example.com/img1.jpg","https://example.com/img2.jpg","https://example.com/img3.jpg","https://example.com/img4.jpg","https://example.com/img5.jpg"]');

-- =============================================
-- Users (10 records - password: password123)
-- =============================================
INSERT INTO app_users (u_id, email, password_hash, full_name, phone_number, address, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Nguyễn Văn A', '0901234567', '123 Nguyễn Huệ, Q1, HCM', 'USER', TRUE),
('11111111-1111-1111-1111-111111111112', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Trần Thị B', '0902345678', '456 Lê Lợi, Q1, HCM', 'USER', TRUE),
('11111111-1111-1111-1111-111111111113', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Admin User', '0903456789', '789 Đồng Khởi, Q1, HCM', 'ADMIN', TRUE),
('11111111-1111-1111-1111-111111111114', 'user4@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Lê Văn C', '0904567890', '321 Hai Bà Trưng, Q3, HCM', 'USER', TRUE),
('11111111-1111-1111-1111-111111111115', 'user5@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Phạm Thị D', '0905678901', '654 Võ Văn Tần, Q3, HCM', 'USER', FALSE);

-- =============================================
-- Banners (5 records)
-- =============================================
INSERT INTO banners (banner_id, title, image_url, link_url, display_order, is_active, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'Summer Sale 50%', 'https://example.com/banner1.jpg', '/products?sale=summer', 1, TRUE, '11111111-1111-1111-1111-111111111113'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'New Arrivals', 'https://example.com/banner2.jpg', '/products?sort=newest', 2, TRUE, '11111111-1111-1111-1111-111111111113'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'Best Sellers', 'https://example.com/banner3.jpg', '/products?sort=best-selling', 3, TRUE, '11111111-1111-1111-1111-111111111113'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'Free Shipping', 'https://example.com/banner4.jpg', '/shipping-policy', 4, TRUE, '11111111-1111-1111-1111-111111111113'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'Member Exclusive', 'https://example.com/banner5.jpg', '/membership', 5, FALSE, '11111111-1111-1111-1111-111111111113');

-- =============================================
-- Sample Orders
-- =============================================
INSERT INTO customer_orders (o_id, user_id, status, total_price, payment_method, shipping_address, phone_number) VALUES
('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'DELIVERED', 900000, 'ONLINE', '123 Nguyễn Huệ, Q1, HCM', '0901234567'),
('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111112', 'SHIPPING', 1290000, 'COD', '456 Lê Lợi, Q1, HCM', '0902345678'),
('77777777-7777-7777-7777-777777777773', '11111111-1111-1111-1111-111111111114', 'PENDING', 2340000, 'COD', '321 Hai Bà Trưng, Q3, HCM', '0904567890');

-- =============================================
-- Sample Order Details
-- =============================================
INSERT INTO order_details (od_id, order_id, product_details_id, quantity, price) VALUES
('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', 2, 450000),
('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666671', 1, 1290000),
('88888888-8888-8888-8888-888888888883', '77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666661', 2, 450000),
('88888888-8888-8888-8888-888888888884', '77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666666', 2, 590000);

-- =============================================
-- Sample Ratings
-- =============================================
INSERT INTO ratings (r_id, user_id, product_id, rating_value, comment) VALUES
('99999999-9999-9999-9999-999999999991', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 5, 'Áo rất đẹp, chất lượng tốt!'),
('99999999-9999-9999-9999-999999999992', '11111111-1111-1111-1111-111111111112', '55555555-5555-5555-5555-555555555551', 4, 'Chất vải thoáng mát'),
('99999999-9999-9999-9999-999999999993', '11111111-1111-1111-1111-111111111114', '55555555-5555-5555-5555-555555555553', 5, 'Quần jeans đẹp, đúng size');

SELECT 'Sample data inserted successfully!' AS status;
