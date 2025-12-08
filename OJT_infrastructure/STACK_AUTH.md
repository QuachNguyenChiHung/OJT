# 🔐 Auth Stack - Cognito User Management

## 📋 Stack Information

**Stack Name:** `OJT-AuthStack`  
**Purpose:** User authentication và authorization với Cognito  
**Deploy Order:** 2 (Sau Network Stack, song song với Database/Storage)

---

## 🏗️ AWS Services

### 1. **Amazon Cognito User Pool**
- **Service:** Cognito User Pools
- **Purpose:** User registration, authentication, account recovery

#### User Pool Configuration
- **Pool Name:** `OJT-UserPool-{environment}`
- **Sign-in Options:**
  - Email address
  - Username (optional)
- **Password Policy:**
  - Minimum length: 8 characters
  - Require uppercase: Yes
  - Require lowercase: Yes
  - Require numbers: Yes
  - Require symbols: Yes
  - Temporary password expiry: 7 days

#### User Attributes
##### Standard Attributes
- `email` (required, verified)
- `name` (full name)
- `phone_number` (optional)
- `address` (optional)

##### Custom Attributes
- `custom:role` (Customer | Admin)
- `custom:userId` (Reference to RDS User table)
- `custom:isActive` (account status)

#### Email Configuration
- **Verification:** Email verification required
- **Email Provider:** Amazon SES (hoặc Cognito default)
- **From Email:** noreply@yourdomain.com
- **Verification Message:** 
  ```
  Your verification code is {####}
  ```

#### Account Recovery
- **Recovery Methods:**
  - Email (preferred)
  - Phone SMS (optional)
- **MFA:** Optional
  - SMS MFA
  - TOTP MFA (Google Authenticator)

#### Lambda Triggers (Optional)
- **Pre Sign-up:** Validate email domain
- **Post Confirmation:** Create user in RDS
- **Pre Authentication:** Custom validation
- **Post Authentication:** Logging

### 2. **App Client**
- **Client Name:** `OJT-WebClient`
- **Client Type:** Public (frontend SPA)
- **Auth Flows:**
  - USER_PASSWORD_AUTH (username/password)
  - REFRESH_TOKEN_AUTH (token refresh)
- **Token Expiration:**
  - ID Token: 1 hour
  - Access Token: 1 hour
  - Refresh Token: 30 days
- **OAuth 2.0:**
  - Enabled (optional)
  - Allowed flows: Implicit grant
  - Scopes: openid, email, profile

### 3. **Amazon Cognito Identity Pool**
- **Service:** Cognito Federated Identities
- **Purpose:** Provide AWS credentials cho authenticated users

#### Identity Pool Configuration
- **Pool Name:** `OJT-IdentityPool-{environment}`
- **Allow Unauthenticated Access:** No
- **Authentication Providers:**
  - Cognito User Pool
  - (Optional) Facebook, Google, etc.

#### IAM Roles
##### Authenticated Role
```
Permissions:
- s3:PutObject (upload images)
- s3:GetObject (read images)
- execute-api:Invoke (call API Gateway)
```

##### Unauthenticated Role
```
Permissions:
- None (not used)
```

---

## 📊 Authentication Architecture

```
┌──────────────────────────────────────────────────┐
│                Frontend (React)                   │
│                                                   │
│  User enters: email, password                     │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│           Cognito User Pool                       │
│                                                   │
│  1. Verify credentials                            │
│  2. Check email verified                          │
│  3. Validate password policy                      │
│  4. Issue tokens:                                 │
│     - ID Token (user info)                        │
│     - Access Token (API access)                   │
│     - Refresh Token (renew)                       │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Cognito Identity Pool                     │
│                                                   │
│  Exchange Cognito token for:                      │
│  - AWS Access Key ID                              │
│  - AWS Secret Access Key                          │
│  - Session Token                                  │
│                                                   │
│  Assume IAM Role: Authenticated-Role              │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   AWS Services         │
        │                        │
        │  - S3 (upload images)  │
        │  - API Gateway         │
        │  - Lambda              │
        └────────────────────────┘


User Registration Flow:
┌─────────────┐
│ Sign Up     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Cognito User Pool   │
│ - Create user       │
│ - Send verify email │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User clicks email   │
│ Verify code         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Lambda Trigger      │
│ (Post Confirmation) │
│ - Create in RDS     │
└─────────────────────┘
```

---

## 🔑 Token Structure

### ID Token (JWT)
```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email_verified": true,
  "custom:role": "Customer",
  "custom:userId": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1638360000,
  "exp": 1638363600
}
```

### Access Token (JWT)
```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "token_use": "access",
  "scope": "openid email profile",
  "auth_time": 1638360000,
  "iat": 1638360000,
  "exp": 1638363600,
  "client_id": "abc123xyz456"
}
```

---

## 💰 Cost Estimate

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| Cognito User Pool | 1,000 MAU | FREE (first 50k) |
| Cognito Identity Pool | 1,000 users | FREE |
| SES (email verification) | 1,000 emails | FREE (first 62k) |
| **Total** | | **$0/month** |

**Free Tier:**
- User Pool: 50,000 MAU (Monthly Active Users) free
- Identity Pool: Always free
- SES: 62,000 emails/month free (if from EC2)

**Paid Tier (if exceed):**
- MAU 50,001 - 100,000: $0.00550 per MAU
- Advanced Security: +$0.05 per MAU

---

## 🔐 Security Features

### Password Security
- ✅ **Strong Password Policy:** 8+ chars, mixed case, numbers, symbols
- ✅ **Password Hashing:** bcrypt by Cognito
- ✅ **Brute Force Protection:** Account lockout after failed attempts
- ✅ **Temporary Password Expiry:** 7 days

