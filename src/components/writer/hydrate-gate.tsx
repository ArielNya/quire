import { useEffect, type ReactNode } from "react";
import { hydrateApiSettings, watchApiSettings } from "@/lib/writer/api-settings";
import { hydrateWriterState, watchWriterState } from "@/lib/writer/store";

export function HydrateGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateWriterState();
    hydrateApiSettings();
    const stopWriter = watchWriterState();
    const stopApi = watchApiSettings();
    return () => {
      stopWriter();
      stopApi();
    };
  }, []);

  return children;
}
