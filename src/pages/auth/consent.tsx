import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { Check, Shield, User, Mail, Info } from "lucide-react";
import Image from "next/image";

interface ScopeInfo {
  name: string;
  description: string;
  icon: JSX.Element;
}

const SCOPE_DETAILS: Record<string, ScopeInfo> = {
  openid: {
    name: "OpenID",
    description: "Verify your identity",
    icon: <Shield className="w-5 h-5 text-primary" />,
  },
  profile: {
    name: "Profile",
    description: "View your profile information (name, avatar)",
    icon: <User className="w-5 h-5 text-primary" />,
  },
  email: {
    name: "Email",
    description: "Access your email address",
    icon: <Mail className="w-5 h-5 text-primary" />,
  },
};

export default function ConsentPage() {
  const router = useRouter();
  const { client_id, redirect_uri, scope, state } = router.query;
  const [scopes, setScopes] = useState<ScopeInfo[]>([]);
  const [clientName, setClientName] = useState("Third-party Application");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scope && typeof scope === "string") {
      const requestedScopes = scope.split(" ");
      const scopeList = requestedScopes
        .filter((s) => SCOPE_DETAILS[s])
        .map((s) => SCOPE_DETAILS[s]);
      setScopes(scopeList);
    }
  }, [scope]);

  const handleApprove = async () => {
    setLoading(true);
    // TODO: Submit consent to backend
    // For now, redirect back with authorization code
    if (redirect_uri && typeof redirect_uri === "string") {
      const params = new URLSearchParams({
        code: "authorization_code_here",
        ...(state && { state: state as string }),
      });
      window.location.href = `${redirect_uri}?${params.toString()}`;
    }
  };

  const handleDeny = () => {
    if (redirect_uri && typeof redirect_uri === "string") {
      const params = new URLSearchParams({
        error: "access_denied",
        error_description: "User denied authorization",
        ...(state && { state: state as string }),
      });
      window.location.href = `${redirect_uri}?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <SEO title="Authorization Request - FanDragon" />
      
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block rounded-2xl overflow-hidden shadow-2xl mb-4 dragon-shadow">
            <Image 
              src="/FDBanner.png" 
              alt="FanDragon" 
              width={600} 
              height={200} 
              className="w-full h-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Authorization Request</h1>
          <p className="text-muted-foreground">
            An application wants to access your FanDragon account
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader>
            <CardTitle>Requested Permissions</CardTitle>
            <CardDescription>This application will be able to:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {scopes.map((scope) => (
                <div key={scope.name} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="mt-0.5">{scope.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{scope.name}</p>
                    <p className="text-sm text-muted-foreground">{scope.description}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                </div>
              ))}
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                By authorizing, you allow this application to access the information above. You can revoke access at any time in your account settings.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleDeny} variant="outline" className="flex-1" disabled={loading}>
                Deny
              </Button>
              <Button onClick={handleApprove} className="flex-1" disabled={loading}>
                {loading ? "Authorizing..." : "Authorize"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Protected by FanDragon Identity</p>
        </div>
      </div>
    </div>
  );
}