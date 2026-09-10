import { createFileRoute, Link } from "@tanstack/react-router";
import { ConnectionDialog } from "@/components/writer/connection-dialog";
import { NewWorkDialog } from "@/components/writer/new-work-dialog";
import { PathLabel } from "@/components/writer/path-label";
import { useApiSettings } from "@/lib/writer/api-settings";
import { useWriterStore } from "@/lib/writer/store";
import { wordCount } from "@/lib/writer/words";

export const Route = createFileRoute("/")({ component: Shelf });

function Shelf() {
  const works = useWriterStore((s) => s.works);
  const scenes = useWriterStore((s) => s.scenes);
  const hasKey = useApiSettings((s) => s.apiKey.trim().length > 0);
  const model = useApiSettings((s) => s.model);

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 pb-16 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Manuscript desk
      </p>
      <h1 className="mt-2 font-display text-5xl tracking-tight">Quire</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        One folder per work. Bible and arcs first. Chapters are folders. Scenes are files.
        Compile when the chapter is actually ready.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <NewWorkDialog />
        <ConnectionDialog />
      </div>
      {!hasKey && (
        <p className="mt-3 text-sm text-muted-foreground">
          Add a key to unlock the partner. DeepSeek official is already selected.
        </p>
      )}
      {hasKey && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">Connected · {model}</p>
      )}
      <ul className="mt-10 space-y-3">
        {works.map((work) => {
          const words = scenes
            .filter((sc) => sc.workId === work.id)
            .reduce((n, sc) => n + wordCount(sc.body), 0);
          return (
            <li key={work.id}>
              <Link
                to="/works/$workId"
                params={{ workId: work.id }}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl">{work.title}</h2>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {words.toLocaleString()} words
                  </span>
                </div>
                <PathLabel path={`${work.folderName}/`} className="mt-1" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {work.logline || "No logline yet."}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
