import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PartnerPanel } from "@/components/writer/partner-panel";
import { PathLabel } from "@/components/writer/path-label";
import { StatusChip } from "@/components/writer/status-chip";
import { TakesList } from "@/components/writer/takes-list";
import { scenePath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import type { SceneStatus } from "@/lib/writer/types";
import { wordCount } from "@/lib/writer/words";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/works/$workId/scenes/$sceneId")({
  component: SceneDesk,
});

const STATUSES: SceneStatus[] = ["outline", "draft", "revise", "done"];

function SceneDesk() {
  const { workId, sceneId } = Route.useParams();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const scene = useWriterStore((s) => s.scenes.find((sc) => sc.id === sceneId));
  const chapterId = scene?.chapterId;
  const chapter = useWriterStore((s) =>
    chapterId ? s.chapters.find((c) => c.id === chapterId) : undefined,
  );
  const patchScene = useWriterStore((s) => s.patchScene);
  const setLastScene = useWriterStore((s) => s.setLastScene);
  const editorScale = useWriterStore((s) => s.editorScale);
  const setEditorScale = useWriterStore((s) => s.setEditorScale);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [selection, setSelection] = useState("");

  useEffect(() => {
    if (scene) setLastScene(workId, scene.id);
  }, [scene, setLastScene, workId]);

  if (!work || !scene || !chapter) {
    return <div className="px-4 py-10 text-sm text-muted-foreground">Scene file missing.</div>;
  }

  const words = wordCount(scene.body);

  return (
    <div className="flex h-full min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-dvh md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <Link
            to="/works/$workId/chapters/$chapterId"
            params={{ workId, chapterId: chapter.id }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {chapter.title}
          </Link>
          <Input
            value={scene.title}
            onChange={(e) => patchScene(scene.id, { title: e.target.value })}
            className="mt-1 h-10 border-0 bg-transparent px-0 font-display text-2xl focus-visible:ring-0"
          />
          <PathLabel path={scenePath(work, chapter, scene)} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {STATUSES.map((st) => (
              <button key={st} type="button" onClick={() => patchScene(scene.id, { status: st })}>
                <span className={cn(st === scene.status ? "opacity-100" : "opacity-40")}>
                  <StatusChip status={st} />
                </span>
              </button>
            ))}
            <span className="ml-auto tabular-nums text-xs text-muted-foreground">
              {words} words
            </span>
            <button
              type="button"
              className="text-xs text-muted-foreground"
              onClick={() => setEditorScale(editorScale === "md" ? "lg" : "md")}
            >
              Type {editorScale === "md" ? "M" : "L"}
            </button>
            <Button
              size="icon"
              variant={partnerOpen ? "secondary" : "ghost"}
              className="md:hidden"
              onClick={() => setPartnerOpen((v) => !v)}
              aria-label="Partner"
            >
              {partnerOpen ? <X /> : <MessageSquare />}
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              value={scene.pov}
              onChange={(e) => patchScene(scene.id, { pov: e.target.value })}
              placeholder="POV"
            />
            <Input
              value={scene.goal}
              onChange={(e) => patchScene(scene.id, { goal: e.target.value })}
              placeholder="Scene goal"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-paper">
          <Textarea
            value={scene.body}
            onChange={(e) => patchScene(scene.id, { body: e.target.value })}
            onSelect={(e) => {
              const t = e.currentTarget;
              setSelection(t.value.slice(t.selectionStart, t.selectionEnd));
            }}
            placeholder="The scene starts here. One file. Compile later."
            className={cn(
              "min-h-[28rem] w-full resize-none rounded-none border-0 bg-paper px-5 py-6 font-serif leading-[1.65] text-ink placeholder:text-ink-muted focus-visible:ring-0",
              editorScale === "lg" ? "text-lg" : "text-base",
            )}
          />
          <TakesList sceneId={scene.id} />
        </div>
      </div>

      <div className="hidden w-[22rem] shrink-0 border-l border-border md:block">
        <PartnerPanel work={work} chapter={chapter} scene={scene} selection={selection} />
      </div>

      {partnerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <p className="text-sm font-medium">Partner</p>
            <Button size="icon" variant="ghost" onClick={() => setPartnerOpen(false)}>
              <X />
            </Button>
          </div>
          <PartnerPanel
            work={work}
            chapter={chapter}
            scene={scene}
            selection={selection}
            className="min-h-0 flex-1"
          />
        </div>
      )}
    </div>
  );
}
