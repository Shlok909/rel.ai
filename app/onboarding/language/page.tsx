"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import { saveOnboardingData, getOnboardingData, clearOnboardingData, type OnboardingData } from "@/lib/utils/onboarding";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
  { label: "English", id: "en" },
  { label: "Hinglish", id: "hinglish" },
];

export default function LanguagePage() {
  const router = useRouter();
  const supabase = createClient();
  const [uiLang, setUiLang] = useState("en");
  const [aiLang, setAiLang] = useState("hinglish");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    // Save language choices to localStorage first
    saveOnboardingData("ui_language", uiLang);
    saveOnboardingData("language", aiLang);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("You need to be signed in to complete onboarding.");
      setLoading(false);
      router.push("/onboarding/auth");
      return;
    }

    // Collect all onboarding data from localStorage
    const data = getOnboardingData() as OnboardingData;

    // Upsert profile data
    const profilePayload = {
      id: user.id,
      age_group: data.age_group || null,
      situation: data.situation || null,
      primary_need: data.primary_need || null,
      ai_disclaimer_accepted: !!data.ai_disclaimer_accepted,
      ui_language: uiLang,
      ai_language: aiLang,
      onboarding_completed: true,
      onboarding_status: 'completed',
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.error("Profile upsert error:", JSON.stringify(profileError));
      setError(`Failed to save profile: ${profileError.message || "Unknown error"}`);
      setLoading(false);
      return;
    }

    // Ensure user_credits row exists (create if missing)
    const { data: existingCredits, error: checkCreditsError } = await supabase
      .from("user_credits")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (checkCreditsError && checkCreditsError.code === 'PGRST116') {
      // PGRST116 = strictly means "no rows returned"
      const { error: creditsError } = await supabase
        .from("user_credits")
        .insert({
          user_id: user.id,
          plan_id: "free",
          monthly_credit_limit: 5,
          credits_remaining: 5,
        });

      if (creditsError) {
        console.error("Fatal Credits insert error:", creditsError);
        setError("Account partially created, but failed to allocate free credits. Please try again.");
        setLoading(false);
        return; // Blocking: Do not let them into the app without an initialized credit row
      }
    } else if (checkCreditsError) {
       console.error("Error verifying credits:", checkCreditsError);
       setError("System failed to verify your credits. Please try again in a moment.");
       setLoading(false);
       return;
    }

    // Clear localStorage and redirect
    clearOnboardingData();
    router.push("/home");
  };

  return (
    <PageContainer padded className="pt-8 min-h-[100dvh] flex flex-col">
      <div className="flex gap-1.5 mb-8 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: "var(--accent)" }} />
        ))}
      </div>

      <div className="mb-8 flex-shrink-0">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-strong)" }}>
          Choose your languages
        </h1>
        <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
          You can always change this later.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="label-section">App UI language</p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(({ label, id }) => {
              const selected = uiLang === id;
              return (
                <button
                  key={id}
                  onClick={() => setUiLang(id)}
                  className="rounded-xl p-4 text-center font-semibold text-sm transition-all"
                  style={{
                    background: selected ? "var(--accent-dim)" : "var(--bg-surface)",
                    border: `1px solid ${selected ? "var(--accent)" : "var(--border-subtle)"}`,
                    color: selected ? "var(--accent)" : "var(--text-strong)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="label-section">AI response language</p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(({ label, id }) => {
              const selected = aiLang === id;
              return (
                <button
                  key={id}
                  onClick={() => setAiLang(id)}
                  className="rounded-xl p-4 text-center font-semibold text-sm transition-all"
                  style={{
                    background: selected ? "var(--accent-dim)" : "var(--bg-surface)",
                    border: `1px solid ${selected ? "var(--accent)" : "var(--border-subtle)"}`,
                    color: selected ? "var(--accent)" : "var(--text-strong)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm font-medium mb-3" style={{ 
          background: "rgba(239,68,68,0.1)", 
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.2)" 
        }}>
          {error}
        </div>
      )}

      <div className="mt-auto pt-4 flex-shrink-0">
        <Button variant="primary" size="lg" fullWidth onClick={handleFinish} loading={loading}>
          Finish &amp; Continue
        </Button>
      </div>
    </PageContainer>
  );
}
