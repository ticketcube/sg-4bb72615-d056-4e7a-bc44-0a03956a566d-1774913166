import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const accessToken = authHeader.substring(7);

  // Verify access token
  const { data: tokenData, error: tokenError } = await supabase
    .from("access_tokens")
    .select("*")
    .eq("token", accessToken)
    .single();

  if (tokenError || !tokenData) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    return res.status(401).json({ error: "Access token expired" });
  }

  // Get user information from Supabase Auth
  const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
    tokenData.user_id
  );

  if (userError || !user) {
    return res.status(500).json({ error: "Failed to fetch user information" });
  }

  // Parse requested scopes
  const scopes = tokenData.scope.split(" ");
  const userInfo: Record<string, unknown> = {};

  if (scopes.includes("openid")) {
    userInfo.sub = user.id;
  }

  if (scopes.includes("profile")) {
    userInfo.name = user.user_metadata?.full_name || null;
    userInfo.picture = user.user_metadata?.avatar_url || null;
    userInfo.updated_at = user.updated_at;
  }

  if (scopes.includes("email")) {
    userInfo.email = user.email;
    userInfo.email_verified = user.email_confirmed_at !== null;
  }

  return res.status(200).json(userInfo);
}