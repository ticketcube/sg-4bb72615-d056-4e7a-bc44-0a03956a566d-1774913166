# OAuth Identity Provider Setup Guide

> **📘 For Third-Party Developers:** If you want to integrate FanDragon authentication into your app, see [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) instead. This file is for FanDragon administrators setting up the identity provider.

---

This application is configured as a complete OAuth 2.0 identity provider using Supabase Auth.

## Quick Setup Steps

### 1. Database Migration

Run the following SQL in your Supabase SQL Editor to add the required token tables:

```bash
# Copy contents from supabase-schema.sql and run in Supabase SQL Editor
```

This adds two new tables to your existing schema:
- `access_tokens` - Short-lived tokens for API access
- `refresh_tokens` - Long-lived tokens for obtaining new access tokens

### 2. Environment Variables

Your `.env.local` should already have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://buhfuaxrtaozpqlxgerj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for token endpoints
```

**Important:** Add your Supabase Service Role Key from: Project Settings → API → service_role key

### 3. Enable Supabase Email Auth

1. Go to Authentication → Providers in Supabase Dashboard
2. Enable "Email" provider
3. Configure Site URL: `http://localhost:3000` (or your production URL)
4. Set Redirect URLs to include your OAuth callback paths

## OAuth 2.0 Flow

### Standard Authorization Code Flow

```
1. Third-party app redirects user to:
   GET /api/oauth/authorize?
     client_id=xxx&
     redirect_uri=https://app.com/callback&
     response_type=code&
     scope=profile email&
     state=random_string

2. User logs in (if not authenticated) → /auth/login

3. User grants consent → /auth/consent

4. User redirected back with authorization code:
   https://app.com/callback?code=xxx&state=random_string

5. Third-party app exchanges code for tokens:
   POST /api/oauth/token
   Body: {
     grant_type: "authorization_code",
     code: "xxx",
     redirect_uri: "https://app.com/callback",
     client_id: "xxx",
     client_secret: "xxx"
   }

6. Response:
   {
     access_token: "xxx",
     token_type: "Bearer",
     expires_in: 7200,
     refresh_token: "xxx",
     scope: "profile email"
   }

7. Third-party app fetches user info:
   GET /api/oauth/userinfo
   Header: Authorization: Bearer {access_token}
```

## API Endpoints

### `/api/oauth/authorize` (GET)
Initiates OAuth authorization flow. Redirects to login/consent pages.

**Query Parameters:**
- `client_id` (required) - OAuth client identifier
- `redirect_uri` (required) - Callback URL (must match registered URI)
- `response_type` (required) - Must be "code"
- `scope` (optional) - Space-separated scopes (default: "profile email")
- `state` (recommended) - Random string for CSRF protection
- `code_challenge` (optional) - PKCE code challenge
- `code_challenge_method` (optional) - "S256" or "plain"

### `/api/oauth/token` (POST)
Exchanges authorization code for access/refresh tokens.

**Body (authorization_code grant):**
```json
{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "redirect_uri": "https://app.com/callback",
  "client_id": "client_id",
  "client_secret": "client_secret",
  "code_verifier": "verifier_for_pkce" // optional
}
```

**Body (refresh_token grant):**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "refresh_token",
  "client_id": "client_id",
  "client_secret": "client_secret"
}
```

### `/api/oauth/userinfo` (GET)
Returns user profile information based on granted scopes.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://avatar.url/image.jpg",
  "updated_at": "2024-03-30T12:00:00Z"
}
```

## Client Application Integration

### Step 1: Register Your Application

1. Log in to the identity provider dashboard
2. Click "New Application"
3. Fill in:
   - Application name
   - Description
   - Logo URL (optional)
   - Redirect URIs (one per line)
4. Save and securely store the `client_secret` (shown only once)

### Step 2: Client-Side Implementation

**Example using plain JavaScript:**

```javascript
// 1. Redirect to authorization endpoint
const authUrl = new URL('https://your-idp.com/api/oauth/authorize');
authUrl.searchParams.set('client_id', 'your_client_id');
authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'profile email');
authUrl.searchParams.set('state', generateRandomState());

window.location.href = authUrl.toString();

// 2. Handle callback (server-side)
// GET https://yourapp.com/callback?code=xxx&state=xxx

// 3. Exchange code for token (server-side)
const tokenResponse = await fetch('https://your-idp.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://yourapp.com/callback',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret'
  })
});

const { access_token, refresh_token } = await tokenResponse.json();

// 4. Fetch user info
const userResponse = await fetch('https://your-idp.com/api/oauth/userinfo', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const user = await userResponse.json();
```

## Security Best Practices

1. **Never expose client_secret** in client-side code
2. **Always validate redirect_uri** matches registered URIs
3. **Use PKCE** for public clients (mobile apps, SPAs)
4. **Implement state parameter** for CSRF protection
5. **Use HTTPS** in production for all OAuth URLs
6. **Rotate client secrets** regularly
7. **Set appropriate token expiration times**:
   - Access tokens: 2 hours
   - Refresh tokens: 30 days
8. **Implement token revocation** for user logout

## Database Schema

Your existing tables are extended with:

**access_tokens**
- Stores short-lived tokens (2 hours)
- Links to user, client, and granted scopes
- Supports revocation

**refresh_tokens**
- Stores long-lived tokens (30 days)
- Links to access token for rotation
- Supports revocation

Both tables have Row Level Security enabled and proper indexes for performance.

## Troubleshooting

**"Invalid client credentials"**
- Verify client_id and client_secret are correct
- Check that client hasn't been deleted

**"Invalid redirect_uri"**
- Ensure redirect_uri exactly matches registered URI (including trailing slashes)

**"Invalid authorization code"**
- Codes expire after 10 minutes
- Codes can only be used once
- Verify code hasn't been tampered with

**"Access token expired"**
- Use refresh token to obtain new access token
- Implement automatic token refresh in your client

## Support

For issues or questions, check:
1. Supabase logs for server-side errors
2. Browser console for client-side errors
3. Verify database tables were created successfully
4. Ensure environment variables are set correctly