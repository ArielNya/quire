import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConnectionDialog } from "@/components/writer/connection-dialog";
import { type WriterMode } from "@/lib/writer/ask";
import { requestWriter } from "@/lib/writer/partner-api";
import { withAgentFlight } from "@/lib/writer/flight";
import { useApiSettings } from "@/lib/writer/api-settings";
import { bibleBlurb, previousEnding } from "@/lib/writer/context-pack";
import { chapterDir, scenePath } from "@/lib/writer/paths";
import { useWriterStore } from "@/lib/writer/store";
import type { Chapter, Scene, Work } from "@/lib/writer/types";
import { cn } from "@/lib/utils";

const MODES: { id: WriterMode; label: string }[] = [
  { id: "partner", label: "Ask" },
  { id: "continue", label: "Continue" },
  { id: "rewrite", label: "Rewrite" },
  { id: "dialogue", label: "Dialogue" },
  { id: "beats", label: "Beats" },
  { id: "continuity", label: "Canon" },
  { id: "breakdown", label: "Breakdown" },
];

export function PartnerPanel({
  work,
  chapter,
  scene,
  selection,
  className,
}: {
  work: Work;
  chapter?: Chapter;
  scene?: Scene;
  selection?: string;
  className?: string;
}) {
  const visibleModes = scene
    ? MODES
    : MODES.filter((m) => m.id === "partner" || m.id === "beats" || m.id === "breakdown" || m.id === "continuity");
  const [mode, setMode] = useState<WriterMode>(scene ? "continue" : "partner");

  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addMessage = useWriterStore((s) => s.addMessage);
  const addTake = useWriterStore((s) => s.addTake);
  const allMessages = useWriterStore((s) => s.messages);
  const hasKey = useApiSettings((s) => s.apiKey.trim().length > 0);
  const model = useApiSettings((s) => s.model);
  const messages = allMessages.filter(
    (m) => m.workId === work.id && (scene ? m.sceneId === scene.id : m.sceneId === null),
  );

  async function run() {
    await withAgentFlight(async () => {
    setBusy(true);
    setError(null);
    const prompt =
      instruction.trim() ||
      (mode === "continue"
        ? "Continue from the end."
        : mode === "rewrite"
          ? "Tighten this. Stay in voice."
          : mode === "dialogue"
            ? "Make the speech sound like these people."
            : mode === "beats"
              ? "Next scenes for this chapter."
              : mode === "continuity"
                ? "Check this against canon."
                : mode === "breakdown"
                  ? "Scene breakdown for this chapter."
                  : "What should I watch for in this scene?");
    addMessage(work.id, scene?.id ?? null, "user", prompt);
    const extra = [
      chapter ? `Chapter breakdown:\n${chapter.breakdown}` : "",
      scene ? `Previous scene ending:\n${previousEnding(scene)}` : "",
      work.arcs.map((a) => `${a.order}. ${a.title}: ${a.summary}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    const creds = useApiSettings.getState();
    if (!creds.apiKey.trim()) {
      setBusy(false);
      setError("Add an API key in Connection.");
      return;
    }
    const result = await requestWriter({
        mode,
        instruction: prompt,
        selection,
        project: work.project,
        style: work.style,
        memoryUser: work.memoryUser,
        memoryStory: work.memoryStory,
        memoryWorld: work.memoryWorld,
        bible: bibleBlurb(work, scene ?? null),
        path: scene && chapter
          ? scenePath(work, chapter, scene)
          : chapter
            ? chapterDir(work, chapter)
            : `${work.folderName}/`,
        body: scene?.body ?? chapter?.breakdown ?? work.project,
        extra,
        apiKey: creds.apiKey,
        baseUrl: creds.baseUrl,
        model: creds.model,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    addMessage(work.id, scene?.id ?? null, "assistant", result.text);
    if (scene && (mode === "continue" || mode === "rewrite" || mode === "dialogue")) {
      addTake(scene.id, result.text, mode);
    }
    setInstruction("");
    });
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-card", className)}>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
        {visibleModes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!hasKey && (
          <div className="rounded-lg border border-border bg-secondary p-3">
            <p className="mb-2 text-sm text-muted-foreground">
              Partner needs your DeepSeek key (or any OpenAI-compatible endpoint).
            </p>
            <ConnectionDialog />
          </div>
        )}
        {hasKey && (
          <p className="truncate font-mono text-[11px] text-muted-foreground">{model}</p>
        )}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Partner stays on this file. Continue writes a take you can accept. Canon checks story memory.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("rounded-lg px-3 py-2 text-sm", m.role === "user" ? "bg-secondary" : "bg-accent")}>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {m.role === "user" ? "You" : "Partner"}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
          </div>
        ))}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <form
        className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) void run();
        }}
      >
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={
            mode === "continue"
              ? "Optional steer — or just run"
              : "What do you need"
          }
          rows={3}
          className="mb-2"
        />
        <Button type="submit" className="w-full" disabled={busy || !hasKey}>
          {busy ? "Working…" : mode === "continue" ? "Continue scene" : "Run"}
        </Button>
      </form>
    </div>
  );
}
