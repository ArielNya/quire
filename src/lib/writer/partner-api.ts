import { runAskWriter, runListModels, type AskInput, type AskResult, type ModelsResult } from "./llm";

const native = import.meta.env.VITE_QUIRE_APK === "1";

export async function requestWriter(input: AskInput): Promise<AskResult> {
  if (native) return runAskWriter(input);
  const { askWriter } = await import("./ask");
  return askWriter({ data: input });
}

export async function requestModels(baseUrl: string, apiKey: string): Promise<ModelsResult> {
  if (native) return runListModels(baseUrl, apiKey);
  const { listModels } = await import("./list-models");
  return listModels({ data: { baseUrl, apiKey } });
}
