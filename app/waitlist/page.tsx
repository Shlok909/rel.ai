"use client";

import { useState, useEffect, Suspense } from "react";
import PageContainer from "@/components/layout/PageContainer";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <WaitlistContent />
    </Suspense>
  );
}

function WaitlistContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract context from URL
  const featId = searchParams.get("featureId");
  const featName = searchParams.get("featureName") || featId;
  const reason = searchParams.get("reason");
  const source = searchParams.get("source") || "/home";
  const plan = searchParams.get("plan");
  const price = searchParams.get("price") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feature: featId || "",
    feedback: plan ? `[Selected Plan: ${plan.toUpperCase()}] \n` : "",
    price: price,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        const fullName = data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || "";
        setFormData(prev => ({ 
          ...prev, 
          email: data.user?.email || "",
          name: fullName,
          // Pre-fill feature if coming from a redirect
          feature: prev.feature || featId || ""
        }));
      }
    });

    if (featId) {
      setFormData(prev => ({ ...prev, feature: featId }));
    }
  }, [supabase, featId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: submitError } = await supabase.from("waitlist_requests").insert({
      user_id: userId,
      name: formData.name,
      email: formData.email,
      interested_feature: formData.feature,
      feedback: formData.feedback,
      willingness_to_pay: formData.price,
      // Contextual fields (Day 6 Enrichment)
      reason: reason,
      source_page: source,
      feature_name: featName
    });

    setLoading(false);
    if (!submitError) {
      setSuccess(true);
    } else {
      console.error("Waitlist error:", submitError);
      setError("Something went wrong. Please check your connection and try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[var(--bg-base)] to-[var(--bg-surface)]">
        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center text-5xl mb-8 shadow-2xl shadow-[var(--accent-glow)] border-4 border-[var(--bg-base)]">
          🎉
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tight" style={{ color: "var(--text-strong)" }}>
          You&apos;re On the List! 💌
        </h1>
        <p className="text-[16px] mb-10 leading-relaxed px-6 opacity-80 font-medium" style={{ color: "var(--text-body)" }}>
          Great to have you, <span className="text-[var(--accent)] font-black">{formData.name || "friend"}</span>. We&apos;ve added you to the inner circle for <span className="font-black text-[var(--text-strong)]">{featName || "Boost"}</span>. Keep an eye on your inbox at {formData.email}.
        </p>
        <Link href="/home" className="w-full max-w-[220px]">
          <Button variant="primary" size="lg" fullWidth className="py-4 shadow-xl">Return to Dashboard 🏠</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Background Glow */}
      <div
        className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 60%)", filter: "blur(50px)" }}
      />

      <TopBar title="Get Boost" showBack className="bg-transparent border-none" />

      <PageContainer padded className="pb-16 pt-2 flex-1 flex flex-col relative z-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl mb-6 shadow-xl shadow-[rgba(0,0,0,0.5)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--accent-border)]">
            {reason === "coming_soon" ? "⏳" : 
             reason === "out_of_credits" ? "⚡" : 
             reason === "preview_used" ? "🎁" : "🚀"}
          </div>
          <h1 className="text-3xl font-black tracking-tighter leading-[1.1] mb-3" style={{ color: "var(--text-strong)" }}>
            {plan ? `Get ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`
               : reason === "preview_used" 
               ? "Get Unlimited Access" 
               : reason === "out_of_credits" 
               ? "Out of Credits?" 
               : featName ? `Early Access: ${featName}` 
               : "Elite Plans Coming Soon"}
          </h1>
          <p className="text-[15px] leading-relaxed font-medium opacity-80" style={{ color: "var(--text-body)" }}>
            {reason === "preview_used"
              ? `You've used your 1-time preview for ${featName}. Join the waitlist for Boost to get unlimited access to all tools.`
              : reason === "out_of_credits"
              ? `You've used your 5 monthly credits for ${featName || "this feature"}. Join the waitlist for Boost to get 25+ monthly credits.`
              : reason === "coming_soon" 
              ? `${featName || "This feature"} is in active development. Join the waitlist to get notified the second it drops!`
              : "Advanced features like Timeline Views and Perspective Shifting are coming next. Join the inner circle to get notified first."}
          </p>
        </div>

        {/* Waitlist Form */}
        <form className="flex flex-col gap-5 flex-1" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 rounded-xl bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs font-black uppercase tracking-widest mb-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-faint)" }}>First Name</label>
            <input 
              type="text" 
              placeholder="Your name" 
              className="input-base" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-faint)" }}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className="input-base" 
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-faint)" }}>Most Interested In</label>
            <div className="relative">
              <select 
                value={formData.feature} 
                onChange={e => setFormData({ ...formData, feature: e.target.value })}
                className="input-base appearance-none pr-10"
              >
                <option value="" disabled>Select a module...</option>
                <option value="reply">Understand & Reply (Advanced)</option>
                <option value="signals">Read the Signals (Full Access)</option>
                <option value="issues">Relationship Issues (Maturity Guide)</option>
                <option value="move">Make the First Move (Elite Playbook)</option>
                <option value="unlimited">Unlimited Credits</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-faint)" }}>Feedback (optional)</label>
            <textarea 
              placeholder="What would you like to see?" 
              rows={3} 
              className="input-base min-h-[100px]" 
              value={formData.feedback}
              onChange={e => setFormData({ ...formData, feedback: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: "var(--text-faint)" }}>Contribution Target (Optional, ₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 299" 
              className="w-full p-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-bold bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="w-full mt-auto pt-6">
            <Button variant="primary" size="lg" fullWidth type="submit" loading={loading} className="font-bold text-lg">
              Join the Waitlist
            </Button>
            <p className="text-center text-[10px] uppercase font-bold tracking-widest mt-4 opacity-40" style={{ color: "var(--text-faint)" }}>
              No spam. Only major updates.
            </p>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
