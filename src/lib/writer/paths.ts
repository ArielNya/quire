import { pad2 } from "./words";
import type { Arc, BibleCard, Chapter, Scene, Work } from "./types";

export function workRoot(work: Work): string {
  return `${work.folderName}/`;
}

export function biblePath(work: Work, card: BibleCard): string {
  const folder =
    card.kind === "character"
      ? "characters"
      : card.kind === "location"
        ? "locations"
        : "other";
  return `${work.folderName}/bible/${folder}/${card.slug}.md`;
}

export function arcPath(work: Work, arc: Arc): string {
  return `${work.folderName}/arcs/${pad2(arc.order)}-${arc.slug}.md`;
}

export function chapterDir(work: Work, chapter: Chapter): string {
  return `${work.folderName}/chapters/${pad2(chapter.order)}-${chapter.slug}/`;
}

export function scenePath(work: Work, chapter: Chapter, scene: Scene): string {
  return `${chapterDir(work, chapter)}scenes/${pad2(scene.order)}-${scene.slug}.md`;
}

export function compiledChapterPath(work: Work, chapter: Chapter): string {
  return `${chapterDir(work, chapter)}CHAPTER.md`;
}

export function breakdownPath(work: Work, chapter: Chapter): string {
  return `${chapterDir(work, chapter)}BREAKDOWN.md`;
}
