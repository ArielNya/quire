export const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
export const DEFAULT_MODEL = "deepseek-chat";

export const FALLBACK_MODELS = [
  "deepseek-chat",
  "deepseek-reasoner",
  "deepseek-v4-flash",
  "deepseek-v4-pro",
];

export function normalizeOpenAiBase(raw: string): string {
  let url = raw.trim();
  if (!url) url = DEFAULT_BASE_URL;
  url = url.replace(/\/+$/, "");
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    if (path === "" || path === "/") {
      parsed.pathname = "/v1";
      return parsed.toString().replace(/\/+$/, "");
    }
    return `${parsed.origin}${path}`;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function chatCompletionsUrl(base: string): string {
  const b = normalizeOpenAiBase(base);
  return `${b}/chat/completions`;
}

export function modelsUrl(base: string): string {
  const b = normalizeOpenAiBase(base);
  return `${b}/models`;
}
