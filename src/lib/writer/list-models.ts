import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_MODELS, modelsUrl } from "./openai";

export const listModels = createServerFn({ method: "POST" })
  .validator((input: { baseUrl: string; apiKey: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = data.apiKey.trim();
    if (!apiKey) {
      return { ok: false as const, error: "Add an API key first.", models: FALLBACK_MODELS };
    }

    try {
      const res = await fetch(modelsUrl(data.baseUrl), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        const detail =
          res.status === 401 || res.status === 403
            ? "Key rejected."
            : `Could not list models (${res.status}).`;
        return { ok: false as const, error: detail, models: FALLBACK_MODELS };
      }

      const body = (await res.json()) as {
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
        return { ok: false as const, error: "No models on this endpoint.", models: FALLBACK_MODELS };
      }
      return { ok: true as const, models };
    } catch {
      return {
        ok: false as const,
        error: "Could not reach that URL.",
        models: FALLBACK_MODELS,
      };
    }
  });
