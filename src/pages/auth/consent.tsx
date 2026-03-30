import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle } from "lucide-react";

type Application = {
  id: string;
  name: string;
  description: string | null;
  homepage_url: string | null;
};

export default function ConsentPage() {
  const router = useRouter();
  const { client_id, redirect_uri, scope, state, response_type } = router.query;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      if (!client_id) return;

      try {
        const { data, error } = await supabase
          .from("oauth_applications")
          .select("id, name, description, homepage_url")
          .eq("client_id", client_id)
          .eq("status", "active")
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        setError("Invalid application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [client_id]);

  const handleConsent = async (approved: boolean) => {
    if (!approved) {
      // Redirect back with error
      const errorUrl = new URL(redirect_uri as string);
      errorUrl.searchParams.append("error", "access_denied");
      if (state) errorUrl.searchParams.append("state", state as string);
      window.location.href = errorUrl.toString();
      return;
    }

    // Submit consent via POST to authorize endpoint
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/oauth/authorize";

    const fields = { client_id, redirect_uri, response_type, scope, state };
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Request</h2>
            <p className="text-slate-600">{error || "Application not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scopes = (scope as string)?.split(" ") || [];
  const scopeDescriptions: Record<string, string> = {
    openid: "Verify your identity",
    profile: "Access your profile information (name, picture)",
    email: "Access your email address",
    offline_access: "Maintain access when you're not actively using the app",
  };

  return (
    <>
      <SEO 
        title="Authorize Application"
        description="Review and authorize application access"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Authorize Application
            </h1>
          </div>

          <Card className="shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {application.name}
                <span className="text-sm font-normal text-slate-500">wants to access your account</span>
              </CardTitle>
              {application.description && (
                <CardDescription>{application.description}</CardDescription>
              )}
              {application.homepage_url && (
                <a 
                  href={application.homepage_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Visit website →
                </a>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  This application will be able to:
                </h3>
                <ul className="space-y-2">
                  {scopes.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{scopeDescriptions[s] || s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> Make sure you trust this application before granting access.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleConsent(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConsent(true)}
                  className="flex-1"
                >
                  Authorize
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}