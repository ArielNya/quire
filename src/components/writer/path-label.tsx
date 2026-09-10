import { cn } from "@/lib/utils";

export function PathLabel({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "truncate font-mono text-[11px] tracking-tight text-muted-foreground",
        className,
      )}
    >
      {path}
    </p>
  );
}
