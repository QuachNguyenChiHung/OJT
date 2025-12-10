// Lambda: Delete Category with Cascade - MySQL
const { getOne, getMany, remove, execute } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    const categoryId = getPathParam(event, 'id');

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    // Check if category exists
    const category = await getOne('SELECT c_id, c_name FROM Category WHERE c_id = ?', [categoryId]);
    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // Get all descendant category IDs (children, grandchildren, etc.)
    const allCategoryIds = await getAllDescendantIds(categoryId);
    allCategoryIds.push(categoryId); // Include the category itself

    console.log(`Deleting category ${categoryId} and ${allCategoryIds.length - 1} sub-categories:`, allCategoryIds);

    // Check if any of these categories have products
    const placeholders = allCategoryIds.map(() => '?').join(',');
    const productCheck = await getOne(
      `SELECT COUNT(*) as count FROM Product WHERE c_id IN (${placeholders})`,
      allCategoryIds
    );

    if (productCheck && productCheck.count > 0) {
      return errorResponse(
        `Không thể xóa: Có ${productCheck.count} sản phẩm trong danh mục này hoặc danh mục con. Vui lòng di chuyển hoặc xóa sản phẩm trước.`,
        400
      );
    }

    // Delete all categories (children first, then parent) - using reverse order
    // MySQL will handle the order, but we delete from deepest level first
    let deletedCount = 0;
    
    // Sort by level descending (delete children before parents)
    const categoriesToDelete = await getMany(
      `SELECT c_id, level FROM Category WHERE c_id IN (${placeholders}) ORDER BY level DESC`,
      allCategoryIds
    );

    for (const cat of categoriesToDelete) {
      await remove('DELETE FROM Category WHERE c_id = ?', [cat.c_id]);
      deletedCount++;
    }

    return successResponse({ 
      message: `Đã xóa danh mục "${category.c_name}" và ${deletedCount - 1} danh mục con`,
      deletedCount,
      deletedIds: allCategoryIds
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse('Failed to delete category: ' + error.message, 500);
  }
};

// Recursively get all descendant category IDs
async function getAllDescendantIds(parentId) {
  const children = await getMany(
    'SELECT c_id FROM Category WHERE parent_id = ?',
    [parentId]
  );

  if (!children || children.length === 0) {
    return [];
  }

  let allIds = children.map(c => c.c_id);

  // Recursively get grandchildren
  for (const child of children) {
    const grandchildIds = await getAllDescendantIds(child.c_id);
    allIds = allIds.concat(grandchildIds);
  }

  return allIds;
}
