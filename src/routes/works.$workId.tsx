import { createFileRoute } from "@tanstack/react-router";
import { WorkShell } from "@/components/writer/work-shell";

export const Route = createFileRoute("/works/$workId")({
  component: WorkLayout,
});

function WorkLayout() {
  const { workId } = Route.useParams();
  return <WorkShell workId={workId} />;
}
