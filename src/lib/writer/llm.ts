import {
  chatCompletionsUrl,
  DEFAULT_MODEL,
  FALLBACK_MODELS,
  modelsUrl,
} from "./openai";

export type WriterMode =
  | "continue"
  | "rewrite"
  | "dialogue"
  | "beats"
  | "continuity"
  | "partner"
  | "breakdown";

export type AskInput = {
  mode: WriterMode;
  instruction: string;
  selection?: string;
  project: string;
  style: string;
  memoryUser: string;
  memoryStory: string;
  memoryWorld: string;
  bible: string;
  path: string;
  body: string;
  extra?: string;
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type AskResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type ModelsResult =
  | { ok: true; models: string[] }
  | { ok: false; error: string; models: string[] };

async function requestJson(opts: {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: unknown;
  timeoutMs: number;
}): Promise<{ status: number; data: unknown }> {
  try {
    const cap = await import("@capacitor/core");
    if (cap.Capacitor.isNativePlatform()) {
      const res = await cap.CapacitorHttp.request({
        url: opts.url,
        method: opts.method,
        headers: opts.headers,
        data: opts.body,
        connectTimeout: opts.timeoutMs,
        readTimeout: opts.timeoutMs,
      });
      return { status: res.status, data: res.data };
    }
  } catch {
    // browser / no capacitor
  }

  const res = await fetch(opts.url, {
    method: opts.method,
    headers: opts.headers,
    signal: AbortSignal.timeout(opts.timeoutMs),
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const MODE_INSTRUCTIONS: Record<AskInput["mode"], string> = {
  continue:
    "Continue the scene from the end of the current body. Match voice exactly. Output ONLY the new prose — no preamble, no quotes around it, no notes.",
  rewrite:
    "Rewrite the selected passage (or the whole scene if no selection) per the instruction. Keep canon. Output ONLY the rewritten prose.",
  dialogue:
    "Rewrite or extend dialogue so each speaker is distinct and naturalistic. Keep tags sparse. Output ONLY the resulting prose for the affected stretch.",
  beats:
    "Propose the next 3–6 scene beats for this chapter. Short bullets. No prose draft unless asked. Stay inside the arc summary.",
  continuity:
    "Audit the current scene against STORY memory and the bible. List only real contradictions or risks. Be brief. If clean, say so in one line.",
  partner:
    "You are the writer's partner, not a chatbot. Answer the instruction. If they want prose, write it in voice. If they want craft talk, be blunt and specific. No cheerleading.",
  breakdown:
    "Turn the instruction and current materials into a scene-by-scene breakdown for this chapter. Numbered scenes with title, goal, and one-line end state. No drafted prose.",
};

function clip(text: string, n: number): string {
  const t = text.trim();
  if (t.length <= n) return t || "(empty)";
  return t.slice(0, n) + "\n…";
}

export async function runAskWriter(data: AskInput): Promise<AskResult> {
  const apiKey = data.apiKey.trim();
  if (!apiKey) {
    return { ok: false, error: "Add an API key in Connection." };
  }

  const system = [
    "You are Quire, a fiction writing partner.",
    "Never write code. Never suggest filesystems, shells, or engineering.",
    "Obey STYLE.md and do not break STORY.md canon. If the writer asks to break canon, flag it and wait.",
    "Do not tidy the writer's voice into generic literary English.",
    "No outlines of your reasoning unless the mode requires a list.",
    MODE_INSTRUCTIONS[data.mode],
  ].join(" ");

  const user = [
    `PATH: ${data.path}`,
    "",
    "## PROJECT.md",
    clip(data.project, 1800),
    "",
    "## STYLE.md",
    clip(data.style, 1800),
    "",
    "## memory/USER.md",
    clip(data.memoryUser, 800),
    "",
    "## memory/STORY.md",
    clip(data.memoryStory, 1400),
    "",
    "## memory/WORLD.md",
    clip(data.memoryWorld, 1000),
    "",
    "## BIBLE (relevant)",
    clip(data.bible, 2200),
    data.extra ? `\n## EXTRA\n${clip(data.extra, 1600)}` : "",
    "",
    "## CURRENT FILE",
    clip(data.body, 6000),
    data.selection ? `\n## SELECTION\n${clip(data.selection, 2500)}` : "",
    "",
    "## WRITER",
    data.instruction.trim() || "(no extra instruction)",
  ]
    .filter(Boolean)
    .join("\n");

  const maxTokens =
    data.mode === "continue" || data.mode === "rewrite" || data.mode === "dialogue"
      ? 1200
      : 700;

  let status: number;
  let payload: unknown;
  try {
    const res = await requestJson({
      url: chatCompletionsUrl(data.baseUrl),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeoutMs: 60_000,
      body: {
        model: data.model.trim() || DEFAULT_MODEL,
        temperature: data.mode === "continuity" ? 0.3 : 0.9,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
    });
    status = res.status;
    payload = res.data;
  } catch {
    return { ok: false, error: "Could not reach that URL." };
  }

  if (status < 200 || status >= 300) {
    if (status === 401 || status === 403) {
      return { ok: false, error: "Key rejected by the endpoint." };
    }
    return { ok: false, error: `Partner failed (${status}). Try again.` };
  }

  const body = payload as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, error: "Empty reply." };
  return { ok: true, text };
}

export async function runListModels(baseUrl: string, apiKey: string): Promise<ModelsResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, error: "Add an API key first.", models: FALLBACK_MODELS };
  }

  let status: number;
  let payload: unknown;
  try {
    const res = await requestJson({
      url: modelsUrl(baseUrl),
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
      timeoutMs: 15_000,
    });
    status = res.status;
    payload = res.data;
  } catch {
    return { ok: false, error: "Could not reach that URL.", models: FALLBACK_MODELS };
  }

  if (status < 200 || status >= 300) {
    const detail =
      status === 401 || status === 403 ? "Key rejected." : `Could not list models (${status}).`;
    return { ok: false, error: detail, models: FALLBACK_MODELS };
  }

  const body = payload as {
    data?: { id?: string }[];
    models?: { id?: string; name?: string }[];
  };
  const ids = new Set<string>();
  for (const row of body.data ?? []) {
    if (row.id) ids.add(row.id);
  }
  for (const row of body.models ?? []) {
    const id = row.id ?? row.name;
    if (id) ids.add(id);
  }
  const models = [...ids].sort((a, b) => a.localeCompare(b));
  if (models.length === 0) {
    return { ok: false, error: "No models on this endpoint.", models: FALLBACK_MODELS };
  }
  return { ok: true, models };
}
