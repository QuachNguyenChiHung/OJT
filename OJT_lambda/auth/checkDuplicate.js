// Lambda: Check Duplicate Username/Phone in RDS
// POST /auth/check-duplicate
// Kiểm tra trong database RDS thay vì Cognito
const { getOne } = require('./shared/database');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

exports.handler = async (event) => {
  try {
    const { field, value } = parseBody(event);

    if (!field || !value) {
      return errorResponse('Field and value are required', 400);
    }

    // Chỉ kiểm tra username và phone
    const allowedFields = ['username', 'phone'];
    if (!allowedFields.includes(field)) {
      return errorResponse('Invalid field. Must be: username or phone', 400);
    }

    let sql;
    let fieldLabel;
    
    switch (field) {
      case 'username':
        // Schema v2: Users table với cột u_name
        sql = 'SELECT user_id FROM Users WHERE u_name = ?';
        fieldLabel = 'Username';
        break;
      case 'phone':
        if (!value || value.trim() === '') {
          return successResponse({ field, value, exists: false, message: null });
        }
        // Schema v2: Users table với cột phone_number
        sql = 'SELECT user_id FROM Users WHERE phone_number = ?';
        fieldLabel = 'Số điện thoại';
        break;
    }

    const result = await getOne(sql, [value]);
    const exists = !!result;

    return successResponse({
      field,
      value,
      exists,
      message: exists ? `${fieldLabel} đã được sử dụng` : null
    });

  } catch (error) {
    console.error('Check duplicate error:', error);
    return errorResponse('Lỗi kiểm tra: ' + error.message, 500);
  }
};
