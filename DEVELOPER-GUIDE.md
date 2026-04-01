# FanDragon OAuth Integration Guide

Integrate FanDragon authentication into your application to provide secure, OAuth 2.0-based user login.

## Overview

FanDragon is an OAuth 2.0 identity provider that allows your application to authenticate users without handling passwords directly. Users sign in with their FanDragon account, and your app receives verified user information.

**Base URL:** `https://fandragon.com`

---

## Quick Start

### 1. Register Your Application

1. Visit https://fandragon.com and sign in
2. Click **"New Application"**
3. Fill in:
   - **Application Name** (e.g., "My Fan App")
   - **Description** (what your app does)
   - **Logo URL** (optional, shown to users during consent)
   - **Redirect URIs** (your callback URLs, one per line)
     ```
     https://yourapp.com/auth/callback
     https://localhost:3000/auth/callback
     ```
4. Click **Save**
5. **IMPORTANT:** Copy your `client_secret` - it's only shown once!

You'll receive:
- **Client ID**: Public identifier for your app
- **Client Secret**: Secret key (keep this secure!)

---

## OAuth 2.0 Flow

### Standard Authorization Code Flow

```
┌─────────────┐                                  ┌──────────────┐
│   Your App  │                                  │  FanDragon   │
└──────┬──────┘                                  └──────┬───────┘
       │                                                │
       │  1. Redirect user to authorize URL            │
       │──────────────────────────────────────────────>│
       │                                                │
       │                    2. User logs in (if needed)│
       │                    3. User grants permissions │
       │                                                │
       │  4. Redirect with authorization code          │
       │<──────────────────────────────────────────────│
       │                                                │
       │  5. Exchange code for tokens (POST)           │
       │──────────────────────────────────────────────>│
       │                                                │
       │  6. Return access_token + refresh_token       │
       │<──────────────────────────────────────────────│
       │                                                │
       │  7. Fetch user info with access_token         │
       │──────────────────────────────────────────────>│
       │                                                │
       │  8. Return user profile                       │
       │<──────────────────────────────────────────────│
```

---

## API Endpoints

### 1. Authorization Endpoint

**Endpoint:** `GET https://fandragon.com/api/oauth/authorize`

Redirects the user to FanDragon to log in and grant permissions.

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `redirect_uri` | Yes | Where to send the user after authorization (must match registered URI) |
| `response_type` | Yes | Must be `code` |
| `scope` | No | Space-separated scopes (default: `openid profile email`) |
| `state` | Recommended | Random string for CSRF protection |
| `code_challenge` | No | PKCE code challenge (for public clients) |
| `code_challenge_method` | No | `S256` or `plain` |

**Example:**
```javascript
const authUrl = new URL('https://fandragon.com/api/oauth/authorize');
authUrl.searchParams.set('client_id', 'your_client_id');
authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('state', generateRandomState());

// Redirect user
window.location.href = authUrl.toString();
```

**Response:**
User is redirected back to your `redirect_uri` with:
```
https://yourapp.com/callback?code=AUTHORIZATION_CODE&state=YOUR_STATE
```

---

### 2. Token Endpoint

**Endpoint:** `POST https://fandragon.com/api/oauth/token`

Exchange authorization code for access and refresh tokens.

**Headers:**
```
Content-Type: application/json
```

**Body (Authorization Code Grant):**
```json
{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "https://yourapp.com/callback",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "code_verifier": "verifier_for_pkce"  // Optional, if using PKCE
}
```

**Body (Refresh Token Grant):**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "your_refresh_token",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "def502003d8f...",
  "scope": "openid profile email"
}
```

**Example (Node.js):**
```javascript
const response = await fetch('https://fandragon.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: 'https://yourapp.com/callback',
    client_id: process.env.FANDRAGON_CLIENT_ID,
    client_secret: process.env.FANDRAGON_CLIENT_SECRET
  })
});

const { access_token, refresh_token } = await response.json();
```

---

### 3. UserInfo Endpoint

**Endpoint:** `GET https://fandragon.com/api/oauth/userinfo`

