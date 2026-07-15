import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — ContextVault.AI" }] }),
  component: Settings,
});

function Settings() {
  const [email, setEmail] = useState("");
  const { mode, resolved, setMode } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const resetPw = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  };

  const options: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "auto", label: "Auto", icon: MonitorSmartphone },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your account and preferences.</p>

      <div className="mt-8 space-y-4">
        <div className="glass rounded-2xl p-6">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="mt-1 text-lg">{email || "—"}</div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="text-sm font-medium">Password</div>
          <p className="mt-1 text-xs text-muted-foreground">
            We'll send a reset link to your email.
          </p>
          <button
            onClick={resetPw}
            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Send reset link
          </button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Theme</div>
            <div className="text-xs text-muted-foreground">
              Currently {mode === "auto" ? `Auto (${resolved})` : resolved}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose Light, Dark, or Auto to follow your system.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {options.map(({ value, label, icon: Icon }) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-transparent bg-gradient-brand text-white ring-brand"
                      : "border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

