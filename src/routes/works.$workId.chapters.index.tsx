import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PathLabel } from "@/components/writer/path-label";
import { StatusChip } from "@/components/writer/status-chip";
import { chapterDir } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import { wordCount } from "@/lib/writer/words";

export const Route = createFileRoute("/works/$workId/chapters/")({
  component: ChaptersPage,
});

function ChaptersPage() {
  const { workId } = Route.useParams();
  const navigate = useNavigate();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const allChapters = useWriterStore((s) => s.chapters);
  const allScenes = useWriterStore((s) => s.scenes);
  const addChapter = useWriterStore((s) => s.addChapter);

  if (!work) return null;
  const chapters = allChapters
    .filter((c) => c.workId === workId)
    .sort((a, b) => a.order - b.order);
  const scenes = allScenes.filter((sc) => sc.workId === workId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-3xl tracking-tight">Chapters</h1>
      <PathLabel path={`${work.folderName}/chapters/`} className="mt-1" />
      <p className="mt-2 text-sm text-muted-foreground">
        Each chapter is a folder. Scene files live inside. CHAPTER.md appears when you compile.
      </p>
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => {
          const id = addChapter(workId, work.arcs[0]?.id ?? null, `Chapter ${chapters.length + 1}`);
          void navigate({
            to: "/works/$workId/chapters/$chapterId",
            params: { workId, chapterId: id },
          });
        }}
      >
        New chapter folder
      </Button>
      <ul className="mt-6 space-y-3">
        {chapters.map((ch) => {
          const kids = scenes.filter((sc) => sc.chapterId === ch.id);
          const words = kids.reduce((n, sc) => n + wordCount(sc.body), 0);
          const arc = work.arcs.find((a) => a.id === ch.arcId);
          return (
            <li key={ch.id}>
              <Link
                to="/works/$workId/chapters/$chapterId"
                params={{ workId, chapterId: ch.id }}
                className="block rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl">{ch.title}</p>
                    <PathLabel path={chapterDir(work, ch)} />
                    {arc && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Arc {arc.order}: {arc.title}
                      </p>
                    )}
                  </div>
                  <StatusChip status={ch.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {kids.length} scene{kids.length === 1 ? "" : "s"} ·{" "}
                  <span className="tabular-nums">{words.toLocaleString()}</span> words
                  {ch.compiledAt ? " · compiled" : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
