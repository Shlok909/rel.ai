"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import PlanBadge from "@/components/ui/PlanBadge";
import CreditBadge from "@/components/ui/CreditBadge";
import SectionCard from "@/components/cards/SectionCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!isMounted) return;

        if (authError || !user) {
          router.push("/onboarding/auth?login=true");
          return;
        }
        setUser(user);

        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Fetch Credits
        const { data: creditsData } = await supabase
          .from('user_credits')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .single();
        
        if (isMounted) {
          setProfile(profileData);
          setCredits(creditsData?.credits_remaining ?? 0);
          setLoading(false);
        }
      } catch (err: any) {
        // Handle the "Navigator Lock" error gracefully
        if (err.message?.includes("navigatorLock") || err.message?.includes("stole it")) {
          console.warn("Auth lock collision handled safely.");
          return;
        }
        console.error("Profile fetch error:", err);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Profile" credits={0} />
        <PageContainer>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const initials = (profile?.display_name || user?.email || "U").substring(0, 1).toUpperCase();
  
  const PLAN_MAP: Record<string, "Beginner" | "Boost" | "Elite"> = {
    free: "Beginner",
    boost: "Boost",
    elite: "Elite",
  };
  const displayPlan: "Beginner" | "Boost" | "Elite" = PLAN_MAP[profile?.plan ?? "free"] ?? "Beginner";

  return (
    <AppShell>
      <TopBar title="Profile" credits={credits} />

      <PageContainer padded className="pb-24 pt-4">
        {/* User Info */}
        <div className="flex items-center gap-4 py-6 mb-4 border-b border-[var(--border-subtle)]">
          <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-lg shadow-[rgba(0,0,0,0.5)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)]"
            style={{ color: "#fff", border: "4px solid var(--bg-base)" }}>
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl font-black tracking-tight leading-tight truncate mb-1" style={{ color: "var(--text-strong)" }}>
              {profile?.display_name || "User"}
            </h2>
            <p className="text-[13px] font-bold tracking-tight opacity-50 uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </p>
            <div className="flex items-center gap-2">
              <PlanBadge plan={displayPlan} />
              <CreditBadge credits={credits} />
            </div>
          </div>
        </div>

        {/* Upgrade / Waitlist */}
        <div className="mb-8">
          <div className="p-5 sm:p-6 rounded-3xl border border-[var(--accent-border)] hover:border-[var(--accent)] transition-all cursor-pointer group bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] shadow-lg shadow-[var(--accent-glow)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-black tracking-tight" style={{ color: "var(--text-strong)" }}>🚀 Join the Inner Circle</p>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--accent)] text-white shadow-sm">Prism</span>
            </div>
            <p className="text-[14px] leading-relaxed font-medium mb-5 opacity-80" style={{ color: "var(--text-body)" }}>
              Get unlimited insights, deeper behavioral analysis, and priority access to our upcoming vision engine.
            </p>
            <Link href="/subscription">
              <Button variant="primary" size="md" fullWidth className="font-bold py-3">Upgrade & Get Notified</Button>
            </Link>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex flex-col gap-1 mb-8">
          <p className="label-section mb-3 px-1">Identity & Status</p>
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] shadow-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Current Goal</span>
              <span className="text-sm font-black" style={{ color: "var(--text-strong)" }}>{profile?.situation || "New User"}</span>
            </div>
            <div className="h-px bg-[var(--border-soft)] w-full my-4 opacity-50" />
            <div className="flex justify-between items-center py-1">
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Age Group</span>
              <span className="text-sm font-black" style={{ color: "var(--text-strong)" }}>{profile?.age_group || "18+"}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="flex flex-col gap-1 mb-8">
          <p className="label-section mb-3 px-1">Preferences</p>
          <Link href="/onboarding/language" className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-soft)] transition-all active:scale-[0.98] group shadow-sm hover:border-[var(--border-strong)]">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black mb-0.5">Response Language</span>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {(profile?.ui_language?.toUpperCase() || 'EN')} / {(profile?.ai_language?.toUpperCase() || 'HINGLISH')}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform group-active:translate-x-1" style={{ color: "var(--text-faint)" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Data Management */}
        <div className="flex flex-col gap-1 mb-10">
          <p className="label-section mb-3 px-1">Security & Vault</p>
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-sm">
            <p className="text-[13px] leading-relaxed font-medium mb-5 opacity-70" style={{ color: "var(--text-muted)" }}>
              All interactions are end-to-end encrypted. We never share your data.
            </p>
            <Link href="/history">
              <Button variant="secondary" fullWidth className="py-2.5 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Manage Data Vault
              </Button>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 mb-12">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm"
            style={{ 
              background: "rgba(239,68,68,0.06)", 
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444" 
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out Securely
          </button>
        </div>
      </PageContainer>
    </AppShell>
  );
}
