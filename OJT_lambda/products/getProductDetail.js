// Lambda: Get Product Detail - MySQL
const { getOne, getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Get product info with category and brand
    const productSql = `
      SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
             c.c_id, c.c_name, b.brand_id, b.brand_name,
             (SELECT pd.img_list FROM ProductDetails pd WHERE pd.p_id = p.p_id LIMIT 1) as img_list
      FROM Product p
      LEFT JOIN Category c ON p.c_id = c.c_id
      LEFT JOIN Brand b ON p.brand_id = b.brand_id
      WHERE p.p_id = ?
    `;

    const product = await getOne(productSql, [productId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Parse img_list to get imageUrl
    let imageUrl = '';
    try {
      let imgList = product.img_list;
      if (typeof imgList === 'string') {
        imgList = JSON.parse(imgList);
      }
      imageUrl = Array.isArray(imgList) && imgList.length > 0 ? imgList[0] : '';
    } catch {
      imageUrl = '';
    }

    // Get product details (variants)
    const detailsSql = `
      SELECT pd_id, size, color_name, color_code, amount, in_stock, img_list
      FROM ProductDetails
      WHERE p_id = ?
    `;

    const details = await getMany(detailsSql, [productId]);

    const variants = (details || []).map(row => {
      let variantImages = [];
      try {
        let imgs = row.img_list;
        if (typeof imgs === 'string') {
          imgs = JSON.parse(imgs);
        }
        variantImages = Array.isArray(imgs) ? imgs : [];
      } catch {
        variantImages = [];
      }

      return {
        pdId: row.pd_id,
        size: row.size,
        colorName: row.color_name,
        colorCode: row.color_code,
        stock: parseInt(row.amount || 0),
        inStock: !!row.in_stock,
        images: variantImages
      };
    });

    // Get rating stats
    const ratingSql = `
      SELECT AVG(rating_value) as avg_rating, COUNT(*) as total_ratings
      FROM Rating WHERE p_id = ?
    `;
    const ratingRow = await getOne(ratingSql, [productId]);

    return successResponse({
      productId: product.p_id,
      name: product.p_name,
      description: product.p_desc || '',
      price: parseFloat(product.price || 0),
      isActive: !!product.is_active,
      imageUrl,
      category: {
        categoryId: product.c_id,
        name: product.c_name
      },
      brand: {
        brandId: product.brand_id,
        name: product.brand_name
      },
      variants,
      ratings: {
        average: parseFloat(ratingRow?.avg_rating || 0).toFixed(1),
        total: parseInt(ratingRow?.total_ratings || 0)
      }
    });

  } catch (error) {
    console.error('Get product detail error:', error);
    return errorResponse(error.message || 'Failed to get product detail', 500);
  }
};