Retrieve authenticated user's profile information.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://avatar.url/image.jpg",
  "updated_at": "2024-03-30T12:00:00Z"
}
```

**Example:**
```javascript
const userResponse = await fetch('https://fandragon.com/api/oauth/userinfo', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const user = await userResponse.json();
console.log(`Welcome ${user.name}!`);
```

---

## Scopes

| Scope | Description |
|-------|-------------|
| `openid` | Returns `sub` (user ID) |
| `profile` | Returns `name`, `picture`, `updated_at` |
| `email` | Returns `email`, `email_verified` |

**Default scope:** `openid profile email`

---

## Code Examples

### JavaScript/Node.js (Express)

```javascript
const express = require('express');
const app = express();

// 1. Redirect to FanDragon for authentication
app.get('/auth/login', (req, res) => {
  const authUrl = new URL('https://fandragon.com/api/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.FANDRAGON_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/auth/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', req.session.state); // Store in session
  
  res.redirect(authUrl.toString());
});

// 2. Handle callback
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state to prevent CSRF
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state');
  }
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://fandragon.com/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://yourapp.com/auth/callback',
      client_id: process.env.FANDRAGON_CLIENT_ID,
      client_secret: process.env.FANDRAGON_CLIENT_SECRET
    })
  });
  
  const { access_token, refresh_token } = await tokenResponse.json();
  
  // Get user info
  const userResponse = await fetch('https://fandragon.com/api/oauth/userinfo', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  
  const user = await userResponse.json();
  
  // Store in session
  req.session.user = user;
  req.session.tokens = { access_token, refresh_token };
  
  res.redirect('/dashboard');
});
```

### Python (Flask)

```python
from flask import Flask, redirect, request, session
import requests

app = Flask(__name__)

@app.route('/auth/login')
def login():
    params = {
        'client_id': os.getenv('FANDRAGON_CLIENT_ID'),
        'redirect_uri': 'https://yourapp.com/auth/callback',
        'response_type': 'code',
        'scope': 'openid profile email',
        'state': session['state']  # Generate and store random state
    }
    auth_url = f"https://fandragon.com/api/oauth/authorize?{urlencode(params)}"
    return redirect(auth_url)

@app.route('/auth/callback')
def callback():
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Verify state
    if state != session.get('state'):
        return 'Invalid state', 400
    
    # Exchange code for tokens
    token_response = requests.post('https://fandragon.com/api/oauth/token', json={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': 'https://yourapp.com/auth/callback',
        'client_id': os.getenv('FANDRAGON_CLIENT_ID'),
        'client_secret': os.getenv('FANDRAGON_CLIENT_SECRET')
    })
    
    tokens = token_response.json()
    
    # Get user info
    user_response = requests.get('https://fandragon.com/api/oauth/userinfo',
        headers={'Authorization': f"Bearer {tokens['access_token']}"})
    
    user = user_response.json()
    session['user'] = user
    
    return redirect('/dashboard')
```

---

## Security Best Practices

### ✅ DO:
- **Store client_secret securely** - Never expose in client-side code
- **Validate redirect_uri** - Must match exactly (including trailing slashes)
- **Use state parameter** - Prevents CSRF attacks
- **Use PKCE for public clients** - Mobile apps, SPAs
- **Use HTTPS** - All OAuth URLs must use HTTPS in production
- **Rotate tokens regularly** - Implement refresh token flow
- **Validate tokens** - Check expiration before using
- **Store tokens securely** - Use secure, httpOnly cookies

### ❌ DON'T:
- Expose `client_secret` in frontend code
- Hardcode credentials in your codebase
- Skip state parameter validation
- Use HTTP in production
- Store access tokens in localStorage (use secure cookies)
- Share tokens between applications

---

## Token Expiration

| Token Type | Lifetime |
|------------|----------|
| Authorization Code | 10 minutes |
| Access Token | 2 hours |
| Refresh Token | 30 days |

### Refresh Token Flow

When your access token expires, use the refresh token to get a new one:

```javascript
const refreshResponse = await fetch('https://fandragon.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken,
    client_id: process.env.FANDRAGON_CLIENT_ID,
    client_secret: process.env.FANDRAGON_CLIENT_SECRET
  })
});

const { access_token, refresh_token } = await refreshResponse.json();
// Update stored tokens
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "invalid_request",
  "error_description": "Missing required parameter: redirect_uri"
}
```

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `invalid_client` | Invalid client_id or client_secret | Verify credentials |
| `invalid_grant` | Invalid or expired authorization code | Request new code |
| `invalid_request` | Missing required parameter | Check request format |
| `unauthorized_client` | redirect_uri not registered | Add URI in app settings |
| `access_denied` | User denied permission | Handle gracefully |
| `invalid_token` | Access token expired or invalid | Use refresh token |

---

## Testing

### Test Environment

Use these for local development:
```
Redirect URI: http://localhost:3000/auth/callback
```

Make sure to register `localhost` URLs in your FanDragon application settings.

### Test Flow

1. Visit your app's login page
2. Click "Sign in with FanDragon"
3. Log in to FanDragon (if not already)
4. Grant permissions
5. You should be redirected back with a valid code
6. Exchange code for tokens
7. Fetch user info

---

## Support

**Documentation:** https://fandragon.com/docs  
**Issues:** Contact support through your FanDragon dashboard  
**Status:** https://status.fandragon.com (coming soon)

---

## Changelog

**v1.0.0** - Initial OAuth 2.0 implementation
- Authorization Code Flow
- Refresh Token support
- PKCE support
- UserInfo endpoint