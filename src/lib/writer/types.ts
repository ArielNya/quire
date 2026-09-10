export type BibleKind = "character" | "location" | "other";

export type BibleCard = {
  id: string;
  kind: BibleKind;
  name: string;
  slug: string;
  summary: string;
  voice: string;
  secrets: string;
  body: string;
};

export type Arc = {
  id: string;
  order: number;
  title: string;
  slug: string;
  summary: string;
  notes: string;
};

export type ChapterStatus = "planning" | "drafting" | "revising" | "locked";

export type Chapter = {
  id: string;
  workId: string;
  arcId: string | null;
  order: number;
  title: string;
  slug: string;
  breakdown: string;
  compiledBody: string;
  compiledAt: number | null;
  status: ChapterStatus;
};

export type SceneStatus = "outline" | "draft" | "revise" | "done";

export type Scene = {
  id: string;
  workId: string;
  chapterId: string;
  order: number;
  title: string;
  slug: string;
  goal: string;
  pov: string;
  body: string;
  status: SceneStatus;
};

export type ChatMessage = {
  id: string;
  workId: string;
  sceneId: string | null;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Take = {
  id: string;
  sceneId: string;
  body: string;
  note: string;
  createdAt: number;
};

export type Work = {
  id: string;
  title: string;
  folderName: string;
  logline: string;
  createdAt: number;
  updatedAt: number;
  lastSceneId: string | null;
  project: string;
  style: string;
  memoryUser: string;
  memoryStory: string;
  memoryWorld: string;
  bible: BibleCard[];
  arcs: Arc[];
};

export type WriterState = {
  works: Work[];
  chapters: Chapter[];
  scenes: Scene[];
  messages: ChatMessage[];
  takes: Take[];
  editorScale: "md" | "lg";
};
