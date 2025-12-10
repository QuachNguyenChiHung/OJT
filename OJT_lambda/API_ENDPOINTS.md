# 📋 API Endpoints - Lambda Functions

## 🔐 Auth (4 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| POST | `/auth/login` | login.js | Đăng nhập |
| POST | `/auth/signup` | signup.js | Đăng ký |
| POST | `/auth/logout` | logout.js | Đăng xuất |
| GET | `/auth/me` | me.js | Lấy thông tin user hiện tại |

## 📦 Products (12 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/products` | getProducts.js | Lấy tất cả sản phẩm |
| GET | `/products/detail/{id}` | getProductDetail.js | Chi tiết sản phẩm |
| POST | `/products` | createProduct.js | Tạo sản phẩm (Admin) |
| PUT | `/products/{id}` | updateProduct.js | Cập nhật sản phẩm (Admin) |
| DELETE | `/products/{id}` | deleteProduct.js | Xóa sản phẩm (Admin) |
| GET | `/products/search` | searchProducts.js | Tìm kiếm sản phẩm |
| GET | `/products/best-selling` | getBestSelling.js | Sản phẩm bán chạy |
| GET | `/products/newest` | getNewest.js | Sản phẩm mới nhất |
| GET | `/products/category/{id}` | getProductsByCategory.js | Sản phẩm theo danh mục |
| GET | `/products/brand/{id}` | getProductsByBrand.js | Sản phẩm theo thương hiệu |
| GET | `/products/price-range` | getProductsByPriceRange.js | Sản phẩm theo khoảng giá |
| GET | `/products/list` | searchProducts.js | Danh sách sản phẩm (search) |

## 🎨 Product Details (7 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/product-details` | getAllProductDetails.js | Tất cả product details |
| GET | `/product-details/{id}` | getProductDetailsById.js | Product detail theo ID |
| GET | `/product-details/product/{id}` | getProductDetailsByProductId.js | Product details theo product |
| POST | `/product-details` | createProductDetails.js | Tạo product detail (Admin) |
| PUT | `/product-details/{id}` | updateProductDetails.js | Cập nhật product detail |
| DELETE | `/product-details/{id}` | deleteProductDetails.js | Xóa product detail |
| POST | `/product-details/{id}/images` | uploadProductImages.js | Upload ảnh sản phẩm |

## 🛒 Cart (6 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| POST | `/cart` | addToCart.js | Thêm vào giỏ hàng |
| GET | `/cart/me` | getMyCart.js | Xem giỏ hàng |
| PUT | `/cart/{id}` | updateCartItem.js | Cập nhật số lượng |
| DELETE | `/cart/{id}` | removeCartItem.js | Xóa item khỏi giỏ |
| DELETE | `/cart` | clearCart.js | Xóa toàn bộ giỏ hàng |
| GET | `/cart/count` | getCartCount.js | Đếm số item trong giỏ |

## 📋 Orders (9 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/orders` | getAllOrders.js | Tất cả đơn hàng (Admin) |
| POST | `/orders` | createOrder.js | Tạo đơn hàng |
| POST | `/orders/create-cod` | createOrderCOD.js | Tạo đơn COD |
| GET | `/orders/{id}/details` | getOrderDetails.js | Chi tiết đơn hàng |
| GET | `/orders/user/{userId}` | getUserOrders.js | Đơn hàng của user |
| GET | `/orders/user/{userId}/status/{status}` | getOrdersByUserStatus.js | Đơn hàng theo trạng thái |
| PATCH | `/orders/{id}/status` | updateOrderStatus.js | Cập nhật trạng thái |
| DELETE | `/orders/{id}` | cancelOrder.js | Hủy đơn hàng |
| POST | `/orders/status/date-range` | getOrdersByDateRange.js | Đơn hàng theo ngày |

## 📂 Categories (6 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/categories` | getCategories.js | Tất cả danh mục |
| GET | `/categories/{id}` | getCategoryById.js | Danh mục theo ID |
| POST | `/categories` | createCategory.js | Tạo danh mục (Admin) |
| PUT | `/categories/{id}` | updateCategory.js | Cập nhật danh mục |
| DELETE | `/categories/{id}` | deleteCategory.js | Xóa danh mục |
| GET | `/categories/search` | searchCategories.js | Tìm kiếm danh mục |

## 🏷️ Brands (5 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/brands` | getBrands.js | Tất cả thương hiệu |
| GET | `/brands/{id}` | getBrandById.js | Thương hiệu theo ID |
| POST | `/brands` | createBrand.js | Tạo thương hiệu (Admin) |
| PUT | `/brands/{id}` | updateBrand.js | Cập nhật thương hiệu |
| DELETE | `/brands/{id}` | deleteBrand.js | Xóa thương hiệu |

## 🖼️ Banners (7 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/banners` | getBanners.js | Tất cả banner |
| GET | `/banners?active=true` | getBanners.js | Banner đang active |
| GET | `/banners/{id}` | getBannerById.js | Banner theo ID |
| POST | `/banners` | createBanner.js | Tạo banner (Admin) |
| PUT | `/banners/{id}` | updateBanner.js | Cập nhật banner |
| DELETE | `/banners/{id}` | deleteBanner.js | Xóa banner |
| PATCH | `/banners/{id}/toggle` | toggleBanner.js | Bật/tắt banner |

## ⭐ Ratings (3 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/ratings/product/{id}` | getProductRatings.js | Đánh giá của sản phẩm |
| GET | `/ratings/product/{id}/stats` | getRatingStats.js | Thống kê đánh giá |
| POST | `/ratings` | createRating.js | Tạo đánh giá |

## 👤 Users (3 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/users` | getAllUsers.js | Tất cả users (Admin) |
| GET | `/users/{id}` | getUserById.js | User theo ID |
| PUT | `/users/profile/{id}` | updateProfile.js | Cập nhật profile |

## 🖼️ Images (1 endpoint)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| POST | `/images/upload` | uploadImage.js | Upload ảnh lên S3 |

## 🔔 Notifications (4 endpoints)
| Method | Endpoint | Lambda Function | Description |
|--------|----------|-----------------|-------------|
| GET | `/notifications` | orders/index.js | Lấy danh sách thông báo |
| GET | `/notifications/unread-count` | orders/index.js | Đếm số thông báo chưa đọc |
| PUT | `/notifications/{id}/read` | orders/index.js | Đánh dấu đã đọc 1 thông báo |
| PUT | `/notifications/read-all` | orders/index.js | Đánh dấu tất cả đã đọc |

---

## 📊 Tổng kết

| Module | Số endpoints |
|--------|-------------|
| Auth | 4 |
| Products | 12 |
| Product Details | 7 |
| Cart | 6 |
| Orders | 9 |
| Categories | 6 |
| Brands | 5 |
| Banners | 7 |
| Ratings | 3 |
| Users | 3 |
| Images | 1 |
| **Tổng** | **63** |

## 🔒 Authentication

Các endpoint yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

## 🛡️ Admin Only Endpoints

- `POST/PUT/DELETE /products/*`
- `POST/PUT/DELETE /categories/*`
- `POST/PUT/DELETE /brands/*`
- `POST/PUT/DELETE /banners/*`
- `GET /users`
- `GET /orders` (all orders)
- `PATCH /orders/{id}/status`
