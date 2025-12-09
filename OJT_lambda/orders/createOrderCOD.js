// Lambda: Create COD Order - MySQL
const { getOne, insert, update } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');
const { verifyToken } = require('./shared/auth');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = parseBody(event);
    const { shippingAddress, phoneNumber, note, items } = body;

    if (!shippingAddress) {
      return errorResponse('Shipping address is required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Order items are required', 400);
    }

    const orderId = uuidv4();
    let totalPrice = 0;

    // Validate items and calculate total
    for (const item of items) {
      const checkSql = `SELECT pd.pd_id, pd.amount, pd.price 
                        FROM product_details pd 
                        WHERE pd.pd_id = ?`;
      const product = await getOne(checkSql, [item.productDetailsId]);

      if (!product) {
        return errorResponse(`Product ${item.productDetailsId} not available`, 400);
      }

      const stock = parseInt(product.amount || 0);
      if (stock < item.quantity) {
        return errorResponse(`Insufficient stock for product ${item.productDetailsId}`, 400);
      }

      const price = parseFloat(product.price || 0);
      totalPrice += price * item.quantity;
    }

    // Create order
    const createOrderSql = `INSERT INTO orders (o_id, u_id, order_status, total_price, shipping_address, phone_number, note, payment_method, created_at, updated_at)
                            VALUES (?, ?, 'PENDING', ?, ?, ?, ?, 'COD', NOW(), NOW())`;
    await insert(createOrderSql, [
      orderId, user.u_id, totalPrice, shippingAddress, phoneNumber || null, note || null
    ]);

    // Create order details and update stock
    for (const item of items) {
      const detailId = uuidv4();
      
      // Get price
      const priceSql = `SELECT price FROM product_details WHERE pd_id = ?`;
      const priceRow = await getOne(priceSql, [item.productDetailsId]);
      const price = parseFloat(priceRow?.price || 0);

      // Insert order detail
      const detailSql = `INSERT INTO order_details (od_id, o_id, pd_id, quantity, price)
                         VALUES (?, ?, ?, ?, ?)`;
      await insert(detailSql, [detailId, orderId, item.productDetailsId, item.quantity, price]);

      // Update stock
      const updateStockSql = `UPDATE product_details SET amount = amount - ? WHERE pd_id = ?`;
      await update(updateStockSql, [item.quantity, item.productDetailsId]);
    }

    return successResponse({
      orderId,
      status: 'PENDING',
      totalPrice,
      paymentMethod: 'COD',
      shippingAddress,
      message: 'Order created successfully',
    }, 201);
  } catch (error) {
    console.error('Create COD order error:', error);
    return errorResponse('Failed to create order', 500);
  }
};
