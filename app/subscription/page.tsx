"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract context from URL to pass forward
  const featId = searchParams.get("featureId") || "";
  const featName = searchParams.get("featureName") || featId;
  const reason = searchParams.get("reason") || "";
  const source = searchParams.get("source") || "/home";

  const handleSelectPlan = (plan: string, price: number) => {
    // Construct waitlist URL carrying all context + selected plan & price
    const params = new URLSearchParams({
      featureId: featId,
      featureName: featName,
      source: source,
      reason: reason,
      plan: plan,
      price: price.toString()
    });
    router.push(`/waitlist?${params.toString()}`);
  };

  return (
    <AppShell>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-soft)] flex items-center justify-center transition-all active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-2" style={{ color: "var(--text-strong)" }}>
          <span className="text-[var(--accent)]">✨</span> Choose Your Plan
        </h1>
        <div className="flex bg-[var(--bg-surface)] rounded-full p-1 border border-[var(--border-soft)]">
          <div className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[var(--accent)] text-white">EN</div>
          <div className="px-2 py-0.5 text-[10px] font-black rounded-full text-[var(--text-muted)]">HI</div>
        </div>
      </div>

      <PageContainer padded className="pb-32 pt-6">
        {/* Simple Credit Rule Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-accent)] bg-[var(--bg-elevated)] mb-6 shadow-lg shadow-[var(--accent-glow)]">
          <span className="text-2xl">⚡</span>
          <div className="flex flex-col">
            <span className="text-[13px] font-black tracking-tight" style={{ color: "var(--text-strong)" }}>Simple Credit Rule</span>
            <span className="text-[11px] font-medium opacity-80" style={{ color: "var(--text-body)" }}>1 credit = 1 feature use &bull; Shared across the entire app</span>
          </div>
        </div>
        
        <p className="text-center text-[12px] font-medium mb-8" style={{ color: "var(--text-muted)" }}>
          Pick your plan — cancel anytime, no strings attached.
        </p>

        <div className="flex flex-col gap-6">
          {/* Beginner Plan */}
          <div className="p-5 md:p-6 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-md flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌱</span>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight leading-none text-white">Beginner</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black" style={{ color: "var(--success)" }}>₹0</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-faint)]">/month</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg" style={{ color: "var(--success)" }}>⚡</span>
                <span className="text-sm font-black" style={{ color: "var(--success)" }}>5 credits / month</span>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-faint)]">= 5 uses</span>
            </div>

            <div className="flex flex-col gap-3 mb-8">
               <FeatureItem icon="🔓" text="Understand & Reply (Limited)" />
               <FeatureItem icon="🔍" text="Read the Signals (Limited)" />
               <FeatureItem icon="🔒" text="Pro Modules" available={false} />
            </div>

            <Button variant="secondary" fullWidth className="py-4 text-sm font-black" onClick={() => handleSelectPlan("beginner", 0)}>
              Current Plan
            </Button>
          </div>

          {/* Boost Plan */}
          <div className="p-5 md:p-6 rounded-3xl border border-[var(--accent)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] shadow-2xl shadow-[var(--accent-glow)] flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              Most Popular
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight leading-none text-white">Boost</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-[var(--accent)]">₹75</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-faint)]">/month</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[rgba(232,114,154,0.08)] border border-[var(--accent-border)] flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg text-[var(--accent)]">⚡</span>
                <span className="text-sm font-black text-[var(--accent)]">25 credits / month</span>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-faint)]">= 25 uses</span>
            </div>

            <div className="flex flex-col gap-3 mb-8">
               <FeatureItem icon="✨" text="Everything in Beginner" highlight />
               <FeatureItem icon="🛡️" text="Relationship Stability" highlight />
               <FeatureItem icon="🔮" text="Advanced Analysis" />
               <FeatureItem icon="🔒" text="Elite Modules" available={false} />
            </div>

            <Button variant="primary" fullWidth className="py-4 text-sm font-black shadow-lg" onClick={() => handleSelectPlan("boost", 75)}>
              Upgrade Now →
            </Button>
          </div>

          {/* Elite Plan */}
          <div className="p-5 md:p-6 rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-md flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👑</span>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight leading-none text-white">Elite</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-[#dca54c]">₹150</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-faint)]">/month</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg text-[#dca54c]">⚡</span>
                <span className="text-sm font-black text-[#dca54c]">60 credits / month</span>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-faint)]">= 60 uses</span>
            </div>

            <div className="flex flex-col gap-3 mb-8">
               <FeatureItem icon="💎" text="Total Masterclass Access" highlightGold />
               <FeatureItem icon="💪" text="Make the First Move" highlightGold />
               <FeatureItem icon="🍷" text="Romantic Playbook" />
               <FeatureItem icon="🎓" text="Certified Guidance" />
            </div>

            <button 
              onClick={() => handleSelectPlan("elite", 150)}
              className="w-full py-4 rounded-full font-black text-sm transition-all active:scale-95 flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #b8860b 0%, #dca54c 100%)", color: "#111" }}
            >
              Go Elite →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center flex flex-col items-center gap-4 border-t border-[var(--border-subtle)] pt-8">
          <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
             100% Private &bull; Cancel Anytime &bull; Shared Credits
          </p>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[var(--warning)] opacity-60 uppercase">
            <span>⚠️</span> This is guidance, not certainty.
          </div>
        </div>
      </PageContainer>
      
      <BottomNav />
    </AppShell>
  );
}

function FeatureItem({ text, icon, available = true, highlight = false, highlightGold = false, label }: { text: string; icon?: string; available?: boolean; highlight?: boolean; highlightGold?: boolean; label?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 p-3 rounded-xl transition-all",
      highlight ? "bg-[var(--accent-dim)] border border-[var(--accent-border)]" : 
      highlightGold ? "bg-[rgba(184,134,11,0.05)] border border-[rgba(184,134,11,0.1)]" :
      "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0",
          available ? (highlight ? "bg-[var(--accent)] text-white" : highlightGold ? "bg-[#b8860b] text-white" : "bg-[var(--bg-overlay)]") : "bg-[var(--bg-overlay)] opacity-40"
        )}>
          {icon ? icon : (available ? "✓" : "—")}
        </div>
        <span className={cn(
          "text-[13px] font-semibold tracking-tight",
          !available && "opacity-40"
        )}>
          {text}
        </span>
      </div>
      {label && (
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--success)]">
           {label}
        </span>
      )}
    </div>
  );
}
