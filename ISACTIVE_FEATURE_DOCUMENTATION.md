# Triển khai tính năng isActive cho Product và User

## Tổng quan
Tính năng này cho phép quản trị viên kiểm soát khả năng hiển thị của sản phẩm và trạng thái hoạt động của người dùng:
- **Product.isActive**: Nếu `false`, sản phẩm sẽ không hiển thị cho người dùng thông thường, nhưng admin vẫn thấy
- **AppUser.isActive**: Nếu `false`, người dùng không thể đăng nhập vào hệ thống

## Các thay đổi đã thực hiện

### 1. Model Product (Product.java)
**Thêm:**
- Trường `isActive` (Boolean) với giá trị mặc định là `true`
- Constructor khởi tạo `isActive = true`
- Getter và Setter cho `isActive`

```java
@Column(name = "is_active", columnDefinition = "bit")
private Boolean isActive;

public Product() {
    this.isActive = true;
}

public Boolean getIsActive() { return isActive; }
public void setIsActive(Boolean isActive) { this.isActive = isActive; }
```

### 2. ProductRepository (ProductRepository.java)
**Thêm các phương thức query:**
- `findByIsActive(Boolean isActive)` - Tìm tất cả sản phẩm theo trạng thái active
- `findByCategoryCIdAndIsActive(UUID categoryId, Boolean isActive)` - Tìm theo category và isActive
- `findByBrandIdAndIsActive(UUID brandId, Boolean isActive)` - Tìm theo brand và isActive
- `findByPriceBetweenAndIsActive(BigDecimal minPrice, BigDecimal maxPrice, Boolean isActive)` - Tìm theo giá và isActive
- `findByPNameContainingIgnoreCaseAndIsActive(String name, Boolean isActive)` - Tìm kiếm theo tên và isActive

### 3. ProductService (ProductService.java)
**Thêm các phương thức role-aware:**
- `findAllForUser(boolean isAdmin)` - Lấy tất cả sản phẩm, lọc theo role
- `findByCategoryForUser(UUID categoryId, boolean isAdmin)` - Lấy sản phẩm theo category, lọc theo role
- `findByBrandForUser(UUID brandId, boolean isAdmin)` - Lấy sản phẩm theo brand, lọc theo role
- `findByPriceRangeForUser(BigDecimal minPrice, BigDecimal maxPrice, boolean isAdmin)` - Lấy sản phẩm theo giá, lọc theo role
- `findByNameContainingForUser(String name, boolean isAdmin)` - Tìm kiếm sản phẩm, lọc theo role

**Cơ chế hoạt động:**
- Nếu `isAdmin = true`: Trả về tất cả sản phẩm (bao gồm cả inactive)
- Nếu `isAdmin = false`: Chỉ trả về sản phẩm có `isActive = true`

### 4. ProductController (ProductController.java)
**Cập nhật:**
- Thêm tham số `Authentication` vào các phương thức GET
- Thêm phương thức helper `isAdmin(Authentication)` để kiểm tra quyền admin
- Cập nhật tất cả các endpoint để sử dụng các phương thức `...ForUser()` từ service

**Các endpoint được cập nhật:**
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/category/{categoryId}` - Lấy sản phẩm theo category
- `GET /api/products/brand/{brandId}` - Lấy sản phẩm theo brand
- `GET /api/products/price-range` - Lấy sản phẩm theo khoảng giá
- `GET /api/products/search` - Tìm kiếm sản phẩm

### 5. AuthController (AuthController.java)
**Cập nhật phương thức login:**
- Kiểm tra `user.isActive` trước khi cho phép đăng nhập
- Nếu `isActive = false`, trả về lỗi HTTP 403 (FORBIDDEN) với thông báo "Account is inactive. Please contact administrator."

```java
// Check if user is active
if (user.getIsActive() == null || !user.getIsActive()) {
    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(Map.of(ERROR_KEY, "Account is inactive. Please contact administrator."));
}
```

### 6. Database Migration (add_isactive_column.sql)
**Script SQL để thêm cột:**
```sql
ALTER TABLE Product 
ADD is_active BIT NOT NULL DEFAULT 1;

