import type { Chapter, Scene } from "./types";

const BREAK = "\n\n* * *\n\n";

export function compileScenes(chapter: Chapter, scenes: Scene[]): string {
  const ordered = [...scenes].sort((a, b) => a.order - b.order);
  const parts = ordered
    .map((scene) => scene.body.trim())
    .filter(Boolean);
  const header = `# ${chapter.title}\n\n`;
  if (parts.length === 0) return header.trimEnd() + "\n";
  return header + parts.join(BREAK) + "\n";
}
