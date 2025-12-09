# 🚀 OJT Lambda Functions

AWS Lambda functions for OJT E-commerce API - **Serverless backend thay thế Spring Boot**.

## 📁 Project Structure

```
OJT_lambda/
├── shared/                  # Shared utilities
│   ├── database.js          # RDS Data API client
│   ├── auth.js              # JWT utilities
│   └── response.js          # API response formatters
├── auth/                    # Authentication (4 functions)
│   ├── login.js             # POST /auth/login
│   ├── signup.js            # POST /auth/signup
│   ├── logout.js            # POST /auth/logout
│   └── me.js                # GET /auth/me
├── products/                # Products (12 functions)
│   ├── getProducts.js       # GET /products
│   ├── getProductDetail.js  # GET /products/detail/{id}
│   ├── createProduct.js     # POST /products
│   ├── updateProduct.js     # PUT /products/{id}
│   ├── deleteProduct.js     # DELETE /products/{id}
│   ├── searchProducts.js    # GET /products/search
│   ├── getBestSelling.js    # GET /products/best-selling
│   ├── getNewest.js         # GET /products/newest
│   ├── getProductsByCategory.js  # GET /products/category/{id}
│   ├── getProductsByBrand.js     # GET /products/brand/{id}
│   └── getProductsByPriceRange.js # GET /products/price-range
├── product-details/         # Product Details (7 functions)
│   ├── getAllProductDetails.js      # GET /product-details
│   ├── getProductDetailsById.js     # GET /product-details/{id}
│   ├── getProductDetailsByProductId.js # GET /product-details/product/{id}
│   ├── createProductDetails.js      # POST /product-details
│   ├── updateProductDetails.js      # PUT /product-details/{id}
│   ├── deleteProductDetails.js      # DELETE /product-details/{id}
│   └── uploadProductImages.js       # POST /product-details/{id}/images
├── cart/                    # Cart (6 functions)
│   ├── addToCart.js         # POST /cart
│   ├── getMyCart.js         # GET /cart/me
│   ├── updateCartItem.js    # PUT /cart/{id}
│   ├── removeCartItem.js    # DELETE /cart/{id}
│   ├── clearCart.js         # DELETE /cart
│   └── getCartCount.js      # GET /cart/count
├── orders/                  # Orders (9 functions)
│   ├── createOrder.js       # POST /orders
│   ├── createOrderCOD.js    # POST /orders/create-cod
│   ├── getOrderDetails.js   # GET /orders/{id}/details
│   ├── getUserOrders.js     # GET /orders/user/{userId}
│   ├── getOrdersByUserStatus.js # GET /orders/user/{userId}/status/{status}
│   ├── getAllOrders.js      # GET /orders (Admin)
│   ├── updateOrderStatus.js # PATCH /orders/{id}/status
│   ├── cancelOrder.js       # DELETE /orders/{id}
│   └── getOrdersByDateRange.js # POST /orders/status/date-range
├── categories/              # Categories (6 functions)
│   ├── getCategories.js     # GET /categories
│   ├── getCategoryById.js   # GET /categories/{id}
│   ├── createCategory.js    # POST /categories
│   ├── updateCategory.js    # PUT /categories/{id}
│   ├── deleteCategory.js    # DELETE /categories/{id}
│   └── searchCategories.js  # GET /categories/search
├── brands/                  # Brands (5 functions)
│   ├── getBrands.js         # GET /brands
│   ├── getBrandById.js      # GET /brands/{id}
│   ├── createBrand.js       # POST /brands
│   ├── updateBrand.js       # PUT /brands/{id}
│   └── deleteBrand.js       # DELETE /brands/{id}
├── banners/                 # Banners (7 functions)
│   ├── getBanners.js        # GET /banners
│   ├── getBannerById.js     # GET /banners/{id}
│   ├── createBanner.js      # POST /banners
│   ├── updateBanner.js      # PUT /banners/{id}
│   ├── deleteBanner.js      # DELETE /banners/{id}
│   └── toggleBanner.js      # PATCH /banners/{id}/toggle
├── ratings/                 # Ratings (3 functions)
│   ├── getProductRatings.js # GET /ratings/product/{id}
│   ├── getRatingStats.js    # GET /ratings/product/{id}/stats
│   └── createRating.js      # POST /ratings
├── users/                   # Users (3 functions)
│   ├── getAllUsers.js       # GET /users (Admin)
│   ├── getUserById.js       # GET /users/{id}
│   └── updateProfile.js     # PUT /users/profile/{id}
├── images/                  # Images (1 function)
│   └── uploadImage.js       # POST /images/upload
└── scripts/
    ├── build-lambda.js      # Build ZIP files
    ├── deploy-lambda.js     # Deploy to AWS
    └── clean.js             # Clean build artifacts
```

## 📊 API Summary

| Module | Functions | Endpoints |
|--------|-----------|-----------|
| Auth | 4 | login, signup, logout, me |
| Products | 12 | CRUD + search, filter, best-selling, newest |
| Product Details | 7 | CRUD + images upload |
| Cart | 6 | add, get, update, remove, clear, count |
| Orders | 9 | CRUD + COD, status, date-range |
| Categories | 6 | CRUD + search |
| Brands | 5 | CRUD |
| Banners | 7 | CRUD + toggle |
| Ratings | 3 | get, stats, create |
| Users | 3 | getAll, getById, updateProfile |
| Images | 1 | upload |
| **Total** | **63** | |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your AWS values
```

### 3. Build & Deploy

```bash
npm run build
npm run deploy
```

## 🔧 Development

### Add New Function

1. Create file: `module/functionName.js`
2. Update `scripts/build-lambda.js`
3. Update `scripts/deploy-lambda.js`
4. Build & deploy: `npm run build && npm run deploy`

### Test Locally

```bash
node -e "require('./auth/login.js').handler({body: JSON.stringify({email: 'test@test.com', password: 'test123'})}).then(console.log)"
```

## 🔐 Environment Variables

- `DB_CLUSTER_ARN`: RDS Aurora cluster ARN
- `DB_SECRET_ARN`: Secrets Manager ARN
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT signing key
- `S3_BUCKET_NAME`: S3 bucket for images

## 📖 Related

- [CDK Infrastructure](../OJT_infrastructure/README.md)
- [Frontend](../OJT_frontendDev/README.md)
