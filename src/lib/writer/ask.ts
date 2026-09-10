import { createServerFn } from "@tanstack/react-start";
import { runAskWriter, type AskInput } from "./llm";

export type { AskInput, WriterMode } from "./llm";

export const askWriter = createServerFn({ method: "POST" })
  .validator((input: AskInput) => input)
  .handler(async ({ data }) => runAskWriter(data));
