// Lambda: Get Products in a Section
const { getMany, getOne } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const sectionId = getPathParam(event, 'id');
    if (!sectionId) {
      return errorResponse('Section ID is required', 400);
    }

    // Check section exists
    const section = await getOne(
      'SELECT section_id, title FROM HomeSection WHERE section_id = ?',
      [sectionId]
    );
    if (!section) {
      return errorResponse('Section not found', 404);
    }

    const products = await getMany(`
      SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
             p.thumbnail_1, p.thumbnail_2,
             c.c_name as category_name, b.brand_name,
             hsp.display_order, hsp.id as relation_id
      FROM HomeSectionProduct hsp
      JOIN Product p ON hsp.p_id = p.p_id
      LEFT JOIN Category c ON p.c_id = c.c_id
      LEFT JOIN Brand b ON p.brand_id = b.brand_id
      WHERE hsp.section_id = ?
      ORDER BY hsp.display_order ASC
    `, [sectionId]);

    return successResponse({
      sectionId: section.section_id,
      sectionTitle: section.title,
      products: products.map(p => ({
        id: p.p_id,
        name: p.p_name,
        description: p.p_desc,
        price: parseFloat(p.price || 0),
        isActive: !!p.is_active,
        thumbnail1: p.thumbnail_1,
        thumbnail2: p.thumbnail_2,
        categoryName: p.category_name,
        brandName: p.brand_name,
        displayOrder: p.display_order,
        relationId: p.relation_id
      }))
    });
  } catch (error) {
    console.error('Get section products error:', error);
    return errorResponse('Failed to fetch products: ' + error.message, 500);
  }
};
