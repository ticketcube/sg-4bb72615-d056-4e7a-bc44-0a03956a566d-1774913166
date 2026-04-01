import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Globe } from "lucide-react";
import Image from "next/image";

interface Application {
  id: string;
  client_name: string;
  client_description: string;
  client_logo_url: string;
  redirect_uris: string[];
  created_at: string;
}

export interface ApplicationCardProps {
  application: Application;
  onUpdate: () => Promise<void>;
}

export function ApplicationCard({ application, onUpdate }: ApplicationCardProps) {
  const getDomain = (uri: string) => {
    try {
      return new URL(uri).hostname;
    } catch {
      return uri;
    }
  };

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-1 dragon-shadow shrink-0">
          {application.client_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={application.client_logo_url} alt={application.client_name} className="w-full h-full object-contain" />
          ) : (
            <Shield className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-xl line-clamp-1">{application.client_name}</CardTitle>
          <CardDescription className="line-clamp-2">{application.client_description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {application.redirect_uris && application.redirect_uris.length > 0 
                ? getDomain(application.redirect_uris[0]) 
                : "No redirect URI"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="w-4 h-4 shrink-0" />
            <span>Client ID: {application.id.substring(0, 8)}...</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" className="w-full" onClick={() => {}}>
            Manage
          </Button>
          <Button variant="default" className="w-full dragon-shadow">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}