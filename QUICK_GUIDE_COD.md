# Quick Guide - COD Order Feature

## 🚀 Cách chạy

### 1. Chạy Migration SQL
Mở SQL Server Management Studio và chạy file:
```
migration_add_cod_columns.sql
```

### 2. Build Project
```bash
mvnw clean install
```

### 3. Start Application
```bash
mvnw spring-boot:run
```

### 4. Test API
Mở file `test-cod-order-api.http` và test các endpoint.

## 📌 Các file quan trọng

| File | Mô tả |
|------|-------|
| `PaymentMethod.java` | Enum cho phương thức thanh toán |
| `CustomerOrder.java` | Model với 3 field mới |
| `OrderDTO.java` | DTOs cho COD order |
| `CustomerOrderService.java` | Method createOrderCOD() |
| `CustomerOrderController.java` | Endpoint POST /api/orders/create-cod |
| `migration_add_cod_columns.sql` | SQL migration script |
| `test-cod-order-api.http` | File test API |
| `COD_ORDER_API_DOCUMENTATION.md` | Documentation đầy đủ |
| `COD_IMPLEMENTATION_SUMMARY.md` | Tóm tắt implementation |

## 🎯 Endpoint chính

```
POST http://localhost:8080/api/orders/create-cod
```

## 📝 Request Body mẫu

```json
{
  "userId": "your-user-id-here",
  "shippingAddress": "123 Nguyen Hue, District 1, HCMC",
  "phone": "0912345678",
  "items": [
    {
      "productDetailsId": "your-product-details-id-here",
      "quantity": 2
    }
  ]
}
```

## ✅ Checklist

- [ ] Chạy migration SQL
- [ ] Build project thành công
- [ ] Start application
- [ ] Test API với valid data
- [ ] Test API với invalid data
- [ ] Kiểm tra database: Orders table có 3 cột mới
- [ ] Kiểm tra kho bị trừ sau khi tạo order
- [ ] Kiểm tra OrderDetails được lưu đúng

## 💡 Tips

- Dùng SQL query sau để lấy userId và productDetailsId:
```sql
SELECT TOP 1 user_id FROM Users WHERE isActive = 1;
SELECT TOP 5 pd_id, p_id, size, amount FROM ProductDetails WHERE amount > 0;
```

- Nếu gặp lỗi validation, check message trong response
- Nếu lỗi stock, kiểm tra amount trong ProductDetails

## 🐛 Common Issues

**Issue 1: User not found**
- Đảm bảo userId tồn tại và user isActive = true

**Issue 2: Product not found**
- Đảm bảo productDetailsId tồn tại và product isActive = true

**Issue 3: Not enough stock**
- Kiểm tra amount trong ProductDetails table

**Issue 4: Invalid phone**
- Phone phải có 10-13 chữ số (không có ký tự đặc biệt)

## 📚 Documentation

Xem chi tiết tại: `COD_ORDER_API_DOCUMENTATION.md`

