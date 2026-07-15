import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand ring-brand">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-semibold tracking-tight">ContextVault.AI</span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <Link to="/extension" className="hover:text-foreground">
            Extension
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white ring-brand"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
