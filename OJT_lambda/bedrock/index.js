// Lambda: Bedrock Chat - Direct AI + RDS (không dùng Agent)
// Tối ưu hiệu năng: sử dụng index, limit queries, cache-friendly
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParams } = require('./shared/response');

const REGION = process.env.AWS_REGION || 'ap-southeast-1';
// Sử dụng inference profile thay vì model ID trực tiếp
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'apac.anthropic.claude-3-haiku-20240307-v1:0';

const bedrockClient = new BedrockRuntimeClient({ region: REGION });

// ============ DATABASE QUERIES (Optimized) ============

// Tìm kiếm sản phẩm
const searchProducts = async (keyword, categoryName, brandName, maxPrice, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50); // Max 50 results
  
  let sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, sp.discount_percent
             FROM Product p
             LEFT JOIN Category c ON p.c_id = c.c_id
             LEFT JOIN Brand b ON p.brand_id = b.brand_id
             LEFT JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1
             WHERE p.is_active = 1`;
  
  const params = [];
  if (keyword) { 
    sql += ' AND p.p_name LIKE ?'; 
    params.push(`%${keyword}%`); 
  }
  if (categoryName) { 
    sql += ' AND c.c_name LIKE ?'; 
    params.push(`%${categoryName}%`); 
  }
  if (brandName) { 
    sql += ' AND b.brand_name LIKE ?'; 
    params.push(`%${brandName}%`); 
  }
  if (maxPrice) { 
    sql += ' AND p.price <= ?'; 
    params.push(parseFloat(maxPrice)); 
  }
  
  sql += ` ORDER BY p.price ASC LIMIT ${safeLimit}`;
  return await getMany(sql, params);
};

// Sản phẩm đang sale
const getSaleProducts = async (keyword, categoryName, brandName, minDiscount, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  
  let sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, sp.discount_percent
             FROM Product p 
             INNER JOIN SaleProduct sp ON p.p_id = sp.p_id AND sp.is_active = 1
             LEFT JOIN Category c ON p.c_id = c.c_id 
             LEFT JOIN Brand b ON p.brand_id = b.brand_id
             WHERE p.is_active = 1`;
  
  const params = [];
  if (keyword) { 
    sql += ' AND p.p_name LIKE ?'; 
    params.push(`%${keyword}%`); 
  }
  if (categoryName) { 
    sql += ' AND c.c_name LIKE ?'; 
    params.push(`%${categoryName}%`); 
  }
  if (brandName) { 
    sql += ' AND b.brand_name LIKE ?'; 
    params.push(`%${brandName}%`); 
  }
  if (minDiscount) { 
    sql += ' AND sp.discount_percent >= ?'; 
    params.push(parseInt(minDiscount)); 
  }
  
  sql += ` ORDER BY sp.discount_percent DESC LIMIT ${safeLimit}`;
  return await getMany(sql, params);
};

