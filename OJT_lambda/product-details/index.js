// Product Details Module Router - handles all /product-details/* endpoints
const getAllProductDetails = require('./getAllProductDetails');
const getProductDetailsById = require('./getProductDetailsById');
const getProductDetailsByProductId = require('./getProductDetailsByProductId');
const createProductDetails = require('./createProductDetails');
const updateProductDetails = require('./updateProductDetails');
const deleteProductDetails = require('./deleteProductDetails');
const uploadProductImages = require('./uploadProductImages');
const migrateAddSizes = require('./migrateAddSizes');

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const pathParams = event.pathParameters || {};
  
  console.log(`[ProductDetailsModule] ${method} ${path}`, { pathParams });

  // GET /product-details
  if (path === '/product-details' && method === 'GET') {
    return getAllProductDetails.handler(event);
  }
  // POST /product-details (Admin)
  if (path === '/product-details' && method === 'POST') {
    return createProductDetails.handler(event);
  }
  // POST /product-details/migrate (Admin - run once)
  if (path === '/product-details/migrate' && method === 'POST') {
    return migrateAddSizes.handler(event);
  }
  // GET /product-details/product/{productId}
  if (path.includes('/product-details/product/') && method === 'GET') {
    const match = path.match(/\/product-details\/product\/([^\/]+)/);
    if (match) {
      event.pathParameters = { ...pathParams, productId: match[1] };
    }
    return getProductDetailsByProductId.handler(event);
  }
  // POST /product-details/{id}/images
  if (path.includes('/images') && method === 'POST') {
    const match = path.match(/\/product-details\/([^\/]+)\/images/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return uploadProductImages.handler(event);
  }
  // GET /product-details/{id}
  if (path.match(/\/product-details\/[^\/]+$/) && method === 'GET') {
    const match = path.match(/\/product-details\/([^\/]+)$/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return getProductDetailsById.handler(event);
  }
  // PUT /product-details/{id}
  if (path.match(/\/product-details\/[^\/]+$/) && method === 'PUT') {
    const match = path.match(/\/product-details\/([^\/]+)$/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return updateProductDetails.handler(event);
  }
  // DELETE /product-details/{id}
  if (path.match(/\/product-details\/[^\/]+$/) && method === 'DELETE') {
    const match = path.match(/\/product-details\/([^\/]+)$/);
    if (match) {
      event.pathParameters = { ...pathParams, id: match[1] };
    }
    return deleteProductDetails.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Route not found', path, method })
  };
};
