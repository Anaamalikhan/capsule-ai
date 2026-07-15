import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — ContextVault.AI" }] }),
  component: Settings,
});

function Settings() {
  const [email, setEmail] = useState("");
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
          <div className="text-sm font-medium">Theme</div>
          <p className="mt-1 text-xs text-muted-foreground">
            ContextVault.AI uses a permanent dark theme optimized for long reading sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
