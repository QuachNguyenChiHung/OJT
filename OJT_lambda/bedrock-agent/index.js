// Lambda Action Group for Bedrock Agent - Full E-commerce Features
const { getMany, getOne } = require('./shared/database');

// Format price to VND
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

// 1. SEARCH PRODUCTS
const searchProducts = async (params) => {
  const { keyword, categoryName, brandName, minPrice, maxPrice, limit = 10 } = params;
  
  let sql = `SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_featured,
                    c.c_name, b.brand_name, sp.discount_percent,
                    COALESCE(AVG(r.rating_value), 0) as avg_rating,
                    COALESCE(SUM(pd.amount), 0) as total_stock
             FROM Product p
             LEFT JOIN Category c ON p.c_id = c.c_id
             LEFT JOIN Brand b ON p.brand_id = b.brand_id
             LEFT JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1
             LEFT JOIN Rating r ON p.p_id = r.p_id
             LEFT JOIN ProductDetails pd ON p.p_id = pd.p_id
             WHERE p.is_active = 1`;
  
  const sqlParams = [];
  if (keyword) { sql += ' AND (p.p_name LIKE ? OR p.p_desc LIKE ?)'; sqlParams.push(`%${keyword}%`, `%${keyword}%`); }
  if (categoryName) { sql += ' AND c.c_name LIKE ?'; sqlParams.push(`%${categoryName}%`); }
  if (brandName) { sql += ' AND b.brand_name LIKE ?'; sqlParams.push(`%${brandName}%`); }
  if (minPrice) { sql += ' AND p.price >= ?'; sqlParams.push(parseFloat(minPrice)); }
  if (maxPrice) { sql += ' AND p.price <= ?'; sqlParams.push(parseFloat(maxPrice)); }
  
  sql += ` GROUP BY p.p_id ORDER BY p.price ASC LIMIT ${parseInt(limit)}`;
  const rows = await getMany(sql, sqlParams);
  
  return rows.map(row => {
    const price = parseFloat(row.price);
    const discount = row.discount_percent || 0;
    return {
      id: row.p_id, name: row.p_name, description: row.p_desc,
      price: formatPrice(price), salePrice: discount > 0 ? formatPrice(price * (1 - discount/100)) : null,
      discountPercent: discount, category: row.c_name, brand: row.brand_name,
      avgRating: parseFloat(row.avg_rating).toFixed(1),
      stockStatus: row.total_stock <= 0 ? 'Hết hàng' : row.total_stock <= 5 ? 'Sắp hết' : 'Còn hàng'
    };
  });
};

// 2. GET SALE PRODUCTS - with filters
const getSaleProducts = async (params) => {
  const { keyword, categoryName, brandName, minDiscount, maxPrice } = params;
  const limit = parseInt(params.limit) || 10;
  
  let sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, sp.discount_percent
             FROM Product p JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1
             LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
             WHERE p.is_active = 1`;
  
  const sqlParams = [];
  if (keyword) { sql += ' AND (p.p_name LIKE ? OR p.p_desc LIKE ?)'; sqlParams.push(`%${keyword}%`, `%${keyword}%`); }
  if (categoryName) { sql += ' AND c.c_name LIKE ?'; sqlParams.push(`%${categoryName}%`); }
  if (brandName) { sql += ' AND b.brand_name LIKE ?'; sqlParams.push(`%${brandName}%`); }
  if (minDiscount) { sql += ' AND sp.discount_percent >= ?'; sqlParams.push(parseInt(minDiscount)); }
  if (maxPrice) { sql += ' AND (p.price * (1 - sp.discount_percent/100)) <= ?'; sqlParams.push(parseFloat(maxPrice)); }
  
  sql += ` ORDER BY sp.discount_percent DESC LIMIT ${limit}`;
  const rows = await getMany(sql, sqlParams);
  
  return rows.map(r => ({
    id: r.p_id, name: r.p_name, originalPrice: formatPrice(r.price),
    salePrice: formatPrice(r.price * (1 - r.discount_percent/100)), discountPercent: r.discount_percent,
    category: r.c_name, brand: r.brand_name
  }));
};

// 3. GET LOW STOCK PRODUCTS
const getLowStockProducts = async (params) => {
  const threshold = parseInt(params.threshold) || 5;
  const limit = parseInt(params.limit) || 10;
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, SUM(pd.amount) as stock
               FROM Product p LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN ProductDetails pd ON p.p_id = pd.p_id WHERE p.is_active = 1
               GROUP BY p.p_id HAVING stock > 0 AND stock <= ${threshold} ORDER BY stock ASC LIMIT ${limit}`;
  const rows = await getMany(sql, []);
  return rows.map(r => ({ id: r.p_id, name: r.p_name, price: formatPrice(r.price), category: r.c_name, brand: r.brand_name, stockRemaining: parseInt(r.stock) }));
};

