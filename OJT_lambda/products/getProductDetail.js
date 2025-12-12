// Lambda: Get Product Detail (with images and ratings)
const { executeStatement } = require('../shared/database');
const { successResponse, errorResponse } = require('../shared/response');

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Get product info
    const productSql = `
      SELECT p.p_id, p.p_name, p.description, p.image_url,
             c.c_id, c.c_name, b.brand_id, b.brand_name
      FROM Products p
      LEFT JOIN Categories c ON p.c_id = c.c_id
      LEFT JOIN Brands b ON p.brand_id = b.brand_id
      WHERE p.p_id = @productId
    `;

    const productResult = await executeStatement(productSql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    if (!productResult.records || productResult.records.length === 0) {
      return errorResponse('Product not found', 404);
    }

    const productRecord = productResult.records[0];

    // Get product details (sizes, colors, prices)
    const detailsSql = `
      SELECT pd_id, size, price, amount
      FROM ProductDetails
      WHERE p_id = @productId
    `;

    const detailsResult = await executeStatement(detailsSql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    const variants = (detailsResult.records || []).map(record => ({
      pdId: record[0].stringValue,
      size: record[1].stringValue,
      price: parseFloat(record[2].stringValue || record[2].doubleValue || 0),
      stock: parseInt(record[3].longValue || record[3].stringValue || 0)
    }));

    // Get rating stats
    const ratingsSql = `
      SELECT AVG(CAST(rating_value AS FLOAT)) as avg_rating, COUNT(*) as total_ratings
      FROM Ratings WHERE p_id = @productId
    `;

    const ratingsResult = await executeStatement(ratingsSql, [
      { name: 'productId', value: { stringValue: productId } }
    ]);

    let avgRating = 0;
    let totalRatings = 0;

    if (ratingsResult.records && ratingsResult.records.length > 0) {
      avgRating = parseFloat(ratingsResult.records[0][0].doubleValue || ratingsResult.records[0][0].stringValue || 0);
      totalRatings = parseInt(ratingsResult.records[0][1].longValue || 0);
    }

    return successResponse({
      productId: productRecord[0].stringValue,
      name: productRecord[1].stringValue,
      description: productRecord[2].stringValue || '',
      imageUrl: productRecord[3].stringValue || '',
      category: {
        categoryId: productRecord[4]?.stringValue,
        name: productRecord[5]?.stringValue
      },
      brand: {
        brandId: productRecord[6]?.stringValue,
        name: productRecord[7]?.stringValue
      },
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
