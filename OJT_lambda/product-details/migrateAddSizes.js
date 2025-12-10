// Lambda: Migration - Add sizes column to ProductDetails
// Run once to add sizes JSON column and migrate existing data
const { getMany, update } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const results = [];

    // Step 1: Try to add sizes column (will fail silently if exists)
    try {
      await update(`ALTER TABLE ProductDetails ADD COLUMN sizes TEXT NULL`);
      results.push('Added sizes column');
    } catch (e) {
      results.push('sizes column already exists or error: ' + e.message);
    }

    // Step 2: Try to add description column
    try {
      await update(`ALTER TABLE ProductDetails ADD COLUMN description TEXT NULL`);
      results.push('Added description column');
    } catch (e) {
      results.push('description column already exists or error: ' + e.message);
    }

    // Step 3: Migrate existing data - convert size/amount to sizes JSON
    try {
      const rows = await getMany(`SELECT pd_id, size, amount FROM ProductDetails WHERE sizes IS NULL AND size IS NOT NULL`);
      
      for (const row of rows) {
        const sizesJson = JSON.stringify([{ size: row.size, amount: row.amount || 0 }]);
        await update(`UPDATE ProductDetails SET sizes = ? WHERE pd_id = ?`, [sizesJson, row.pd_id]);
      }
      results.push(`Migrated ${rows.length} existing records`);
    } catch (e) {
      results.push('Migration error: ' + e.message);
    }

    // Step 4: Verify
    const sample = await getMany(`SELECT pd_id, color_name, size, amount, sizes FROM ProductDetails LIMIT 3`);

    return successResponse({
      message: 'Migration completed',
      results,
      sample
    });
  } catch (error) {
    console.error('Migration error:', error);
    return errorResponse('Migration failed: ' + error.message, 500);
  }
};
