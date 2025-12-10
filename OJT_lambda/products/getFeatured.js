// Lambda: Get Featured Products - MySQL (with images)
const { getMany, getOne } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async () => {
  try {
    // First try with is_featured column, include thumbnails and first image from ProductDetails
    let sql = `
      SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
             p.thumbnail_1, p.thumbnail_2,
             c.c_name as category_name, b.brand_name,
             (SELECT AVG(rating_value) FROM Rating WHERE p_id = p.p_id) as avg_rating,
             (SELECT pd.img_list FROM ProductDetails pd WHERE pd.p_id = p.p_id LIMIT 1) as img_list
      FROM Product p
      LEFT JOIN Category c ON p.c_id = c.c_id
      LEFT JOIN Brand b ON p.brand_id = b.brand_id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.p_id DESC
      LIMIT 20
    `;

    let rows;
    try {
      rows = await getMany(sql);
    } catch (e) {
      // If is_featured column doesn't exist, return newest products
      console.log('is_featured column may not exist, returning newest products:', e.message);
      sql = `
        SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
               p.thumbnail_1, p.thumbnail_2,
               c.c_name as category_name, b.brand_name,
               (SELECT AVG(rating_value) FROM Rating WHERE p_id = p.p_id) as avg_rating,
               (SELECT pd.img_list FROM ProductDetails pd WHERE pd.p_id = p.p_id LIMIT 1) as img_list
        FROM Product p
        LEFT JOIN Category c ON p.c_id = c.c_id
        LEFT JOIN Brand b ON p.brand_id = b.brand_id
        WHERE p.is_active = 1
        ORDER BY p.p_id DESC
        LIMIT 8
      `;
      rows = await getMany(sql);
    }

    const products = rows.map(row => {
      // Parse img_list to get first image (fallback if no thumbnails)
      let imageUrl = null;
      let imageUrl2 = null;
      if (row.img_list) {
        try {
          const imgs = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
          if (Array.isArray(imgs) && imgs.length > 0) {
            imageUrl = imgs[0];
            if (imgs.length > 1) imageUrl2 = imgs[1];
          }
        } catch (e) {
          // ignore parse error
        }
      }
      
      // Use thumbnails if available, otherwise fallback to img_list
      const thumb1 = row.thumbnail_1 || imageUrl;
      const thumb2 = row.thumbnail_2 || imageUrl2 || thumb1;
      
      return {
        id: row.p_id,
        productId: row.p_id,
        name: row.p_name,
        description: row.p_desc || '',
        price: parseFloat(row.price || 0),
        isActive: !!row.is_active,
        isFeatured: true,
        categoryName: row.category_name,
        brandName: row.brand_name,
        averageRating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : null,
        thumbnail1: thumb1,
        thumbnail2: thumb2,
        imageUrl: thumb1,
        image: thumb1
      };
    });

    return successResponse(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    return errorResponse('Failed to fetch featured products: ' + error.message, 500);
  }
};
