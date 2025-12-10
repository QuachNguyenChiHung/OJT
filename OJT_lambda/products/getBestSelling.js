// Lambda function: Get best selling products (MySQL - Schema v2) with images
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async () => {
  try {
    // Schema v2: Product, Category, Brand, ProductDetails, OrderDetails - include first image
    const sql = `SELECT 
                   p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                   c.c_id, c.c_name, b.brand_id, b.brand_name,
                   COALESCE(SUM(od.quantity), 0) as total_sold,
                   (SELECT pd2.img_list FROM ProductDetails pd2 WHERE pd2.p_id = p.p_id LIMIT 1) as img_list
                 FROM Product p
                 LEFT JOIN Category c ON p.c_id = c.c_id
                 LEFT JOIN Brand b ON p.brand_id = b.brand_id
                 LEFT JOIN ProductDetails pd ON p.p_id = pd.p_id
                 LEFT JOIN OrderDetails od ON pd.pd_id = od.pd_id
                 WHERE p.is_active = TRUE
                 GROUP BY p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
                          c.c_id, c.c_name, b.brand_id, b.brand_name
                 ORDER BY total_sold DESC
                 LIMIT 10`;

    const rows = await getMany(sql);

    const products = (rows || []).map(row => {
      // Parse img_list to get first image
      let imageUrl = null;
      if (row.img_list) {
        try {
          const imgs = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0];
          }
        } catch (e) {
          // ignore parse error
        }
      }
      
      return {
        id: row.p_id,
        pId: row.p_id,
        name: row.p_name,
        pName: row.p_name,
        description: row.p_desc || null,
        pDesc: row.p_desc || null,
        price: parseFloat(row.price || 0),
        isActive: !!row.is_active,
        categoryId: row.c_id,
        categoryName: row.c_name,
        category: row.c_id ? {
          cId: row.c_id,
          cName: row.c_name
        } : null,
        brandId: row.brand_id,
        brandName: row.brand_name,
        brand: row.brand_id ? {
          brandId: row.brand_id,
          brandName: row.brand_name
        } : null,
        totalSold: parseInt(row.total_sold || 0),
        imageUrl: imageUrl,
        image: imageUrl
      };
    });

    return successResponse(products);

  } catch (error) {
    console.error('Get best selling products error:', error);
    return errorResponse('Failed to fetch best selling products', 500);
  }
};
