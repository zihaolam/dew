import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "stack";

const indexOptions = queryOptions({
  queryKey: ["/"],
  queryFn: async ({ signal }) => {
    const result = await api.index.get({ fetch: { signal } });
    if (result.error != null) {
      throw result.error;
    }
    return result.data;
  },
});

export const Route = createFileRoute("/")({
  component: IndexPage,
  async loader({ context: { queryClient } }) {
    await queryClient.prefetchQuery(indexOptions);
  },
});

export function IndexPage() {
  const index = useSuspenseQuery(indexOptions);
  return (
    <>
      <div className="relative h-dvh w-dvw grid place-items-center">
        <div className="text-xs">
          <span className="font-medium">Result:</span>{" "}
          <pre className="inline">{JSON.stringify(index.data)}</pre>
        </div>
      </div>
    </>
  );
}
