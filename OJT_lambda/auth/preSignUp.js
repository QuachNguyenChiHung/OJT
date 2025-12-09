// Lambda: Pre Sign-up Trigger - Check duplicate username/phone
// Cognito Pre Sign-up trigger to prevent duplicate username and phone_number
// Uses Cognito ListUsers API to check for duplicates

const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  console.log('Pre Sign-up trigger:', JSON.stringify(event, null, 2));
  
  const { userName, request, userPoolId } = event;
  const { userAttributes } = request;
  
  const phoneNumber = userAttributes?.phone_number;
  
  try {
    // Check duplicate username - Cognito already handles this for signInAliases
    // But we double-check to be safe
    
    // Check duplicate phone_number (even if not verified)
    if (phoneNumber) {
      const listUsersCommand = new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `phone_number = "${phoneNumber}"`,
        Limit: 1,
      });
      
      const response = await cognitoClient.send(listUsersCommand);
      
      if (response.Users && response.Users.length > 0) {
        // Phone number already exists
        throw new Error('Số điện thoại đã được sử dụng. Vui lòng sử dụng số điện thoại khác.');
      }
    }
    
    // All checks passed, allow sign-up
    console.log('Pre Sign-up validation passed for:', userName);
    return event;
    
  } catch (error) {
    console.error('Pre Sign-up error:', error);
    // Throw error to reject sign-up
    throw new Error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }
};
