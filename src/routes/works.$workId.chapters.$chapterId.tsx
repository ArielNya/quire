import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PathLabel } from "@/components/writer/path-label";
import { StatusChip } from "@/components/writer/status-chip";
import { breakdownPath, chapterDir, compiledChapterPath, scenePath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import type { ChapterStatus } from "@/lib/writer/types";
import { wordCount } from "@/lib/writer/words";

export const Route = createFileRoute("/works/$workId/chapters/$chapterId")({
  component: ChapterFolder,
});

const STATUSES: ChapterStatus[] = ["planning", "drafting", "revising", "locked"];

function ChapterFolder() {
  const { workId, chapterId } = Route.useParams();
  const navigate = useNavigate();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const chapter = useWriterStore((s) => s.chapters.find((c) => c.id === chapterId));
  const allScenes = useWriterStore((s) => s.scenes);
  const patchChapter = useWriterStore((s) => s.patchChapter);
  const addScene = useWriterStore((s) => s.addScene);
  const compileChapter = useWriterStore((s) => s.compileChapter);
  const moveScene = useWriterStore((s) => s.moveScene);
  const removeChapter = useWriterStore((s) => s.removeChapter);

  if (!work || !chapter) {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground">Chapter folder missing.</div>
    );
  }

  const scenes = allScenes
    .filter((sc) => sc.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);

  const words = scenes.reduce((n, sc) => n + wordCount(sc.body), 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        to="/works/$workId/chapters"
        params={{ workId }}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        chapters/
      </Link>
      <Input
        className="mt-2 h-12 font-display text-2xl"
        value={chapter.title}
        onChange={(e) => patchChapter(chapter.id, { title: e.target.value })}
      />
      <PathLabel path={chapterDir(work, chapter)} className="mt-1" />

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => patchChapter(chapter.id, { status: st })}
            className="h-9"
          >
            <StatusChip status={st === chapter.status ? st : st} />
          </button>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-medium">BREAKDOWN.md</h2>
        <PathLabel path={breakdownPath(work, chapter)} />
        <Textarea
          className="mt-2"
          value={chapter.breakdown}
          onChange={(e) => patchChapter(chapter.id, { breakdown: e.target.value })}
          placeholder={"Scene 1 — \nScene 2 — \nScene 3 — "}
          rows={6}
        />
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">scenes/</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const id = addScene(chapter.id, `Scene ${scenes.length + 1}`);
              void navigate({
                to: "/works/$workId/scenes/$sceneId",
                params: { workId, sceneId: id },
              });
            }}
          >
            New scene file
          </Button>
        </div>
        <ul className="mt-3 space-y-2">
          {scenes.map((sc, i) => (
            <li key={sc.id} className="flex items-stretch gap-2">
              <Link
                to="/works/$workId/scenes/$sceneId"
                params={{ workId, sceneId: sc.id }}
                className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">
                    {String(sc.order).padStart(2, "0")} {sc.title}
                  </p>
                  <StatusChip status={sc.status} />
                </div>
                <PathLabel path={scenePath(work, chapter, sc)} />
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="tabular-nums">{wordCount(sc.body)}</span> words
                  {sc.goal ? ` · ${sc.goal}` : ""}
                </p>
              </Link>
              <div className="flex flex-col">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                  onClick={() => moveScene(sc.id, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                  onClick={() => moveScene(sc.id, 1)}
                  disabled={i === scenes.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Compile CHAPTER.md</h2>
        <PathLabel path={compiledChapterPath(work, chapter)} />
        <p className="mt-2 text-sm text-muted-foreground">
          Joins scene files in order with scene breaks. Does not rewrite them.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="tabular-nums">{words.toLocaleString()}</span> words across {scenes.length}{" "}
          files
        </p>
        <Button className="mt-3" onClick={() => compileChapter(chapter.id)}>
          Compile chapter
        </Button>
        {chapter.compiledBody && (
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-paper p-4 font-serif text-sm leading-relaxed text-ink">
            {chapter.compiledBody}
          </pre>
        )}
      </section>

      <Button
        className="mt-8"
        variant="ghost"
        onClick={() => {
          removeChapter(chapter.id);
          void navigate({ to: "/works/$workId/chapters", params: { workId } });
        }}
      >
        Delete folder
      </Button>
    </div>
  );
}
