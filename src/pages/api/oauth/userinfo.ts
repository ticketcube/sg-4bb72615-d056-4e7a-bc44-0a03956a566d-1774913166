import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const accessToken = authHeader.replace("Bearer ", "");
  const supabase = supabaseAdmin;

  // Verify access token
  const { data: accessTokenData, error: tokenError } = await supabase
    .from("access_tokens")
    .select("*")
    .eq("token", accessToken)
    .is("revoked_at", null)
    .single();

  if (tokenError || !accessTokenData) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  // Check if token is expired
  if (new Date(accessTokenData.expires_at) < new Date()) {
    return res.status(401).json({ error: "Access token expired" });
  }

  // Get user information
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(accessTokenData.user_id);

  if (userError || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Get user profile if exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.user.id)
    .single();

  // Build response based on requested scopes
  const scopes = accessTokenData.scopes.split(" ");
  const userInfo: any = {
    sub: user.user.id,
  };

  if (scopes.includes("profile")) {
    userInfo.name = profile?.full_name || "";
    userInfo.picture = profile?.avatar_url || "";
    userInfo.updated_at = profile?.updated_at || user.user.updated_at;
  }

  if (scopes.includes("email")) {
    userInfo.email = user.user.email || "";
    userInfo.email_verified = user.user.email_confirmed_at !== null;
  }

  return res.status(200).json(userInfo);
}