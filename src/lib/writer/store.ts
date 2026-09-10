import { create } from "zustand";
import { compileScenes } from "./compile";
import { seedChapters, seedScenes, seedWork } from "./seed";
import { slugify } from "./words";
import type {
  BibleCard,
  BibleKind,
  Chapter,
  ChapterStatus,
  Scene,
  SceneStatus,
  Work,
  WriterState,
} from "./types";

function uid(): string {
  return crypto.randomUUID();
}

function touch(work: Work): Work {
  return { ...work, updatedAt: Date.now() };
}

export type WriterStore = WriterState & {
  hydrated: boolean;
  ensureSeed: () => void;
  createWork: (input: { title: string; logline: string }) => string;
  deleteWork: (workId: string) => void;
  patchWork: (workId: string, patch: Partial<Work>) => void;
  setLastScene: (workId: string, sceneId: string | null) => void;
  addBibleCard: (workId: string, kind: BibleKind) => string;
  patchBibleCard: (workId: string, cardId: string, patch: Partial<BibleCard>) => void;
  removeBibleCard: (workId: string, cardId: string) => void;
  addArc: (workId: string) => string;
  patchArc: (
    workId: string,
    arcId: string,
    patch: Partial<Work["arcs"][number]>,
  ) => void;
  removeArc: (workId: string, arcId: string) => void;
  addChapter: (workId: string, arcId: string | null, title: string) => string;
  patchChapter: (chapterId: string, patch: Partial<Chapter>) => void;
  removeChapter: (chapterId: string) => void;
  addScene: (chapterId: string, title: string) => string;
  patchScene: (sceneId: string, patch: Partial<Scene>) => void;
  removeScene: (sceneId: string) => void;
  moveScene: (sceneId: string, direction: -1 | 1) => void;
  compileChapter: (chapterId: string) => void;
  addTake: (sceneId: string, body: string, note: string) => void;
  applyTake: (takeId: string, mode: "replace" | "append") => void;
  dismissTake: (takeId: string) => void;
  addMessage: (
    workId: string,
    sceneId: string | null,
    role: "user" | "assistant",
    content: string,
  ) => void;
  setEditorScale: (scale: "md" | "lg") => void;
  exportWorkText: (workId: string) => string;
};

const empty: WriterState = {
  works: [seedWork()],
  chapters: seedChapters(),
  scenes: seedScenes(),
  messages: [],
  takes: [],
  editorScale: "md",
};

const STORAGE_KEY = "quire-writer-v1";