// 4. GET BEST SELLING
const getBestSellingProducts = async (params) => {
  const limit = parseInt(params.limit) || 10;
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, COALESCE(SUM(od.quantity), 0) as sold
               FROM Product p LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN ProductDetails pd ON p.p_id = pd.p_id LEFT JOIN OrderDetails od ON pd.pd_id = od.pd_id
               WHERE p.is_active = 1 GROUP BY p.p_id HAVING sold > 0 ORDER BY sold DESC LIMIT ${limit}`;
  const rows = await getMany(sql, []);
  return rows.map(r => ({ id: r.p_id, name: r.p_name, price: formatPrice(r.price), category: r.c_name, brand: r.brand_name, totalSold: parseInt(r.sold) }));
};

// 5. GET FEATURED
const getFeaturedProducts = async (params) => {
  const limit = parseInt(params.limit) || 10;
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, sp.discount_percent
               FROM Product p LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1
               WHERE p.is_active = 1 AND p.is_featured = 1 LIMIT ${limit}`;
  const rows = await getMany(sql, []);
  return rows.map(r => ({ id: r.p_id, name: r.p_name, price: formatPrice(r.price), category: r.c_name, brand: r.brand_name, discountPercent: r.discount_percent || 0 }));
};

// 6. GET CATEGORIES (tree)
const getCategories = async () => {
  const sql = `SELECT c.c_id, c.c_name, c.parent_id, c.level, COUNT(p.p_id) as count
               FROM Category c LEFT JOIN Product p ON c.c_id = p.c_id AND p.is_active = 1
               GROUP BY c.c_id ORDER BY c.level, c.display_order, c.c_name`;
  const rows = await getMany(sql);
  const buildTree = (items, parentId = null) => items.filter(i => i.parent_id === parentId)
    .map(i => ({ id: i.c_id, name: i.c_name, level: i.level || 0, productCount: parseInt(i.count), children: buildTree(items, i.c_id) }));
  return buildTree(rows);
};

// 7. GET BRANDS
const getBrands = async () => {
  const sql = `SELECT b.brand_id, b.brand_name, COUNT(p.p_id) as count FROM Brand b
               LEFT JOIN Product p ON b.brand_id = p.brand_id AND p.is_active = 1 GROUP BY b.brand_id ORDER BY b.brand_name`;
  const rows = await getMany(sql);
  return rows.map(r => ({ id: r.brand_id, name: r.brand_name, productCount: parseInt(r.count) }));
};

// 8. GET PRODUCT DETAIL
const getProductById = async (productId) => {
  const sql = `SELECT p.*, c.c_name, b.brand_name, sp.discount_percent, COALESCE(AVG(r.rating_value), 0) as rating
               FROM Product p LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1 LEFT JOIN Rating r ON p.p_id = r.p_id
               WHERE p.p_id = ? GROUP BY p.p_id`;
  const product = await getOne(sql, [productId]);
  if (!product) return null;
  const variants = await getMany(`SELECT color_name, size, amount FROM ProductDetails WHERE p_id = ?`, [productId]);
  const stock = variants.reduce((s, v) => s + (v.amount || 0), 0);
  const price = parseFloat(product.price), discount = product.discount_percent || 0;
  return {
    id: product.p_id, name: product.p_name, description: product.p_desc,
    price: formatPrice(price), salePrice: discount > 0 ? formatPrice(price * (1 - discount/100)) : null,
    discountPercent: discount, category: product.c_name, brand: product.brand_name,
    avgRating: parseFloat(product.rating).toFixed(1), totalStock: stock,
    stockStatus: stock <= 0 ? 'Hết hàng' : stock <= 5 ? 'Sắp hết' : 'Còn hàng',
    variants: variants.map(v => ({ color: v.color_name, size: v.size, stock: v.amount }))
  };
};

