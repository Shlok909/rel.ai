"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingData, clearOnboardingData } from "@/lib/utils/onboarding";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(false);

  // Read URL params to see if we should start in login mode
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("login=true")) {
      setIsLogin(true);
    }
  }, []);

  // Guard: Block sign-up if onboarding questions are not answered
  // (returning users signing in are never affected)
  useEffect(() => {
    const isLoginMode = isLogin || window.location.search.includes("login=true");
    if (isLoginMode) return; // Returning users don't need onboarding
    const age = localStorage.getItem("onboarding_age");
    const situation = localStorage.getItem("onboarding_situation");
    const need = localStorage.getItem("onboarding_need");
    const disclaimer = localStorage.getItem("onboarding_disclaimer");
    if (!age || !situation || !need || disclaimer !== "true") {
      router.replace("/onboarding/age");
    }
  }, [isLogin, router]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Auto-redirect if already signed in, and clear stale sessions
  useEffect(() => {
    // Listen for auth errors (like invalid refresh tokens) and clear them
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Token refresh failed - sign out to clear stale cookies
        supabase.auth.signOut();
      }
    });

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        // Stale session detected - clear it
        console.warn("Clearing stale auth session:", error.message);
        supabase.auth.signOut();
        return;
      }
      if (user) {
        router.push("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Fetch onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          router.push("/home");
        } else {
          // Send back to the final step to complete the flow
          router.push("/onboarding/language");
        }
      } else {
        const onboardingData = getOnboardingData();
        // Final safety check: ensure onboarding is actually complete
        const od = onboardingData as any;
        if (!od.age_group || !od.situation || !od.primary_need || !od.ai_disclaimer_accepted) {
          setMessage({ text: "Please complete the onboarding questions before creating an account.", type: "error" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { ...onboardingData, display_name: displayName },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/confirm`,
          },
        });
        if (error) throw error;
        
        setMessage({
          text: "Success! Please check your email to confirm your account.",
          type: "success",
        });
      }
    } catch (err: any) {
      if (err.message === "Invalid login credentials") {
        setMessage({ text: "Invalid Credentials", type: "error" });
      } else {
        setMessage({ text: err.message, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer padded className="pt-8 min-h-[100dvh] flex flex-col justify-center">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-strong)" }}>
          {isLogin ? "Welcome back" : "Save your progress"}
        </h1>
        <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
          {isLogin 
            ? "Sign in to pick up where you left off." 
            : "Create an account to save your answers and claim your free credits."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        {!isLogin && (
          <div>
            <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--text-strong)" }}>User Name (Optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}
              placeholder="What should we call you?"
            />
          </div>
        )}
        
        <div>
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--text-strong)" }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}
            placeholder="you@email.com"
          />
        </div>

        <div>
           <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--text-strong)" }}>Password</label>
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
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </PageContainer>
  );
}
