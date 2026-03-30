import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ApplicationCard } from "@/components/ApplicationCard";
import { CreateApplicationDialog } from "@/components/CreateApplicationDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export default function Dashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <>
      <SEO title="Developer Dashboard" />
      <DashboardLayout>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">OAuth Applications</h1>
            <p className="text-slate-600 mt-2">
              Manage your registered applications and their OAuth credentials.
            </p>
          </div>
          <CreateApplicationDialog onSuccess={fetchApplications} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No applications yet</h3>
              <p className="text-slate-500 mb-4 max-w-sm">
                Create your first OAuth application to get credentials and start integrating with our API.
              </p>
              <CreateApplicationDialog onSuccess={fetchApplications} />
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
}