import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/works/$workId/chapters")({
  component: ChaptersLayout,
});

function ChaptersLayout() {
  return <Outlet />;
}
