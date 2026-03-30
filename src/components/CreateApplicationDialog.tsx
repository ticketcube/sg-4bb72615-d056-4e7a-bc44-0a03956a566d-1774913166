import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface CreateApplicationDialogProps {
  onSuccess: () => void;
}

export function CreateApplicationDialog({ onSuccess }: CreateApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_description: "",
    redirect_uris: "",
    client_logo_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirect_uris: formData.redirect_uris.split("\n").filter(Boolean),
          allowed_scopes: ["profile", "email"],
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({ client_name: "", client_description: "", redirect_uris: "", client_logo_url: "" });
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create application:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create OAuth Application</DialogTitle>
            <DialogDescription>
              Register a new application to use OAuth authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Application Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="My Awesome App"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_description">Description (optional)</Label>
              <Textarea
                id="client_description"
                value={formData.client_description}
                onChange={(e) => setFormData({ ...formData, client_description: e.target.value })}
                placeholder="A brief description of your application"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_logo_url">Logo URL (optional)</Label>
              <Input
                id="client_logo_url"
                type="url"
                value={formData.client_logo_url}
                onChange={(e) => setFormData({ ...formData, client_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirect_uris">Redirect URIs (one per line)</Label>
              <Textarea
                id="redirect_uris"
                value={formData.redirect_uris}
                onChange={(e) => setFormData({ ...formData, redirect_uris: e.target.value })}
                placeholder="https://myapp.com/auth/callback&#10;http://localhost:3000/callback"
                rows={4}
                required
              />
              <p className="text-xs text-slate-500">
                Enter each redirect URI on a new line
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}