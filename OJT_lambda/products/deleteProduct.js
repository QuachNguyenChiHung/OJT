// Lambda: Delete Product (Admin) - MySQL
const { remove, getOne } = require('./shared/database');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Check role from database
    const dbUser = await getOne('SELECT role FROM Users WHERE user_id = ?', [user.u_id]);
    const isAdmin = dbUser?.role === 'ADMIN' || user.role === 'ADMIN' || (user.groups && user.groups.includes('admin'));
    
    if (!isAdmin) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    // Extract productId from path
    let productId = event.pathParameters?.id;
    if (!productId) {
      const path = event.path || event.rawPath || '';
      const match = path.match(/\/products\/([^\/\?]+)/);
      if (match) productId = match[1];
    }

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Delete product (cascade will handle related records) - Schema v2
    const deleteSql = `DELETE FROM Product WHERE p_id = ?`;
    await remove(deleteSql, [productId]);

    return successResponse({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(error.message || 'Failed to delete product', 500);
  }
};
