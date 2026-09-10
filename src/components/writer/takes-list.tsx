import { Button } from "@/components/ui/button";
import { useWriterStore } from "@/lib/writer/store";

export function TakesList({ sceneId }: { sceneId: string }) {
  const allTakes = useWriterStore((s) => s.takes);
  const takes = allTakes.filter((t) => t.sceneId === sceneId);
  const applyTake = useWriterStore((s) => s.applyTake);
  const dismissTake = useWriterStore((s) => s.dismissTake);

  if (takes.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-paper-muted bg-paper px-4 py-3 text-ink">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">Takes</p>
      {takes.map((take) => (
        <div key={take.id} className="rounded-lg border border-paper-muted bg-paper p-3">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">{take.note}</p>
          <p className="mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap font-serif text-sm leading-relaxed">
            {take.body}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => applyTake(take.id, "append")}>
              Append
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyTake(take.id, "replace")}>
              Replace scene
            </Button>
            <Button size="sm" variant="ghost" onClick={() => dismissTake(take.id)}>
              Dismiss
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
