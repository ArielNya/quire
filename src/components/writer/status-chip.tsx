import { Badge } from "@/components/ui/badge";
import type { ChapterStatus, SceneStatus } from "@/lib/writer/types";

const LABELS: Record<ChapterStatus | SceneStatus, string> = {
  planning: "Planning",
  drafting: "Drafting",
  revising: "Revising",
  locked: "Locked",
  outline: "Outline",
  draft: "Draft",
  revise: "Revise",
  done: "Done",
};

export function StatusChip({
  status,
}: {
  status: ChapterStatus | SceneStatus;
}) {
  return <Badge>{LABELS[status]}</Badge>;
}
