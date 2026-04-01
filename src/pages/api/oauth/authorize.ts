import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin, supabase } from "@/lib/supabase";
import crypto from "crypto";
import { generateAuthorizationCode, validateScopes } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // 2. Process authorization (user has consented)
    const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.body;
    
    // Validate required parameters again just in case
    if (!client_id || !redirect_uri || !scope) {
      return res.redirect(`/auth/error?error=invalid_request&error_description=Missing required parameters`);
    }

    // Convert potential array params to string
    const clientIdStr = Array.isArray(client_id) ? client_id[0] : client_id;
    const redirectUriStr = Array.isArray(redirect_uri) ? redirect_uri[0] : redirect_uri;

    // Verify client exists and redirect_uri matches
    const { data: client, error: clientError } = await supabaseAdmin
      .from("oauth_clients")
      .select("*")
      .eq("client_id", clientIdStr)
      .single();

    if (clientError || !client) {
      return res.redirect(`/auth/error?error=invalid_client`);
    }

    // Check if redirect URI is authorized
    const isAuthorizedUri = client.redirect_uris.includes(redirectUriStr);

    if (!isAuthorizedUri) {
      return res.redirect("/auth/error?error=redirect_uri_mismatch");
    }

    // Generate authorization code
    const authorizationCode = generateAuthorizationCode();

    // Store authorization code in database
    const { error: insertError } = await supabaseAdmin
      .from("oauth_authorizations")
      .insert({
        authorization_code: authorizationCode,
        client_id: clientIdStr,
        redirect_uri: redirectUriStr,
        scopes: Array.isArray(scope) ? scope : typeof scope === 'string' ? scope.split(' ') : [],
        state: Array.isArray(state) ? state[0] : state,
        code_challenge: Array.isArray(code_challenge) ? code_challenge[0] : code_challenge,
        code_challenge_method: Array.isArray(code_challenge_method) ? code_challenge_method[0] : code_challenge_method,
        code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      } as any);

    if (insertError) {
      console.error("Authorization error:", insertError);
      return res.redirect(`${redirectUriStr}?error=server_error`);
    }

    // Redirect back to client with authorization code
    const redirectUrl = new URL(redirectUriStr);
    redirectUrl.searchParams.append("code", authorizationCode);

    return res.redirect(redirectUrl.toString());
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 3. GET request - display consent page
  const { client_id, redirect_uri, response_type, scope, state, code_challenge, code_challenge_method } = req.query;

  // Validate required parameters
  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  if (response_type !== "code") {
    return res.status(400).json({ error: "Unsupported response_type. Only 'code' is supported" });
  }

  // Helper to ensure string
  const getStr = (val: string | string[] | undefined) => Array.isArray(val) ? val[0] : val || "";

  const clientIdStr = getStr(client_id);
  const redirectUriStr = getStr(redirect_uri);

  // Validate client
  const { data: client, error } = await supabaseAdmin
    .from("oauth_clients")
    .select("client_name, client_logo_url, redirect_uris, allowed_scopes")
    .eq("client_id", clientIdStr)
    .single();

  if (error || !client) {
    return res.redirect("/auth/error?error=invalid_client");
  }

  // Verify redirect URI is allowed
  if (!client.redirect_uris.includes(redirectUriStr)) {
    return res.redirect("/auth/error?error=redirect_uri_mismatch");
  }

  // Check requested scopes against allowed scopes
  const requestedScopes = getStr(scope).split(" ");

  // Validate scopes
  const allowedScopesStr = Array.isArray(client.allowed_scopes) ? client.allowed_scopes.join(" ") : String(client.allowed_scopes || "");
  if (!validateScopes(requestedScopes, allowedScopesStr)) {
    return res.status(400).json({ error: "Invalid scope requested" });
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login page with return URL
    return res.redirect(`/auth/login?${new URLSearchParams({
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: requestedScopes.join(" "),
      state: (state as string) || "",
      response_type: response_type as string,
      ...(code_challenge && { code_challenge: code_challenge as string }),
      ...(code_challenge_method && { code_challenge_method: code_challenge_method as string }),
    }).toString()}`);
  }

  // User is authenticated, redirect to consent page
  return res.redirect(`/auth/consent?${new URLSearchParams({
    client_id: client_id as string,
    redirect_uri: redirect_uri as string,
    scope: requestedScopes.join(" "),
    state: (state as string) || "",
    response_type: response_type as string,
    ...(code_challenge && { code_challenge: code_challenge as string }),
    ...(code_challenge_method && { code_challenge_method: code_challenge_method as string }),
  }).toString()}`);
}