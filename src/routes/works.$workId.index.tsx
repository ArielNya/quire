import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PathLabel } from "@/components/writer/path-label";
import { chapterDir, scenePath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import { wordCount } from "@/lib/writer/words";

export const Route = createFileRoute("/works/$workId/")({
  component: WorkDesk,
});

function WorkDesk() {
  const { workId } = Route.useParams();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const allChapters = useWriterStore((s) => s.chapters);
  const allScenes = useWriterStore((s) => s.scenes);
  const patchWork = useWriterStore((s) => s.patchWork);
  const exportWorkText = useWriterStore((s) => s.exportWorkText);

  if (!work) return null;

  const folderName = work.folderName;
  const chapters = allChapters
    .filter((c) => c.workId === workId)
    .sort((a, b) => a.order - b.order);
  const scenes = allScenes.filter((sc) => sc.workId === workId);
  const last = scenes.find((sc) => sc.id === work.lastSceneId) ?? scenes[0];
  const lastChapter = last ? chapters.find((c) => c.id === last.chapterId) : undefined;
  const words = scenes.reduce((n, sc) => n + wordCount(sc.body), 0);

  function download() {
    const text = exportWorkText(workId);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}.quire.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Desk
      </p>
      <h1 className="mt-1 font-display text-4xl tracking-tight">{work.title}</h1>
      <PathLabel path={`${work.folderName}/`} className="mt-1" />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{work.logline}</p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Stat label="Words" value={words.toLocaleString()} />
        <Stat label="Arcs" value={String(work.arcs.length)} />
        <Stat label="Chapters" value={String(chapters.length)} />
      </div>

      {last && lastChapter && (
        <Link
          to="/works/$workId/scenes/$sceneId"
          params={{ workId, sceneId: last.id }}
          className="mt-6 block rounded-xl border border-border bg-card p-4"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Continue
          </p>
          <p className="mt-1 font-display text-xl">{last.title}</p>
          <PathLabel path={scenePath(work, lastChapter, last)} className="mt-1" />
        </Link>
      )}

      <section className="mt-8 space-y-2">
        <h2 className="text-sm font-medium">PROJECT.md</h2>
        <Textarea
          value={work.project}
          onChange={(e) => patchWork(workId, { project: e.target.value })}
          rows={8}
        />
      </section>
      <section className="mt-5 space-y-2">
        <h2 className="text-sm font-medium">STYLE.md</h2>
        <Textarea
          value={work.style}
          onChange={(e) => patchWork(workId, { style: e.target.value })}
          rows={7}
        />
      </section>
      <section className="mt-5 space-y-2">
        <h2 className="text-sm font-medium">memory/</h2>
        <p className="text-xs text-muted-foreground">USER.md</p>
        <Textarea
          value={work.memoryUser}
          onChange={(e) => patchWork(workId, { memoryUser: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">STORY.md</p>
        <Textarea
          value={work.memoryStory}
          onChange={(e) => patchWork(workId, { memoryStory: e.target.value })}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">WORLD.md</p>
        <Textarea
          value={work.memoryWorld}
          onChange={(e) => patchWork(workId, { memoryWorld: e.target.value })}
          rows={4}
        />
      </section>

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-medium">chapters/</h2>
        {chapters.length === 0 && (
          <p className="text-sm text-muted-foreground">No chapter folders yet.</p>
        )}
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            to="/works/$workId/chapters/$chapterId"
            params={{ workId, chapterId: ch.id }}
            className="block rounded-lg border border-border px-4 py-3"
          >
            <p className="text-sm font-medium">{ch.title}</p>
            <PathLabel path={chapterDir(work, ch)} />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={download}>
          Export folder dump
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}
