import { create } from "zustand";
import { DEFAULT_BASE_URL, DEFAULT_MODEL, FALLBACK_MODELS } from "./openai";

const STORAGE_KEY = "quire-api-v1";

type ApiState = {
  apiKey: string;
  baseUrl: string;
  model: string;
  models: string[];
  setApiKey: (apiKey: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setModel: (model: string) => void;
  setModels: (models: string[]) => void;
};

export const useApiSettings = create<ApiState>()((set) => ({
  apiKey: "",
  baseUrl: DEFAULT_BASE_URL,
  model: DEFAULT_MODEL,
  models: FALLBACK_MODELS,
  setApiKey: (apiKey) => set({ apiKey }),
  setBaseUrl: (baseUrl) => set({ baseUrl }),
  setModel: (model) => set({ model }),
  setModels: (models) => set({ models }),
}));

type Persisted = Pick<ApiState, "apiKey" | "baseUrl" | "model">;

export function hydrateApiSettings() {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as Persisted;
    useApiSettings.setState({
      apiKey: typeof data.apiKey === "string" ? data.apiKey : "",
      baseUrl: data.baseUrl?.trim() || DEFAULT_BASE_URL,
      model: data.model?.trim() || DEFAULT_MODEL,
    });
  } catch {
    // keep defaults
  }
}

export function watchApiSettings() {
  if (typeof window === "undefined") return () => {};
  return useApiSettings.subscribe((s) => {
    const payload: Persisted = {
      apiKey: s.apiKey,
      baseUrl: s.baseUrl,
      model: s.model,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });
}
