import { createFileRoute } from "@tanstack/react-router";
import { PartnerPanel } from "@/components/writer/partner-panel";
import { PathLabel } from "@/components/writer/path-label";
import { useWriterStore } from "@/lib/writer/store";

export const Route = createFileRoute("/works/$workId/partner")({
  component: PartnerPage,
});

function PartnerPage() {
  const { workId } = Route.useParams();
  const work = useWriterStore((s) => s.works.find((w) => w.id === workId));
  if (!work) return null;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-dvh">
      <div className="border-b border-border px-4 py-3">
        <h1 className="font-display text-2xl">Partner</h1>
        <PathLabel path={`${work.folderName}/`} />
      </div>
      <PartnerPanel work={work} className="min-h-0 flex-1" />
    </div>
  );
}
