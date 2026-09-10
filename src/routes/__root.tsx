import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateGate } from "@/components/writer/hydrate-gate";
import appCss from "../styles.css?url";

const APP_NAME = "Quire";
const apk = import.meta.env.VITE_QUIRE_APK === "1";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0c0c0d" },
      {
        name: "description",
        content: "Scene-by-scene manuscript desk. Bible, arcs, chapter folders, then compile.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap",
      },
    ],
  }),
  component: apk ? ApkRoot : WebRoot,
});

function ApkRoot() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <HydrateGate>
        <Outlet />
      </HydrateGate>
    </div>
  );
}

function WebRoot() {
  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background font-sans text-foreground">
        <PreviewHostBridge />
        <AuthProvider>
          <HydrateGate>
            <Outlet />
          </HydrateGate>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
