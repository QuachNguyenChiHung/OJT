// Script to sync admin role from Cognito to database
// Run this once to update existing admin users

const mysql = require('mysql2/promise');
const { CognitoIdentityProviderClient, AdminListGroupsForUserCommand, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

const USER_POOL_ID = 'ap-southeast-1_opAAV3F1j';

// Database config - update with your values
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'demoaws',
  port: parseInt(process.env.DB_PORT || '3306'),
};

const getUserRole = async (username) => {
  try {
    const command = new AdminListGroupsForUserCommand({
      Username: username,
      UserPoolId: USER_POOL_ID,
    });
    const response = await cognitoClient.send(command);
    
    const groups = response.Groups || [];
    const isAdmin = groups.some(g => g.GroupName === 'admin');
    const isEmployee = groups.some(g => g.GroupName === 'employee');
    
    if (isAdmin) return 'ADMIN';
    if (isEmployee) return 'EMPLOYEE';
    return 'USER';
  } catch (error) {
    console.error('Error getting user groups:', error);
    return null;
  }
};

exports.handler = async (event) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // List all users in Cognito
    const listCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 60,
    });
    const usersResponse = await cognitoClient.send(listCommand);
    
    const results = [];
    
    for (const user of usersResponse.Users || []) {
      const username = user.Username;
      const sub = user.Attributes?.find(a => a.Name === 'sub')?.Value;
      
      if (!sub) continue;
      
      const role = await getUserRole(username);
      if (!role) continue;
      
      // Update role in database
      const [result] = await connection.execute(
        'UPDATE app_users SET role = ? WHERE u_id = ? OR username = ?',
        [role, sub, username]
      );
      
      results.push({
        username,
        sub,
        role,
        updated: result.affectedRows > 0,
      });
    }
    
    await connection.end();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Role sync completed',
        results,
      }),
    };
    
  } catch (error) {
    await connection.end();
    console.error('Sync error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
