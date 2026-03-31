"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setMessage({ text: "Password updated successfully!", type: "success" });
      setTimeout(() => {
        router.push("/onboarding/auth?login=true");
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer padded className="pt-8 min-h-[100dvh] flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-strong)" }}>
          Set new password
        </h1>
        <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--text-strong)" }}>New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}
            placeholder="••••••••"
          />
        </div>

        {message.text && (
          <div className="p-3 rounded-lg text-sm font-medium" style={{ 
            background: message.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", 
            color: message.type === "error" ? "#ef4444" : "#22c55e",
            border: `1px solid ${message.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` 
          }}>
            {message.text}
          </div>
        )}

        <div className="mt-4">
          <Button variant="primary" size="lg" fullWidth type="submit" className={loading ? "opacity-70 pointer-events-none" : ""}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
