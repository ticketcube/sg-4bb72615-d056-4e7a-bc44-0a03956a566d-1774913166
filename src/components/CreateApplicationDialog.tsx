import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2 } from "lucide-react";

export interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateApplicationDialog({ open, onOpenChange, onSuccess }: CreateApplicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ client_id: string; client_secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    client_description: "",
    client_logo_url: "",
    redirect_uris: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          redirect_uris: formData.redirect_uris.split(",").map((uri) => uri.trim()),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create application");
      }

      const data = await response.json();
      setCredentials({
        client_id: data.client_id,
        client_secret: data.client_secret,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (credentials) {
      navigator.clipboard.writeText(
        `Client ID: ${credentials.client_id}\nClient Secret: ${credentials.client_secret}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (credentials) {
      onSuccess();
      setCredentials(null);
      setFormData({
        client_name: "",
        client_description: "",
        client_logo_url: "",
        redirect_uris: "",
      });
    }
    onOpenChange(false);
  };

  if (credentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md border-border/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Application Created
            </DialogTitle>
            <DialogDescription className="text-base">
              Your application has been registered successfully.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200">
            <AlertDescription className="font-medium">
              Copy your Client Secret now. You won't be able to see it again!
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Client ID</Label>
              <code className="block w-full p-3 bg-muted rounded-lg text-sm break-all">
                {credentials.client_id}
              </code>
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <code className="block w-full p-3 bg-muted rounded-lg text-sm break-all font-mono">
                {credentials.client_secret}
              </code>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={copyCredentials} className="w-full sm:w-auto">
              {copied ? "Copied!" : <><Copy className="w-4 h-4 mr-2" /> Copy Both</>}
            </Button>
            <Button onClick={handleClose} className="w-full sm:w-auto dragon-shadow">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Register Application</DialogTitle>
          <DialogDescription>
            Create a new OAuth application to integrate with FanDragon Identity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Application Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="My Awesome App"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_description">Description</Label>
              <Textarea
                id="client_description"
                value={formData.client_description}
                onChange={(e) => setFormData({ ...formData, client_description: e.target.value })}
                placeholder="What does your application do?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_logo_url">Logo URL</Label>
              <Input
                id="client_logo_url"
                type="url"
                value={formData.client_logo_url}
                onChange={(e) => setFormData({ ...formData, client_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect_uris">Redirect URIs *</Label>
              <Textarea
                id="redirect_uris"
                value={formData.redirect_uris}
                onChange={(e) => setFormData({ ...formData, redirect_uris: e.target.value })}
                placeholder="https://example.com/api/auth/callback&#10;Separate multiple URIs with commas"
                required
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Where should we redirect users after they authenticate?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="dragon-shadow">
              {loading ? "Registering..." : "Register Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}