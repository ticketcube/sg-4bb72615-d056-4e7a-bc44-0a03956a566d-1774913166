import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthParams, setOauthParams] = useState<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    response_type?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  } | null>(null);

  useEffect(() => {
    // Capture OAuth parameters from URL
    const { client_id, redirect_uri, scope, state, response_type, code_challenge, code_challenge_method } = router.query;
    
    if (client_id && redirect_uri) {
      setOauthParams({
        client_id: client_id as string,
        redirect_uri: redirect_uri as string,
        scope: scope as string,
        state: state as string,
        response_type: response_type as string,
        code_challenge: code_challenge as string,
        code_challenge_method: code_challenge_method as string,
      });
    }
  }, [router.query]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // If OAuth parameters exist, redirect to consent page
      if (oauthParams && oauthParams.client_id && oauthParams.redirect_uri) {
        const params = new URLSearchParams({
          client_id: oauthParams.client_id,
          redirect_uri: oauthParams.redirect_uri,
          scope: oauthParams.scope || "openid email profile",
          state: oauthParams.state || "",
          response_type: oauthParams.response_type || "code",
          ...(oauthParams.code_challenge && { code_challenge: oauthParams.code_challenge }),
          ...(oauthParams.code_challenge_method && { code_challenge_method: oauthParams.code_challenge_method }),
        });
        router.push(`/auth/consent?${params.toString()}`);
      } else {
        // Normal login, go to dashboard
        router.push("/");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <SEO title="Sign In - FanDragon Identity" />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-block rounded-2xl overflow-hidden shadow-2xl mb-6 dragon-shadow">
            <Image 
              src="/FDBanner.png" 
              alt="FanDragon" 
              width={600} 
              height={200} 
              className="w-full h-auto"
              priority
            />
          </div>
          <p className="text-muted-foreground text-lg">Sign in to manage your identity</p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link 
            href={`/auth/register${oauthParams ? `?${new URLSearchParams(oauthParams as any).toString()}` : ""}`}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>FanDragon Identity Provider</p>
          <p className="text-xs">Secure OAuth 2.0 Authentication</p>
        </div>
      </div>
    </div>
  );
}