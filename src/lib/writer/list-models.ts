import { createServerFn } from "@tanstack/react-start";
import { runListModels } from "./llm";

export const listModels = createServerFn({ method: "POST" })
  .validator((input: { baseUrl: string; apiKey: string }) => input)
  .handler(async ({ data }) => runListModels(data.baseUrl, data.apiKey));
