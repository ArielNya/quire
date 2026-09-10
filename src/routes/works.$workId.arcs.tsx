import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PathLabel } from "@/components/writer/path-label";
import { arcPath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";

export const Route = createFileRoute("/works/$workId/arcs")({
  component: ArcsPage,
});

function ArcsPage() {
  const { workId } = Route.useParams();
  const navigate = useNavigate();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const allChapters = useWriterStore((s) => s.chapters);
  const addArc = useWriterStore((s) => s.addArc);
  const patchArc = useWriterStore((s) => s.patchArc);
  const removeArc = useWriterStore((s) => s.removeArc);
  const addChapter = useWriterStore((s) => s.addChapter);

  if (!work) return null;
  const chapters = allChapters
    .filter((c) => c.workId === workId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-3xl tracking-tight">Arcs</h1>
      <PathLabel path={`${work.folderName}/arcs/`} className="mt-1" />
      <p className="mt-2 text-sm text-muted-foreground">
        Break the book here first. Chapter structure inside each arc can stay rough until you are
        actually writing it.
      </p>
      <Button className="mt-4" variant="outline" onClick={() => addArc(workId)}>
        Add arc
      </Button>

      <ol className="mt-6 space-y-4">
        {[...work.arcs]
          .sort((a, b) => a.order - b.order)
          .map((arc) => {
            const kids = chapters.filter((c) => c.arcId === arc.id);
            return (
              <li key={arc.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Arc {arc.order}
                </p>
                <Input
                  className="mt-2"
                  value={arc.title}
                  onChange={(e) => patchArc(workId, arc.id, { title: e.target.value })}
                />
                <PathLabel path={arcPath(work, arc)} className="mt-1" />
                <Textarea
                  className="mt-3"
                  value={arc.summary}
                  onChange={(e) => patchArc(workId, arc.id, { summary: e.target.value })}
                  placeholder="What this arc does to the book"
                  rows={3}
                />
                <Textarea
                  className="mt-2"
                  value={arc.notes}
                  onChange={(e) => patchArc(workId, arc.id, { notes: e.target.value })}
                  placeholder="Chapter structure notes — titles, jobs, empty slots"
                  rows={3}
                />
                <ul className="mt-3 space-y-1">
                  {kids.map((ch) => (
                    <li key={ch.id} className="text-sm text-muted-foreground">
                      ch.{ch.order} {ch.title}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const id = addChapter(workId, arc.id, `Chapter ${chapters.length + 1}`);
                      void navigate({
                        to: "/works/$workId/chapters/$chapterId",
                        params: { workId, chapterId: id },
                      });
                    }}
                  >
                    New chapter folder
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeArc(workId, arc.id)}>
                    Remove arc
                  </Button>
                </div>
              </li>
            );
          })}
      </ol>
    </div>
  );
}
