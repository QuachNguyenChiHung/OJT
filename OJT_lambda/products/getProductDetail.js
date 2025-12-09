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

    // Schema v2: ProductDetails table
    const detailsSql = `
      SELECT pd_id, size, amount, color_name, color_code, img_list, in_stock
      FROM ProductDetails
      WHERE p_id = ?
    `;

    const detailsRows = await getMany(detailsSql, [productId]);

    const variants = detailsRows.map(row => ({
      pdId: row.pd_id,
      size: row.size,
      stock: parseInt(row.amount || 0),
      colorName: row.color_name,
      colorCode: row.color_code,
      imgList: row.img_list,
      inStock: !!row.in_stock
    }));

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
