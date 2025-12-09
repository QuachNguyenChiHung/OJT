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

      // Get product details and check stock
      const checkSql = `SELECT pd_id, price, amount FROM product_details WHERE pd_id = ?`;
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
      INSERT INTO orders (o_id, u_id, total_price, additional_fee, order_status, 
        payment_method, shipping_address, phone_number, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await insert(createOrderSql, [
      orderId, user.u_id, totalPrice, fee, 'PENDING',
      paymentMethod || 'COD', shippingAddress, phoneNumber
    ]);

    // Create order details and update stock
    for (const item of items) {
      const { productDetailsId, quantity } = item;

      // Get price
      const priceSql = `SELECT price FROM product_details WHERE pd_id = ?`;
      const priceRow = await getOne(priceSql, [productDetailsId]);
      const price = parseFloat(priceRow?.price || 0);

      // Insert order detail
      const orderDetailSql = `
        INSERT INTO order_details (od_id, o_id, pd_id, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `;

      await insert(orderDetailSql, [uuidv4(), orderId, productDetailsId, quantity, price]);

      // Update stock
      const updateStockSql = `UPDATE product_details SET amount = amount - ? WHERE pd_id = ?`;
      await update(updateStockSql, [quantity, productDetailsId]);
    }

    // Clear user's cart
    const clearCartSql = `DELETE FROM cart WHERE u_id = ?`;
    await remove(clearCartSql, [user.u_id]);

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
