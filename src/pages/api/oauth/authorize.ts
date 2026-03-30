import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { generateAuthorizationCode, validateScopes } from "@/lib/oauth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { client_id, redirect_uri, response_type, scope, state, code_challenge, code_challenge_method } = req.query;

  // Validate required parameters
  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  if (response_type !== "code") {
    return res.status(400).json({ error: "Unsupported response_type. Only 'code' is supported" });
  }

  // Verify client exists and redirect_uri matches
  const { data: client, error: clientError } = await supabase
    .from("oauth_clients")
    .select("*")
    .eq("client_id", client_id)
    .single();

  if (clientError || !client) {
    return res.status(400).json({ error: "Invalid client_id" });
  }

  // Validate redirect URI
  const redirectUris = client.redirect_uris || [];
  if (!redirectUris.includes(redirect_uri as string)) {
    return res.status(400).json({ error: "Invalid redirect_uri" });
  }

  // Validate scopes
  const requestedScopes = (scope as string) || "profile email";
  if (!validateScopes(requestedScopes, client.allowed_scopes || [])) {
    return res.status(400).json({ error: "Invalid scope requested" });
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login page with return URL
    return res.redirect(`/auth/login?${new URLSearchParams({
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: requestedScopes,
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
    scope: requestedScopes,
    state: (state as string) || "",
    response_type: response_type as string,
    ...(code_challenge && { code_challenge: code_challenge as string }),
    ...(code_challenge_method && { code_challenge_method: code_challenge_method as string }),
  }).toString()}`);
}