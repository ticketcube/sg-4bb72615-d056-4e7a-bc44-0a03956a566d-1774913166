import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { generateClientId, generateClientSecret, hashClientSecret } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("oauth_applications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch applications" });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, description, redirect_uris, homepage_url } = req.body;

    if (!name || !redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const hashedSecret = hashClientSecret(clientSecret);

    const { data, error } = await supabase
      .from("oauth_applications")
      .insert({
        name,
        description: description || null,
        client_id: clientId,
        client_secret: hashedSecret,
        redirect_uris,
        homepage_url: homepage_url || null,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create application" });
    }

    return res.status(201).json({
      ...data,
      client_secret: clientSecret, // Return plain secret only once
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}