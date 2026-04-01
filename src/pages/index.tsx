import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ApplicationCard } from "@/components/ApplicationCard";
import { CreateApplicationDialog } from "@/components/CreateApplicationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Application {
  id: string;
  client_name: string;
  client_description: string;
  client_logo_url: string;
  redirect_uris: string[];
  created_at: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationCreated = () => {
    fetchApplications();
    setCreateDialogOpen(false);
  };

  return (
    <>
      <SEO title="Dashboard - FanDragon Identity Provider" />
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">OAuth Applications</h1>
              <p className="text-muted-foreground">Manage third-party applications that use FanDragon for authentication</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="dragon-shadow">
              <Plus className="w-5 h-5 mr-2" />
              Create Application
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} onUpdate={fetchApplications} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardHeader className="text-center pb-4">
                <CardTitle>No applications yet</CardTitle>
                <CardDescription>Create your first OAuth application to get started</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <CreateApplicationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleApplicationCreated} />
      </DashboardLayout>
    </>
  );
}