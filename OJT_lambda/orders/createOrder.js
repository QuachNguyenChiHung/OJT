// Lambda: Create Order - MySQL
const { getOne, insert, update, remove } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    // Verify authentication
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { items, additionalFee, paymentMethod, shippingAddress, phoneNumber } = parseBody(event);

    if (!items || items.length === 0) {
      return errorResponse('Order items are required', 400);
    }

    if (!shippingAddress || !phoneNumber) {
      return errorResponse('Shipping address and phone number are required', 400);
    }

    const orderId = uuidv4();
    let totalPrice = 0;

    // Validate all items and calculate total
    for (const item of items) {
      const { productDetailsId, quantity } = item;

      // Get product details and check stock (price is in Product table)
      const checkSql = `
        SELECT pd.pd_id, pd.amount, p.price 
        FROM ProductDetails pd 
        INNER JOIN Product p ON pd.p_id = p.p_id 
        WHERE pd.pd_id = ?
      `;
      const product = await getOne(checkSql, [productDetailsId]);

      if (!product) {
        return errorResponse(`Product ${productDetailsId} not found`, 404);
      }

      const price = parseFloat(product.price || 0);
      const stock = parseInt(product.amount || 0);

      if (stock < quantity) {
        return errorResponse(`Insufficient stock for product ${productDetailsId}`, 400);
      }

      totalPrice += price * quantity;
    }

    // Add additional fee if provided
    const fee = parseFloat(additionalFee || 0);
    totalPrice += fee;

    // Create order
    const createOrderSql = `
      INSERT INTO Orders (o_id, u_id, total_price, status, 
        payment_method, shipping_address, phone, date_created)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await insert(createOrderSql, [
      orderId, user.u_id, totalPrice, 'PENDING',
      paymentMethod || 'COD', shippingAddress, phoneNumber
    ]);

    // Create order details and update stock
    for (const item of items) {
      const { productDetailsId, quantity, size } = item;

      // Get price (from Product table via ProductDetails)
      const priceSql = `
        SELECT p.price, pd.size as defaultSize FROM ProductDetails pd 
        INNER JOIN Product p ON pd.p_id = p.p_id 
        WHERE pd.pd_id = ?
      `;
      const priceRow = await getOne(priceSql, [productDetailsId]);
      const price = parseFloat(priceRow?.price || 0);
      // Use provided size or fallback to ProductDetails size
      const itemSize = size || priceRow?.defaultSize || null;

      // Insert order detail with size
      const orderDetailSql = `
        INSERT INTO OrderDetails (od_id, o_id, pd_id, quantity, price, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await insert(orderDetailSql, [uuidv4(), orderId, productDetailsId, quantity, price, itemSize]);

      // Update stock
      const updateStockSql = `UPDATE ProductDetails SET amount = amount - ? WHERE pd_id = ?`;
      await update(updateStockSql, [quantity, productDetailsId]);
    }

    // Clear user's cart
    const clearCartSql = `DELETE FROM Cart WHERE user_id = ?`;
    await remove(clearCartSql, [user.u_id]);

    // Create notification for user
    try {
      const notificationId = uuidv4();
      const createdAt = Math.floor(Date.now() / 1000);
      const notificationSql = `
        INSERT INTO notifications (n_id, u_id, title, message, type, reference_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
      `;
      await insert(notificationSql, [
        notificationId,
        user.u_id,
        'Đặt hàng thành công!',
        'Đơn hàng của bạn đã được tạo thành công và đang chờ xử lý.',
        'ORDER_CREATED',
        orderId,
        createdAt
      ]);
    } catch (notifError) {
      console.error('Create notification error:', notifError);
      // Don't fail the order if notification fails
    }

    return successResponse({
      orderId,
      totalPrice,
      status: 'PENDING',
      message: 'Order created successfully'
    }, 201);

  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(error.message || 'Failed to create order', 500);
  }
};
