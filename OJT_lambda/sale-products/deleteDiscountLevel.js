// Lambda: Delete Discount Level
const { executeStatement, getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const discountPercent = event.pathParameters?.discountPercent;

    if (!discountPercent) {
      return errorResponse('Discount percent is required', 400);
    }

    // Check if any products are using this discount level
    const productsUsing = await getMany(
      'SELECT p_id FROM SaleProduct WHERE discount_percent = ?',
      [parseInt(discountPercent)]
    );

    if (productsUsing && productsUsing.length > 0) {
      return errorResponse(
        `Không thể xóa mức giảm ${discountPercent}% vì có ${productsUsing.length} sản phẩm đang sử dụng. Hãy chuyển các sản phẩm sang mức giảm khác trước.`,
        400
      );
    }

    // Delete the discount level
    const result = await executeStatement(
      'DELETE FROM DiscountLevel WHERE discount_percent = ?',
      [parseInt(discountPercent)]
    );

    if (result.affectedRows === 0) {
      return errorResponse('Discount level not found', 404);
    }

    return successResponse({ message: `Đã xóa mức giảm ${discountPercent}%` });
  } catch (error) {
    console.error('Delete discount level error:', error);
    return errorResponse('Failed to delete discount level: ' + error.message, 500);
  }
};
