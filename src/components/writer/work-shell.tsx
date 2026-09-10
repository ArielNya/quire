import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BookOpen, Folder, Layers, MessageSquare, PenLine } from "lucide-react";
import { ConnectionDialog } from "@/components/writer/connection-dialog";
import { PathLabel } from "@/components/writer/path-label";
import { useWriterStore } from "@/lib/writer/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/works/$workId", label: "Desk", icon: PenLine, end: true },
  { to: "/works/$workId/bible", label: "Bible", icon: BookOpen, end: false },
  { to: "/works/$workId/arcs", label: "Arcs", icon: Layers, end: false },
  { to: "/works/$workId/chapters", label: "Chapters", icon: Folder, end: false },
  { to: "/works/$workId/partner", label: "Partner", icon: MessageSquare, end: false },
] as const;

export function WorkShell({ workId }: { workId: string }) {
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!work) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6">
        <p className="font-display text-2xl">Work not found</p>
        <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to shelf
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside className="hidden min-h-dvh w-56 shrink-0 flex-col border-r border-border md:flex">
        <Link to="/" className="px-5 pt-6 font-display text-2xl tracking-tight">
          Quire
        </Link>
        <p className="px-5 pt-4 text-sm font-medium">{work.title}</p>
        <PathLabel path={`${work.folderName}/`} className="px-5" />
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const href = item.to.replace("$workId", workId);
            const active = item.end
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                params={{ workId }}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-3 py-4">
          <ConnectionDialog />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:hidden">
          <Link to="/" className="font-display text-xl">
            Quire
          </Link>
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm text-muted-foreground">{work.title}</span>
            <ConnectionDialog compact />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        {NAV.map((item) => {
          const href = item.to.replace("$workId", workId);
          const active = item.end
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              params={{ workId }}
              className={cn(
                "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
