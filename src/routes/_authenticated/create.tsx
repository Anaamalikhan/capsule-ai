import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { createCapsule } from "@/lib/capsules.functions";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "New Capsule — CapsuleHub" }] }),
  component: CreatePage,
});

const SOURCES = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity", "Lovable", "Cursor", "Windsurf", "Other"];

function CreatePage() {
  const navigate = useNavigate();
  const create = useServerFn(createCapsule);
  const [raw, setRaw] = useState("");
  const [sourceAi, setSourceAi] = useState("ChatGPT");
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setRaw(text);
    toast.success(`Loaded ${f.name}`);
  };

  const submit = async () => {
    if (raw.trim().length < 20) {
      toast.error("Paste a longer conversation.");
      return;
    }
    setLoading(true);
    try {
      const res = await create({ data: { raw, sourceAi } });
      toast.success("Capsule generated");
      navigate({ to: "/capsules/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create capsule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Create a Capsule</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste a conversation, upload a transcript, or drop in JSON. CapsuleHub will
        compress it into a portable structured memory.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground">Source AI</label>
          <select
            value={sourceAi}
            onChange={(e) => setSourceAi(e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s} className="bg-background">
                {s}
              </option>
            ))}
          </select>

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
            <Upload className="h-3.5 w-3.5" />
            Upload .txt / .md / .json
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.json,text/plain,application/json"
              onChange={onFile}
            />
          </label>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={20}
          placeholder={`User: How should I structure my vector database?\nAssistant: Great question — first consider your embedding dimensionality...`}
          className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-sm outline-none focus:border-white/30"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{raw.length.toLocaleString()} characters · ~{Math.ceil(raw.length / 4).toLocaleString()} tokens</span>
          <button
            onClick={submit}
            disabled={loading || raw.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium text-white ring-brand disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Compressing..." : "Generate Capsule"}
          </button>
        </div>
      </div>
    </div>
  );
}
