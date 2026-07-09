import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Nav";
import { LayoutDashboard, Plus, Puzzle, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="relative flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-white/5 px-4 py-6 md:block">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          <SideLink to="/dashboard" icon={LayoutDashboard} label="Capsules" />
          <SideLink to="/create" icon={Plus} label="New Capsule" />
          <SideLink to="/extension" icon={Puzzle} label="Extension" />
          <SideLink to="/settings" icon={Settings} label="Settings" />
        </nav>
        <button
          onClick={signOut}
          className="mt-8 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>
      <main className="flex-1">
        <div className="md:hidden border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <Logo />
          <button onClick={signOut} className="text-sm text-muted-foreground">
            Sign out
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function SideLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground [&.active]:bg-white/10 [&.active]:text-foreground"
      activeProps={{ className: "active" }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