// Sản phẩm bán chạy - tối ưu với subquery
const getBestSelling = async (limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20);
  
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name, 
                      COALESCE(sales.total_sold, 0) as sold
               FROM Product p
               LEFT JOIN Category c ON p.c_id = c.c_id 
               LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN (
                 SELECT pd.p_id, SUM(od.quantity) as total_sold
                 FROM ProductDetails pd
                 INNER JOIN OrderDetails od ON pd.pd_id = od.pd_id
                 GROUP BY pd.p_id
               ) sales ON p.p_id = sales.p_id
               WHERE p.is_active = 1 AND sales.total_sold > 0
               ORDER BY sales.total_sold DESC 
               LIMIT ${safeLimit}`;
  return await getMany(sql, []);
};

// Danh mục - simple query với index
const getCategories = async () => {
  const sql = `SELECT c_id, c_name, parent_id, level 
               FROM Category 
               ORDER BY level, display_order, c_name 
               LIMIT 100`;
  return await getMany(sql, []);
};

// Thương hiệu - simple query với index
const getBrands = async () => {
  const sql = `SELECT brand_id, brand_name 
               FROM Brand 
               ORDER BY brand_name 
               LIMIT 50`;
  return await getMany(sql, []);
};

// Sản phẩm sắp hết hàng
const getLowStock = async (limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20);
  
  const sql = `SELECT p.p_id, p.p_name, p.price, c.c_name, b.brand_name,
                      COALESCE(SUM(pd.amount), 0) as stock
               FROM Product p
               LEFT JOIN Category c ON p.c_id = c.c_id
               LEFT JOIN Brand b ON p.brand_id = b.brand_id
               LEFT JOIN ProductDetails pd ON p.p_id = pd.p_id
               WHERE p.is_active = 1
               GROUP BY p.p_id
               HAVING stock > 0 AND stock <= 5
               ORDER BY stock ASC
               LIMIT ${safeLimit}`;
  return await getMany(sql, []);
};

// ============ AI PROCESSING ============

// Kiểm tra xem query có liên quan đến sản phẩm/mua sắm không
const isProductRelated = (query) => {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const original = query.toLowerCase();
  
  // Các từ khóa liên quan đến sản phẩm/mua sắm
  const productKeywords = [
    // Sản phẩm
    'san pham', 'sản phẩm', 'product', 'hang', 'hàng', 'do', 'đồ',
    // Loại sản phẩm
    'ao', 'áo', 'quan', 'quần', 'vay', 'váy', 'dam', 'đầm', 'bikini', 'vest', 'suit',
    'giay', 'giày', 'dep', 'dép', 'tui', 'túi', 'balo', 'ba lô', 'mu', 'mũ', 'non', 'nón',
    // Hành động mua sắm
    'mua', 'tim', 'tìm', 'xem', 'search', 'gia', 'giá', 'price', 'bao nhieu', 'bao nhiêu',
    // Sale/Khuyến mãi
    'sale', 'giam gia', 'giảm giá', 'khuyen mai', 'khuyến mãi', 'discount', 'uu dai', 'ưu đãi',
    // Danh mục/Thương hiệu
    'danh muc', 'danh mục', 'category', 'thuong hieu', 'thương hiệu', 'brand',
    'nike', 'adidas', 'puma', 'gucci', 'zara', 'fff', 'laviem',
    // Trạng thái
    'ban chay', 'bán chạy', 'hot', 'best', 'noi bat', 'nổi bật',
    'het hang', 'hết hàng', 'con hang', 'còn hàng', 'ton kho', 'tồn kho',
    // Size/Màu
    'size', 'mau', 'màu', 'color'
  ];
  
  return productKeywords.some(k => q.includes(k) || original.includes(k));
};

// Response cho câu hỏi không liên quan
const getOffTopicResponse = () => {
  const responses = [
    'Xin chào! Tôi là trợ lý bán hàng của Furious Five Fashion. Tôi được thiết lập để giúp bạn tìm kiếm sản phẩm thời trang nhanh chóng. Bạn có thể hỏi tôi về:\n- Sản phẩm đang giảm giá\n- Sản phẩm bán chạy\n- Tìm kiếm theo danh mục, thương hiệu\n- Giá cả sản phẩm\n\nBạn muốn tìm sản phẩm gì hôm nay?',
    'Chào bạn! Tôi là chatbot hỗ trợ mua sắm tại Furious Five Fashion. Tôi có thể giúp bạn:\n- Xem sản phẩm đang sale\n- Tìm áo, quần, váy, bikini...\n- Xem sản phẩm theo thương hiệu\n\nHãy cho tôi biết bạn đang tìm kiếm gì nhé!',
    'Xin lỗi, tôi chỉ có thể hỗ trợ bạn về các vấn đề liên quan đến sản phẩm và mua sắm tại cửa hàng. Bạn có muốn xem sản phẩm đang giảm giá hoặc tìm kiếm sản phẩm cụ thể không?'
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// Phân tích intent từ câu hỏi - mở rộng và chính xác hơn
const analyzeIntent = (query) => {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  const original = query.toLowerCase();
  
  // Kiểm tra câu chào hỏi đơn giản
  const greetings = ['hello', 'hi', 'hey', 'xin chao', 'xin chào', 'chao', 'chào', 'alo', 'e', 'ê', 'yo'];
  const smallTalk = ['khoe khong', 'khỏe không', 'ban khoe', 'bạn khỏe', 'the nao', 'thế nào', 'sao roi', 'sao rồi', 'gi day', 'gì đây', 'la gi', 'là gì', 'ban la ai', 'bạn là ai', 'may la gi', 'mày là gì'];
  
  // Nếu chỉ là chào hỏi ngắn hoặc small talk và không liên quan sản phẩm
  if ((greetings.some(g => q === g || original === g) || smallTalk.some(s => q.includes(s) || original.includes(s))) && !isProductRelated(query)) {
    return { type: 'offtopic' };
  }
  
  // Nếu query quá ngắn và không liên quan sản phẩm
  if (query.trim().length <= 3 && !isProductRelated(query)) {
    return { type: 'offtopic' };
  }
  
  // Sale/Giảm giá
  const saleKeywords = ['sale', 'giam gia', 'giảm giá', 'khuyen mai', 'khuyến mãi', 'discount', 'uu dai', 'ưu đãi'];
  if (saleKeywords.some(k => q.includes(k) || original.includes(k))) {
    const intent = { type: 'sale', keyword: null, category: null, brand: null, minDiscount: null };
    
    // Tìm % giảm giá
    const discountMatch = query.match(/(\d+)\s*%/);
    if (discountMatch) intent.minDiscount = parseInt(discountMatch[1]);
    
    // Tìm keyword sản phẩm
    const productKeywords = {
      'ao thun': 'áo thun', 'áo thun': 'áo thun',
      'bikini': null, // category
      'quan': 'quần', 'quần': 'quần',
      'vay': 'váy', 'váy': 'váy',
      'vest': 'vest', 'suit': 'vest',
      'ao': 'áo', 'áo': 'áo',
      'dam': 'đầm', 'đầm': 'đầm'
    };
    
    for (const [key, value] of Object.entries(productKeywords)) {
      if (q.includes(key) || original.includes(key)) {
        if (key === 'bikini') intent.category = 'Bikini';
        else intent.keyword = value;
        break;
      }
    }
    
    // Tìm brand
    const brands = ['nike', 'adidas', 'fff', 'puma', 'gucci', 'zara', 'laviem', 't1'];
    for (const brand of brands) {
      if (q.includes(brand)) {
        intent.brand = brand.toUpperCase() === 'FFF' ? 'FFF' : brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
    
    return intent;
  }
  
  // Sắp hết hàng
  const lowStockKeywords = ['sap het', 'sắp hết', 'con it', 'còn ít', 'low stock', 'het hang', 'hết hàng'];
  if (lowStockKeywords.some(k => q.includes(k) || original.includes(k))) {
    return { type: 'lowstock' };
  }
  
  // Bán chạy
  const bestSellingKeywords = ['ban chay', 'bán chạy', 'best', 'hot', 'pho bien', 'phổ biến', 'nhieu nguoi mua', 'nhiều người mua'];
  if (bestSellingKeywords.some(k => q.includes(k) || original.includes(k))) {
    return { type: 'bestselling' };
  }
  
  // Danh mục
  const categoryKeywords = ['danh muc', 'danh mục', 'category', 'loai', 'loại', 'the loai', 'thể loại'];
  if (categoryKeywords.some(k => q.includes(k) || original.includes(k))) {
    return { type: 'categories' };
  }
  
  // Thương hiệu
  const brandKeywords = ['thuong hieu', 'thương hiệu', 'brand', 'hang', 'hãng', 'nhan hieu', 'nhãn hiệu'];
  if (brandKeywords.some(k => q.includes(k) || original.includes(k))) {
    return { type: 'brands' };
  }
  
  // Tìm kiếm chung - extract keyword
  let keyword = query;
  const searchPrefixes = ['tim', 'tìm', 'search', 'xem', 'cho xem', 'muon mua', 'muốn mua', 'can', 'cần'];
  for (const prefix of searchPrefixes) {
    if (q.startsWith(prefix) || original.startsWith(prefix)) {
      keyword = query.substring(prefix.length).trim();
      break;
    }
  }
  
  return { type: 'search', keyword: keyword || query };
};

// Format giá VND
const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

// Format data sản phẩm - tối ưu cho AI
const formatProducts = (products) => {
  if (!products || products.length === 0) return 'Không tìm thấy sản phẩm nào.';
  
  return products.map((p, i) => {
    const price = parseFloat(p.price);
    const discount = p.discount_percent || 0;
    let text = `${i + 1}. ${p.p_name} - ${formatPrice(price)}`;
    if (discount > 0) {
      const salePrice = price * (1 - discount / 100);
      text = `${i + 1}. ${p.p_name}\n   Giá gốc: ${formatPrice(price)} - Giá sale: ${formatPrice(salePrice)} (Giảm ${discount}%)`;
    }
    if (p.brand_name) text += `\n   Thương hiệu: ${p.brand_name}`;
    if (p.c_name) text += ` | Danh mục: ${p.c_name}`;
    if (p.sold) text += ` | Đã bán: ${p.sold}`;
    if (p.stock !== undefined) text += ` | Còn: ${p.stock} sản phẩm`;
    return text;
  }).join('\n\n');
};

// Tạo response nhanh không cần AI (cho các query đơn giản)
const generateQuickResponse = (query, data, dataType, intent) => {
  if (!data || data.length === 0) {
    return `Xin lỗi, không tìm thấy sản phẩm phù hợp với yêu cầu "${query}". Bạn có muốn tìm kiếm sản phẩm khác không?`;
  }
  
  let intro = '';
  switch (intent.type) {
    case 'sale':
      intro = `Cửa hàng đang có ${data.length} sản phẩm giảm giá`;
      if (intent.keyword) intro += ` "${intent.keyword}"`;
      if (intent.brand) intro += ` thương hiệu ${intent.brand}`;
      if (intent.minDiscount) intro += ` giảm từ ${intent.minDiscount}%`;
      intro += ':\n\n';
      break;
    case 'bestselling':
      intro = `Top ${data.length} sản phẩm bán chạy nhất:\n\n`;
      break;
    case 'lowstock':
      intro = `${data.length} sản phẩm sắp hết hàng:\n\n`;
      break;
    case 'categories':
      return `Cửa hàng có các danh mục: ${data.map(c => c.c_name).join(', ')}. Bạn muốn xem sản phẩm danh mục nào?`;
    case 'brands':
      return `Các thương hiệu có sẵn: ${data.map(b => b.brand_name).join(', ')}. Bạn quan tâm thương hiệu nào?`;
    default:
      intro = `Tìm thấy ${data.length} sản phẩm:\n\n`;
  }
  
  return intro + formatProducts(data) + '\n\nBạn cần tư vấn thêm về sản phẩm nào?';
};

// Gọi Claude để tạo response thân thiện (chỉ khi cần)
const generateFriendlyResponse = async (query, data, dataType, intent) => {
  // Với data đơn giản, dùng quick response để tiết kiệm thời gian và chi phí
  if (data.length <= 10 && ['sale', 'bestselling', 'lowstock', 'categories', 'brands'].includes(intent.type)) {
    return generateQuickResponse(query, data, dataType, intent);
  }
  
  const systemPrompt = `Bạn là trợ lý bán hàng của cửa hàng thời trang Furious Five Fashion.
Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn
- KHÔNG dùng emoji
- Hiển thị giá theo format: X VND
- Nếu có sale: hiển thị "Giá gốc: X VND - Giá sale: Y VND (Giảm Z%)"
- Kết thúc bằng câu hỏi ngắn để tiếp tục hỗ trợ
- Giới hạn response trong 500 từ`;

  let userMessage = `Khách hỏi: "${query}"\n\nDữ liệu từ database:\n`;
  
  if (dataType === 'products') {
    userMessage += formatProducts(data);
  } else if (dataType === 'categories') {
    userMessage += data.map(c => c.c_name).join(', ');
  } else if (dataType === 'brands') {
    userMessage += data.map(b => b.brand_name).join(', ');
  } else {
    userMessage += JSON.stringify(data, null, 2);
  }
  
  userMessage += '\n\nHãy trả lời khách hàng một cách thân thiện dựa trên dữ liệu trên.';

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  } catch (error) {
    console.error('AI Error:', error.message);
    // Fallback to quick response if AI fails
    return generateQuickResponse(query, data, dataType, intent);
  }
};

// ============ MAIN HANDLER ============

// Helper function để xử lý query
const processQuery = async (query) => {
  const startTime = Date.now();
  
  const intent = analyzeIntent(query);
  console.log('Intent:', JSON.stringify(intent));

  // Xử lý câu hỏi không liên quan đến sản phẩm
  if (intent.type === 'offtopic') {
    console.log('Off-topic query detected, returning quick response');
    return getOffTopicResponse();
  }

  let data, dataType = 'products';

  switch (intent.type) {
    case 'sale':
      data = await getSaleProducts(intent.keyword, intent.category, intent.brand, intent.minDiscount);
      break;
    case 'bestselling':
      data = await getBestSelling();
      break;
    case 'lowstock':
      data = await getLowStock();
      break;
    case 'categories':
      data = await getCategories();
      dataType = 'categories';
      break;
    case 'brands':
      data = await getBrands();
      dataType = 'brands';
      break;
    default:
      data = await searchProducts(intent.keyword);
  }

  const dbTime = Date.now() - startTime;
  console.log(`DB query time: ${dbTime}ms, Results: ${data?.length || 0}`);

  // Tạo response
  const message = await generateFriendlyResponse(query, data, dataType, intent);
  
  const totalTime = Date.now() - startTime;
  console.log(`Total processing time: ${totalTime}ms`);

  return message;
};

exports.handler = async (event) => {
  console.log('Bedrock Direct Event:', JSON.stringify(event, null, 2));
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method;

  try {
    // GET /ask?q=...
    if (path.includes('/ask') && method === 'GET') {
      const { q } = getQueryParams(event);
      if (!q) return errorResponse('Missing query parameter: q', 400);
      if (q.length > 500) return errorResponse('Query too long (max 500 chars)', 400);

      console.log('Query:', q);
      const message = await processQuery(q);
      return successResponse({ message });
    }

    // POST /chat
    if (path.includes('/chat') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.message) return errorResponse('Missing message', 400);
      if (body.message.length > 500) return errorResponse('Message too long (max 500 chars)', 400);

      const message = await processQuery(body.message);
      return successResponse({ message, sessionId: body.sessionId });
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Handler error:', error);
    return errorResponse('Internal server error: ' + error.message, 500);
  }
};