export const useWriterStore = create<WriterStore>()((set, get) => ({
      ...empty,
      hydrated: true,
      ensureSeed: () => {
        const { works } = get();
        if (works.length > 0) return;
        set({
          works: [seedWork()],
          chapters: seedChapters(),
          scenes: seedScenes(),
        });
      },
      createWork: ({ title, logline }) => {
        const id = uid();
        const folderName = title.trim() || "Untitled";
        const work: Work = {
          id,
          title: folderName,
          folderName: folderName.replace(/\s+/g, ""),
          logline,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastSceneId: null,
          project: `Title: ${folderName}\nForm:\nPromise:\n\nDo nots:\n`,
          style: `POV:\nTense:\nSentence habits:\nDialogue:\nDo not:\n`,
          memoryUser: "",
          memoryStory: "",
          memoryWorld: "",
          bible: [],
          arcs: [
            {
              id: uid(),
              order: 1,
              title: "Arc 1",
              slug: "arc-1",
              summary: "",
              notes: "",
            },
          ],
        };
        set((s) => ({ works: [work, ...s.works] }));
        return id;
      },
      deleteWork: (workId) => {
        set((s) => ({
          works: s.works.filter((w) => w.id !== workId),
          chapters: s.chapters.filter((c) => c.workId !== workId),
          scenes: s.scenes.filter((sc) => sc.workId !== workId),
          messages: s.messages.filter((m) => m.workId !== workId),
          takes: s.takes.filter((t) => {
            const scene = s.scenes.find((sc) => sc.id === t.sceneId);
            return scene?.workId !== workId;
          }),
        }));
      },
      patchWork: (workId, patch) => {
        set((s) => ({
          works: s.works.map((w) => (w.id === workId ? touch({ ...w, ...patch }) : w)),
        }));
      },
      setLastScene: (workId, sceneId) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId ? touch({ ...w, lastSceneId: sceneId }) : w,
          ),
        }));
      },
      addBibleCard: (workId, kind) => {
        const id = uid();
        const name = kind === "character" ? "New character" : kind === "location" ? "New place" : "New note";
        const card: BibleCard = {
          id,
          kind,
          name,
          slug: slugify(name) + "-" + id.slice(0, 4),
          summary: "",
          voice: "",
          secrets: "",
          body: "",
        };
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId ? touch({ ...w, bible: [...w.bible, card] }) : w,
          ),
        }));
        return id;
      },
      patchBibleCard: (workId, cardId, patch) => {
        set((s) => ({
          works: s.works.map((w) => {
            if (w.id !== workId) return w;
            return touch({
              ...w,
              bible: w.bible.map((c) => {
                if (c.id !== cardId) return c;
                const next = { ...c, ...patch };
                if (patch.name) next.slug = slugify(patch.name);
                return next;
              }),
            });
          }),
        }));
      },
      removeBibleCard: (workId, cardId) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touch({ ...w, bible: w.bible.filter((c) => c.id !== cardId) })
              : w,
          ),
        }));
      },
      addArc: (workId) => {
        const id = uid();
        set((s) => ({
          works: s.works.map((w) => {
            if (w.id !== workId) return w;
            const order = w.arcs.length + 1;
            return touch({
              ...w,
              arcs: [
                ...w.arcs,
                {
                  id,
                  order,
                  title: `Arc ${order}`,
                  slug: slugify(`arc-${order}`),
                  summary: "",
                  notes: "",
                },
              ],
            });
          }),
        }));
        return id;
      },
      patchArc: (workId, arcId, patch) => {
        set((s) => ({
          works: s.works.map((w) => {
            if (w.id !== workId) return w;
            return touch({
              ...w,
              arcs: w.arcs.map((a) => {
                if (a.id !== arcId) return a;
                const next = { ...a, ...patch };
                if (patch.title) next.slug = slugify(patch.title);
                return next;
              }),
            });
          }),
        }));
      },
      removeArc: (workId, arcId) => {
        set((s) => ({
          works: s.works.map((w) =>
            w.id === workId
              ? touch({ ...w, arcs: w.arcs.filter((a) => a.id !== arcId).map((a, i) => ({ ...a, order: i + 1 })) })
              : w,
          ),
          chapters: s.chapters.map((c) =>
            c.arcId === arcId ? { ...c, arcId: null } : c,
          ),
        }));
      },
      addChapter: (workId, arcId, title) => {
        const id = uid();
        const existing = get().chapters.filter((c) => c.workId === workId);
        const order = existing.length + 1;
        const chapter: Chapter = {
          id,
          workId,
          arcId,
          order,
          title: title.trim() || `Chapter ${order}`,
          slug: slugify(title.trim() || `chapter-${order}`),
          breakdown: "",
          compiledBody: "",
          compiledAt: null,
          status: "planning",
        };
        set((s) => ({ chapters: [...s.chapters, chapter] }));
        get().patchWork(workId, {});
        return id;
      },
      patchChapter: (chapterId, patch) => {
        set((s) => ({
          chapters: s.chapters.map((c) => {
            if (c.id !== chapterId) return c;
            const next = { ...c, ...patch };
            if (patch.title) next.slug = slugify(patch.title);
            return next;
          }),
        }));
      },
      removeChapter: (chapterId) => {
        set((s) => ({
          chapters: s.chapters.filter((c) => c.id !== chapterId),
          scenes: s.scenes.filter((sc) => sc.chapterId !== chapterId),
        }));
      },
      addScene: (chapterId, title) => {
        const chapter = get().chapters.find((c) => c.id === chapterId);
        if (!chapter) return "";
        const id = uid();
        const siblings = get().scenes.filter((sc) => sc.chapterId === chapterId);
        const order = siblings.length + 1;
        const scene: Scene = {
          id,
          workId: chapter.workId,
          chapterId,
          order,
          title: title.trim() || `Scene ${order}`,
          slug: slugify(title.trim() || `scene-${order}`),
          goal: "",
          pov: "",
          body: "",
          status: "outline",
        };
        set((s) => ({ scenes: [...s.scenes, scene] }));
        get().setLastScene(chapter.workId, id);
        return id;
      },
      patchScene: (sceneId, patch) => {
        set((s) => ({
          scenes: s.scenes.map((sc) => {
            if (sc.id !== sceneId) return sc;
            const next = { ...sc, ...patch };
            if (patch.title) next.slug = slugify(patch.title);
            return next;
          }),
        }));
      },
      removeScene: (sceneId) => {
        set((s) => ({
          scenes: s.scenes
            .filter((sc) => sc.id !== sceneId)
            .map((sc, _i, arr) => {
              const sibs = arr
                .filter((x) => x.chapterId === sc.chapterId)
                .sort((a, b) => a.order - b.order);
              const order = sibs.findIndex((x) => x.id === sc.id) + 1;
              return { ...sc, order };
            }),
          takes: s.takes.filter((t) => t.sceneId !== sceneId),
        }));
      },
      moveScene: (sceneId, direction) => {
        set((s) => {
          const scene = s.scenes.find((sc) => sc.id === sceneId);
          if (!scene) return s;
          const sibs = s.scenes
            .filter((sc) => sc.chapterId === scene.chapterId)
            .sort((a, b) => a.order - b.order);
          const idx = sibs.findIndex((sc) => sc.id === sceneId);
          const swap = sibs[idx + direction];
          if (!swap) return s;
          return {
            scenes: s.scenes.map((sc) => {
              if (sc.id === scene.id) return { ...sc, order: swap.order };
              if (sc.id === swap.id) return { ...sc, order: scene.order };
              return sc;
            }),
          };
        });
      },
      compileChapter: (chapterId) => {
        const chapter = get().chapters.find((c) => c.id === chapterId);
        if (!chapter) return;
        const scenes = get().scenes.filter((sc) => sc.chapterId === chapterId);
        const compiledBody = compileScenes(chapter, scenes);
        get().patchChapter(chapterId, {
          compiledBody,
          compiledAt: Date.now(),
          status: chapter.status === "planning" ? "drafting" : chapter.status,
        });
      },
      addTake: (sceneId, body, note) => {
        set((s) => ({
          takes: [
            {
              id: uid(),
              sceneId,
              body,
              note,
              createdAt: Date.now(),
            },
            ...s.takes,
          ],
        }));
      },
      applyTake: (takeId, mode) => {
        const take = get().takes.find((t) => t.id === takeId);
        if (!take) return;
        const scene = get().scenes.find((sc) => sc.id === take.sceneId);
        if (!scene) return;
        const body =
          mode === "replace"
            ? take.body
            : scene.body.trim()
              ? `${scene.body.trim()}\n\n${take.body.trim()}`
              : take.body;
        get().patchScene(scene.id, {
          body,
          status: scene.status === "outline" ? "draft" : scene.status,
        });
        get().dismissTake(takeId);
      },
      dismissTake: (takeId) => {
        set((s) => ({ takes: s.takes.filter((t) => t.id !== takeId) }));
      },
      addMessage: (workId, sceneId, role, content) => {
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: uid(),
              workId,
              sceneId,
              role,
              content,
              createdAt: Date.now(),
            },
          ],
        }));
      },
      setEditorScale: (scale) => set({ editorScale: scale }),
      exportWorkText: (workId) => {
        const work = get().works.find((w) => w.id === workId);
        if (!work) return "";
        const chapters = get()
          .chapters.filter((c) => c.workId === workId)
          .sort((a, b) => a.order - b.order);
        const scenes = get().scenes.filter((sc) => sc.workId === workId);
        const lines: string[] = [];
        const push = (path: string, body: string) => {
          lines.push(`---\n# ${path}\n\n${body.trim()}\n`);
        };
        push(`${work.folderName}/PROJECT.md`, work.project);
        push(`${work.folderName}/STYLE.md`, work.style);
        push(`${work.folderName}/memory/USER.md`, work.memoryUser);
        push(`${work.folderName}/memory/STORY.md`, work.memoryStory);
        push(`${work.folderName}/memory/WORLD.md`, work.memoryWorld);
        for (const card of work.bible) {
          const folder =
            card.kind === "character"
              ? "characters"
              : card.kind === "location"
                ? "locations"
                : "other";
          push(
            `${work.folderName}/bible/${folder}/${card.slug}.md`,
            `# ${card.name}\n\n${card.summary}\n\n## Voice\n${card.voice}\n\n## Secrets\n${card.secrets}\n\n${card.body}`,
          );
        }
        for (const arc of [...work.arcs].sort((a, b) => a.order - b.order)) {
          push(
            `${work.folderName}/arcs/${String(arc.order).padStart(2, "0")}-${arc.slug}.md`,
            `# ${arc.title}\n\n${arc.summary}\n\n${arc.notes}`,
          );
        }
        for (const ch of chapters) {
          const dir = `${work.folderName}/chapters/${String(ch.order).padStart(2, "0")}-${ch.slug}`;
          push(`${dir}/BREAKDOWN.md`, ch.breakdown);
          if (ch.compiledBody) push(`${dir}/CHAPTER.md`, ch.compiledBody);
          const chScenes = scenes
            .filter((sc) => sc.chapterId === ch.id)
            .sort((a, b) => a.order - b.order);
          for (const sc of chScenes) {
            push(
              `${dir}/scenes/${String(sc.order).padStart(2, "0")}-${sc.slug}.md`,
              `# ${sc.title}\n\nGoal: ${sc.goal}\nPOV: ${sc.pov}\n\n${sc.body}`,
            );
          }
        }
        return lines.join("\n");
      },
}));

