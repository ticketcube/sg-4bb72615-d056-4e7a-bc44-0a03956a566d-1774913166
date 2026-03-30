import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Key, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ApplicationCardProps {
  app: {
    id: string;
    client_id: string;
    client_name: string;
    client_description: string | null;
    client_logo_url: string | null;
    redirect_uris: string[];
    allowed_scopes: string[];
    created_at: string;
  };
}

export function ApplicationCard({ app }: ApplicationCardProps) {
  const [copiedId, setCopiedId] = useState(false);

  const copyClientId = () => {
    navigator.clipboard.writeText(app.client_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {app.client_logo_url ? (
              <img src={app.client_logo_url} alt={app.client_name} className="w-12 h-12 rounded-lg" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{app.client_name}</CardTitle>
              <CardDescription className="text-sm">
                Created {new Date(app.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {app.client_description && (
          <p className="text-sm text-slate-600">{app.client_description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Key className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-xs text-slate-600">{app.client_id}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyClientId}
              className="h-8"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {app.allowed_scopes.map((scope) => (
              <Badge key={scope} variant="secondary" className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>

          <div className="pt-2 space-y-1">
            <p className="text-xs font-medium text-slate-700">Redirect URIs:</p>
            {app.redirect_uris.map((uri, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-slate-600">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{uri}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}