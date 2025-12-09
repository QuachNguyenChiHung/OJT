// Lambda: Get My Cart - MySQL
const { getMany } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get all cart items for user with product details - Schema v2
    const sql = `
      SELECT 
        c.cart_id,
        c.quantity,
        c.created_at,
        c.updated_at,
        pd.pd_id,
        pd.size,
        pd.color_name,
        pd.color_code,
        pd.img_list,
        pd.amount as stock,
        p.p_id,
        p.p_name,
        p.p_desc,
        p.price
      FROM Cart c
      INNER JOIN ProductDetails pd ON c.pd_id = pd.pd_id
      INNER JOIN Product p ON pd.p_id = p.p_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;

    const rows = await getMany(sql, [user.u_id]);

    if (!rows || rows.length === 0) {
      return successResponse({
        data: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          estimatedShipping: 0,
          grandTotal: 0
        }
      });
    }

    // Format cart items - Schema v2
    const items = rows.map(row => {
      const quantity = parseInt(row.quantity || 0);
      const price = parseFloat(row.price || 0);
      
      // Parse img_list JSON
      let images = [];
      try {
        images = row.img_list ? JSON.parse(row.img_list) : [];
      } catch (e) {
        images = [];
      }
      const firstImage = images.length > 0 ? images[0] : '';
      
      return {
        cartId: row.cart_id,
        quantity,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        pdId: row.pd_id,
        size: row.size,
        colorName: row.color_name || '',
        colorCode: row.color_code || '',
        price,
        stock: parseInt(row.stock || 0),
        productId: row.p_id,
        productName: row.p_name,
        description: row.p_desc || '',
        image: firstImage,
        itemTotal: price * quantity
      };
    });

    // Calculate totals
    const totalPrice = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedShipping = totalPrice > 500000 ? 0 : 30000; // Free shipping over 500k
    const grandTotal = totalPrice + estimatedShipping;

    return successResponse({
      data: {
        items,
        totalItems,
        totalPrice,
        estimatedShipping,
        grandTotal
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse(error.message || 'Failed to get cart', 500);
  }
};
