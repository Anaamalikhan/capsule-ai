import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  FileText,
  GitBranch,
  Lock,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { SiteNav, Logo } from "@/components/site/Nav";

export const Route = createFileRoute("/")({
  component: Landing,
});

const AI_MODELS = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity", "Lovable", "Cursor", "Windsurf"];

function Landing() {
  return (
    <div className="relative">
      {/* Ambient grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg" />

      <SiteNav />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portable memory for every AI</span>
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Move your AI conversations{" "}
            <span className="text-gradient">anywhere</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            CapsuleHub turns any AI chat into a portable Memory Capsule. Paste it into
            ChatGPT, Claude, Gemini, Cursor, or Lovable and pick up exactly where you left off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white ring-brand"
            >
              Create your first Capsule
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/extension"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium"
            >
              Install extension
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {AI_MODELS.map((m) => (
              <span key={m} className="opacity-80">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Pipeline visual */}
        <div className="relative mt-20">
          <PipelineDemo />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Features"
          title="A memory layer that follows you between AIs"
          subtitle="Everything you need to compress, port, and reuse the context of any AI conversation."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "One-click capture",
              desc: "The browser extension scrapes your entire conversation — including lazy-loaded messages, code blocks and artifacts.",
            },
            {
              icon: Cpu,
              title: "AI-optimized compression",
              desc: "A structured Capsule preserves decisions, architecture and next steps at a fraction of the tokens.",
            },
            {
              icon: Share2,
              title: "Cross-AI compatible",
              desc: "Paste a Capsule into any assistant and it instantly understands the full context.",
            },
            {
              icon: Lock,
              title: "Encrypted storage",
              desc: "Capsules live in your private vault. Share them only when you explicitly choose to.",
            },
            {
              icon: GitBranch,
              title: "Version history",
              desc: "Every edit becomes a version. Diff, roll back, or fork a Capsule at any point.",
            },
            {
              icon: Wand2,
              title: "Semantic search",
              desc: "Find the capsule where you discussed vector databases — in plain English.",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-3xl p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From chat to Capsule in four steps"
        />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "Capture", d: "Open any AI chat and click Create Capsule.", i: FileText },
            { n: "02", t: "Compress", d: "CapsuleHub generates a structured memory.", i: Cpu },
            { n: "03", t: "Paste", d: "Drop the Capsule into another AI.", i: Copy },
            { n: "04", t: "Continue", d: "Keep working with full context intact.", i: ArrowRight },
          ].map((s) => (
            <div key={s.n} className="glass rounded-3xl p-6">
              <div className="text-xs font-mono text-muted-foreground">{s.n}</div>
              <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                <s.i className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="Pricing" title="Start free. Scale when you need to." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Free",
              price: "$0",
              blurb: "For personal exploration.",
              features: ["25 capsules / month", "1 device", "Public share links"],
              cta: "Get started",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$12",
              blurb: "For daily AI users.",
              features: [
                "Unlimited capsules",
                "Semantic search",
                "Version history",
                "Private encrypted vault",
              ],
              cta: "Upgrade to Pro",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              blurb: "For teams & orgs.",
              features: ["Team workspaces", "SSO / SAML", "Audit logs", "Priority support"],
              cta: "Talk to us",
              highlight: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl p-8 ${
                p.highlight
                  ? "bg-gradient-brand ring-brand text-white"
                  : "glass"
              }`}
            >
              <div className="text-sm opacity-80">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-4xl font-semibold">{p.price}</div>
                {p.price !== "Custom" && <div className="text-sm opacity-70">/mo</div>}
              </div>
              <p className="mt-2 text-sm opacity-80">{p.blurb}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium ${
                  p.highlight
                    ? "bg-white text-black"
                    : "bg-white/10 text-foreground hover:bg-white/15"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <div className="mt-10 space-y-3">
          {[
            {
              q: "Which AIs are supported?",
              a: "ChatGPT, Claude, Gemini, Grok, Perplexity, Cursor, Windsurf, Bolt, Replit AI, DeepSeek and Lovable. Adding a new provider only means writing a new scraper adapter.",
            },
            {
              q: "Do I need the extension?",
              a: "No — you can paste conversations directly into CapsuleHub. The extension is a shortcut for one-click capture.",
            },
            {
              q: "Is my data private?",
              a: "Capsules are encrypted at rest and only ever leave your vault when you explicitly share a link.",
            },
            {
              q: "What's inside a Capsule?",
              a: "Structured sections like PROJECT, OBJECTIVE, DECISIONS MADE, ARCHITECTURE, OPEN QUESTIONS and NEXT TASK — not a plain summary.",
            },
          ].map((f) => (
            <details key={f.q} className="glass group rounded-2xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] glass-strong px-8 py-16 text-center">
          <div className="absolute inset-0 -z-10 opacity-40 bg-gradient-brand blur-3xl" />
          <h2 className="text-3xl font-semibold md:text-5xl">
            Give every AI a shared memory.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sign up in seconds. Your first Capsule is on us.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Create your first Capsule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CapsuleHub. Portable memory for every AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function PipelineDemo() {
  const stages = ["ChatGPT", "Capsule", "Claude", "Lovable", "Cursor", "Gemini"];
  return (
    <div className="glass-strong rounded-[2rem] p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-2 md:gap-4">
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                s === "Capsule"
                  ? "bg-gradient-brand text-white ring-brand"
                  : "glass"
              }`}
            >
              {s === "Capsule" && <Sparkles className="mr-2 inline h-4 w-4" />}
              {s}
            </div>
            {i < stages.length - 1 && (
              <ArrowRight
                className="h-4 w-4 text-muted-foreground animate-pipeline"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Download className="h-3.5 w-3.5" />
        <span>Continue instantly with full context</span>
      </div>
    </div>
  );
}
