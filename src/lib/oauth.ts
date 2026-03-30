import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export function generateClientId(): string {
  return `client_${uuidv4().replace(/-/g, "")}`;
}

export function generateClientSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateAuthorizationCode(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashClientSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function verifyClientSecret(secret: string, hash: string): boolean {
  return hashClientSecret(secret) === hash;
}

export const OAUTH_SCOPES = {
  "openid": "OpenID Connect authentication",
  "profile": "Access to user profile information",
  "email": "Access to user email address",
  "offline_access": "Refresh token for offline access",
} as const;

export type OAuthScope = keyof typeof OAUTH_SCOPES;

export function validateScopes(scopes: string): boolean {
  const requestedScopes = scopes.split(" ");
  return requestedScopes.every(scope => scope in OAUTH_SCOPES);
}