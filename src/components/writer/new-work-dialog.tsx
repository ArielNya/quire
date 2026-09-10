import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWriterStore } from "@/lib/writer/store";

export function NewWorkDialog({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const createWork = useWriterStore((s) => s.createWork);
  const navigate = useNavigate();

  function submit() {
    const id = createWork({ title, logline });
    setOpen(false);
    setTitle("");
    setLogline("");
    void navigate({ to: "/works/$workId", params: { workId: id } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={compact ? "secondary" : "default"} className={compact ? "" : "w-full sm:w-auto"}>
          New work
        </Button>
      </DialogTrigger>
      <DialogContent title="New work">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="work-title">Folder name</Label>
            <Input
              id="work-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saltglass"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="work-log">Logline</Label>
            <Textarea
              id="work-log"
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="What the book is, in one breath"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full">
            Create folder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
