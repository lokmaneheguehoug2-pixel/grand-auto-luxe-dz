import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/car/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/vehicle/$id", params: { id: params.id } });
  },
});
