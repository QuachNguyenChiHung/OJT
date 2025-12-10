// Lambda: Get All Categories with Hierarchy (MySQL)
const { getMany } = require('./shared/database');
const { successResponse, errorResponse, getQueryParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const parentId = getQueryParam(event, 'parentId');
    const level = getQueryParam(event, 'level');
    const flat = getQueryParam(event, 'flat') === 'true';

    let sql = `
      SELECT c.c_id, c.c_name, c.parent_id, c.level, c.display_order,
             p.c_name as parent_name
      FROM Category c
      LEFT JOIN Category p ON c.parent_id = p.c_id
    `;
    const params = [];

    if (parentId) {
      sql += ` WHERE c.parent_id = ?`;
      params.push(parentId);
    } else if (level !== null && level !== undefined) {
      sql += ` WHERE c.level = ?`;
      params.push(parseInt(level));
    }

    sql += ` ORDER BY c.level, c.display_order, c.c_name`;

    const rows = await getMany(sql, params);

    const categories = (rows || []).map(row => ({
      id: row.c_id,
      cId: row.c_id,
      name: row.c_name,
      cName: row.c_name,
      parentId: row.parent_id,
      parentName: row.parent_name,
      level: row.level || 0,
      displayOrder: row.display_order || 0
    }));

    // Build tree structure if not flat
    if (!flat && !parentId && level === null) {
      const tree = buildTree(categories);
      return successResponse(tree);
    }

    return successResponse(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
};

// Build hierarchical tree from flat list
function buildTree(items) {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else if (!item.parentId) {
      roots.push(map[item.id]);
    }
  });

  return roots;
}
