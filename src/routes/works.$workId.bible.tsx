import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PathLabel } from "@/components/writer/path-label";
import { biblePath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import type { BibleKind } from "@/lib/writer/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/works/$workId/bible")({
  component: BiblePage,
});

const KINDS: { id: BibleKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "character", label: "Characters" },
  { id: "location", label: "Places" },
  { id: "other", label: "Other" },
];

function BiblePage() {
  const { workId } = Route.useParams();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const addBibleCard = useWriterStore((s) => s.addBibleCard);
  const patchBibleCard = useWriterStore((s) => s.patchBibleCard);
  const removeBibleCard = useWriterStore((s) => s.removeBibleCard);
  const [filter, setFilter] = useState<BibleKind | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  if (!work) return null;
  const cards = work.bible.filter((c) => filter === "all" || c.kind === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-3xl tracking-tight">Story bible</h1>
      <PathLabel path={`${work.folderName}/bible/`} className="mt-1" />
      <p className="mt-2 text-sm text-muted-foreground">
        Built at the start. Voice and secrets live here so scenes do not invent people.
      </p>

      <div className="mt-5 flex gap-1 overflow-x-auto">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setFilter(k.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
              filter === k.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["character", "location", "other"] as BibleKind[]).map((kind) => (
          <Button
            key={kind}
            size="sm"
            variant="outline"
            onClick={() => {
              const id = addBibleCard(workId, kind);
              setOpenId(id);
            }}
          >
            Add {kind === "character" ? "character" : kind === "location" ? "place" : "note"}
          </Button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {cards.map((card) => {
          const open = openId === card.id;
          return (
            <li key={card.id} className="rounded-xl border border-border bg-card">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                onClick={() => setOpenId(open ? null : card.id)}
              >
                <div>
                  <p className="font-medium">{card.name}</p>
                  <PathLabel path={biblePath(work, card)} />
                  <p className="mt-1 text-sm text-muted-foreground">{card.summary || "No summary"}</p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {card.kind}
                </span>
              </button>
              {open && (
                <div className="space-y-2 border-t border-border px-4 py-3">
                  <Input
                    value={card.name}
                    onChange={(e) => patchBibleCard(workId, card.id, { name: e.target.value })}
                  />
                  <Textarea
                    value={card.summary}
                    onChange={(e) => patchBibleCard(workId, card.id, { summary: e.target.value })}
                    placeholder="Summary"
                    rows={2}
                  />
                  <Textarea
                    value={card.voice}
                    onChange={(e) => patchBibleCard(workId, card.id, { voice: e.target.value })}
                    placeholder="Voice"
                    rows={2}
                  />
                  <Textarea
                    value={card.secrets}
                    onChange={(e) => patchBibleCard(workId, card.id, { secrets: e.target.value })}
                    placeholder="Secrets — off-page until earned"
                    rows={2}
                  />
                  <Textarea
                    value={card.body}
                    onChange={(e) => patchBibleCard(workId, card.id, { body: e.target.value })}
                    placeholder="Notes"
                    rows={4}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBibleCard(workId, card.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
