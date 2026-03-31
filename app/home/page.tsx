import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import ModuleCard from "@/components/cards/ModuleCard";
import PlanBadge from "@/components/ui/PlanBadge";
import Link from "next/link";
import { MODULES, PLANS } from "@/lib/config/featureConfig";
import { createClient } from "@/lib/supabase/server";
import { getModuleAccessState, getSubscriptionUrl } from "@/lib/utils/featureAccess";
import { getUserCredits, getUserProfile } from "@/lib/utils/creditAccess";
import CreditStatusBanner from "@/components/ui/CreditStatusBanner";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null; // Should be handled by middleware, but safe fallback
  }

  const profile = await getUserProfile(user.id);
  const userCredits = await getUserCredits(user.id);

  const credits = userCredits?.credits_remaining ?? 0;
  const planId = userCredits?.plan_id || "free";
  const planLabel = PLANS[planId as keyof typeof PLANS]?.displayName || "Beginner";
  const situation = profile?.situation || "Exploring";
  const language = profile?.ui_language === "hinglish" ? "HI" : "EN";

  return (
    <AppShell>
      <TopBar credits={credits} language={language} />

      <PageContainer>
        {/* Personalised Greeting */}
        <div className="pt-2 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight truncate pr-2" style={{ color: "var(--text-strong)" }}>
              Hey {profile?.display_name || "there"} 👋
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            We&apos;re here to help you navigate it all.
          </p>
        </div>

        {/* Credit Status Banner */}
        <CreditStatusBanner credits={credits} className="mt-6 mb-2" />

        {/* Current State & Badge summary */}
        <div className="flex items-center justify-between mt-4 mb-8 bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-soft)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">💭</span>
            <span className="text-sm font-semibold truncate leading-tight" style={{ color: "var(--text-body)" }}>
              &ldquo;{situation}&rdquo;
            </span>
          </div>
          <PlanBadge plan={planLabel as any} className="flex-shrink-0 ml-3" />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <p className="label-section px-1">Quick Actions ⚡</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Understand a message", icon: "💬", href: "/module/understand-reply" },
              { label: "Write a reply", icon: "✍️", href: "/module/understand-reply" },
              { label: "Read the signals", icon: "🔍", href: "/module/read-signals" },
              { label: "Handle a conflict", icon: "🕊️", href: "/module/relationship-issues" },
            ].map((action) => (
              <Link href={action.href} key={action.label} className="block">
                <div className="card-surface p-4 flex flex-col gap-3 transition-all hover:bg-[var(--bg-elevated)] active:scale-[0.96] border-[var(--border-soft)]">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-[13px] font-bold leading-tight tracking-tight" style={{ color: "var(--text-strong)" }}>
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex flex-col gap-0.5">
              <p className="label-section !mb-0 text-[var(--color-text-strong)] opacity-100">Module Library 📙</p>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] leading-none">Curated Wisdom</p>
            </div>
            <Link href="/subscription">
              <button className="text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-dim)] transition-all active:scale-95 flex items-center gap-2 group" style={{ color: "var(--color-text-muted)" }}>
                <span className="group-hover:text-[var(--color-accent)] transition-colors">Unlock All</span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              </button>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {MODULES.map((mod: any) => {
              const hrefs: Record<string, string> = {
                reply: "/module/understand-reply",
                signals: "/module/read-signals",
                issues: "/module/relationship-issues",
                move: "/module/make-first-move",
              };
              
              const access = getModuleAccessState(planId, mod.id);
              const isLocked = access.isLocked;
              const isComingSoon = access.reason === "coming_soon";
              
              const waitlistUrl = getSubscriptionUrl(
                mod.id, 
                mod.uiName, 
                "home", 
                access.reason,
                mod.id,
                mod.uiName
              );
              
              // Special case: Make the First Move acts as its own premium showcase/splash page
              // We pass its own route as the 'waitlistUrl' so it shows locked but links to the showcase
              const finalWaitlistUrl = mod.id === "move" ? hrefs[mod.id] : waitlistUrl;
              
              return (
                <ModuleCard
                  key={mod.id}
                  emoji={mod.emoji}
                  title={mod.uiName}
                  subtitle={isComingSoon ? "Available in v2.0" : (mod.desc_hi || "")}
                  description={mod.description}
                  href={hrefs[mod.id] || `/module/${mod.id}`}
                  isPro={mod.visibleFrom !== "free"}
                  isLocked={isLocked}
                  waitlistUrl={finalWaitlistUrl}
                />
              );
            })}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-4 mb-4 flex justify-center border-t border-[var(--border-subtle)] pt-8">
          <p className="text-[11px] font-bold text-center max-w-[260px] opacity-40 leading-relaxed uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
            Rel.AI provides guidance, not clinical advice. Always trust your own intuition.
          </p>
        </div>
      </PageContainer>
    </AppShell>
  );
}
