# API Tìm kiếm / Danh sách Sản phẩm

## Tổng quan
API này cho phép người dùng tìm kiếm hoặc xem danh sách sản phẩm với thông tin cơ bản bao gồm tên, giá và ảnh đại diện.

## Endpoint

### GET /api/products/list

**Mô tả:** Lấy danh sách sản phẩm hoặc tìm kiếm sản phẩm theo tên

**URL:** `http://localhost:8080/api/products/list`

**Method:** GET

**Query Parameters:**
- `search` (optional): Từ khóa tìm kiếm theo tên sản phẩm. Nếu không có, API sẽ trả về tất cả sản phẩm.

**Headers:**
- `Authorization` (optional): Bearer token để xác thực người dùng
  - Nếu không có token hoặc là user thường: Chỉ hiển thị sản phẩm có `isActive = true`
  - Nếu là ADMIN: Hiển thị tất cả sản phẩm

## Response Format

### Success Response (200 OK)

**Response Body:** Array of ProductSearchResponse

```json
[
  {
    "id": "uuid-string",
    "name": "Tên sản phẩm",
    "price": 1000000.00,
    "imageUrl": "https://example.com/image.jpg"
  },
  {
    "id": "uuid-string",
    "name": "Sản phẩm khác",
    "price": 500000.00,
    "imageUrl": "https://example.com/image2.jpg"
  }
]
```

### Response Fields
- `id` (UUID): ID duy nhất của sản phẩm
- `name` (String): Tên sản phẩm
- `price` (BigDecimal): Giá sản phẩm
- `imageUrl` (String): URL ảnh đại diện của sản phẩm (lấy từ ProductDetails, ảnh đầu tiên)

## Ví dụ sử dụng

### 1. Lấy tất cả sản phẩm

**Request:**
```
GET http://localhost:8080/api/products/list
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Áo thun nam",
    "price": 299000.00,
    "imageUrl": "https://example.com/ao-thun-nam.jpg"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "name": "Quần jean nữ",
    "price": 599000.00,
    "imageUrl": "https://example.com/quan-jean-nu.jpg"
  }
]
```

### 2. Tìm kiếm sản phẩm theo tên

**Request:**
```
GET http://localhost:8080/api/products/list?search=áo
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Áo thun nam",
    "price": 299000.00,
    "imageUrl": "https://example.com/ao-thun-nam.jpg"
  },
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "name": "Áo sơ mi",
    "price": 399000.00,
    "imageUrl": "https://example.com/ao-so-mi.jpg"
  }
]
```

### 3. Tìm kiếm với Authentication (Admin)

**Request:**
```
GET http://localhost:8080/api/products/list?search=áo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** Trả về tất cả sản phẩm (kể cả isActive = false) phù hợp với từ khóa tìm kiếm

## Cách hoạt động

1. **Authentication Check:**
   - API kiểm tra token để xác định user là Admin hay không
   - Nếu không có token hoặc user thường: chỉ hiển thị sản phẩm active
   - Nếu là Admin: hiển thị tất cả sản phẩm

2. **Search Logic:**
   - Nếu có tham số `search`: Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
   - Nếu không có tham số `search`: Trả về tất cả sản phẩm

3. **Image URL Logic:**
   - Lấy ảnh đầu tiên từ ProductDetails của sản phẩm
   - Nếu `imgList` chứa nhiều ảnh (phân cách bởi dấu phẩy, chấm phẩy hoặc dấu pipe), sẽ lấy ảnh đầu tiên
   - Nếu không có ảnh: trả về `null`

## Thay đổi Code

### 1. ProductDTO.java
Thêm class mới `ProductSearchResponse`:
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public static class ProductSearchResponse {
    private UUID id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
}
```

### 2. ProductService.java
Thêm method `getRepresentativeImageUrl()`:
```java
public String getRepresentativeImageUrl(UUID productId) {
    List<ProductDetails> productDetails = productDetailsRepository.findByProductPId(productId);
    if (productDetails != null && !productDetails.isEmpty()) {
        for (ProductDetails pd : productDetails) {
            if (pd.getImgList() != null && !pd.getImgList().trim().isEmpty()) {
                String imgList = pd.getImgList().trim();
                String[] images = imgList.split("[,;|]");
                if (images.length > 0 && !images[0].trim().isEmpty()) {
                    return images[0].trim();
                }
            }
        }
    }
    return null;
}
```

### 3. ProductController.java
Thêm endpoint và helper method:
```java
@GetMapping("/list")
public List<ProductDTO.ProductSearchResponse> listProducts(
        @RequestParam(required = false) String search,
        Authentication authentication) {
    boolean isAdmin = isAdmin(authentication);
    
    List<Product> products;
    if (search != null && !search.trim().isEmpty()) {
        products = productService.findByNameContainingForUser(search, isAdmin);
    } else {
        products = productService.findAllForUser(isAdmin);
    }
    
    return products.stream()
        .map(this::convertToSearchDTO)
        .collect(Collectors.toList());
}

private ProductDTO.ProductSearchResponse convertToSearchDTO(Product product) {
    String imageUrl = productService.getRepresentativeImageUrl(product.getPId());
    
    return new ProductDTO.ProductSearchResponse(
        product.getPId(),
        product.getPName(),
        product.getPrice(),
        imageUrl
    );
}
```

## Testing

### Sử dụng Postman hoặc curl:

```bash
# Lấy tất cả sản phẩm
curl -X GET http://localhost:8080/api/products/list

# Tìm kiếm sản phẩm
curl -X GET "http://localhost:8080/api/products/list?search=áo"

# Với authentication
curl -X GET http://localhost:8080/api/products/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- API này tự động filter sản phẩm theo trạng thái `isActive` dựa trên quyền của user
- Image URL được lấy từ bảng ProductDetails, ảnh đầu tiên trong danh sách
- API hỗ trợ tìm kiếm không phân biệt hoa thường (case-insensitive)
- Tham số `search` là optional, không bắt buộc phải có

