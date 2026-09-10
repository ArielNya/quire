import { createServerFn } from "@tanstack/react-start";
import { chatCompletionsUrl, DEFAULT_MODEL } from "./openai";

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

const MODE_INSTRUCTIONS: Record<WriterMode, string> = {
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

export const askWriter = createServerFn({ method: "POST" })
  .validator((input: AskInput) => input)
  .handler(async ({ data }) => {
    const apiKey = data.apiKey.trim();
    if (!apiKey) {
      return { ok: false as const, error: "Add an API key in Connection." };
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

    let res: Response;
    try {
      res = await fetch(chatCompletionsUrl(data.baseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(60_000),
        body: JSON.stringify({
          model: data.model.trim() || DEFAULT_MODEL,
          temperature: data.mode === "continuity" ? 0.3 : 0.9,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
    } catch {
      return { ok: false as const, error: "Could not reach that URL." };
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false as const, error: "Key rejected by the endpoint." };
      }
      return { ok: false as const, error: `Partner failed (${res.status}). Try again.` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Empty reply." };
    return { ok: true as const, text };
  });

function clip(text: string, n: number): string {
  const t = text.trim();
  if (t.length <= n) return t || "(empty)";
  return t.slice(0, n) + "\n…";
}