### Account Security
- ✅ **Email Verification:** Required before login
- ✅ **MFA:** Optional (SMS or TOTP)
- ✅ **Account Recovery:** Via email
- ✅ **Session Management:** Configurable token expiry

### Advanced Security (Optional)
- ✅ **Adaptive Authentication:** ML-based risk detection
- ✅ **Compromised Credentials Check:** Against known breaches
- ✅ **Device Tracking:** Remember trusted devices

### Token Security
- ✅ **JWT Tokens:** Signed and verifiable
- ✅ **Short-lived Tokens:** 1 hour expiry
- ✅ **Refresh Token Rotation:** Optional
- ✅ **Token Revocation:** Via sign out

---

## 📤 Outputs

Stack này export các values sau:

| Output Name | Description | Used By |
|------------|-------------|---------|
| `UserPoolId` | Cognito User Pool ID | Frontend, API Stack |
| `UserPoolArn` | User Pool ARN | API Gateway auth |
| `UserPoolClientId` | App Client ID | Frontend auth |
| `IdentityPoolId` | Identity Pool ID | Frontend AWS SDK |

---

## 🚀 Deployment

```bash
# Deploy auth stack
cd OJT_infrastructure
npm run deploy:core

# Hoặc deploy riêng
cdk deploy OJT-AuthStack
```

**Deploy Time:** ~3 minutes

---

## 🔍 Verification

```bash
# Get User Pool details
aws cognito-idp describe-user-pool --user-pool-id ap-southeast-1_ABC123

# List users
aws cognito-idp list-users --user-pool-id ap-southeast-1_ABC123

# Create test user
aws cognito-idp admin-create-user \
  --user-pool-id ap-southeast-1_ABC123 \
  --username testuser@example.com \
  --user-attributes Name=email,Value=testuser@example.com Name=name,Value="Test User"

# Verify user email
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id ap-southeast-1_ABC123 \
  --username testuser@example.com
```

---

## 💻 Frontend Integration

### Installation
```bash
npm install amazon-cognito-identity-js
# or
npm install aws-amplify
```

### Sign Up
```javascript
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-southeast-1_ABC123',
  ClientId: 'abc123xyz456'
};

const userPool = new CognitoUserPool(poolData);

const signUp = (email, password, name) => {
  const attributeList = [
    { Name: 'email', Value: email },
    { Name: 'name', Value: name }
  ];

  userPool.signUp(email, password, attributeList, null, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('User registered:', result.user.getUsername());
  });
};
```

### Sign In
```javascript
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

const signIn = (email, password) => {
  const authenticationData = {
    Username: email,
    Password: password
  };
  
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  
  const userData = {
    Username: email,
    Pool: userPool
  };
  
  const cognitoUser = new CognitoUser(userData);
  
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      console.log('Login successful');
    },
    onFailure: (err) => {
      console.error(err);
    }
  });
};
```

### Get Current User
```javascript
const getCurrentUser = () => {
  const cognitoUser = userPool.getCurrentUser();
  
  if (cognitoUser) {
    cognitoUser.getSession((err, session) => {
      if (err) {
        console.error(err);
        return;
      }
      
      if (session.isValid()) {
        const idToken = session.getIdToken().payload;
        console.log('User:', idToken.email);
        console.log('Role:', idToken['custom:role']);
      }
    });
  }
};
```

---

## 🎯 User Lifecycle

### Registration
1. User nhập email, password, name
2. Cognito creates user (UNCONFIRMED status)
3. Email verification code sent
4. User enters code
5. Status → CONFIRMED
6. Lambda trigger creates user in RDS

### Login
1. User nhập email, password
2. Cognito validates credentials
3. Returns tokens (ID, Access, Refresh)
4. Frontend stores tokens
5. Use Access Token for API calls

### Password Reset
1. User clicks "Forgot Password"
2. Cognito sends reset code to email
3. User enters code + new password
4. Password updated

### Logout
1. User clicks logout
2. Frontend clears tokens
3. Optional: Call global sign out API

---

## 📊 Monitoring

### CloudWatch Metrics
- **SignInSuccesses:** Successful logins
- **SignInFailures:** Failed login attempts
- **SignUpSuccesses:** New registrations
- **TokenRefreshSuccesses:** Token refreshes
- **UserNotFound:** Invalid usernames
- **PasswordResetRequested:** Password reset requests

### CloudWatch Logs
- Authentication events
- User creation events
- Token issuance
- Lambda trigger executions

---

## 📚 Related Documentation

- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Cognito Identity Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html)
- [AWS Amplify Auth](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Cognito Security Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-security.html)

---

## ⚠️ Important Notes

1. **Email Verification Required:** Users phải verify email trước khi login
2. **Custom Attributes:** `custom:role`, `custom:userId` để sync với RDS
3. **Token Storage:** Store tokens securely (httpOnly cookies preferred)
4. **Token Refresh:** Implement refresh token flow
5. **MFA:** Consider enabling cho admin users
6. **Advanced Security:** Enable nếu cần fraud detection

---

## 🔄 Cognito vs JWT (Lambda)

**Current Implementation:** Dùng cả 2 approaches

### Option 1: Cognito Only
- ✅ Managed service (no code)
- ✅ Built-in security features
- ✅ Easy frontend integration
- ❌ Vendor lock-in

### Option 2: Custom JWT (Lambda)
- ✅ Full control
- ✅ Custom logic
- ✅ Database-based users
- ❌ More code to maintain

**Recommendation:** Dùng Cognito cho authentication, custom JWT cho authorization

---

**Stack Status:** ✅ Production Ready (Optional - có thể dùng JWT thay thế)  
**Last Updated:** December 2025
