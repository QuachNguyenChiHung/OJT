// Lambda: Sync Users between RDS and Cognito
const { getMany } = require('./shared/database');
const { successResponse, errorResponse } = require('./shared/response');
const { verifyToken, isAdmin } = require('./shared/auth');
const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_REGION = process.env.AWS_REGION || 'ap-southeast-1';

exports.handler = async (event) => {
  try {
    // Verify admin
    const user = await verifyToken(event);
    if (!user || !isAdmin(user)) {
      return errorResponse('Admin access required', 403);
    }

    // Get users from RDS (excluding ADMIN role since they don't exist in Cognito)
    const rdsSql = `SELECT user_id, email, u_name as name, role FROM Users WHERE role != 'ADMIN'`;
    const rdsUsers = await getMany(rdsSql);
    
    // Get users from Cognito
    let cognitoUsers = [];
    if (COGNITO_USER_POOL_ID) {
      try {
        const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });
        const listCommand = new ListUsersCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Limit: 60
        });
        const cognitoResponse = await cognitoClient.send(listCommand);
        cognitoUsers = (cognitoResponse.Users || []).map(u => {
          const emailAttr = u.Attributes?.find(a => a.Name === 'email');
          return {
            username: u.Username,
            email: emailAttr?.Value || u.Username,
            status: u.UserStatus,
            enabled: u.Enabled
          };
        });
      } catch (cognitoErr) {
        console.error('Cognito list users error:', cognitoErr);
        // Continue without Cognito data
      }
    }

    // Compare and find differences
    const rdsEmails = new Set(rdsUsers.map(u => u.email?.toLowerCase()));
    const cognitoEmails = new Set(cognitoUsers.map(u => u.email?.toLowerCase()));

    // Users in RDS but not in Cognito
    const onlyInRds = rdsUsers.filter(u => !cognitoEmails.has(u.email?.toLowerCase()));
    
    // Users in Cognito but not in RDS
    const onlyInCognito = cognitoUsers.filter(u => !rdsEmails.has(u.email?.toLowerCase()));

    // Users in both
    const inBoth = rdsUsers.filter(u => cognitoEmails.has(u.email?.toLowerCase()));

    // Get admin count (skipped from sync)
    const adminSql = `SELECT COUNT(*) as count FROM Users WHERE role = 'ADMIN'`;
    const adminResult = await getMany(adminSql);
    const adminCount = adminResult[0]?.count || 0;

    return successResponse({
      message: 'Đồng bộ hoàn tất',
      summary: {
        rdsTotal: rdsUsers.length,
        cognitoTotal: cognitoUsers.length,
        synced: inBoth.length,
        onlyInRds: onlyInRds.length,
        onlyInCognito: onlyInCognito.length,
        skipped: adminCount
      },
      details: {
        onlyInRds: onlyInRds.map(u => ({ email: u.email, name: u.name })),
        onlyInCognito: onlyInCognito.map(u => ({ email: u.email, status: u.status })),
        adminSkipped: `${adminCount} admin users (RDS only)`
      }
    });
  } catch (error) {
    console.error('Sync users error:', error);
    return errorResponse('Failed to sync users: ' + error.message, 500);
  }
};
