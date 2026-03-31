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
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: "var(--text-strong)" }}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
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
