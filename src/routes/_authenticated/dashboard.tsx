import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listCapsules } from "@/lib/capsules.functions";
import { Plus, Sparkles, ArrowRight, Loader2 } from "lucide-react";

const capsulesQuery = queryOptions({
  queryKey: ["capsules"],
  queryFn: () => listCapsules(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your Capsules — CapsuleHub" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Capsules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portable memories of your AI conversations.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white ring-brand"
        >
          <Plus className="h-4 w-4" />
          New Capsule
        </Link>
      </div>

      <div className="mt-8">
        <Suspense fallback={<Skeleton />}>
          <CapsuleList />
        </Suspense>
      </div>
    </div>
  );
}

function CapsuleList() {
  const { data } = useSuspenseQuery(capsulesQuery);
  if (!data.capsules.length) return <EmptyState />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.capsules.map((c) => (
        <Link
          key={c.id}
          to="/capsules/$id"
          params={{ id: c.id }}
          className="glass rounded-2xl p-5 transition-colors hover:bg-white/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-white/5 px-2 py-0.5">
                  {c.source_ai ?? "unknown"}
                </span>
                <span>
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="mt-2 line-clamp-1 text-lg font-semibold">{c.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {(c.tags ?? []).slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2 py-0.5">
                  #{t}
                </span>
              ))}
            </div>
            <div>
              {c.tokens_original.toLocaleString()} → {c.tokens_compressed.toLocaleString()} tk
              {" · "}
              <span className="text-foreground">
                {Math.round((1 - c.tokens_compressed / Math.max(c.tokens_original, 1)) * 100)}%
                smaller
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-strong rounded-3xl p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <h2 className="text-xl font-semibold">No capsules yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Paste a conversation and CapsuleHub will compress it into portable memory.
      </p>
      <Link
        to="/create"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white ring-brand"
      >
        <Plus className="h-4 w-4" />
        Create your first Capsule
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
