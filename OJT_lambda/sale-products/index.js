// Sale Products Module - Entry Point
const getSaleProducts = require('./getSaleProducts');
const addSaleProduct = require('./addSaleProduct');
const updateSaleProduct = require('./updateSaleProduct');
const removeSaleProduct = require('./removeSaleProduct');
const getDiscountLevels = require('./getDiscountLevels');
const createDiscountLevel = require('./createDiscountLevel');
const deleteDiscountLevel = require('./deleteDiscountLevel');

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  const path = event.path || event.rawPath || '';
  const pathParams = event.pathParameters || {};

  console.log(`[SaleProductsModule] ${method} ${path}`, { pathParams });

  // === DISCOUNT LEVELS ===
  // GET /sale-products/discount-levels - Get all discount levels
  if (path === '/sale-products/discount-levels' && method === 'GET') {
    return getDiscountLevels.handler(event);
  }

  // POST /sale-products/discount-levels - Create new discount level
  if (path === '/sale-products/discount-levels' && method === 'POST') {
    return createDiscountLevel.handler(event);
  }

  // DELETE /sale-products/discount-levels/{discountPercent} - Delete discount level
  if (path.match(/\/sale-products\/discount-levels\/\d+$/) && method === 'DELETE') {
    const match = path.match(/\/sale-products\/discount-levels\/(\d+)$/);
    if (match) event.pathParameters = { ...pathParams, discountPercent: match[1] };
    return deleteDiscountLevel.handler(event);
  }

  // === SALE PRODUCTS ===
  // GET /sale-products - Get all sale products
  if (path === '/sale-products' && method === 'GET') {
    return getSaleProducts.handler(event);
  }

  // POST /sale-products - Add product to sale
  if (path === '/sale-products' && method === 'POST') {
    return addSaleProduct.handler(event);
  }

  // PUT /sale-products/{productId} - Update discount (exclude discount-levels path)
  if (path.match(/\/sale-products\/[^\/]+$/) && !path.includes('discount-levels') && method === 'PUT') {
    const match = path.match(/\/sale-products\/([^\/]+)$/);
    if (match) event.pathParameters = { ...pathParams, productId: match[1] };
    return updateSaleProduct.handler(event);
  }

  // DELETE /sale-products/{productId} - Remove from sale (exclude discount-levels path)
  if (path.match(/\/sale-products\/[^\/]+$/) && !path.includes('discount-levels') && method === 'DELETE') {
    const match = path.match(/\/sale-products\/([^\/]+)$/);
    if (match) event.pathParameters = { ...pathParams, productId: match[1] };
    return removeSaleProduct.handler(event);
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Not Found', path, method })
  };
};
