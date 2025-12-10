// Lambda: Get All Home Sections with Products
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async () => {
  try {
    // Get all active sections ordered by display_order
    const sections = await getMany(`
      SELECT section_id, title, description, display_order, is_active, created_at
      FROM HomeSection
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at DESC
    `);

    // Get products for each section
    const result = await Promise.all(sections.map(async (section) => {
      const products = await getMany(`
        SELECT p.p_id, p.p_name, p.p_desc, p.price, p.is_active,
               p.thumbnail_1, p.thumbnail_2, p.c_id, p.brand_id,
               c.c_name as category_name, b.brand_name,
               hsp.display_order as product_order
        FROM HomeSectionProduct hsp
        JOIN Product p ON hsp.p_id = p.p_id
        LEFT JOIN Category c ON p.c_id = c.c_id
        LEFT JOIN Brand b ON p.brand_id = b.brand_id
        WHERE hsp.section_id = ? AND p.is_active = 1
        ORDER BY hsp.display_order ASC
      `, [section.section_id]);

      return {
        id: section.section_id,
        title: section.title,
        description: section.description,
        displayOrder: section.display_order,
        isActive: !!section.is_active,
        products: products.map(p => ({
          id: p.p_id,
          name: p.p_name,
          description: p.p_desc,
          price: parseFloat(p.price || 0),
          thumbnail1: p.thumbnail_1,
          thumbnail2: p.thumbnail_2,
          categoryId: p.c_id,
          categoryName: p.category_name,
          brandId: p.brand_id,
          brandName: p.brand_name,
          displayOrder: p.product_order
        }))
      };
    }));

    return successResponse(result);
  } catch (error) {
    console.error('Get sections error:', error);
    return errorResponse('Failed to fetch sections: ' + error.message, 500);
  }
};
