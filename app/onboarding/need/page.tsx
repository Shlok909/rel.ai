"use client";

import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import { saveOnboardingData } from "@/lib/utils/onboarding";

const NEEDS = [
  "Understanding their behavior",
  "Writing messages",
  "Fixing a problem or conflict",
  "Overthinking / confidence",
  "Just exploring",
];

export default function NeedPage() {
  const router = useRouter();

  const handleSelect = (value: string) => {
    saveOnboardingData("need", value);
    router.push("/onboarding/disclaimer");
  };

  return (
    <PageContainer padded className="pt-8 min-h-[100dvh] flex flex-col">
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: step <= 3 ? "var(--accent)" : "var(--bg-elevated)" }} />
        ))}
      </div>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-strong)" }}>
          What do you need help with the most right now?
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        {NEEDS.map((label) => (
          <button 
            key={label} 
            onClick={() => handleSelect(label)}
            className="tap-item flex text-left w-full items-center p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl transition-transform active:scale-[0.98]"
          >
            <span className="flex-1 text-base ml-2 font-medium" style={{ color: "var(--text-strong)" }}>{label}</span>
            <svg className="w-5 h-5 mr-1" style={{ color: "var(--text-faint)" }}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
