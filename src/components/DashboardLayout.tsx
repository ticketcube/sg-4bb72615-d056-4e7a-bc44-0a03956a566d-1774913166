import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Settings, User } from "lucide-react";
import Image from "next/image";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <nav className="border-b border-border/50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 p-1 group-hover:scale-105 transition-transform">
                  <Image src="/dragon-icon.svg" alt="FanDragon" width={24} height={24} className="w-full h-full" />
                </div>
                <span className="font-heading font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500">
                  FanDragon
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}