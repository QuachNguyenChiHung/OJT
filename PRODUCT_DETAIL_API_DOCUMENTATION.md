# API Chi tiết Sản phẩm - Product Detail API

## Tổng quan
API này trả về thông tin chi tiết của một sản phẩm cụ thể, bao gồm tên, giá và danh sách các biến thể (product details) theo màu sắc. **Mỗi biến thể luôn trả về chính xác 5 hình ảnh.**

## Endpoint

### GET /api/products/detail/{id}

**Mô tả:** Lấy chi tiết sản phẩm theo ID

**URL:** `http://localhost:8080/api/products/detail/{id}`

**Method:** GET

**Path Parameters:**
- `id` (required, UUID): ID của sản phẩm cần lấy chi tiết

**Headers:**
- Không cần authentication (public endpoint)

---

## Response Format

### Success Response (200 OK)

**Response Body:** ProductDetailResponse

```json
{
  "id": "uuid-string",
  "name": "Tên sản phẩm",
  "price": 1000000.00,
  "productDetails": [
    {
      "pdId": "uuid-string",
      "colorName": "Đỏ",
      "colorCode": "#FF0000",
      "size": "M",
      "amount": 100,
      "inStock": true,
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg",
        "https://example.com/image4.jpg",
        "https://example.com/image5.jpg"
      ]
    },
    {
      "pdId": "uuid-string",
      "colorName": "Xanh",
      "colorCode": "#0000FF",
      "size": "L",
      "amount": 50,
      "inStock": true,
      "images": [
        "https://example.com/blue1.jpg",
        "https://example.com/blue2.jpg",
        "https://example.com/blue3.jpg",
        "https://example.com/blue4.jpg",
        "https://example.com/blue5.jpg"
      ]
    }
  ]
}
```

### Response Fields

#### ProductDetailResponse
- `id` (UUID): ID duy nhất của sản phẩm
- `name` (String): Tên sản phẩm
- `price` (BigDecimal): Giá sản phẩm
- `productDetails` (Array): Danh sách các biến thể sản phẩm

#### ProductDetailVariant (trong productDetails)
- `pdId` (UUID): ID của product detail
- `colorName` (String): Tên màu sắc (có thể null)
- `colorCode` (String): Mã màu hex (có thể null)
- `size` (String): Kích thước (S, M, L, XL, etc.)
- `amount` (Integer): Số lượng còn trong kho
- `inStock` (Boolean): Trạng thái còn hàng
- `images` (Array[String]): **Luôn có đúng 5 hình ảnh**

---

## Ràng buộc quan trọng: 5 Hình ảnh

### ⚠️ Quy tắc xử lý hình ảnh

API đảm bảo mỗi product detail **luôn trả về đúng 5 hình ảnh**:

#### Trường hợp 1: Có đủ hoặc nhiều hơn 5 ảnh
- Lấy 5 ảnh đầu tiên
- Bỏ qua các ảnh thừa

#### Trường hợp 2: Có ít hơn 5 ảnh
- Lấy tất cả ảnh có sẵn
- Thêm ảnh placeholder để đủ 5 ảnh
- Placeholder: `https://via.placeholder.com/500x500?text=No+Image`

#### Trường hợp 3: Không có ảnh nào
- Trả về 5 ảnh placeholder

### Ví dụ:

```javascript
// Database có 2 ảnh
imgList = "img1.jpg,img2.jpg"

// API trả về 5 ảnh (2 real + 3 placeholder)
images: [
  "img1.jpg",
  "img2.jpg",
  "https://via.placeholder.com/500x500?text=No+Image",
  "https://via.placeholder.com/500x500?text=No+Image",
  "https://via.placeholder.com/500x500?text=No+Image"
]
```

```javascript
// Database có 7 ảnh
imgList = "img1.jpg,img2.jpg,img3.jpg,img4.jpg,img5.jpg,img6.jpg,img7.jpg"

// API trả về 5 ảnh đầu tiên
images: [
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg"
]
```

---

## Ví dụ sử dụng

### 1. Lấy chi tiết sản phẩm

