import type { NextApiRequest, NextApiResponse } from "next";
import { createAuthenticatedClient } from "@/lib/supabase";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const supabase = createAuthenticatedClient(accessToken);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "GET") {
      // Fetch user's OAuth applications
      const { data, error } = await supabase
        .from("oauth_clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Failed to fetch applications" });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === "POST") {
      const { client_name, redirect_uris, client_description, client_logo_url } = req.body;

      // Validate required fields
      if (!client_name || !redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate client credentials
      const client_id = `fd_${crypto.randomBytes(16).toString("hex")}`;
      const client_secret = crypto.randomBytes(32).toString("hex");

      // Insert new OAuth client
      const { data, error } = await supabase
        .from("oauth_clients")
        .insert({
          client_id,
          client_secret,
          client_name,
          client_description: client_description || null,
          client_logo_url: client_logo_url || null,
          redirect_uris,
          allowed_scopes: ["openid", "email", "profile"],
          is_active: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        return res.status(500).json({ 
          error: "Failed to create application",
          details: error.message 
        });
      }

      return res.status(201).json({
        ...data,
        client_secret, // Return secret only on creation
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}