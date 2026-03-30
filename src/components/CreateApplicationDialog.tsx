import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create OAuth Application</DialogTitle>
          <DialogDescription>
            Register a new third-party application to use your OAuth provider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" placeholder="My Application" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of your application"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="redirect-uri">Redirect URI</Label>
            <Input 
              id="redirect-uri" 
              placeholder="https://example.com/auth/callback"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              The URL where users will be redirected after authorization
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="homepage">Homepage URL (Optional)</Label>
            <Input 
              id="homepage" 
              placeholder="https://example.com"
              type="url"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>
            Create Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}