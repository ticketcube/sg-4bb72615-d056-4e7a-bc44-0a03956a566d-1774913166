import type { NextApiRequest, NextApiResponse } from "next";
import { getServiceClient } from "@/lib/supabase";
import { generateAccessToken, generateRefreshToken } from "@/lib/oauth";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token, code_verifier } = req.body;

  if (!grant_type) {
    return res.status(400).json({ error: "Missing grant_type" });
  }

  const supabase = getServiceClient();

  // Verify client credentials
  const { data: client, error: clientError } = await supabase
    .from("oauth_clients")
    .select("*")
    .eq("client_id", client_id)
    .single();

  if (clientError || !client || client.client_secret !== client_secret) {
    return res.status(401).json({ error: "Invalid client credentials" });
  }

  // Handle authorization_code grant
  if (grant_type === "authorization_code") {
    if (!code || !redirect_uri) {
      return res.status(400).json({ error: "Missing code or redirect_uri" });
    }

    // Verify authorization code
    const { data: authorization, error: authError } = await supabase
      .from("oauth_authorizations")
      .select("*")
      .eq("authorization_code", code)
      .eq("client_id", client.id)
      .is("used_at", null)
      .single();

    if (authError || !authorization) {
      return res.status(400).json({ error: "Invalid or expired authorization code" });
    }

    // Check if code is expired
    if (new Date(authorization.expires_at) < new Date()) {
      return res.status(400).json({ error: "Authorization code expired" });
    }

    // Verify redirect URI matches
    if (authorization.redirect_uri !== redirect_uri) {
      return res.status(400).json({ error: "Redirect URI mismatch" });
    }

    // Verify PKCE if used
    if (authorization.code_challenge) {
      if (!code_verifier) {
        return res.status(400).json({ error: "Missing code_verifier for PKCE" });
      }

      const method = authorization.code_challenge_method || "plain";
      let challenge = code_verifier;

      if (method === "S256") {
        challenge = crypto.createHash("sha256").update(code_verifier).digest("base64url");
      }

      if (challenge !== authorization.code_challenge) {
        return res.status(400).json({ error: "Invalid code_verifier" });
      }
    }

    // Mark authorization code as used
    await supabase
      .from("oauth_authorizations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", authorization.id);

    // Generate access token
    const accessToken = generateAccessToken();
    const accessTokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const { data: newAccessToken, error: tokenError } = await supabase
      .from("access_tokens")
      .insert({
        token: accessToken,
        client_id: client.id,
        user_id: authorization.user_id,
        scopes: authorization.scopes,
        expires_at: accessTokenExpiry.toISOString(),
      })
      .select()
      .single();

    if (tokenError || !newAccessToken) {
      return res.status(500).json({ error: "Failed to create access token" });
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await supabase
      .from("refresh_tokens")
      .insert({
        token: refreshToken,
        access_token_id: newAccessToken.id,
        client_id: client.id,
        user_id: authorization.user_id,
        expires_at: refreshTokenExpiry.toISOString(),
      });

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 7200,
      refresh_token: refreshToken,
      scope: authorization.scopes,
    });
  }

  // Handle refresh_token grant
  if (grant_type === "refresh_token") {
    if (!refresh_token) {
      return res.status(400).json({ error: "Missing refresh_token" });
    }

    // Verify refresh token
    const { data: storedToken, error: tokenError } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", refresh_token)
      .eq("client_id", client.id)
      .is("revoked_at", null)
      .single();

    if (tokenError || !storedToken) {
      return res.status(400).json({ error: "Invalid refresh token" });
    }

    // Check if expired
    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(400).json({ error: "Refresh token expired" });
    }

    // Get scopes from original access token
    const { data: oldAccessToken } = await supabase
      .from("access_tokens")
      .select("scopes")
      .eq("id", storedToken.access_token_id)
      .single();

    // Generate new access token
    const newAccessToken = generateAccessToken();
    const accessTokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const { data: createdToken } = await supabase
      .from("access_tokens")
      .insert({
        token: newAccessToken,
        client_id: client.id,
        user_id: storedToken.user_id,
        scopes: oldAccessToken?.scopes || "profile email",
        expires_at: accessTokenExpiry.toISOString(),
      })
      .select()
      .single();

    if (!createdToken) {
      return res.status(500).json({ error: "Failed to create access token" });
    }

    // Update refresh token to point to new access token
    await supabase
      .from("refresh_tokens")
      .update({ access_token_id: createdToken.id })
      .eq("id", storedToken.id);

    return res.status(200).json({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 7200,
      scope: oldAccessToken?.scopes || "profile email",
    });
  }

  return res.status(400).json({ error: "Unsupported grant_type" });
}