type Persisted = Pick<
  WriterState,
  "works" | "chapters" | "scenes" | "messages" | "takes" | "editorScale"
>;

function sliceState(s: WriterStore): Persisted {
  return {
    works: s.works,
    chapters: s.chapters,
    scenes: s.scenes,
    messages: s.messages,
    takes: s.takes,
    editorScale: s.editorScale,
  };
}

export function hydrateWriterState() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Persisted & { state?: Persisted };
    const data = parsed.state ?? parsed;
    if (Array.isArray(data.works) && data.works.length > 0) {
      useWriterStore.setState({
        works: data.works,
        chapters: data.chapters ?? [],
        scenes: data.scenes ?? [],
        messages: data.messages ?? [],
        takes: data.takes ?? [],
        editorScale: data.editorScale ?? "md",
      });
    }
  } catch {
    // keep seed
  }
}

export function watchWriterState() {
  if (typeof window === "undefined") return () => {};
  return useWriterStore.subscribe((s) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sliceState(s)));
  });
}

export function selectWork(workId: string) {
  return useWriterStore.getState().works.find((w) => w.id === workId);
}

export function workWordCount(workId: string): number {
  const { scenes } = useWriterStore.getState();
  return scenes
    .filter((s) => s.workId === workId)
    .reduce((n, s) => n + (s.body.trim() ? s.body.trim().split(/\s+/).length : 0), 0);
}

export function setChapterStatus(id: string, status: ChapterStatus) {
  useWriterStore.getState().patchChapter(id, { status });
}

export function setSceneStatus(id: string, status: SceneStatus) {
  useWriterStore.getState().patchScene(id, { status });
}
