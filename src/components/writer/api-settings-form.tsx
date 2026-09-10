import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiSettings } from "@/lib/writer/api-settings";
import { listModels } from "@/lib/writer/list-models";
import { DEFAULT_BASE_URL, DEFAULT_MODEL } from "@/lib/writer/openai";
import { cn } from "@/lib/utils";

export function ApiSettingsForm({ className }: { className?: string }) {
  const apiKey = useApiSettings((s) => s.apiKey);
  const baseUrl = useApiSettings((s) => s.baseUrl);
  const model = useApiSettings((s) => s.model);
  const models = useApiSettings((s) => s.models);
  const setApiKey = useApiSettings((s) => s.setApiKey);
  const setBaseUrl = useApiSettings((s) => s.setBaseUrl);
  const setModel = useApiSettings((s) => s.setModel);
  const setModels = useApiSettings((s) => s.setModels);

  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lastFetch = useRef("");

  async function refresh(force = false) {
    const key = useApiSettings.getState().apiKey.trim();
    const url = useApiSettings.getState().baseUrl.trim() || DEFAULT_BASE_URL;
    if (!key) {
      setStatus("Paste a key, then load models.");
      return;
    }
    const stamp = `${url}::${key}`;
    if (!force && stamp === lastFetch.current) return;
    setBusy(true);
    setStatus("Loading models…");
    const result = await listModels({ data: { baseUrl: url, apiKey: key } });
    setBusy(false);
    lastFetch.current = stamp;
    if (!result.ok) {
      setModels(result.models);
      setStatus(result.error);
      return;
    }
    setModels(result.models);
    const current = useApiSettings.getState().model;
    if (!result.models.includes(current)) {
      const next =
        result.models.find((id) => id === DEFAULT_MODEL) ??
        result.models.find((id) => id.includes("flash") || id.includes("chat")) ??
        result.models[0];
      if (next) setModel(next);
    }
    setStatus(`${result.models.length} models from this endpoint.`);
  }

  useEffect(() => {
    if (useApiSettings.getState().apiKey.trim()) void refresh();
  }, []);

  const known = models.includes(model) ? models : [model, ...models];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label htmlFor="api-key">API key</Label>
        <div className="flex gap-2">
          <Input
            id="api-key"
            autoComplete="off"
            spellCheck={false}
            type={showKey ? "text" : "password"}
            value={apiKey}
            placeholder="sk-…"
            onChange={(e) => setApiKey(e.target.value)}
            onBlur={() => {
              if (apiKey.trim()) void refresh(true);
            }}
          />
          <Button type="button" variant="outline" onClick={() => setShowKey((v) => !v)}>
            {showKey ? "Hide" : "Show"}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="api-url">OpenAI-compatible URL</Label>
        <Input
          id="api-url"
          autoComplete="off"
          spellCheck={false}
          value={baseUrl}
          placeholder={DEFAULT_BASE_URL}
          onChange={(e) => setBaseUrl(e.target.value)}
          onBlur={() => {
            if (!baseUrl.trim()) setBaseUrl(DEFAULT_BASE_URL);
            if (apiKey.trim()) void refresh(true);
          }}
        />
        <p className="text-xs text-muted-foreground">
          Defaults to DeepSeek official. Any /v1 chat-completions host works.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="api-model">Model</Label>
        <select
          id="api-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {known.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void refresh(true)}>
          {busy ? "Loading…" : "Load models"}
        </Button>
        {status && (
          <p className="text-xs text-muted-foreground" role="status">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
