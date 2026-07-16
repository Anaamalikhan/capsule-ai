import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Share2,
  Trash2,
  Check,
  Pencil,
  Clock,
  Calendar,
} from "lucide-react";
import {
  deleteCapsule,
  getCapsule,
  renameCapsule,
  toggleCapsuleShare,
  type StructuredCapsule,
} from "@/lib/capsules.functions";

function formatFullTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const opts = (id: string) =>
  queryOptions({
    queryKey: ["capsule", id],
    queryFn: () => getCapsule({ data: { id } }),
  });

export const Route = createFileRoute("/_authenticated/capsules/$id")({
  head: () => ({ meta: [{ title: "Capsule — ContextVault.AI" }] }),
  component: CapsuleView,
});

function CapsuleView() {
  const { id } = Route.useParams();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <Inner id={id} />
    </Suspense>
  );
}

function Inner({ id }: { id: string }) {
  const { data, refetch } = useSuspenseQuery(opts(id));
  const capsule = data.capsule;
  const structured = capsule.structured as unknown as StructuredCapsule;
  const del = useServerFn(deleteCapsule);
  const share = useServerFn(toggleCapsuleShare);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const compression =
    capsule.tokens_original > 0
      ? Math.round((1 - capsule.tokens_compressed / capsule.tokens_original) * 100)
      : 0;

  const copyMd = async () => {
    await navigator.clipboard.writeText(capsule.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Capsule copied to clipboard");
  };

  const download = (kind: "md" | "json" | "txt") => {
    let content = "";
    let mime = "text/plain";
    let ext = "txt";
    if (kind === "md") {
      content = capsule.markdown;
      mime = "text/markdown";
      ext = "md";
    } else if (kind === "json") {
      content = JSON.stringify(structured, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      content = capsule.markdown.replace(/[#*>`]/g, "");
      ext = "txt";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(capsule.title)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onShare = async () => {
    const next = !capsule.is_public;
    await share({ data: { id: capsule.id, is_public: next } });
    if (next) {
      const url = `${window.location.origin}/capsules/${capsule.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Public link copied");
    } else {
      toast.success("Sharing disabled");
    }
    refetch();
  };

  const onDelete = async () => {
    if (!confirm("Delete this capsule permanently?")) return;
    await del({ data: { id: capsule.id } });
    toast.success("Deleted");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to capsules
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {capsule.source_ai && (
              <span className="rounded-full bg-white/5 px-2 py-0.5">{capsule.source_ai}</span>
            )}
            <span>
              {new Date(capsule.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {capsule.is_public && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                Public
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{capsule.title}</h1>
          <p className="mt-2 text-muted-foreground">{capsule.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Stat label="Original" value={`${capsule.tokens_original.toLocaleString()} tk`} />
        <Stat label="Compressed" value={`${capsule.tokens_compressed.toLocaleString()} tk`} />
        <Stat label="Savings" value={`${compression}%`} highlight />
        <Stat label="Sections" value={String(structured.sections?.length ?? 0)} />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={copyMd}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white ring-brand"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Capsule"}
        </button>
        <button onClick={() => download("md")} className="btn-ghost">
          <Download className="h-4 w-4" /> Markdown
        </button>
        <button onClick={() => download("json")} className="btn-ghost">
          <Download className="h-4 w-4" /> JSON
        </button>
        <button onClick={() => download("txt")} className="btn-ghost">
          <Download className="h-4 w-4" /> TXT
        </button>
        <button onClick={onShare} className="btn-ghost">
          <Share2 className="h-4 w-4" />
          {capsule.is_public ? "Disable share" : "Share link"}
        </button>
        <button onClick={onDelete} className="btn-ghost text-red-400">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      {/* Tags */}
      {capsule.tags && capsule.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {capsule.tags.map((t: string) => (
            <span key={t} className="rounded-full glass px-3 py-1 text-xs">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="mt-10 space-y-4">
        {structured.sections?.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {s.heading}
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {s.content}
            </pre>
          </div>
        ))}
      </div>

      <style>{`
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-4 ${highlight ? "ring-brand" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${highlight ? "text-gradient" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "capsule";
}
