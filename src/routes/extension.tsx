import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Chrome, Puzzle } from "lucide-react";
import { SiteNav } from "@/components/site/Nav";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Browser extension — CapsuleHub" },
      {
        name: "description",
        content: "Install the CapsuleHub extension to capture any AI conversation with one click.",
      },
    ],
  }),
  component: ExtensionPage,
});

function ExtensionPage() {
  return (
    <div>
      <SiteNav />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-12">
        <div className="text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand ring-brand">
            <Puzzle className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            The <span className="text-gradient">CapsuleHub</span> browser extension
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One-click capture from ChatGPT, Claude, Gemini, Grok, Perplexity, Cursor, Lovable
            and more. Every message, code block, and artifact — auto-scrolled and scraped.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Card title="Supported today">
            {["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity", "Lovable", "Cursor", "Windsurf"].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> {s}
              </li>
            ))}
          </Card>
          <Card title="Browsers">
            {["Chrome", "Edge", "Brave", "Opera", "Firefox (soon)"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Chrome className="h-4 w-4" /> {b}
              </li>
            ))}
          </Card>
        </div>

        <div className="mt-12 glass-strong rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-semibold">Coming soon</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The extension is in private beta. In the meantime, paste your conversation into the
            web app and get the same Capsule in seconds.
          </p>
          <Link
            to="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white ring-brand"
          >
            Create a Capsule in the app
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-sm">{children}</ul>
    </div>
  );
}