UPDATE Product 
SET is_active = 1 
WHERE is_active IS NULL;

CREATE INDEX idx_product_isactive ON Product(is_active);
```

## Cách sử dụng

### Đối với Admin:
1. **Quản lý sản phẩm:**
   - Admin có thể thấy tất cả sản phẩm (active và inactive)
   - Để ẩn sản phẩm khỏi user: Cập nhật `isActive = false` cho sản phẩm đó
   - Để hiện lại sản phẩm: Cập nhật `isActive = true`

2. **Quản lý người dùng:**
   - Để vô hiệu hóa tài khoản user: Cập nhật `isActive = false` trong bảng Users
   - User sẽ không thể đăng nhập khi `isActive = false`

### Đối với User:
1. **Xem sản phẩm:**
   - User chỉ thấy các sản phẩm có `isActive = true`
   - Các sản phẩm inactive hoàn toàn ẩn khỏi kết quả tìm kiếm

2. **Đăng nhập:**
   - Nếu tài khoản bị vô hiệu hóa (`isActive = false`), không thể đăng nhập
   - Thông báo lỗi: "Account is inactive. Please contact administrator."

## API Endpoints

### 1. Lấy tất cả sản phẩm
```
GET /api/products
Header: Authorization: Bearer {token}
```
- **Admin**: Thấy tất cả sản phẩm
- **User**: Chỉ thấy sản phẩm active

### 2. Lấy sản phẩm theo category
```
GET /api/products/category/{categoryId}
Header: Authorization: Bearer {token}
```
- **Admin**: Thấy tất cả sản phẩm trong category
- **User**: Chỉ thấy sản phẩm active trong category

### 3. Tìm kiếm sản phẩm
```
GET /api/products/search?name=searchTerm
Header: Authorization: Bearer {token}
```
- **Admin**: Tìm trong tất cả sản phẩm
- **User**: Chỉ tìm trong sản phẩm active

### 4. Đăng nhập
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password"
}
```
- **Thành công**: Trả về token nếu `isActive = true`
- **Thất bại**: HTTP 403 nếu `isActive = false`

## Testing

### Test 1: User thường xem sản phẩm
```bash
# Đăng nhập với user thường
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Lấy danh sách sản phẩm (chỉ thấy active products)
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer {token}"
```

### Test 2: Admin xem tất cả sản phẩm
```bash
# Đăng nhập với admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Lấy danh sách sản phẩm (thấy tất cả products)
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer {token}"
```

### Test 3: User inactive không thể đăng nhập
```bash
# Trước tiên set isActive = false cho user trong database
UPDATE Users SET isActive = 0 WHERE email = 'user@test.com';

# Thử đăng nhập
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'
  
# Kết quả: HTTP 403 với message "Account is inactive"
```

### Test 4: Set product isActive = false
```bash
# Admin update product
UPDATE Product SET is_active = 0 WHERE p_id = '{product_id}';

# User không thấy product này
# Admin vẫn thấy product này
```

## Migration Steps

1. **Chạy SQL script:**
```bash
# Kết nối đến database và chạy
sqlcmd -S your_server -d your_database -i add_isactive_column.sql
```

2. **Compile và restart application:**
```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

3. **Verify:**
- Kiểm tra các sản phẩm hiện có đều có `isActive = true`
- Test với admin account
- Test với user account
- Test login với inactive user

## Notes

- Giá trị mặc định của `isActive` là `true` cho cả Product và User mới
- AppUser đã có sẵn field `isActive`, chỉ thêm logic kiểm tra ở AuthController
- Product mới thêm field `isActive` và logic filtering
- Admin luôn có quyền xem tất cả (role = "ADMIN")
- User thường chỉ xem được items active (role = "USER")

## Security Notes

- Authentication được xử lý bởi Spring Security với JWT
- Role được lưu trong JWT token
- Mỗi request đều check Authentication để xác định role
- Không có token = anonymous user = xem như là User thường (chỉ thấy active products)

