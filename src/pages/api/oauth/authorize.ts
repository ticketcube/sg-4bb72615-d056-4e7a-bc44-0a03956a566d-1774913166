import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { generateAuthorizationCode, validateScopes } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    client_id,
    redirect_uri,
    response_type,
    scope = "openid profile email",
    state,
  } = req.method === "GET" ? req.query : req.body;

  // Validate required parameters
  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  if (response_type !== "code") {
    return res.status(400).json({ error: "Unsupported response_type. Only 'code' is supported." });
  }

  // Validate scopes
  if (typeof scope === "string" && !validateScopes(scope)) {
    return res.status(400).json({ error: "Invalid scope" });
  }

  // Verify client exists and is active
  const { data: application, error: appError } = await supabase
    .from("oauth_applications")
    .select("*")
    .eq("client_id", client_id)
    .eq("status", "active")
    .single();

  if (appError || !application) {
    return res.status(400).json({ error: "Invalid client_id" });
  }

  // Verify redirect_uri is registered
  const redirectUriStr = Array.isArray(redirect_uri) ? redirect_uri[0] : redirect_uri;
  if (!application.redirect_uris.includes(redirectUriStr)) {
    return res.status(400).json({ error: "Invalid redirect_uri" });
  }

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirect to login with return URL
    const returnUrl = `/api/oauth/authorize?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
    return res.redirect(307, `/auth/login?return_to=${encodeURIComponent(returnUrl)}`);
  }

  // If POST, user has consented - generate authorization code
  if (req.method === "POST") {
    const code = generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: codeError } = await supabase
      .from("authorization_codes")
      .insert({
        code,
        client_id: client_id as string,
        user_id: session.user.id,
        redirect_uri: redirectUriStr,
        scope: scope as string,
        expires_at: expiresAt.toISOString(),
      });

    if (codeError) {
      return res.status(500).json({ error: "Failed to generate authorization code" });
    }

    // Redirect back to application with code
    const redirectUrl = new URL(redirectUriStr);
    redirectUrl.searchParams.append("code", code);
    if (state) {
      redirectUrl.searchParams.append("state", Array.isArray(state) ? state[0] : state);
    }

    return res.redirect(302, redirectUrl.toString());
  }

  // Show consent screen
  return res.redirect(307, `/auth/consent?${new URLSearchParams({
    client_id: client_id as string,
    redirect_uri: redirectUriStr,
    scope: scope as string,
    state: (state as string) || "",
    response_type: response_type as string,
  }).toString()}`);
}