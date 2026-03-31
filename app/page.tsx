"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import AuthRedirectGuard from "@/components/auth/AuthRedirectGuard";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/home");
      }
    });
  }, [router, supabase]);
  return (
    <div
      className="min-h-screen w-full mx-auto max-w-md md:max-w-2xl lg:max-w-3xl flex flex-col p-6 relative overflow-x-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Atmospheric glow moved to AppShell for global visibility */}


      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 relative z-10 py-12">
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl glow-accent border border-[var(--accent-border)]"
          style={{ background: "var(--bg-elevated)" }}
        >
          💞
        </div>

        {/* Text */}
        <div className="flex flex-col gap-4">
          <div className="text-5xl md:text-6xl font-serif tracking-tight mb-2">
            <span className="font-bold" style={{ color: "var(--text-strong)" }}>Rel.</span>
            <span className="italic font-semibold" style={{ color: "var(--accent)" }}>AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]" style={{ color: "var(--text-strong)" }}>
            Unlock the Art of <br />
            <span style={{ color: "var(--accent)" }}>Modern Romance 🍷</span>
          </h1>
          <p className="text-[17px] md:text-lg font-medium opacity-60 leading-relaxed max-w-[320px]" style={{ color: "var(--text-muted)" }}>
            Your private guide to navigating connections with clarity, confidence, and charm.
          </p>
        </div>

        {/* Value props */}
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {[
            { emoji: "💬", text: "Unsure what to text back?" },
            { emoji: "💭", text: "Overthinking their behavior?" },
            { emoji: "❤️", text: "Advice you can actually trust" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-muted)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col gap-4 relative z-10 pt-4 mb-4">
        <Link href="/onboarding/age">
          <Button variant="primary" size="lg" fullWidth className="h-16 text-lg font-bold">
            Get Started Free
          </Button>
        </Link>
        <Link href="/onboarding/auth?login=true" className="w-full">
          <button 
            className="w-full py-2 text-sm font-bold uppercase tracking-widest transition-all active:scale-95" 
            style={{ color: "var(--accent)" }}
          >
            Sign In
          </button>
        </Link>
        <div className="flex items-center justify-center gap-2 mt-2">
          <svg className="w-3.5 h-3.5" style={{ color: "var(--success)" }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-faint)" }}>
            100% Private, Secure & Anonymous
          </p>
        </div>
      </div>
    </div>
  );
}
