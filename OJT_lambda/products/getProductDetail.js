// Lambda: Get Product Detail - MySQL (Schema v2)
const { getOne, getMany } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const productId = getPathParam(event, 'id') || event.pathParameters?.productId;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Schema v2: Product, Category, Brand tables
    const productSql = `
      SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
             p.thumbnail_1, p.thumbnail_2,
             c.c_id, c.c_name, b.brand_id, b.brand_name
      FROM Product p
      LEFT JOIN Category c ON p.c_id = c.c_id
      LEFT JOIN Brand b ON p.brand_id = b.brand_id
      WHERE p.p_id = ?
    `;

    const product = await getOne(productSql, [productId]);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Schema v2: ProductDetails table with sizes JSON column
    const detailsSql = `
      SELECT pd_id, sizes, size, amount, color_name, color_code, img_list, in_stock, description
      FROM ProductDetails
      WHERE p_id = ?
    `;

    const detailsRows = await getMany(detailsSql, [productId]);

    const variants = detailsRows.map(row => {
      // Parse img_list JSON string to array
      let imgList = [];
      if (row.img_list) {
        try {
          imgList = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
        } catch (e) {
          imgList = [];
        }
      }
      
      // Parse sizes JSON array
      let sizes = [];
      if (row.sizes) {
        try {
          sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes;
        } catch (e) {
          sizes = [];
        }
      }
      // Fallback: if no sizes array but has single size/amount
      if (sizes.length === 0 && row.size) {
        sizes = [{ size: row.size, amount: parseInt(row.amount || 0) }];
      }
      
      // Calculate total stock from sizes array
      const totalStock = sizes.reduce((sum, s) => sum + (parseInt(s.amount) || 0), 0);
      
      return {
        pdId: row.pd_id,
        sizes: sizes,
        size: row.size, // Keep for backward compatibility
        stock: totalStock,
        amount: totalStock,
        colorName: row.color_name,
        colorCode: row.color_code,
        description: row.description || '',
        imgList: imgList,
        inStock: !!row.in_stock && totalStock > 0
      };
    });

    // Schema v2: Rating table
    const ratingsSql = `
      SELECT AVG(rating_value) as avg_rating, COUNT(*) as total_ratings
      FROM Rating WHERE p_id = ?
    `;

    let avgRating = 0;
    let totalRatings = 0;
    try {
      const ratingsRow = await getOne(ratingsSql, [productId]);
      if (ratingsRow) {
        avgRating = parseFloat(ratingsRow.avg_rating || 0);
        totalRatings = parseInt(ratingsRow.total_ratings || 0);
      }
    } catch (e) {
      // Rating table may not exist, ignore
    }

    return successResponse({
      id: product.p_id,
      productId: product.p_id,
      name: product.p_name,
      productName: product.p_name,
      description: product.p_desc || '',
      desc: product.p_desc || '',
      price: parseFloat(product.price || 0),
      isActive: !!product.is_active,
      thumbnail1: product.thumbnail_1 || null,
      thumbnail2: product.thumbnail_2 || null,
      categoryId: product.c_id,
      categoryName: product.c_name,
      category: product.c_id ? {
        cId: product.c_id,
        cName: product.c_name
      } : null,
      brandId: product.brand_id,
      brandName: product.brand_name,
      brand: product.brand_id ? {
        brandId: product.brand_id,
        brandName: product.brand_name
      } : null,
      variants,
      ratings: {
        average: avgRating.toFixed(1),
        total: totalRatings
      }
    });

  } catch (error) {
    console.error('Get product detail error:', error);
    return errorResponse(error.message || 'Failed to get product detail', 500);
  }
};
