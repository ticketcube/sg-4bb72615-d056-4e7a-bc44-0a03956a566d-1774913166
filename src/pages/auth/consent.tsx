import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateAuthorizationCode } from "@/lib/oauth";

export default function ConsentPage() {
  const router = useRouter();
  const { client_id, redirect_uri, scope, state, response_type, code_challenge, code_challenge_method } = router.query;
  
  const [client, setClient] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consenting, setConsenting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!client_id) return;

      try {
        // Get authenticated user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !authUser) {
          router.push(`/auth/login?${new URLSearchParams(router.query as any).toString()}`);
          return;
        }

        setUser(authUser);

        // Get client details
        const { data: clientData, error: clientError } = await supabase
          .from("oauth_clients")
          .select("*")
          .eq("client_id", client_id)
          .single();

        if (clientError || !clientData) {
          setError("Invalid client application");
          return;
        }

        setClient(clientData);
      } catch (err) {
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [client_id, router]);

  const handleConsent = async (approved: boolean) => {
    if (!approved) {
      const errorUrl = new URL(redirect_uri as string);
      errorUrl.searchParams.set("error", "access_denied");
      if (state) errorUrl.searchParams.set("state", state as string);
      window.location.href = errorUrl.toString();
      return;
    }

    setConsenting(true);

    try {
      const authCode = generateAuthorizationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const { error: insertError } = await supabase
        .from("oauth_authorizations")
        .insert({
          authorization_code: authCode,
          client_id: client.id,
          user_id: user.id,
          redirect_uri: redirect_uri as string,
          scopes: (scope as string) || "profile email",
          expires_at: expiresAt.toISOString(),
          code_challenge: code_challenge as string || null,
          code_challenge_method: code_challenge_method as string || null,
        });

      if (insertError) {
        setError("Failed to create authorization");
        setConsenting(false);
        return;
      }

      // Redirect back to client with authorization code
      const successUrl = new URL(redirect_uri as string);
      successUrl.searchParams.set("code", authCode);
      if (state) successUrl.searchParams.set("state", state as string);
      
      window.location.href = successUrl.toString();
    } catch (err) {
      setError("An error occurred during authorization");
      setConsenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <CardTitle>Authorization Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{error}</p>
            <Button onClick={() => router.push("/")} className="mt-4 w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scopes = ((scope as string) || "profile email").split(" ");

  return (
    <>
      <SEO title="Authorize Application" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {client?.client_logo_url ? (
                <img src={client.client_logo_url} alt={client.client_name} className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">{client?.client_name}</CardTitle>
            <CardDescription className="text-base mt-2">
              wants to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {client?.client_description && (
              <p className="text-sm text-slate-600 text-center">{client.client_description}</p>
            )}

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">This application will be able to:</p>
              <div className="space-y-2">
                {scopes.includes("profile") && (
                  <div className="flex items-start gap-2">
                    <Checkbox checked disabled className="mt-0.5" />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">View your profile information</p>
                      <p className="text-xs text-slate-500">Name, avatar, and public profile data</p>
                    </div>
                  </div>
                )}
                {scopes.includes("email") && (
                  <div className="flex items-start gap-2">
                    <Checkbox checked disabled className="mt-0.5" />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">View your email address</p>
                      <p className="text-xs text-slate-500">Primary email and verification status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Signed in as <span className="font-medium">{user?.email}</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleConsent(false)}
                disabled={consenting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleConsent(true)}
                disabled={consenting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {consenting ? "Authorizing..." : "Authorize"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}