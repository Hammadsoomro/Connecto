# Sub-Account Login Implementation

## Overview
This document describes the implementation of email and password login functionality for sub-accounts in the Connecto application.

## Features Implemented

### 1. Sub-Account Login UI
- **Location**: `client/pages/Login.tsx`
- **Features**:
  - Added tabs for "Main Account" and "Sub Account" login
  - Separate form fields for sub-account email and password
  - Different styling for sub-account login (blue gradient vs purple for main account)
  - Proper error handling for both login types

### 2. Backend Authentication
- **Location**: `server/routes/auth.ts`
- **Features**:
  - Updated `authenticateToken` middleware to handle both user and sub-account tokens
  - Sub-account tokens contain `type: "sub-account"` field
  - Proper user context creation for sub-accounts using parent user ID

### 3. Database Support
- **Location**: `server/database.ts`
- **Features**:
  - Added `getSubAccountById()` method
  - Sub-accounts already had email and password fields in the database schema

### 4. Sub-Account Restrictions
- **SMS Routes** (`server/routes/sms.ts`):
  - Sub-accounts can only send SMS from their assigned phone number
  - Validation to ensure sub-account has an assigned number

- **Phone Number Routes** (`server/routes/phone-numbers.ts`):
  - Sub-accounts can only see their assigned phone number
  - Sub-accounts cannot purchase new numbers
  - Sub-accounts cannot set primary numbers

- **Sub-Account Management** (`server/routes/sub-accounts.ts`):
  - Sub-accounts cannot create, update, or delete other sub-accounts
  - Sub-accounts cannot access sub-account management features

### 5. Frontend Context
- **Location**: `client/contexts/AuthContext.tsx`
- **Features**:
  - `loginSubAccount()` function already existed
  - Proper token and user state management for sub-accounts
  - `isSubAccount` flag to differentiate between account types

### 6. Sub-Account Creation
- **Location**: `client/components/SubAccountsDialog.tsx`
- **Features**:
  - Form includes email and password fields
  - Proper validation and error handling
  - Integration with backend API

## How Sub-Account Login Works

1. **User Interface**:
   - User clicks on "Sub Account" tab in login page
   - Enters sub-account email and password
   - Clicks "Sign In as Sub-Account" button

2. **Authentication Flow**:
   - Frontend calls `/api/auth/sub-account-login` endpoint
   - Backend validates email and password against sub-accounts collection
   - JWT token is generated with sub-account specific payload:
     ```json
     {
       "id": "sub-account-id",
       "type": "sub-account",
       "parentUserId": "parent-user-id",
       "assignedNumber": "phone-number"
     }
     ```

3. **Authorization**:
   - All subsequent API calls use the sub-account token
   - Middleware identifies sub-account tokens and applies appropriate restrictions
   - Sub-account gets access to parent user's resources but with limited permissions

## API Endpoints

### Sub-Account Login
```
POST /api/auth/sub-account-login
Content-Type: application/json

{
  "email": "subaccount@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "id": "sub-account-id",
    "userId": "parent-user-id",
    "name": "Sub Account Name",
    "email": "subaccount@example.com",
    "friendlyName": "Sub Account Name",
    "status": "active",
    "assignedNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "isSubAccount": true
}
```

## Security Features

1. **Password Hashing**: Sub-account passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication with 7-day expiration
3. **Permission Restrictions**: Sub-accounts have limited access to features
4. **Number Assignment**: Sub-accounts can only use their assigned phone number

## Usage Instructions

1. **Creating Sub-Accounts**:
   - Main account users can create up to 3 sub-accounts
   - Each sub-account requires name, email, and password
   - Optionally assign a phone number during creation

2. **Sub-Account Login**:
   - Go to login page
   - Click "Sub Account" tab
   - Enter sub-account email and password
   - Click "Sign In as Sub-Account"

3. **Sub-Account Capabilities**:
   - Send and receive SMS using assigned phone number
   - View contacts and messages
   - Cannot purchase phone numbers
   - Cannot manage other sub-accounts
   - Cannot access billing or account settings

## Files Modified

- `client/pages/Login.tsx` - Added sub-account login UI
- `server/routes/auth.ts` - Updated authentication middleware
- `server/database.ts` - Added getSubAccountById method
- `server/routes/sms.ts` - Added sub-account restrictions
- `server/routes/phone-numbers.ts` - Added sub-account restrictions
- `server/routes/sub-accounts.ts` - Added sub-account restrictions

## Testing

To test the sub-account login functionality:

1. Create a main account
2. Create a sub-account with email and password
3. Logout from main account
4. Use sub-account login tab with the created credentials
5. Verify that sub-account has limited access as expected

The implementation is now complete and ready for use!