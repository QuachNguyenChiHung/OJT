-- Helper SQL queries to get IDs for testing COD Order API

-- 1. Get active user ID
SELECT TOP 1
    user_id,
    email,
    u_name,
    phone_number,
    address,
    isActive
FROM Users
WHERE isActive = 1
ORDER BY user_id;

-- 2. Get product details with available stock
SELECT TOP 10
    pd.pd_id,
    p.p_id,
    p.p_name,
    pd.size,
    pd.color_name,
    pd.amount,
    pd.in_stock,
    p.price,
    p.is_active
FROM ProductDetails pd
JOIN Product p ON pd.p_id = p.p_id
WHERE pd.amount > 0
  AND pd.in_stock = 1
  AND p.is_active = 1
ORDER BY pd.amount DESC;

-- 3. Get all active users
SELECT
    user_id,
    email,
    u_name,
    phone_number,
    isActive
FROM Users
WHERE isActive = 1
ORDER BY u_name;

-- 4. Check specific user details
-- Replace 'YOUR-USER-ID' with actual user ID
DECLARE @userId UNIQUEIDENTIFIER = 'YOUR-USER-ID';

SELECT
    user_id,
    email,
    u_name,
    phone_number,
    address,
    isActive
FROM Users
WHERE user_id = @userId;

-- 5. Check specific product details
-- Replace 'YOUR-PRODUCT-DETAILS-ID' with actual product details ID
DECLARE @pdId UNIQUEIDENTIFIER = 'YOUR-PRODUCT-DETAILS-ID';

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
FROM ProductDetails pd
JOIN Product p ON pd.p_id = p.p_id
WHERE pd.pd_id = @pdId;

-- 6. Check recent orders
SELECT TOP 10
    o.o_id,
    o.status,
    o.payment_method,
    o.shipping_address,
    o.phone,
    o.total_price,
    o.date_created,
    u.u_name,
    u.email
FROM Orders o
JOIN Users u ON o.u_id = u.user_id
ORDER BY o.date_created DESC;

-- 7. Check order details for specific order
-- Replace 'YOUR-ORDER-ID' with actual order ID
DECLARE @orderId UNIQUEIDENTIFIER = 'YOUR-ORDER-ID';

SELECT
    od.od_id,
    od.quantity,
    od.price,
    p.p_name,
    pd.size,
    pd.color_name,
    (od.quantity * od.price) AS subtotal
FROM OrderDetails od
JOIN ProductDetails pd ON od.pd_id = pd.pd_id
JOIN Product p ON pd.p_id = p.p_id
WHERE od.o_id = @orderId;

-- 8. Products with low stock (< 5)
SELECT
    p.p_name,
    pd.size,
    pd.color_name,
    pd.amount,
    pd.in_stock
FROM ProductDetails pd
JOIN Product p ON pd.p_id = p.p_id
WHERE pd.amount < 5 AND pd.amount > 0
ORDER BY pd.amount ASC;

-- 9. Count orders by payment method
SELECT
    payment_method,
    COUNT(*) as order_count,
    SUM(total_price) as total_revenue
FROM Orders
GROUP BY payment_method;

-- 10. Get sample data for HTTP test file
-- Copy these values to test-cod-order-api.http
SELECT
    'User ID: ' + CAST((SELECT TOP 1 user_id FROM Users WHERE isActive = 1) AS VARCHAR(50)) AS sample_user_id,
    'Product Details ID 1: ' + CAST((SELECT TOP 1 pd_id FROM ProductDetails WHERE amount > 0) AS VARCHAR(50)) AS sample_pd_id_1,
    'Product Details ID 2: ' + CAST((SELECT TOP 1 SKIP 1 pd_id FROM ProductDetails WHERE amount > 0) AS VARCHAR(50)) AS sample_pd_id_2;

-- 11. Verify migration columns exist
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Orders'
AND COLUMN_NAME IN ('payment_method', 'shipping_address', 'phone')
ORDER BY COLUMN_NAME;