// 9. GET PRODUCTS BY CATEGORY
const getProductsByCategory = async (params) => {
  const { categoryId, categoryName } = params;
  const limit = parseInt(params.limit) || 20;
  let catIds = [];
  if (categoryId) { catIds = [categoryId]; const children = await getMany(`SELECT c_id FROM Category WHERE parent_id = ?`, [categoryId]); catIds.push(...children.map(c => c.c_id)); }
  else if (categoryName) { const cats = await getMany(`SELECT c_id FROM Category WHERE c_name LIKE ?`, [`%${categoryName}%`]); catIds = cats.map(c => c.c_id); }
  if (!catIds.length) return [];
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name FROM Product p
               LEFT JOIN Category c ON p.c_id = c.c_id LEFT JOIN Brand b ON p.brand_id = b.brand_id
               WHERE p.is_active = 1 AND p.c_id IN (${catIds.map(() => '?').join(',')}) LIMIT ${limit}`;
  const rows = await getMany(sql, catIds);
  return rows.map(r => ({ id: r.p_id, name: r.p_name, price: formatPrice(r.price), category: r.c_name, brand: r.brand_name }));
};

// 10. GET DISCOUNT LEVELS
const getDiscountLevels = async () => {
  const sql = `SELECT dl.discount_percent, dl.name, COUNT(sp.p_id) as count FROM DiscountLevel dl
               LEFT JOIN SaleProduct sp ON dl.discount_percent = sp.discount_percent AND sp.is_active = 1
               WHERE dl.is_active = 1 GROUP BY dl.discount_percent ORDER BY dl.discount_percent`;
  const rows = await getMany(sql);
  return rows.map(r => ({ percent: r.discount_percent, name: r.name, productCount: parseInt(r.count) }));
};

// MAIN HANDLER
exports.handler = async (event) => {
  console.log('Agent Event:', JSON.stringify(event, null, 2));
  const { actionGroup, apiPath, httpMethod } = event;
  const params = {};
  (event.parameters || []).forEach(p => { params[p.name] = p.value; });
  (event.requestBody?.content?.['application/json']?.properties || []).forEach(p => { params[p.name] = p.value; });

  let result, msg;
  try {
    switch (apiPath) {
      case '/search-products': result = await searchProducts(params); msg = result.length ? `Tìm thấy ${result.length} sản phẩm` : 'Không tìm thấy'; break;
      case '/sale-products': result = await getSaleProducts(params); msg = `${result.length} sản phẩm đang giảm giá`; break;
      case '/low-stock-products': result = await getLowStockProducts(params); msg = result.length ? `${result.length} sản phẩm sắp hết` : 'Tất cả còn hàng'; break;
      case '/best-selling': result = await getBestSellingProducts(params); msg = `Top ${result.length} bán chạy`; break;
      case '/featured-products': result = await getFeaturedProducts(params); msg = `${result.length} sản phẩm nổi bật`; break;
      case '/categories': result = await getCategories(); msg = 'Danh mục sản phẩm'; break;
      case '/brands': result = await getBrands(); msg = 'Thương hiệu'; break;
      case '/product/{productId}': result = await getProductById(params.productId); msg = result ? 'Chi tiết sản phẩm' : 'Không tìm thấy'; break;
      case '/products-by-category': result = await getProductsByCategory(params); msg = `${result.length} sản phẩm trong danh mục`; break;
      case '/discount-levels': result = await getDiscountLevels(); msg = 'Các mức giảm giá'; break;
      default: result = null; msg = 'Action không hỗ trợ';
    }
    return { messageVersion: '1.0', response: { actionGroup, apiPath, httpMethod, httpStatusCode: 200, responseBody: { 'application/json': { body: JSON.stringify({ message: msg, data: result }) } } } };
  } catch (error) {
    console.error('Error:', error);
    return { messageVersion: '1.0', response: { actionGroup, apiPath, httpMethod, httpStatusCode: 500, responseBody: { 'application/json': { body: JSON.stringify({ error: error.message }) } } } };
  }
};
