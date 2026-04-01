import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ApplicationCard } from "@/components/ApplicationCard";
import { CreateApplicationDialog } from "@/components/CreateApplicationDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { Plus, Loader2, AlertCircle } from "lucide-react";

interface Application {
  id: string;
  client_id: string;
  client_name: string;
  client_description: string;
  client_logo_url: string;
  redirect_uris: string[];
  allowed_scopes: string[];
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchApplications();
    } catch (err) {
      console.error("Auth error:", err);
      setError("Failed to authenticate");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err instanceof Error ? err.message : "Failed to load applications");
    }
  };

  const handleApplicationCreated = () => {
    fetchApplications();
    setCreateDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO title="Dashboard - FanDragon" />
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">OAuth Applications</h1>
              <p className="text-muted-foreground mt-1">
                Manage your third-party integrations
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="dragon-shadow">
              <Plus className="w-5 h-5 mr-2" />
              Register Application
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Register your first OAuth application to start integrating with FanDragon Identity
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="dragon-shadow">
                <Plus className="w-5 h-5 mr-2" />
                Register Your First Application
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  application={app}
                  onUpdate={fetchApplications}
                />
              ))}
            </div>
          )}
        </div>

        <CreateApplicationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleApplicationCreated}
        />
      </DashboardLayout>
    </>
  );
}