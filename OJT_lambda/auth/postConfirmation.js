// Cognito Post Confirmation Trigger
// Tạo user profile trong database khi user xác nhận tài khoản
const { insert, getOne } = require('./shared/database');
const { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({});

// Get user's groups from Cognito to determine role
const getUserRole = async (username, userPoolId) => {
  try {
    const command = new AdminListGroupsForUserCommand({
      Username: username,
      UserPoolId: userPoolId,
    });
    const response = await cognitoClient.send(command);
    
    // Check if user is in admin group
    const groups = response.Groups || [];
    const isAdmin = groups.some(g => g.GroupName === 'admin');
    const isEmployee = groups.some(g => g.GroupName === 'employee');
    
    if (isAdmin) return 'ADMIN';
    if (isEmployee) return 'EMPLOYEE';
    return 'USER';
  } catch (error) {
    console.error('Error getting user groups:', error);
    return 'USER'; // Default to USER if error
  }
};

exports.handler = async (event) => {
  console.log('PostConfirmation trigger:', JSON.stringify(event, null, 2));

  // Chỉ xử lý khi user confirm signup
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const { sub, email, name, phone_number } = event.request.userAttributes;
  const username = event.userName;
  const userPoolId = event.userPoolId;

  try {
    // Check if user already exists
    const existing = await getOne(
      'SELECT u_id FROM app_users WHERE u_id = ? OR email = ?',
      [sub, email]
    );

    if (existing) {
      console.log('User already exists in database');
      return event;
    }

    // Get role from Cognito groups
    const role = await getUserRole(username, userPoolId);
    console.log('User role from Cognito groups:', role);

    // Insert new user into database (MySQL)
    const sql = `INSERT INTO app_users (u_id, username, email, full_name, phone_number, role, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, TRUE)`;

    await insert(sql, [sub, username || email, email, name || null, phone_number || null, role]);

    console.log('User profile created successfully:', { sub, username, email, role });

  } catch (error) {
    console.error('Error creating user profile:', error);
    // Don't throw - let user continue even if DB insert fails
  }

  return event;
};
