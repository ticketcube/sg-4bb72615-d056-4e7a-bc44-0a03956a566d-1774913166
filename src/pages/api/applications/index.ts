import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { generateClientId, generateClientSecret } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (req.method === "GET") {
      // List user's OAuth applications
      const { data: applications, error } = await supabase
        .from("oauth_clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(applications || []);
    }

    if (req.method === "POST") {
      const { client_name, client_description, redirect_uris, allowed_scopes, client_logo_url } = req.body;

      if (!client_name || !redirect_uris) {
        return res.status(400).json({ error: "Missing required fields: client_name and redirect_uris" });
      }

      const clientId = generateClientId();
      const clientSecret = generateClientSecret();

      const { data: newApp, error } = await supabase
        .from("oauth_clients")
        .insert({
          client_id: clientId,
          client_secret: clientSecret,
          client_name,
          client_description: client_description || null,
          client_logo_url: client_logo_url || null,
          redirect_uris: Array.isArray(redirect_uris) ? redirect_uris : [redirect_uris],
          allowed_scopes: allowed_scopes || ["openid", "profile", "email"],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({
        ...newApp,
        message: "Application created successfully. Save the client_secret - you won't be able to see it again!",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}