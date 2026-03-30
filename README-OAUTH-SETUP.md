# OAuth Provider Setup Instructions

## Database Schema Setup

1. **Go to Supabase SQL Editor**
   - Navigate to https://buhfuaxrtaozpqlxgerj.supabase.co
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the Schema SQL**
   - Copy the contents of `supabase-schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

This will create:
- `oauth_applications` - OAuth client applications
- `authorization_codes` - Temporary authorization codes
- `access_tokens` - Access tokens for API calls
- `refresh_tokens` - Long-lived refresh tokens
- Proper indexes and RLS policies

## Supabase Auth Configuration

1. **Enable Email Authentication**
   - Go to Authentication → Providers
   - Ensure Email provider is enabled

2. **Configure Site URL**
   - Go to Authentication → URL Configuration
   - Set Site URL to your development URL (e.g., `http://localhost:3000`)
   - Add redirect URLs for OAuth flow

3. **Optional: Enable Social Providers**
   - Configure Google, GitHub, etc. in Authentication → Providers
   - Users can then sign in with these providers and use your OAuth service

## Testing the OAuth Flow

1. **Create a test application**
   - Sign up/login to your dashboard
   - Create a new OAuth application
   - Note the Client ID and Client Secret

2. **Test Authorization Flow**
   ```
   GET /api/oauth/authorize?
     client_id=YOUR_CLIENT_ID
     &redirect_uri=YOUR_REDIRECT_URI
     &response_type=code
     &scope=openid profile email
     &state=random_state
   ```

3. **Exchange Code for Token**
   ```
   POST /api/oauth/token
   Content-Type: application/json
   
   {
     "grant_type": "authorization_code",
     "code": "AUTHORIZATION_CODE",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "redirect_uri": "YOUR_REDIRECT_URI"
   }
   ```

4. **Get User Info**
   ```
   GET /api/oauth/userinfo
   Authorization: Bearer ACCESS_TOKEN
   ```

## Security Best Practices

- Store client secrets securely (they are hashed in the database)
- Use HTTPS in production
- Validate redirect URIs strictly
- Implement rate limiting on token endpoints
- Set appropriate token expiration times
- Regularly rotate client secrets