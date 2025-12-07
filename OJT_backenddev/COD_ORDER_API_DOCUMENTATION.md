# COD Order API Documentation

## Tổng quan
API này cho phép tạo đơn hàng COD (Cash on Delivery - Thanh toán khi nhận hàng) trong hệ thống.

## Endpoint

### Create COD Order
**POST** `/api/orders/create-cod`

Tạo đơn hàng mới với phương thức thanh toán COD.

## Request

### Headers
```
Content-Type: application/json
```

### Request Body

```json
{
  "userId": "UUID",
  "shippingAddress": "string",
  "phone": "string",
  "items": [
    {
      "productDetailsId": "UUID",
      "quantity": number
    }
  ]
}
```

### Request Body Schema

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| userId | UUID | Yes | Must be valid user ID | ID của người dùng đặt hàng |
| shippingAddress | String | Yes | Not null | Địa chỉ giao hàng |
| phone | String | Yes | Pattern: `^[0-9]{10,13}$` | Số điện thoại (10-13 chữ số) |
| items | Array | Yes | Not empty | Danh sách sản phẩm đặt hàng |
| items[].productDetailsId | UUID | Yes | Must exist | ID chi tiết sản phẩm |
| items[].quantity | Integer | Yes | Min: 1 | Số lượng sản phẩm |

## Response

### Success Response (201 Created)

```json
{
  "orderId": "UUID",
  "status": "PENDING",
  "totalPrice": 1500000.00,
  "paymentMethod": "COD",
  "message": "Order created successfully. Please prepare cash for delivery."
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| orderId | UUID | ID của đơn hàng vừa tạo |
| status | String | Trạng thái đơn hàng (PENDING) |
| totalPrice | BigDecimal | Tổng giá trị đơn hàng |
| paymentMethod | String | Phương thức thanh toán (COD) |
| message | String | Thông báo cho khách hàng |

## Business Logic

### 1. Validate User
- Kiểm tra user có tồn tại không
- Kiểm tra user có active không

### 2. Validate Products and Stock
- Kiểm tra từng sản phẩm có tồn tại không
- Kiểm tra sản phẩm có active không
- Kiểm tra số lượng > 0
- Kiểm tra tồn kho đủ không

### 3. Calculate Total Price
- Tính tổng tiền = Σ(giá sản phẩm × số lượng)

### 4. Reduce Stock (Trừ kho)
- Trừ số lượng trong kho
- Cập nhật trạng thái inStock nếu hết hàng

### 5. Create Order
- Tạo CustomerOrder với:
  - status = PENDING
  - paymentMethod = COD
  - shippingAddress
  - phone
  - totalPrice

### 6. Save OrderDetails
- Lưu chi tiết từng sản phẩm trong đơn hàng

### 7. Return Response
- Trả về thông tin đơn hàng đã tạo

## Error Cases

### 400 Bad Request

#### Validation Errors

**Invalid Phone Format**
```json
{
  "error": "Validation failed",
  "message": "Phone number must be 10-13 digits"
}
```

**Empty Items**
```json
{
  "error": "Order must contain at least one item"
}
```

**Invalid Quantity**
```json
{
  "error": "Quantity must be greater than 0 for product: [Product Name]"
}
```

### 404 Not Found

**User Not Found**
```json
{
  "error": "User not found with id: [userId]"
}
```

**Product Not Found**
```json
{
  "error": "Product details not found with id: [productDetailsId]"
}
```

### 400 Bad Request - Business Logic Errors

**User Not Active**
```json
{
  "error": "User is not active"
}
```

**Product Not Active**
```json
{
  "error": "Product is not active: [Product Name]"
}
```

**Insufficient Stock**
```json
{
  "error": "Not enough stock for product '[Product Name]' (Size: M). Requested: 5, Available: 2"
}
```

## Example Usage

### Successful Request

```http
POST http://localhost:8080/api/orders/create-cod
Content-Type: application/json

{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shippingAddress": "123 Nguyen Hue, District 1, Ho Chi Minh City",
  "phone": "0912345678",
  "items": [
    {
      "productDetailsId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "quantity": 2
    },
    {
      "productDetailsId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "quantity": 1
    }
  ]
}
```

### Successful Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/d4e5f6a7-b8c9-0123-def1-234567890123

{
  "orderId": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "status": "PENDING",
  "totalPrice": 1500000.00,
  "paymentMethod": "COD",
  "message": "Order created successfully. Please prepare cash for delivery."
}
```

## Order Status Flow

```
PENDING → PROCESSING → SHIPPING → DELIVERED
    ↓
CANCELLED
```

## Notes

- Đơn hàng COD được tạo với trạng thái **PENDING**
- Kho hàng được trừ ngay khi tạo đơn
- Nếu hết hàng, trường `inStock` sẽ được cập nhật thành `false`
- Khách hàng cần chuẩn bị tiền mặt khi nhận hàng
- Đơn hàng chỉ có thể hủy khi ở trạng thái **PENDING**

## Related Endpoints

- `GET /api/orders/{orderId}` - Lấy thông tin đơn hàng
- `GET /api/orders/{orderId}/details` - Lấy chi tiết sản phẩm trong đơn
- `PATCH /api/orders/{orderId}/status` - Cập nhật trạng thái đơn hàng
- `DELETE /api/orders/{orderId}` - Hủy đơn hàng
- `GET /api/orders/user/{userId}` - Lấy tất cả đơn hàng của user

## Database Changes

Xem file `migration_add_cod_columns.sql` để biết chi tiết về các thay đổi cơ sở dữ liệu.

Các cột mới được thêm vào bảng `Orders`:
- `payment_method` (NVARCHAR(50))
- `shipping_address` (NVARCHAR(500))
- `phone` (NVARCHAR(20))

