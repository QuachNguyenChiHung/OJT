-- Helper SQL queries for testing Lambda functions
-- Use with MySQL Workbench or any MySQL client

-- =============================================
-- 1. Get active users for testing
-- =============================================
SELECT 
    u_id,
    email,
    full_name,
    phone_number,
    role,
    is_active
FROM app_users
WHERE is_active = TRUE
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 2. Get products with available stock
-- =============================================
SELECT 
    pd.pd_id,
    p.p_id,
    p.p_name,
    pd.size,
    pd.color_name,
    pd.amount,
    pd.in_stock,
    p.price,
    p.is_active
FROM product_details pd
JOIN products p ON pd.product_id = p.p_id
WHERE pd.amount > 0
  AND pd.in_stock = TRUE
  AND p.is_active = TRUE
ORDER BY pd.amount DESC
LIMIT 10;

-- =============================================
-- 3. Get recent orders
-- =============================================
SELECT 
    o.o_id,
    o.status,
    o.payment_method,
    o.shipping_address,
    o.phone_number,
    o.total_price,
    o.date_created,
    u.full_name,
    u.email
FROM customer_orders o
JOIN app_users u ON o.user_id = u.u_id
ORDER BY o.date_created DESC
LIMIT 10;

-- =============================================
-- 4. Get order details for specific order
-- =============================================
-- Replace 'YOUR-ORDER-ID' with actual order ID
SET @orderId = '77777777-7777-7777-7777-777777777771';

SELECT 
    od.od_id,
    od.quantity,
    od.price,
    p.p_name,
    pd.size,
    pd.color_name,
    (od.quantity * od.price) AS subtotal
FROM order_details od
JOIN product_details pd ON od.product_details_id = pd.pd_id
JOIN products p ON pd.product_id = p.p_id
WHERE od.order_id = @orderId;

-- =============================================
-- 5. Products with low stock (< 5)
-- =============================================
SELECT 
    p.p_name,
    pd.size,
    pd.color_name,
    pd.amount,
    pd.in_stock
FROM product_details pd
JOIN products p ON pd.product_id = p.p_id
WHERE pd.amount < 5 AND pd.amount > 0
ORDER BY pd.amount ASC;

-- =============================================
-- 6. Count orders by payment method
-- =============================================
SELECT 
    payment_method,
    COUNT(*) as order_count,
    SUM(total_price) as total_revenue
FROM customer_orders
GROUP BY payment_method;

-- =============================================
-- 7. Count orders by status
-- =============================================
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total_price) as total_amount
FROM customer_orders
GROUP BY status
ORDER BY FIELD(status, 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED');

-- =============================================
-- 8. Product ratings summary
-- =============================================
SELECT 
    p.p_id,
    p.p_name,
    COUNT(r.r_id) as rating_count,
    AVG(r.rating_value) as avg_rating,
    MIN(r.rating_value) as min_rating,
    MAX(r.rating_value) as max_rating
FROM products p
LEFT JOIN ratings r ON p.p_id = r.product_id
GROUP BY p.p_id, p.p_name
HAVING rating_count > 0
ORDER BY avg_rating DESC;

-- =============================================
-- 9. Best selling products
-- =============================================
SELECT 
    p.p_id,
    p.p_name,
    SUM(od.quantity) as total_sold,
    SUM(od.quantity * od.price) as total_revenue
FROM products p
JOIN product_details pd ON p.p_id = pd.product_id
JOIN order_details od ON pd.pd_id = od.product_details_id
JOIN customer_orders o ON od.order_id = o.o_id
WHERE o.status != 'CANCELLED'
GROUP BY p.p_id, p.p_name
ORDER BY total_sold DESC
LIMIT 10;

-- =============================================
-- 10. Cart items for user
-- =============================================
-- Replace 'YOUR-USER-ID' with actual user ID
SET @userId = '11111111-1111-1111-1111-111111111111';

SELECT 
    c.cart_id,
    p.p_name,
    pd.size,
    pd.color_name,
    c.quantity,
    p.price,
    (c.quantity * p.price) as subtotal
FROM cart c
JOIN product_details pd ON c.product_details_id = pd.pd_id
JOIN products p ON pd.product_id = p.p_id
WHERE c.user_id = @userId;

-- =============================================
-- 11. Verify table structure
-- =============================================
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- =============================================
-- 12. Check foreign key relationships
-- =============================================
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
