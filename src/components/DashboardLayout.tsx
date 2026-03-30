import { ReactNode } from "react";
import Link from "next/link";
import { Shield, Key, Users, Settings, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navItems = [
    { href: "/", icon: Home, label: "Overview" },
    { href: "/applications", icon: Shield, label: "Applications" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/api-keys", icon: Key, label: "API Keys" },
    { href: "/docs", icon: FileText, label: "Documentation" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold">OAuth Provider</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Documentation</Button>
            <Button size="sm">Create Application</Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground/80 hover:text-foreground">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}