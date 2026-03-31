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
  const [showPassword, setShowPassword] = useState(false);
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

    // Sanitize email: lowercase and remove trailing spaces
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
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
          email: sanitizedEmail,
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
      console.error("Auth error:", err);
      
      const errMsg = err.message?.toLowerCase() || "";
      if (errMsg.includes("invalid login credentials")) {
        setMessage({ text: "Invalid email or password. (Note: Email is case-sensitive, please check for typos)", type: "error" });
      } else if (errMsg.includes("email not confirmed")) {
        setMessage({ 
          text: "Email not confirmed. Please check your inbox or click below to resend the link.", 
          type: "error" 
        });
      } else {
        setMessage({ text: err.message, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email address first.", type: "error" });
      return;
    }
    setLoading(true);
    const sanitizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Password reset link sent! Check your email.", type: "success" });
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email address first.", type: "error" });
      return;
    }
    setLoading(true);
    const sanitizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: sanitizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      }
    });
    setLoading(false);
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Confirmation email resent! Check your inbox.", type: "success" });
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
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}
            placeholder="you@email.com"
          />
        </div>

        <div className="relative">
           <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--text-strong)" }}>Password</label>
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
          <div className="p-3 rounded-lg text-sm font-medium flex flex-col gap-2" style={{ 
            background: message.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", 
            color: message.type === "error" ? "#ef4444" : "#22c55e",
            border: `1px solid ${message.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` 
          }}>
            <span>{message.text}</span>
            {message.text.includes("Email not confirmed") && (
              <button 
                type="button"
                onClick={handleResendConfirmation}
                className="text-xs font-bold underline text-left"
              >
                Resend confirmation link
              </button>
            )}
          </div>
        )}

        {isLogin && (
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "var(--text-strong)" }}
            >
              Forgot Password?
            </button>
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
