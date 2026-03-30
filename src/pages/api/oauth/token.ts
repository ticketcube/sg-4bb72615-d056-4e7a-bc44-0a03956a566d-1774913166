import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { generateAccessToken, generateRefreshToken, verifyClientSecret } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = req.body;

  if (!grant_type || !client_id || !client_secret) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Verify client credentials
  const { data: application, error: appError } = await supabase
    .from("oauth_applications")
    .select("*")
    .eq("client_id", client_id)
    .eq("status", "active")
    .single();

  if (appError || !application) {
    return res.status(401).json({ error: "Invalid client credentials" });
  }

  if (!verifyClientSecret(client_secret, application.client_secret)) {
    return res.status(401).json({ error: "Invalid client credentials" });
  }

  if (grant_type === "authorization_code") {
    if (!code || !redirect_uri) {
      return res.status(400).json({ error: "Missing code or redirect_uri" });
    }

    // Verify authorization code
    const { data: authCode, error: codeError } = await supabase
      .from("authorization_codes")
      .select("*")
      .eq("code", code)
      .eq("client_id", client_id)
      .eq("redirect_uri", redirect_uri)
      .eq("used", false)
      .single();

    if (codeError || !authCode) {
      return res.status(400).json({ error: "Invalid or expired authorization code" });
    }

    // Check if code is expired
    if (new Date(authCode.expires_at) < new Date()) {
      return res.status(400).json({ error: "Authorization code expired" });
    }

    // Mark code as used
    await supabase
      .from("authorization_codes")
      .update({ used: true })
      .eq("id", authCode.id);

    // Generate tokens
    const accessToken = generateAccessToken();
    const refreshTokenValue = generateRefreshToken();
    const accessTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days

    // Store access token
    const { data: accessTokenData, error: accessError } = await supabase
      .from("access_tokens")
      .insert({
        token: accessToken,
        client_id,
        user_id: authCode.user_id,
        scope: authCode.scope,
        expires_at: accessTokenExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (accessError || !accessTokenData) {
      return res.status(500).json({ error: "Failed to generate access token" });
    }

    // Store refresh token
    await supabase
      .from("refresh_tokens")
      .insert({
        token: refreshTokenValue,
        access_token_id: accessTokenData.id,
        client_id,
        user_id: authCode.user_id,
        expires_at: refreshTokenExpiresAt.toISOString(),
      });

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshTokenValue,
      scope: authCode.scope,
    });
  } else if (grant_type === "refresh_token") {
    if (!refresh_token) {
      return res.status(400).json({ error: "Missing refresh_token" });
    }

    // Verify refresh token
    const { data: refreshTokenData, error: refreshError } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", refresh_token)
      .eq("client_id", client_id)
      .single();

    if (refreshError || !refreshTokenData) {
      return res.status(400).json({ error: "Invalid refresh token" });
    }

    if (new Date(refreshTokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: "Refresh token expired" });
    }

    // Get the old access token to get scope
    const { data: oldAccessToken } = await supabase
      .from("access_tokens")
      .select("scope")
      .eq("id", refreshTokenData.access_token_id)
      .single();

    // Generate new access token
    const newAccessToken = generateAccessToken();
    const accessTokenExpiresAt = new Date(Date.now() + 3600 * 1000);

    const { data: newAccessTokenData, error: newAccessError } = await supabase
      .from("access_tokens")
      .insert({
        token: newAccessToken,
        client_id,
        user_id: refreshTokenData.user_id,
        scope: oldAccessToken?.scope || "openid profile email",
        expires_at: accessTokenExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (newAccessError || !newAccessTokenData) {
      return res.status(500).json({ error: "Failed to generate access token" });
    }

    // Update refresh token to point to new access token
    await supabase
      .from("refresh_tokens")
      .update({ access_token_id: newAccessTokenData.id })
      .eq("id", refreshTokenData.id);

    return res.status(200).json({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: oldAccessToken?.scope || "openid profile email",
    });
  }

  return res.status(400).json({ error: "Unsupported grant_type" });
}