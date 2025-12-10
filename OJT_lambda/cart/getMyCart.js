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
    // Include selected_size from Cart, sizes JSON, thumbnail from Product
    const sql = `
      SELECT 
        c.cart_id,
        c.quantity,
        c.selected_size,
        c.created_at,
        c.updated_at,
        pd.pd_id,
        pd.size,
        pd.sizes,
        pd.color_name,
        pd.color_code,
        pd.img_list,
        pd.amount,
        p.p_id,
        p.p_name,
        p.p_desc,
        p.price,
        p.thumbnail_1
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
      
      // Parse img_list JSON - try multiple formats
      let images = [];
      let firstImage = '';
      
      if (row.img_list) {
        try {
          const parsed = typeof row.img_list === 'string' ? JSON.parse(row.img_list) : row.img_list;
          if (Array.isArray(parsed)) {
            images = parsed;
            firstImage = parsed[0] || '';
          } else if (typeof parsed === 'string') {
            firstImage = parsed;
          }
        } catch (e) {
          if (typeof row.img_list === 'string' && row.img_list.trim()) {
            firstImage = row.img_list.trim();
          }
        }
      }
      
      // Fallback to product thumbnail if no variant image
      if (!firstImage && row.thumbnail_1) {
        firstImage = row.thumbnail_1;
      }
      
      // Parse sizes JSON array first
      let sizes = [];
      if (row.sizes) {
        try {
          sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes;
          if (!Array.isArray(sizes)) sizes = [];
        } catch (e) {
          sizes = [];
        }
      }
      
      // Get selected size from cart, or fallback to product size, or first available size
      let selectedSize = row.selected_size || row.size || '';
      
      // If no selected size but has sizes array, use first size with stock > 0
      if (!selectedSize && sizes.length > 0) {
        const firstAvailable = sizes.find(s => parseInt(s.amount || 0) > 0);
        if (firstAvailable) {
          selectedSize = firstAvailable.size;
        } else {
          selectedSize = sizes[0]?.size || '';
        }
      }
      
      // Calculate stock for the selected size
      let stockForSize = parseInt(row.amount || 0);
      if (sizes.length > 0 && selectedSize) {
        const sizeData = sizes.find(s => s.size === selectedSize);
        if (sizeData) {
          stockForSize = parseInt(sizeData.amount || 0);
        }
      }
      
      return {
        cartId: row.cart_id,
        quantity,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        pdId: row.pd_id,
        size: selectedSize,
        sizes: sizes,
        colorName: row.color_name || '',
        colorCode: row.color_code || '',
        price,
        stock: stockForSize,
        productId: row.p_id,
        productName: row.p_name,
        description: row.p_desc || '',
        image: firstImage,
        images: images,
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
