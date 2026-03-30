import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Key, Copy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApplicationCardProps {
  name: string;
  clientId: string;
  redirectUri: string;
  status: "active" | "inactive";
  createdAt: string;
}

export function ApplicationCard({ name, clientId, redirectUri, status, createdAt }: ApplicationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{redirectUri}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View Credentials</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Client ID</div>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md font-mono text-sm">
              <span className="flex-1 truncate">{clientId}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Created {createdAt}</span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}