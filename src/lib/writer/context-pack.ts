import type { Scene, Work } from "./types";
import { useWriterStore } from "./store";

export function bibleBlurb(work: Work, scene: Scene | null): string {
  const names = new Set<string>();
  const hay = `${scene?.body ?? ""} ${scene?.goal ?? ""} ${scene?.pov ?? ""}`.toLowerCase();
  for (const card of work.bible) {
    if (hay.includes(card.name.toLowerCase().split(" ")[0] ?? "")) {
      names.add(card.id);
    }
  }
  const picked =
    names.size > 0
      ? work.bible.filter((c) => names.has(c.id))
      : work.bible.slice(0, 4);
  return picked
    .map(
      (c) =>
        `### ${c.name} (${c.kind})\n${c.summary}\nVoice: ${c.voice}\nSecrets: ${c.secrets}\n${c.body}`,
    )
    .join("\n\n");
}

export function previousEnding(scene: Scene): string {
  const { scenes } = useWriterStore.getState();
  const sibs = scenes
    .filter((s) => s.chapterId === scene.chapterId)
    .sort((a, b) => a.order - b.order);
  const idx = sibs.findIndex((s) => s.id === scene.id);
  const prev = idx > 0 ? sibs[idx - 1] : null;
  if (!prev?.body) return "";
  const words = prev.body.trim().split(/\s+/);
  return words.slice(-180).join(" ");
}
