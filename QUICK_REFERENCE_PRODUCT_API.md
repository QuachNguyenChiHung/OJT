# 🚀 Quick Reference - API Sản phẩm

## Endpoint mới: GET /api/products/list

### URL đầy đủ
```
http://localhost:8080/api/products/list
```

---

## 📋 Các trường hợp sử dụng

### 1️⃣ Lấy TẤT CẢ sản phẩm
```bash
GET /api/products/list
```

### 2️⃣ TÌM KIẾM sản phẩm theo tên
```bash
GET /api/products/list?search=áo
```

### 3️⃣ Với QUYỀN ADMIN (cần token)
```bash
GET /api/products/list?search=áo
Header: Authorization: Bearer <JWT_TOKEN>
```

---

## 📤 Response (Kết quả trả về)

```json
[
  {
    "id": "uuid",
    "name": "Tên sản phẩm",
    "price": 299000.00,
    "imageUrl": "https://..."
  }
]
```

### Giải thích các trường:
- **id**: ID duy nhất của sản phẩm (UUID)
- **name**: Tên sản phẩm (String)
- **price**: Giá sản phẩm (Number, 2 chữ số thập phân)
- **imageUrl**: Link ảnh đại diện (String, có thể null nếu không có ảnh)

---

## 🔒 Phân quyền

| Người dùng | Xem được gì? |
|-----------|--------------|
| **Không đăng nhập** | Chỉ sản phẩm ACTIVE (isActive = true) |
| **User thường** | Chỉ sản phẩm ACTIVE (isActive = true) |
| **Admin** | TẤT CẢ sản phẩm (kể cả inactive) |

---

## 🎯 Ví dụ thực tế

### Với Postman:
1. Tạo request mới
2. Method: **GET**
3. URL: `http://localhost:8080/api/products/list`
4. Params (optional): `search` = `áo`
5. Click **Send**

### Với JavaScript/Fetch:
```javascript
// Lấy tất cả sản phẩm
fetch('http://localhost:8080/api/products/list')
  .then(response => response.json())
  .then(data => console.log(data));

// Tìm kiếm
fetch('http://localhost:8080/api/products/list?search=áo')
  .then(response => response.json())
  .then(data => console.log(data));

// Với token
fetch('http://localhost:8080/api/products/list', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Với React:
```javascript
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('http://localhost:8080/api/products/list')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);

// Hiển thị
products.map(product => (
  <div key={product.id}>
    <img src={product.imageUrl} alt={product.name} />
    <h3>{product.name}</h3>
    <p>{product.price.toLocaleString('vi-VN')} ₫</p>
  </div>
))
```

---

## ⚠️ Lưu ý quan trọng

1. ✅ **search** là optional (không bắt buộc)
2. ✅ Tìm kiếm **KHÔNG phân biệt** hoa thường
3. ✅ Tìm kiếm tìm trong **TÊN** sản phẩm
4. ✅ imageUrl có thể là **null** nếu sản phẩm chưa có ảnh
5. ✅ Giá luôn có **2 chữ số** thập phân

---

## 📞 Liên hệ / Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- ✓ Server đã chạy chưa? (port 8080)
- ✓ Database có dữ liệu chưa?
- ✓ URL có đúng không?
- ✓ CORS có cho phép không? (đã set `@CrossOrigin(origins = "*")`)

---

## 📚 Files liên quan

- `PRODUCT_SEARCH_API_SUMMARY.md` - Tóm tắt triển khai
- `PRODUCT_SEARCH_API_DOCUMENTATION.md` - Tài liệu chi tiết
- `test-product-search-api.http` - File test HTTP

