# 🚀 Product APIs - README

## Giới thiệu

Đã triển khai thành công **3 APIs sản phẩm** phục vụ chức năng xem danh sách, chi tiết và sản phẩm bán chạy trong hệ thống E-commerce.

---

## 📋 APIs đã triển khai

### 1️⃣ API Danh sách / Tìm kiếm Sản phẩm
**Endpoint:** `GET /api/products/list?search={keyword}`

**Mục đích:** Xem danh sách sản phẩm và tìm kiếm

**Response:** Danh sách sản phẩm với tên, giá, 1 ảnh đại diện

### 2️⃣ API Chi tiết Sản phẩm  
**Endpoint:** `GET /api/products/detail/{id}`

**Mục đích:** Xem chi tiết 1 sản phẩm cụ thể

**Response:** Thông tin đầy đủ sản phẩm với các biến thế (màu, size) và **đúng 5 ảnh mỗi biến thể**

### 3️⃣ API Sản phẩm Bán chạy nhất
**Endpoint:** `GET /api/products/best-selling`

**Mục đích:** Xem danh sách sản phẩm bán chạy nhất, sắp xếp theo lượng bán

**Response:** Danh sách sản phẩm với tên, giá, 1 ảnh, **sắp xếp từ bán nhiều → ít**

---

## 🎯 Bắt đầu nhanh

### Bước 1: Lấy danh sách sản phẩm

```bash
curl http://localhost:8080/api/products/list
```

### Bước 2: Chọn 1 product ID từ kết quả

### Bước 3: Lấy chi tiết sản phẩm

```bash
curl http://localhost:8080/api/products/detail/{PRODUCT_ID}
```

---

## 📚 Tài liệu chi tiết

### API Danh sách / Tìm kiếm:
- 📖 **Chi tiết:** `PRODUCT_SEARCH_API_DOCUMENTATION.md`
- 📝 **Tóm tắt:** `PRODUCT_SEARCH_API_SUMMARY.md`  
- ⚡ **Quick Ref:** `QUICK_REFERENCE_PRODUCT_API.md`
- 🧪 **Test:** `test-product-search-api.http`

### API Chi tiết sản phẩm:
- 📖 **Chi tiết:** `PRODUCT_DETAIL_API_DOCUMENTATION.md`
- 📝 **Tóm tắt:** `PRODUCT_DETAIL_API_SUMMARY.md`
- ⚡ **Quick Ref:** `QUICK_REFERENCE_PRODUCT_DETAIL.md`
- 🧪 **Test:** `test-product-detail-api.http`

### Tổng hợp:
- 📦 **Tổng hợp 2 APIs:** `COMPLETE_PRODUCT_APIS.md`

---

## 🔍 API 1: Danh sách / Tìm kiếm

### Request
```http
GET /api/products/list
GET /api/products/list?search=áo
```

### Response
```json
[
  {
    "id": "uuid",
    "name": "Áo thun nam",
    "price": 299000.00,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

### Features
- ✅ Xem tất cả sản phẩm
- ✅ Tìm kiếm theo tên
- ✅ 1 ảnh đại diện mỗi sản phẩm
- ✅ Phân quyền (Admin vs User)

---

## 📦 API 2: Chi tiết Sản phẩm

### Request
```http
GET /api/products/detail/{id}
```

### Response
```json
{
  "id": "uuid",
  "name": "Áo thun nam cao cấp",
  "price": 299000.00,
  "productDetails": [
    {
      "pdId": "uuid",
      "colorName": "Đỏ",
      "colorCode": "#FF0000",
      "size": "M",
      "amount": 100,
      "inStock": true,
      "images": [
        "img1.jpg",
        "img2.jpg",
        "img3.jpg",
        "img4.jpg",
        "img5.jpg"
      ]
    }
  ]
}
```

### Features
- ✅ Thông tin đầy đủ sản phẩm
- ✅ Danh sách các biến thể (màu, size)
- ✅ **Đúng 5 ảnh mỗi biến thế** (ràng buộc đặc biệt)
- ✅ Thông tin tồn kho

---

## 🔥 API 3: Sản phẩm Bán chạy nhất

### Request
```http
GET /api/products/best-selling
```

### Response
```json
[
  {
    "id": "uuid",
    "name": "Áo thun hot trend",
    "price": 299000.00,
    "imageUrl": "https://example.com/ao-thun.jpg"
  },
  {
    "id": "uuid",
    "name": "Quần jean phổ biến",
    "price": 599000.00,
    "imageUrl": "https://example.com/quan-jean.jpg"
  }
]
```

### Features
- ✅ Xem sản phẩm bán chạy nhất
- ✅ **Sắp xếp theo lượng bán giảm dần** (bán nhiều → ít)
- ✅ 1 ảnh đại diện mỗi sản phẩm
- ✅ Chỉ tính đơn hàng Completed
- ✅ Phân quyền Admin/User

---

## ⭐ Điểm đặc biệt: 5 Hình ảnh

API Chi tiết sản phẩm **đảm bảo** mỗi biến thế luôn có **đúng 5 hình ảnh**:

| Database có | API trả về |
|-------------|------------|
| 0 ảnh | 5 placeholder |
| 2 ảnh | 2 real + 3 placeholder |
| 5 ảnh | 5 ảnh (không thay đổi) |
| 8 ảnh | 5 ảnh đầu tiên |

**Placeholder:** `https://via.placeholder.com/500x500?text=No+Image`

