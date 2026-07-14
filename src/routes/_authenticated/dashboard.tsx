import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { listCapsules } from "@/lib/capsules.functions";
import {
  Plus,
  Sparkles,
  Loader2,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  GitMerge,
  Calendar,
  Lock,
  Globe,
  ChevronDown,
} from "lucide-react";

const capsulesQuery = queryOptions({
  queryKey: ["capsules"],
  queryFn: () => listCapsules(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your Capsules — CapsuleHub" }] }),
  component: Dashboard,
});

type ViewMode = "grid" | "table";
type FilterMode = "all" | "public" | "private";

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Suspense fallback={<SkeletonBlock />}>
        <DashboardInner />
      </Suspense>
    </div>
  );
}

function DashboardInner() {
  const { data } = useSuspenseQuery(capsulesQuery);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    return data.capsules.filter((c) => {
      if (filter === "public" && !c.is_public) return false;
      if (filter === "private" && c.is_public) return false;
      if (!q) return true;
      const hay = `${c.title} ${c.description ?? ""} ${(c.tags ?? []).join(" ")} ${c.source_ai ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data.capsules, submittedQuery, filter]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="bg-gradient-brand bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Capsule Hub
            </h1>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-xs text-muted-foreground">
              ?
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View and Manage your Context Capsules
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
          }}
          className="flex w-full max-w-xl items-center gap-2 md:w-auto"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search capsules..."
              className="glass w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none ring-brand placeholder:text-muted-foreground focus:border-white/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="glass inline-flex min-w-[220px] items-center justify-between gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {filter === "all" ? "All Capsules" : filter === "public" ? "Public" : "Private"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </button>
            {filterOpen && (
              <div className="glass-strong absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 py-1 text-sm shadow-xl">
                {(["all", "public", "private"] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFilter(f);
                      setFilterOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left hover:bg-white/10 ${
                      filter === f ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {f === "all" ? "All Capsules" : f === "public" ? "Public" : "Private"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "capsule" : "capsules"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass inline-flex items-center rounded-xl border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Table
            </button>
          </div>

          <button
            type="button"
            className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white ring-brand"
          >
            <GitMerge className="h-4 w-4" />
            Merge Capsules
            <span className="absolute -right-1 -top-2 rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-black">
              BETA
            </span>
          </button>

          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          data.capsules.length === 0 ? (
            <EmptyState />
          ) : (
            <NoResults query={submittedQuery} />
          )
        ) : view === "grid" ? (
          <GridView capsules={filtered} />
        ) : (
          <TableView capsules={filtered} />
        )}
      </div>
    </>
  );
}

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  source_ai: string | null;
  tags: string[] | null;
  tokens_original: number;
  tokens_compressed: number;
  is_public: boolean;
  created_at: string;
};

function GridView({ capsules }: { capsules: Capsule[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capsules.map((c) => (
        <Link
          key={c.id}
          to="/capsules/$id"
          params={{ id: c.id }}
          className="glass group flex flex-col rounded-2xl border border-white/10 p-5 transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="text-lg font-semibold line-clamp-1">{c.title}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(c.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/5 pt-4 text-sm">
            <Row label="Versions">
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                v1
              </span>
            </Row>
            <Row label="Source">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-black">
                {(c.source_ai ?? "u").slice(0, 1).toLowerCase()}
              </span>
            </Row>
            <Row label="Visibility">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs">
                {c.is_public ? (
                  <>
                    <Globe className="h-3 w-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" /> Private
                  </>
                )}
              </span>
            </Row>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function TableView({ capsules }: { capsules: Capsule[] }) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Tokens</th>
            <th className="px-4 py-3 font-medium">Visibility</th>
          </tr>
        </thead>
        <tbody>
          {capsules.map((c) => (
            <tr
              key={c.id}
              className="border-t border-white/5 transition-colors hover:bg-white/5"
            >
              <td className="px-4 py-3">
                <Link
                  to="/capsules/$id"
                  params={{ id: c.id }}
                  className="font-medium hover:underline"
                >
                  {c.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{c.source_ai ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {c.tokens_original.toLocaleString()} → {c.tokens_compressed.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs">
                  {c.is_public ? (
                    <>
                      <Globe className="h-3 w-3" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" /> Private
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-10 text-center text-sm text-muted-foreground">
      No capsules matching <span className="text-foreground">"{query}"</span>.
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

function SkeletonBlock() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
