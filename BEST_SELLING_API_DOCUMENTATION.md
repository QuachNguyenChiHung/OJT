# API Sản phẩm Bán chạy nhất

## Tổng quan
API này trả về danh sách các sản phẩm bán chạy nhất, được sắp xếp theo thứ tự từ bán nhiều nhất đến ít nhất. Thông tin bao gồm tên, giá và ảnh đại diện của mỗi sản phẩm.

## Endpoint

### GET /api/products/best-selling

**Mô tả:** Lấy danh sách sản phẩm bán chạy nhất, sắp xếp theo số lượng đã bán giảm dần

**URL:** `http://localhost:8080/api/products/best-selling`

**Method:** GET

**Query Parameters:** Không có

**Headers:**
- `Authorization` (optional): Bearer token để xác thực người dùng
  - Nếu không có token hoặc là user thường: Chỉ hiển thị sản phẩm có `isActive = true`
  - Nếu là ADMIN: Hiển thị tất cả sản phẩm

---

## Response Format

### Success Response (200 OK)

**Response Body:** Array of ProductSearchResponse (giống API /list)

```json
[
  {
    "id": "uuid-string",
    "name": "Áo thun nam hot trend",
    "price": 299000.00,
    "imageUrl": "https://example.com/ao-thun.jpg"
  },
  {
    "id": "uuid-string",
    "name": "Quần jean nữ cao cấp",
    "price": 599000.00,
    "imageUrl": "https://example.com/quan-jean.jpg"
  },
  {
    "id": "uuid-string",
    "name": "Áo khoác thể thao",
    "price": 899000.00,
    "imageUrl": "https://example.com/ao-khoac.jpg"
  }
]
```

### Response Fields
- `id` (UUID): ID duy nhất của sản phẩm
- `name` (String): Tên sản phẩm
- `price` (BigDecimal): Giá sản phẩm
- `imageUrl` (String): URL ảnh đại diện của sản phẩm (lấy từ ProductDetails, ảnh đầu tiên)

**⚠️ Lưu ý:** Danh sách được sắp xếp theo thứ tự giảm dần của số lượng bán. Sản phẩm ở đầu danh sách là sản phẩm bán chạy nhất.

---

## Ví dụ sử dụng

### 1. Lấy danh sách sản phẩm bán chạy (không cần đăng nhập)

**Request:**
```
GET http://localhost:8080/api/products/best-selling
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Áo thun nam basic",
    "price": 199000.00,
    "imageUrl": "https://cdn.example.com/ao-thun-basic.jpg"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "name": "Quần short nam",
    "price": 249000.00,
    "imageUrl": "https://cdn.example.com/quan-short.jpg"
  },
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "name": "Áo polo nam",
    "price": 299000.00,
    "imageUrl": "https://cdn.example.com/ao-polo.jpg"
  }
]
```

### 2. Lấy danh sách với quyền Admin

**Request:**
```
GET http://localhost:8080/api/products/best-selling
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** Trả về tất cả sản phẩm bán chạy (kể cả isActive = false), sắp xếp theo số lượng bán

---

## Cách hoạt động

### 1. Logic tính sản phẩm bán chạy:

```sql
SELECT p.* FROM Product p
JOIN ProductDetails pd ON p.p_id = pd.p_id
JOIN OrderDetails od ON pd.pd_id = od.pd_id
JOIN Orders o ON od.o_id = o.o_id
WHERE o.status = 'Completed'
GROUP BY p.p_id
ORDER BY SUM(od.quantity) DESC
```

**Giải thích:**
- Chỉ tính các đơn hàng có trạng thái **"Completed"** (đã hoàn thành)
- Tính tổng số lượng (`SUM(od.quantity)`) của mỗi sản phẩm
- Sắp xếp giảm dần theo tổng số lượng bán
- Sản phẩm bán nhiều nhất ở đầu danh sách

### 2. Authentication & Authorization:
- **Không có token / User thường:** Chỉ xem sản phẩm active (isActive = true)
- **Admin:** Xem tất cả sản phẩm, kể cả inactive

### 3. Image URL:
- Lấy ảnh đầu tiên từ ProductDetails của sản phẩm
- Nếu không có ảnh: trả về `null`

---

## Use Cases

### 1. Trang chủ E-commerce - Section "Bán chạy nhất"
```html
<section class="best-sellers">
  <h2>Sản phẩm bán chạy nhất</h2>
  <div class="product-grid">
    <!-- Hiển thị 8-12 sản phẩm đầu tiên -->
  </div>
