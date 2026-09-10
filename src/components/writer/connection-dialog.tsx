import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiSettingsForm } from "@/components/writer/api-settings-form";
import { useApiSettings } from "@/lib/writer/api-settings";

export function ConnectionDialog({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const hasKey = useApiSettings((s) => s.apiKey.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button type="button" size="icon" variant="ghost" aria-label="Connection">
            <Settings />
          </Button>
        ) : (
          <Button type="button" variant={hasKey ? "outline" : "default"}>
            {hasKey ? "Connection" : "Add API key"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title="Connection" className="max-w-lg">
        <p className="mb-4 text-sm text-muted-foreground">
          Kept on this device. Partner calls go through your key, not a shared one.
        </p>
        <ApiSettingsForm />
      </DialogContent>
    </Dialog>
  );
}
