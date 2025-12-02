# 🚀 Quick Reference - API Chi tiết Sản phẩm

## Endpoint

```
GET /api/products/detail/{id}
```

### URL đầy đủ
```
http://localhost:8080/api/products/detail/{product-id}
```

---

## 📋 Request

### Path Parameter:
- **id** (UUID, required) - ID của sản phẩm

### Example:
```bash
GET http://localhost:8080/api/products/detail/123e4567-e89b-12d3-a456-426614174000
```

---

## 📤 Response

```json
{
  "id": "uuid",
  "name": "Tên sản phẩm",
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

---

## ⭐ Đặc điểm quan trọng

### 🎯 Mỗi variant có **ĐÚNG 5 HÌNH ẢNH**

| Trường hợp | Xử lý |
|------------|-------|
| DB có 2 ảnh | 2 real + 3 placeholder |
| DB có 5 ảnh | Giữ nguyên 5 ảnh |
| DB có 8 ảnh | Lấy 5 ảnh đầu |
| DB không có ảnh | 5 placeholder |

**Placeholder:** `https://via.placeholder.com/500x500?text=No+Image`

---

## 💻 Code Examples

### JavaScript/Fetch
```javascript
fetch(`http://localhost:8080/api/products/detail/${productId}`)
  .then(res => res.json())
  .then(product => {
    console.log(product.name);
    console.log(product.price);
    
    product.productDetails.forEach(variant => {
      console.log(variant.colorName);
      // variant.images LUÔN có 5 items
      variant.images.forEach(img => console.log(img));
    });
  });
```

### React
```jsx
const [product, setProduct] = useState(null);

useEffect(() => {
  fetch(`/api/products/detail/${id}`)
    .then(res => res.json())
    .then(data => setProduct(data));
}, [id]);

// Render
<div>
  <h1>{product?.name}</h1>
  <p>{product?.price} ₫</p>
  
  {product?.productDetails.map(v => (
    <div key={v.pdId}>
      <h3>{v.colorName} - {v.size}</h3>
      {v.images.map((img, i) => (
        <img key={i} src={img} alt={`Image ${i+1}`} />
      ))}
    </div>
  ))}
</div>
```

### Vue
```vue
<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ product.price }} ₫</p>
    
    <div v-for="v in product.productDetails" :key="v.pdId">
      <h3>{{ v.colorName }}</h3>
      <img v-for="(img, i) in v.images" 
           :key="i" 
           :src="img">
    </div>
  </div>
</template>
```

### Axios
```javascript
axios.get(`/api/products/detail/${productId}`)
  .then(response => {
    const product = response.data;
    // product.productDetails[0].images.length === 5
  });
```

---

## 🎨 Frontend Use Cases

### 1. Image Gallery
```javascript
// Mỗi variant có 5 ảnh cho gallery
const variant = product.productDetails[0];
const mainImage = variant.images[0];
const thumbnails = variant.images.slice(1, 5);
```

### 2. Color Selector
```javascript
// Hiển thị các màu có sẵn
product.productDetails.map(v => ({
  name: v.colorName,
  code: v.colorCode,
  images: v.images // 5 ảnh cho màu này
}))
```

### 3. Stock Display
```javascript
// Kiểm tra tồn kho
const variant = product.productDetails.find(v => v.colorName === 'Đỏ');
console.log(`Còn ${variant.amount} sản phẩm`);
console.log(variant.inStock ? 'Còn hàng' : 'Hết hàng');
```

---

## 🧪 Testing

### Postman
```
1. Method: GET
2. URL: http://localhost:8080/api/products/detail/{id}
3. Send
4. Check: mỗi variant có đúng 5 images
```

### cURL
```bash
curl http://localhost:8080/api/products/detail/YOUR_PRODUCT_ID
```

### Browser
```
http://localhost:8080/api/products/detail/YOUR_PRODUCT_ID
```

---

## 📊 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | ID sản phẩm |
| name | String | Tên sản phẩm |
| price | BigDecimal | Giá sản phẩm |
| productDetails | Array | Danh sách variants |

### ProductDetailVariant:

| Field | Type | Description |
|-------|------|-------------|
| pdId | UUID | ID variant |
| colorName | String | Tên màu |
| colorCode | String | Mã màu hex |
| size | String | Size (S/M/L/XL) |
| amount | Integer | Số lượng tồn |
| inStock | Boolean | Còn hàng? |
| **images** | **Array[5]** | **5 hình ảnh** |

---

## ⚠️ Lưu ý

✅ **images LUÔN có 5 items**  
✅ Tự động thêm placeholder nếu thiếu  
✅ Tự động cắt nếu thừa  
✅ colorName/colorCode có thể null  
✅ Không cần authentication  

---

## 🔗 API liên quan

| API | Endpoint | Use case |
|-----|----------|----------|
| **Danh sách SP** | `/api/products/list` | Xem nhiều sản phẩm |
| **Chi tiết SP** | `/api/products/detail/{id}` | Xem 1 sản phẩm |
| **Tìm kiếm** | `/api/products/list?search=...` | Tìm sản phẩm |

---

## 📖 Tài liệu đầy đủ

- `PRODUCT_DETAIL_API_DOCUMENTATION.md` - Chi tiết
- `PRODUCT_DETAIL_API_SUMMARY.md` - Tóm tắt
- `test-product-detail-api.http` - Test file

---

## ✅ Checklist Frontend

Khi tích hợp API này, đảm bảo:

- [ ] Handle loading state
- [ ] Handle error (404, 500)
- [ ] Display 5 images per variant
- [ ] Show color options
- [ ] Display stock info
- [ ] Format price (VNĐ)
- [ ] Image gallery/carousel
- [ ] Mobile responsive
- [ ] Lazy load images (optional)

---

## 🎯 Common Patterns

### Pattern 1: Single Variant Display
```javascript
// Hiển thị variant đầu tiên
const mainVariant = product.productDetails[0];
```

### Pattern 2: Color Switching
```javascript
const [selectedColor, setSelectedColor] = useState(0);
const currentVariant = product.productDetails[selectedColor];
// currentVariant.images có 5 ảnh
```

### Pattern 3: Image Carousel
```javascript
const [currentImage, setCurrentImage] = useState(0);
const variant = product.productDetails[0];
const displayImage = variant.images[currentImage];
// Có thể next/prev trong 5 ảnh
```

---

## 🚀 Bắt đầu ngay!

```bash
# 1. Lấy product ID từ API list
curl http://localhost:8080/api/products/list

# 2. Lấy chi tiết sản phẩm
curl http://localhost:8080/api/products/detail/{id-from-step-1}

# 3. Kiểm tra response có 5 ảnh/variant
```

**Done! API sẵn sàng để tích hợp! 🎉**

