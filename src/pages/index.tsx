import { DashboardLayout } from "@/components/DashboardLayout";
import { ApplicationCard } from "@/components/ApplicationCard";
import { CreateApplicationDialog } from "@/components/CreateApplicationDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Key, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function Home() {
  const stats = [
    { label: "Total Applications", value: "12", icon: Shield, change: "+2 this month" },
    { label: "Active Users", value: "1,234", icon: Users, change: "+18% from last month" },
    { label: "API Keys", value: "24", icon: Key, change: "8 active" },
    { label: "Auth Requests", value: "45.2K", icon: Activity, change: "+12% this week" },
  ];

  const applications = [
    {
      name: "Production App",
      clientId: "prod_app_a1b2c3d4e5f6",
      redirectUri: "https://app.example.com/auth/callback",
      status: "active" as const,
      createdAt: "Jan 15, 2026",
    },
    {
      name: "Development Environment",
      clientId: "dev_app_x9y8z7w6v5u4",
      redirectUri: "http://localhost:3000/auth/callback",
      status: "active" as const,
      createdAt: "Mar 20, 2026",
    },
  ];

  return (
    <>
      <SEO
        title="OAuth Provider Dashboard"
        description="Manage your OAuth applications and identity provider settings"
      />
      <DashboardLayout>
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-hero rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-heading font-bold mb-2">OAuth Identity Provider</h1>
            <p className="text-white/90 text-lg max-w-2xl">
              Secure authentication for third-party applications. Manage your OAuth clients, monitor usage, and control access.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-1">Applications</h2>
              <p className="text-muted-foreground">OAuth clients registered with your provider</p>
            </div>
            <CreateApplicationDialog />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <ApplicationCard key={app.clientId} {...app} />
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="mt-8 border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Quick Start Guide</CardTitle>
            <CardDescription>
              Get started with OAuth integration in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create an Application</h3>
                <p className="text-sm text-muted-foreground">
                  Register your application and get client credentials
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Configure OAuth Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Set up authorization endpoints and redirect URIs
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Start Authenticating</h3>
                <p className="text-sm text-muted-foreground">
                  Integrate with your application and test the flow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}