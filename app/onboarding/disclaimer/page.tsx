"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import { saveOnboardingData } from "@/lib/utils/onboarding";

export default function DisclaimerPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (!agreed) return;
    saveOnboardingData("disclaimer", "true");
    router.push("/onboarding/language");
  };

  return (
    <PageContainer padded className="pt-8 min-h-[100dvh] flex flex-col">
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: step <= 4 ? "var(--accent)" : "var(--bg-elevated)" }} />
        ))}
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-strong)" }}>
          A quick note before we begin
        </h1>
      </div>

      {/* Consent Card */}
      <button
        type="button"
        onClick={() => setAgreed(!agreed)}
        className="card-surface p-5 flex items-start gap-4 text-left transition-all duration-150 active:scale-[0.99] w-full"
        style={{
          borderColor: agreed ? "var(--accent)" : "var(--border-subtle)",
          background: agreed ? "var(--accent-dim)" : "var(--bg-surface)",
        }}
      >
        <div
          className="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
          style={{
            borderColor: agreed ? "var(--accent)" : "var(--border-medium)",
            background: agreed ? "var(--accent)" : "transparent",
          }}
        >
          {agreed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-strong)" }}>
          I understand this app provides AI guidance, not therapy or emergency help.
        </p>
      </button>

      {/* CTA */}
      <div className="mt-auto pt-8">
        <Button 
          variant={agreed ? "primary" : "locked"} 
          size="lg" 
          fullWidth 
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </PageContainer>
  );
}