**Request:**
```
GET http://localhost:8080/api/products/detail/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Áo thun nam cao cấp",
  "price": 299000.00,
  "productDetails": [
    {
      "pdId": "aaa-111",
      "colorName": "Trắng",
      "colorCode": "#FFFFFF",
      "size": "M",
      "amount": 50,
      "inStock": true,
      "images": [
        "https://cdn.example.com/ao-trang-1.jpg",
        "https://cdn.example.com/ao-trang-2.jpg",
        "https://cdn.example.com/ao-trang-3.jpg",
        "https://cdn.example.com/ao-trang-4.jpg",
        "https://cdn.example.com/ao-trang-5.jpg"
      ]
    },
    {
      "pdId": "bbb-222",
      "colorName": "Đen",
      "colorCode": "#000000",
      "size": "L",
      "amount": 30,
      "inStock": true,
      "images": [
        "https://cdn.example.com/ao-den-1.jpg",
        "https://cdn.example.com/ao-den-2.jpg",
        "https://via.placeholder.com/500x500?text=No+Image",
        "https://via.placeholder.com/500x500?text=No+Image",
        "https://via.placeholder.com/500x500?text=No+Image"
      ]
    }
  ]
}
```

### 2. Sản phẩm không tồn tại

**Request:**
```
GET http://localhost:8080/api/products/detail/invalid-uuid
```

**Response:**
```
Status: 500 Internal Server Error
{
  "error": "Product not found with id: invalid-uuid"
}
```

---

## Cách hoạt động

### Flow xử lý:

1. **Nhận request** với product ID
2. **Tìm sản phẩm** trong database
3. **Lấy tất cả product details** của sản phẩm
4. **Với mỗi product detail:**
   - Lấy danh sách ảnh từ `imgList`
   - Parse ảnh (phân tách bởi dấu phẩy, chấm phẩy, hoặc pipe)
   - Nếu < 5 ảnh: thêm placeholder
   - Nếu > 5 ảnh: cắt còn 5 ảnh
   - Nếu = 5 ảnh: giữ nguyên
5. **Trả về JSON** với đầy đủ thông tin

### Parse Image Logic:

```java
// Hỗ trợ nhiều định dạng phân cách:
"img1.jpg,img2.jpg,img3.jpg"           // dấu phẩy
"img1.jpg;img2.jpg;img3.jpg"           // dấu chấm phẩy
"img1.jpg|img2.jpg|img3.jpg"           // dấu pipe
"img1.jpg, img2.jpg , img3.jpg"        // có khoảng trắng (tự động trim)
```

---

## Thay đổi Code

### 1. ProductDTO.java

