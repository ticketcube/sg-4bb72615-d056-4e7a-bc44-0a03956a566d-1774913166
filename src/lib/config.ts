// Application configuration
export const APP_CONFIG = {
  name: "FanDragon",
  tagline: "Secure Identity Provider for Fan Communities",
  description: "Power your fan community apps with trusted OAuth authentication",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://fandragon.com",
};

// OAuth configuration
export const OAUTH_CONFIG = {
  AUTHORIZATION_CODE_EXPIRY: 600, // 10 minutes in seconds
  SUPPORTED_SCOPES: "openid profile email",
  DEFAULT_SCOPE: "openid profile email",
  TOKEN_EXPIRY: 3600, // 1 hour in seconds
};