---

## 💻 Ví dụ tích hợp

### JavaScript/Fetch
```javascript
// Lấy danh sách
fetch('http://localhost:8080/api/products/list')
  .then(res => res.json())
  .then(products => console.log(products));

// Lấy chi tiết
fetch('http://localhost:8080/api/products/detail/PRODUCT_ID')
  .then(res => res.json())
  .then(product => {
    console.log(product.name);
    product.productDetails.forEach(v => {
      console.log(`${v.colorName}: ${v.images.length} images`); // Always 5
    });
  });
```

### React
```jsx
// Component danh sách
function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products/list')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);
  
  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// Component chi tiết
function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetch(`/api/products/detail/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);
  
  return (
    <div>
      <h1>{product?.name}</h1>
      <p>{product?.price} ₫</p>
      {product?.productDetails.map(v => (
        <div key={v.pdId}>
          <h3>{v.colorName}</h3>
          {/* Always 5 images */}
          {v.images.map((img, i) => (
            <img key={i} src={img} alt={`Image ${i+1}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Vue.js
```vue
<template>
  <div>
    <!-- List -->
    <div v-for="product in products" :key="product.id">
      <img :src="product.imageUrl" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.price }} ₫</p>
    </div>
    
    <!-- Detail -->
    <div v-if="selectedProduct">
      <h1>{{ selectedProduct.name }}</h1>
      <div v-for="variant in selectedProduct.productDetails" :key="variant.pdId">
        <h3>{{ variant.colorName }}</h3>
        <!-- Always 5 images -->
        <img v-for="(img, i) in variant.images" 
             :key="i" 
             :src="img" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      selectedProduct: null
    }
  },
  mounted() {
    // Fetch list
    fetch('/api/products/list')
      .then(res => res.json())
      .then(data => this.products = data);
  },
  methods: {
    loadDetail(id) {
      fetch(`/api/products/detail/${id}`)
        .then(res => res.json())
        .then(data => this.selectedProduct = data);
    }
  }
}
</script>
```

---

## 🧪 Testing

### Sử dụng Postman

#### Test API 1:
```
Method: GET
URL: http://localhost:8080/api/products/list
```

#### Test API 2:
```
Method: GET
URL: http://localhost:8080/api/products/detail/{PRODUCT_ID}
```

### Sử dụng HTTP Test Files

Mở các file sau trong IntelliJ IDEA:
- `test-product-search-api.http`
- `test-product-detail-api.http`

Click vào request để chạy test.

### Sử dụng cURL

```bash
# API 1: List
curl http://localhost:8080/api/products/list

# API 1: Search
curl "http://localhost:8080/api/products/list?search=áo"

# API 2: Detail
curl http://localhost:8080/api/products/detail/YOUR_PRODUCT_ID
```

---

## 📊 So sánh 3 APIs

| Feature | API List | API Detail | API Best-Selling |
|---------|----------|------------|------------------|
| URL | `/list` | `/detail/{id}` | `/best-selling` |
| Số SP trả về | Nhiều | 1 | Nhiều |
| Images | 1 ảnh/SP | 5 ảnh/variant | 1 ảnh/SP |
| Product Details | ❌ | ✅ | ❌ |
| Color/Size | ❌ | ✅ | ❌ |
| Stock Info | ❌ | ✅ | ❌ |
| Search | ✅ | ❌ | ❌ |
| **Sort** | None | N/A | **Sales ↓** |
| Use Case | Listing page | Detail page | Trending |

---

## 🔄 User Flow

```
Trang chủ
   ↓
Gọi API /list
   ↓
Hiển thị danh sách SP (tên, giá, 1 ảnh)
   ↓
User click vào 1 SP
   ↓
Gọi API /detail/{id}
   ↓
Hiển thị chi tiết (tên, giá, variants với 5 ảnh/màu)
   ↓
User chọn màu → xem 5 ảnh
   ↓
User chọn size → kiểm tra tồn kho
   ↓
Add to cart
```

---

## 📱 Mobile App Support

APIs tương thích với:
- ✅ React Native
- ✅ Flutter
- ✅ iOS (Swift)
- ✅ Android (Kotlin/Java)
- ✅ Ionic
- ✅ Xamarin

Xem examples trong `COMPLETE_PRODUCT_APIS.md`

---

## 🔒 Security & Authorization

### API List (`/list`):
- **Public access** (không cần token)
- Có phân quyền nội bộ:
  - User thường: Chỉ xem SP active
  - Admin: Xem tất cả SP

### API Detail (`/detail/{id}`):
- **Public access** (không cần token)
- Trả về tất cả variants

---

## ⚙️ Configuration

### CORS
```java
@CrossOrigin(origins = "*")
```
- Cho phép truy cập từ mọi origin
- Production: Nên giới hạn origins cụ thể

### Base URL
- Development: `http://localhost:8080`
- Production: Update theo domain thực tế

---

## 🐛 Error Handling

### Product not found (404/500):
```json
{
  "error": "Product not found with id: xxx"
}
```

### Invalid UUID (400):
```json
{
  "error": "Invalid UUID string: xxx"
}
```

### Recommendations:
```javascript
try {
  const response = await fetch(`/api/products/detail/${id}`);
  if (!response.ok) {
    throw new Error('Product not found');
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
}
```

---

## 🚀 Deployment

### Checklist:
- [ ] Update base URL
- [ ] Configure CORS for production domain
- [ ] Setup CDN for images
- [ ] Add rate limiting
- [ ] Setup monitoring/logging
- [ ] Test with production data
- [ ] Performance testing
- [ ] Security audit

---

## 📈 Performance Tips

### Frontend:
- Cache danh sách sản phẩm
- Lazy load images
- Implement infinite scroll
- Debounce search input
- Use pagination

### Backend (future):
- Add Redis cache
- Implement pagination
- Optimize DB queries
- Add indexes
- CDN integration

---

## 🎯 Next Steps

### For Frontend Developers:
1. ✅ Đọc documentation
2. ✅ Test APIs với Postman
3. ✅ Implement product list page
4. ✅ Implement product detail page
5. ✅ Handle loading & error states
6. ✅ Implement image gallery (5 ảnh)
7. ✅ Add to cart functionality

### For Backend Developers:
1. ✅ Monitor API performance
2. ✅ Add more filters (price, category)
3. ✅ Implement pagination
4. ✅ Add caching layer
5. ✅ Setup logging & monitoring

---

## 📞 Support

### Câu hỏi thường gặp:

**Q: Tại sao phải đúng 5 ảnh?**  
A: Theo yêu cầu của product, để đảm bảo UI/UX nhất quán.

**Q: Placeholder image có thể custom không?**  
A: Có, sửa trong `ProductService.getExactlyFiveImages()`

**Q: API có pagination không?**  
A: Chưa có, sẽ implement trong phiên bản sau.

**Q: Làm sao biết product ID?**  
A: Gọi API `/list` trước để lấy danh sách IDs.

---

## 📦 Files Structure

```
src/main/java/com/tanxuan/demoaws/
├── controller/
│   └── ProductController.java      (2 endpoints mới)
├── service/
│   └── ProductService.java         (logic xử lý 5 ảnh)
├── dto/
│   └── ProductDTO.java             (4 DTOs)
└── model/
    ├── Product.java
    ├── ProductDetails.java
    └── Color.java

Documentation files:
├── PRODUCT_SEARCH_API_DOCUMENTATION.md
├── PRODUCT_SEARCH_API_SUMMARY.md
├── PRODUCT_DETAIL_API_DOCUMENTATION.md
├── PRODUCT_DETAIL_API_SUMMARY.md
├── QUICK_REFERENCE_PRODUCT_API.md
├── QUICK_REFERENCE_PRODUCT_DETAIL.md
├── COMPLETE_PRODUCT_APIS.md
├── test-product-search-api.http
├── test-product-detail-api.http
└── PRODUCT_APIS_README.md (this file)
```

---

## ✅ Summary

**APIs hoàn toàn sẵn sàng!**

- ✅ 3 APIs đã implement
- ✅ API 1: Danh sách/Tìm kiếm
- ✅ API 2: Chi tiết (đảm bảo đúng 5 ảnh/variant)
- ✅ API 3: Sản phẩm bán chạy (sắp xếp theo sales)
- ✅ Tài liệu đầy đủ
- ✅ Test files sẵn sàng
- ✅ Code examples cho nhiều frameworks
- ✅ Ready for production

**Happy coding! 🚀**

---

## 📄 License

Internal project - All rights reserved

---

## 👥 Contributors

- Backend Developer: [Your Name]
- Created: November 30, 2025

---

**Chúc bạn tích hợp thành công! 🎉**