Thêm 2 classes mới:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public static class ProductDetailResponse {
    private UUID id;
    private String name;
    private BigDecimal price;
    private List<ProductDetailVariant> productDetails;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public static class ProductDetailVariant {
    private UUID pdId;
    private String colorName;
    private String colorCode;
    private String size;
    private Integer amount;
    private Boolean inStock;
    private List<String> images; // Exactly 5 images
}
```

### 2. ProductService.java

Thêm method `getExactlyFiveImages()`:

```java
public List<String> getExactlyFiveImages(String imgList) {
    List<String> images = new ArrayList<>();
    
    // Parse the image list
    if (imgList != null && !imgList.trim().isEmpty()) {
        String[] imageArray = imgList.trim().split("[,;|]");
        for (String img : imageArray) {
            String trimmed = img.trim();
            if (!trimmed.isEmpty()) {
                images.add(trimmed);
            }
        }
    }
    
    // Ensure exactly 5 images
    while (images.size() < 5) {
        images.add("https://via.placeholder.com/500x500?text=No+Image");
    }
    
    // Trim to exactly 5 if more than 5
    if (images.size() > 5) {
        images = images.subList(0, 5);
    }
    
    return images;
}
```

### 3. ProductController.java

Thêm endpoint và helper method:

```java
@GetMapping("/detail/{id}")
public ProductDTO.ProductDetailResponse getProductDetail(@PathVariable UUID id) {
    Product product = productService.findById(id);
    return convertToDetailDTO(product);
}

private ProductDTO.ProductDetailResponse convertToDetailDTO(Product product) {
    List<ProductDTO.ProductDetailVariant> variants = product.getProductDetails().stream()
        .map(pd -> {
            List<String> images = productService.getExactlyFiveImages(pd.getImgList());
            
            return new ProductDTO.ProductDetailVariant(
                pd.getPdId(),
                pd.getColor() != null ? pd.getColor().getColorName() : null,
                pd.getColor() != null ? pd.getColor().getColorCode() : null,
                pd.getSize(),
                pd.getAmount(),
                pd.getInStock(),
                images
            );
        })
        .collect(Collectors.toList());
    
    return new ProductDTO.ProductDetailResponse(
        product.getPId(),
        product.getPName(),
        product.getPrice(),
        variants
    );
}
```

---

## Testing

### Sử dụng Postman:

1. Method: **GET**
2. URL: `http://localhost:8080/api/products/detail/{product-id}`
3. Replace `{product-id}` với UUID thực tế
4. Click **Send**

### Sử dụng curl:

```bash
curl -X GET http://localhost:8080/api/products/detail/123e4567-e89b-12d3-a456-426614174000
```

### Sử dụng JavaScript/Fetch:

```javascript
const productId = '123e4567-e89b-12d3-a456-426614174000';

fetch(`http://localhost:8080/api/products/detail/${productId}`)
  .then(response => response.json())
  .then(data => {
    console.log('Product:', data.name);
    console.log('Price:', data.price);
    
    data.productDetails.forEach(variant => {
      console.log(`Color: ${variant.colorName}`);
      console.log(`Size: ${variant.size}`);
      console.log(`Images (${variant.images.length}):`, variant.images);
    });
  });
```

### Frontend Display Example (React):

```jsx
function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/detail/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);
  
  if (!product) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p className="price">{product.price.toLocaleString('vi-VN')} ₫</p>
      
      {product.productDetails.map(variant => (
        <div key={variant.pdId} className="variant">
          <h3>
            {variant.colorName} - {variant.size}
          </h3>
          <p>Còn {variant.amount} sản phẩm</p>
          
          <div className="images">
            {variant.images.map((img, index) => (
              <img key={index} src={img} alt={`${product.name} - ${index + 1}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Use Cases

### Case 1: E-commerce Product Page
Khi user click vào sản phẩm từ danh sách, hiển thị:
- Tên và giá sản phẩm
- Các màu sắc có sẵn
- Image gallery với 5 ảnh cho mỗi màu
- Thông tin tồn kho

### Case 2: Product Comparison
So sánh các biến thể:
- Xem ảnh của từng màu
- So sánh số lượng tồn kho
- Chọn size phù hợp

### Case 3: Mobile App
- Swipe qua 5 ảnh của mỗi màu
- Xem chi tiết từng biến thể
- Thêm vào giỏ hàng

---

## Notes

- ✅ **Luôn trả về đúng 5 ảnh** cho mỗi product detail
- ✅ Placeholder image tự động thêm nếu thiếu
- ✅ Hỗ trợ nhiều định dạng phân cách ảnh (`,` `;` `|`)
- ✅ Tự động trim khoảng trắng
- ✅ Trả về null cho colorName/colorCode nếu không có màu
- ⚠️ Không có pagination (trả về tất cả product details)
- ⚠️ Không filter theo isActive (trả về tất cả variants)

---

## Error Handling

### Product không tồn tại:
```json
Status: 500
{
  "error": "Product not found with id: xxx"
}
```

### Invalid UUID format:
```json
Status: 400
{
  "error": "Invalid UUID string: xxx"
}
```

---

## Performance Considerations

- Database query: 1 query cho product + eager/lazy load productDetails
- Image processing: O(n) với n = số lượng product details
- Memory: Mỗi product detail thêm tối đa 5 strings cho images

---

## Future Improvements

- [ ] Thêm pagination cho product details
- [ ] Thêm filter theo color
- [ ] Thêm sort theo size
- [ ] Cache kết quả
- [ ] Optimize image loading (lazy load)
- [ ] CDN integration cho images
- [ ] Image compression/resize suggestions

