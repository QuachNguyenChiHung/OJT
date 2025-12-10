// Products Module Router - handles all /products/* endpoints
const getProducts = require('./getProducts');
const getProductDetail = require('./getProductDetail');
const createProduct = require('./createProduct');
const updateProduct = require('./updateProduct');
const deleteProduct = require('./deleteProduct');
const searchProducts = require('./searchProducts');
const getBestSelling = require('./getBestSelling');
const getNewest = require('./getNewest');
const getFeatured = require('./getFeatured');
const setFeatured = require('./setFeatured');
const getProductsByCategory = require('./getProductsByCategory');
const getProductsByBrand = require('./getProductsByBrand');
const getProductsByPriceRange = require('./getProductsByPriceRange');
const uploadThumbnails = require('./uploadThumbnails');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[ProductsModule] ${method} ${path}`, { pathParams });

  // GET /products
  if (path === '/products' && method === 'GET') {
    return getProducts.handler(event);
  }
  // POST /products (Admin)
  if (path === '/products' && method === 'POST') {
    return createProduct.handler(event);
  }
  
  // Specific routes MUST come before generic /{id} routes
  // GET /products/search
  if (path.endsWith('/search') && method === 'GET') {
    return searchProducts.handler(event);
  }
  // GET /products/list
  if (path.endsWith('/list') && method === 'GET') {
    return searchProducts.handler(event);
  }
  // GET /products/best-selling
  if (path.endsWith('/best-selling') && method === 'GET') {
    return getBestSelling.handler(event);
  }
  // GET /products/newest
  if (path.endsWith('/newest') && method === 'GET') {
    return getNewest.handler(event);
  }
  // GET /products/featured
  if (path.endsWith('/featured') && method === 'GET') {
    return getFeatured.handler(event);
  }
  // POST /products/{id}/featured - Set featured status
  if (path.match(/\/products\/[^\/]+\/featured$/) && method === 'POST') {
    const match = path.match(/\/products\/([^\/]+)\/featured$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return setFeatured.handler(event);
  }
  // POST /products/{id}/thumbnails - Upload thumbnails
  if (path.match(/\/products\/[^\/]+\/thumbnails$/) && method === 'POST') {
    const match = path.match(/\/products\/([^\/]+)\/thumbnails$/);
    if (match) event.pathParameters = { ...pathParams, id: match[1] };
    return uploadThumbnails.handler(event);
  }
  // GET /products/price-range
  if (path.endsWith('/price-range') && method === 'GET') {
    return getProductsByPriceRange.handler(event);
  }
  // GET /products/category/{categoryId}
  if (path.includes('/products/category/') && method === 'GET') {
    return getProductsByCategory.handler(event);
  }
  // GET /products/brand/{brandId}
  if (path.includes('/products/brand/') && method === 'GET') {
    return getProductsByBrand.handler(event);
  }
  // GET /products/detail/{productId} (legacy)
  if (path.includes('/products/detail/') && method === 'GET') {
    return getProductDetail.handler(event);
  }
  
  // Generic /{id} routes - MUST come AFTER specific routes
  // PUT /products/{id} (Admin)
  if (path.match(/\/products\/[^\/]+$/) && method === 'PUT') {
    if (!pathParams.id) {
      const match = path.match(/\/products\/([^\/]+)$/);
      if (match) event.pathParameters = { ...pathParams, id: match[1] };
    }
    return updateProduct.handler(event);
  }
  // DELETE /products/{id} (Admin)
  if (path.match(/\/products\/[^\/]+$/) && method === 'DELETE') {
    if (!pathParams.id) {
      const match = path.match(/\/products\/([^\/]+)$/);
      if (match) event.pathParameters = { ...pathParams, id: match[1] };
    }
    return deleteProduct.handler(event);
  }
  // GET /products/{id} - single product by ID
  if (path.match(/\/products\/[^\/]+$/) && method === 'GET') {
    if (!pathParams.id) {
      const match = path.match(/\/products\/([^\/]+)$/);
      if (match) event.pathParameters = { ...pathParams, id: match[1] };
    }
    return getProductDetail.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
