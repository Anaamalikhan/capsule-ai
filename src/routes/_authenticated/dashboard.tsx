import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { listCapsules, mergeCapsules, renameCapsule } from "@/lib/capsules.functions";
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
  X,
  Check,
  Pencil,
} from "lucide-react";

const capsulesQuery = queryOptions({
  queryKey: ["capsules"],
  queryFn: () => listCapsules(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your Capsules — ContextVault.AI" }] }),
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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mergeFn = useServerFn(mergeCapsules);

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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      else toast.error("You can merge up to 6 capsules at a time.");
      return next;
    });
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    setSelected(new Set());
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const runMerge = async () => {
    if (selected.size < 2) {
      toast.error("Select at least 2 capsules to merge.");
      return;
    }
    setMerging(true);
    try {
      const res = await mergeFn({ data: { ids: Array.from(selected) } });
      toast.success("Capsules merged into a new capsule.");
      await queryClient.invalidateQueries({ queryKey: ["capsules"] });
      setSelectMode(false);
      setSelected(new Set());
      navigate({ to: "/capsules/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to merge capsules.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="bg-gradient-brand bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              ContextVault.AI
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

          {!selectMode ? (
            <button
              type="button"
              onClick={enterSelectMode}
              disabled={data.capsules.length < 2}
              className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GitMerge className="h-4 w-4" />
              Merge Capsules
              <span className="absolute -right-1 -top-2 rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-black">
                BETA
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelSelect}
                disabled={merging}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={runMerge}
                disabled={merging || selected.size < 2}
                className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white ring-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {merging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitMerge className="h-4 w-4" />
                )}
                Merge {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </>
          )}

          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </div>

      {selectMode && (
        <div className="glass mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span>
            Select 2–6 capsules to merge into a single unified capsule.{" "}
            <span className="text-muted-foreground">
              Selected: {selected.size}
            </span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          data.capsules.length === 0 ? (
            <EmptyState />
          ) : (
            <NoResults query={submittedQuery} />
          )
        ) : view === "grid" ? (
          <GridView
            capsules={filtered}
            selectMode={selectMode}
            selected={selected}
            onToggle={toggleSelect}
          />
        ) : (
          <TableView
            capsules={filtered}
            selectMode={selectMode}
            selected={selected}
            onToggle={toggleSelect}
          />
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

type SelectionProps = {
  selectMode: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
};

function GridView({
  capsules,
  selectMode,
  selected,
  onToggle,
}: { capsules: Capsule[] } & SelectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capsules.map((c) => {
        const isSelected = selected.has(c.id);
        const cardClass = `glass group relative flex flex-col rounded-2xl border p-5 transition-all ${
          isSelected
            ? "border-primary bg-primary/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/10"
        }`;

        const inner = (
          <>
            {selectMode && (
              <div
                className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="pr-2 text-lg font-semibold line-clamp-1">{c.title}</div>
              {!selectMode && <RenameButton id={c.id} currentTitle={c.title} />}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatFullTimestamp(c.created_at)}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Token compression
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Original</div>
                  <div className="text-base font-semibold text-foreground">
                    {c.tokens_original.toLocaleString()}
                  </div>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Compressed</div>
                  <div className="text-base font-semibold text-primary">
                    {c.tokens_compressed.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Saved</div>
                  <div className="text-base font-semibold text-emerald-400">
                    {c.tokens_original > 0
                      ? `${Math.max(0, Math.round(((c.tokens_original - c.tokens_compressed) / c.tokens_original) * 100))}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-sm">
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

          </>
        );

        if (selectMode) {
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id)}
              className={`${cardClass} text-left`}
            >
              {inner}
            </button>
          );
        }
        return (
          <Link
            key={c.id}
            to="/capsules/$id"
            params={{ id: c.id }}
            className={cardClass}
          >
            {inner}
          </Link>
        );
      })}
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

function TableView({
  capsules,
  selectMode,
  selected,
  onToggle,
}: { capsules: Capsule[] } & SelectionProps) {
  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {selectMode && <th className="w-10 px-4 py-3" />}
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Tokens</th>
            <th className="px-4 py-3 font-medium">Visibility</th>
          </tr>
        </thead>
        <tbody>
          {capsules.map((c) => {
            const isSelected = selected.has(c.id);
            return (
              <tr
                key={c.id}
                onClick={selectMode ? () => onToggle(c.id) : undefined}
                className={`border-t border-white/5 transition-colors ${
                  selectMode ? "cursor-pointer" : ""
                } ${isSelected ? "bg-primary/10" : "hover:bg-white/5"}`}
              >
                {selectMode && (
                  <td className="px-4 py-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  {selectMode ? (
                    <span className="font-medium">{c.title}</span>
                  ) : (
                    <Link
                      to="/capsules/$id"
                      params={{ id: c.id }}
                      className="font-medium hover:underline"
                    >
                      {c.title}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.source_ai ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatFullTimestamp(c.created_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="text-foreground">{c.tokens_original.toLocaleString()}</span>
                  {" → "}
                  <span className="text-primary">{c.tokens_compressed.toLocaleString()}</span>
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
            );
          })}
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
        Paste a conversation and ContextVault.AI will compress it into portable memory.
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

function formatFullTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function RenameButton({ id, currentTitle }: { id: string; currentTitle: string }) {
  const renameFn = useServerFn(renameCapsule);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = window.prompt("Rename capsule", currentTitle);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === currentTitle) return;
    setBusy(true);
    try {
      await renameFn({ data: { id, title: trimmed.slice(0, 200) } });
      await queryClient.invalidateQueries({ queryKey: ["capsules"] });
      toast.success("Capsule renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Rename capsule"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-muted-foreground opacity-0 transition hover:bg-white/10 hover:text-foreground group-hover:opacity-100 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
    </button>
  );
}