</section>
```

### 2. Widget "Trending Products"
```html
<aside class="trending-widget">
  <h3>🔥 Trending Now</h3>
  <ul>
    <!-- Top 5 sản phẩm bán chạy -->
  </ul>
</aside>
```

### 3. Dashboard Analytics (Admin)
```html
<div class="admin-dashboard">
  <h2>Top Selling Products</h2>
  <table>
    <!-- Hiển thị ranking với số lượng bán -->
  </table>
</div>
```

---

## Thay đổi Code

### 1. ProductRepository.java
Thêm 2 custom queries:

```java
@Query("SELECT p FROM Product p " +
       "JOIN p.productDetails pd " +
       "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
       "JOIN od.order o " +
       "WHERE o.status = 'Completed' " +
       "GROUP BY p.PId " +
       "ORDER BY SUM(od.quantity) DESC")
List<Product> findBestSellingProducts();

@Query("SELECT p FROM Product p " +
       "JOIN p.productDetails pd " +
       "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
       "JOIN od.order o " +
       "WHERE o.status = 'Completed' AND p.isActive = :isActive " +
       "GROUP BY p.PId " +
       "ORDER BY SUM(od.quantity) DESC")
List<Product> findBestSellingProductsByActiveStatus(Boolean isActive);
```

### 2. ProductService.java
Thêm method:

```java
public List<Product> findBestSellingProducts(boolean isAdmin) {
    if (isAdmin) {
        return productRepository.findBestSellingProducts();
    }
    return productRepository.findBestSellingProductsByActiveStatus(true);
}
```

### 3. ProductController.java
Thêm endpoint:

```java
@GetMapping("/best-selling")
public List<ProductDTO.ProductSearchResponse> getBestSellingProducts(Authentication authentication) {
    boolean isAdmin = isAdmin(authentication);
    return productService.findBestSellingProducts(isAdmin).stream()
        .map(this::convertToSearchDTO)
        .collect(Collectors.toList());
}
```

---

## Frontend Integration

### JavaScript/Fetch Example:
```javascript
// Lấy top 10 sản phẩm bán chạy
fetch('http://localhost:8080/api/products/best-selling')
  .then(response => response.json())
  .then(products => {
    const top10 = products.slice(0, 10);
    displayBestSellers(top10);
  });

function displayBestSellers(products) {
  const container = document.getElementById('best-sellers');
  
  products.forEach((product, index) => {
    const card = `
      <div class="product-card">
        <span class="rank">#${index + 1}</span>
        <img src="${product.imageUrl}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${product.price.toLocaleString('vi-VN')} ₫</p>
        <span class="badge">Bán chạy</span>
      </div>
    `;
    container.innerHTML += card;
  });
}
```

### React Example:
```jsx
import { useState, useEffect } from 'react';

function BestSellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('http://localhost:8080/api/products/best-selling')
      .then(res => res.json())
      .then(data => {
        setProducts(data.slice(0, 8)); // Top 8
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <section className="best-sellers">
      <h2>🔥 Sản phẩm bán chạy nhất</h2>
      <div className="product-grid">
        {products.map((product, index) => (
          <div key={product.id} className="product-card">
            <div className="rank-badge">#{index + 1}</div>
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">
              {product.price.toLocaleString('vi-VN')} ₫
            </p>
            <button onClick={() => viewDetail(product.id)}>
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Vue.js Example:
```vue
<template>
  <section class="best-sellers">
    <h2>🔥 Bán chạy nhất</h2>
    <div class="product-grid">
      <div 
        v-for="(product, index) in bestSellers" 
        :key="product.id"
        class="product-card"
      >
        <span class="rank">#{{ index + 1 }}</span>
        <img :src="product.imageUrl" :alt="product.name">
        <h3>{{ product.name }}</h3>
        <p class="price">{{ formatPrice(product.price) }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      bestSellers: []
    }
  },
  mounted() {
    fetch('http://localhost:8080/api/products/best-selling')
      .then(res => res.json())
      .then(data => {
        this.bestSellers = data.slice(0, 10); // Top 10
      });
  },
  methods: {
    formatPrice(price) {
      return price.toLocaleString('vi-VN') + ' ₫';
    }
  }
}
</script>
```

---

## Testing

### Postman:
```
Method: GET
URL: http://localhost:8080/api/products/best-selling
Headers: (optional) Authorization: Bearer {token}
```

### cURL:
```bash
# Without authentication
curl -X GET http://localhost:8080/api/products/best-selling

# With authentication (Admin)
curl -X GET http://localhost:8080/api/products/best-selling \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Result:
- Status: 200 OK
- Body: Array of products
- Order: Descending by sales quantity (best-selling first)
- Each product has: id, name, price, imageUrl

---

## Performance Considerations

### 1. Database Query
- Query sử dụng JOIN nhiều bảng
- GROUP BY và SUM có thể chậm với dữ liệu lớn
- **Khuyến nghị:** Thêm index cho các foreign keys

### 2. Caching
```java
// Future improvement: Add caching
@Cacheable(value = "bestSellingProducts", key = "#isAdmin")
public List<Product> findBestSellingProducts(boolean isAdmin) {
    // ...
}
```

### 3. Pagination
```java
// Future: Add pagination support
@GetMapping("/best-selling")
public Page<ProductDTO.ProductSearchResponse> getBestSellingProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    Authentication authentication
) {
    // ...
}
```

---

## Comparison với các APIs khác

| Feature | /list | /detail/{id} | **/best-selling** |
|---------|-------|--------------|-------------------|
| Số lượng SP | Nhiều | 1 | Nhiều |
| Sắp xếp | Không | N/A | **Theo lượng bán ↓** |
| Search | ✅ Có | ❌ | ❌ |
| Images | 1/SP | 5/variant | 1/SP |
| Details | ❌ | ✅ | ❌ |
| Use case | Listing | Detail page | **Best-sellers** |

---

## Error Handling

### Không có đơn hàng nào:
```json
Status: 200 OK
Body: []
```

### Database error:
```json
Status: 500
{
  "error": "Internal server error"
}
```

---

## Business Logic

### Điều kiện tính "bán chạy":
1. ✅ Chỉ tính đơn hàng **status = "Completed"**
2. ✅ Tính tổng số lượng từ **OrderDetails**
3. ✅ Group by Product (không phân biệt màu/size)
4. ✅ Sắp xếp giảm dần theo tổng số lượng

### Không tính:
- ❌ Đơn hàng Pending
- ❌ Đơn hàng Cancelled
- ❌ Đơn hàng Processing
- ❌ Views/Clicks (chỉ tính actual sales)

---

## Notes

- ✅ Sử dụng DTO ProductSearchResponse (giống API /list)
- ✅ Tự động filter theo isActive cho user thường
- ✅ Admin xem tất cả sản phẩm
- ✅ Sắp xếp theo thứ tự bán chạy (nhiều → ít)
- ⚠️ Không có pagination (trả về tất cả)
- ⚠️ Không có filter theo category/brand
- 💡 Frontend nên lấy top N sản phẩm (slice)

---

## Future Enhancements

- [ ] Add pagination
- [ ] Add time filter (best-selling last 30 days, 7 days, etc.)
- [ ] Add category filter
- [ ] Add caching (Redis)
- [ ] Return sales count with each product
- [ ] Add trending score (views + sales)
- [ ] Add "new" vs "all-time" best sellers

---

## SEO & Marketing

### Suggested titles:
- "🔥 Sản phẩm bán chạy nhất"
- "Top Trending Products"
- "Best Sellers"
- "Mua nhiều nhất"

### Display strategies:
- Homepage banner
- Sidebar widget
- Dedicated page "/best-sellers"
- Email marketing campaigns
- Social media posts

---

**API sẵn sàng sử dụng!** 🚀

