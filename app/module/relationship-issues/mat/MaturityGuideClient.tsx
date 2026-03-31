"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { LoadingResults, ErrorAlert } from "@/components/ui/StateFeedback";
import Link from "next/link";

interface MaturityResult {
  strengths: string[];
  growth_areas: string[];
  this_week: string;
  disclaimer?: string;
}

const QUESTIONS = [
  {
    key: "comm",
    label: "How do you communicate with your partner?",
    placeholder: "e.g. I overthink before texting, go quiet when upset, use lots of emojis",
  },
  {
    key: "conflict",
    label: "How do you handle disagreements?",
    placeholder: "e.g. I get defensive, try to understand, give silent treatment",
  },
  {
    key: "rely",
    label: "How reliable are you as a partner?",
    placeholder: "e.g. always keep promises, sometimes forget important things",
  },
];

export default function MaturityGuideClient({ matUsed }: { matUsed: boolean }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({
    comm: "",
    conflict: "",
    rely: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MaturityResult | null>(null);

  const allAnswered = QUESTIONS.every(q => answers[q.key].trim().length > 0);

  const handleReset = () => {
    setResult(null);
    setAnswers({
      comm: "",
      conflict: "",
      rely: "",
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError("Please answer all 3 questions before continuing.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/maturity-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "no_credits") {
          router.push(`/subscription?featureId=mat&featureName=Maturity%20Guide&reason=out_of_credits&source=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }

      if (data.success && data.data) {
        setResult(data.data as MaturityResult);
        router.refresh();
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate guide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Input Form / Limit Reached State */}
      {!result && matUsed ? (
        <div className="card-surface p-10 text-center flex flex-col items-center gap-6 shadow-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-overlay)] animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-4xl shadow-inner text-black border border-[var(--color-border-soft)]">
            🎁
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tighter" style={{ color: "var(--color-text-strong)" }}>Analysis Used</h2>
            <p className="text-[15px] leading-relaxed font-medium max-w-[320px]" style={{ color: "var(--color-text-muted)" }}>
              You've already used your free maturity analysis. Check your <span className="text-[var(--color-accent)] font-bold">History</span> to see results or upgrade for unlimited access.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth
            onClick={() => router.push('/subscription?featureId=mat&reason=preview_used')}
            className="font-black tracking-tight"
          >
            Upgrade to Boost
          </Button>
        </div>
      ) : !result ? (
        <div className="card-surface p-6 flex flex-col gap-10 shadow-2xl">
          <div className="flex items-center gap-3 px-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
             <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: "var(--color-text-faint)" }}>
               Initial Baseline Assessment
             </p>
          </div>

          <div className="flex flex-col gap-8">
            {QUESTIONS.map((q, idx) => (
              <div key={q.key} className="flex flex-col gap-4">
                <p className="text-[15px] font-black tracking-tight leading-snug flex items-start gap-4" style={{ color: "var(--color-text-strong)" }}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--color-accent-dim)] flex items-center justify-center text-[10px] font-black border border-[var(--color-accent-border)] text-[var(--color-accent)]">
                    {idx + 1}
                  </span>
                  {q.label}
                </p>
                <textarea
                  className="input-base min-h-[140px] resize-none text-[15px] font-medium px-5 py-4"
                  placeholder={q.placeholder}
                  value={answers[q.key]}
                  onChange={e => setAnswers(p => ({ ...p, [q.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {error && <ErrorAlert error={error} onRetry={handleSubmit} />}

          <div className="pt-6 border-t border-[var(--color-border-subtle)]">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              loading={loading}
              disabled={!allAnswered}
              className="font-black tracking-tight"
            >
              Generate Guide (1 Credit)
            </Button>
            <p className="text-[10px] text-center font-bold tracking-widest opacity-30 mt-4 uppercase" style={{ color: "var(--color-text-faint)" }}>
               Relationship Intelligence &bull; Private
            </p>
          </div>
        </div>
      ) : null}

      {loading && !result && <LoadingResults message="Analyzing behavior patterns..." />}

      {/* Results */}
      {result && !loading && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {(result as any).safety_triggered ? (
            <div className="card-warning flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <h2 className="text-xl font-black" style={{ color: "var(--color-text-strong)" }}>A Note on Your Well-being</h2>
              </div>
              <p className="text-[15px] leading-relaxed font-medium" style={{ color: "var(--color-text-body)" }}>
                {(result as any).message}
              </p>
              <Button 
                variant="secondary" 
                size="md" 
                className="mt-2 font-bold"
                onClick={() => window.open('https://icallhelpline.org', '_blank')}
              >
                Visit iCall Helpline
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-black tracking-tighter" style={{ color: "var(--color-text-strong)" }}>Your Assessment</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--color-success-dim)] border border-[var(--color-border-success)] text-[var(--color-success)]">COMPLETE</span>
              </div>

              <div className="flex flex-col gap-6">
                {/* Strengths Section */}
                {result.strengths && result.strengths.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <p className="label-section px-1">Hidden Strengths</p>
                    <div className="flex flex-col gap-4">
                      {result.strengths.map((s, idx) => (
                        <div key={idx} className="card-surface p-5 sm:p-6 border-[var(--color-border-accent)] bg-[var(--color-bg-elevated)] group shadow-lg">
                          <div className="flex items-center gap-3 mb-3">
                             <span className="text-xl">💎</span>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Strength {idx + 1}</span>
                          </div>
                          <p className="text-[16px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-strong)" }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Growth Areas */}
                {result.growth_areas && result.growth_areas.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <p className="label-section px-1">Growth Opportunities</p>
                    <div className="flex flex-col gap-4">
                      {result.growth_areas.map((g, idx) => (
                        <div key={idx} className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)] group">
                          <div className="flex items-center gap-3 mb-3">
                             <span className="text-xl">🌱</span>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: "var(--color-text-faint)" }}>Area {idx + 1}</span>
                          </div>
                          <p className="text-[15px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-body)" }}>{g}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Objective */}
                <div className="flex flex-col gap-4">
                  <p className="label-section px-1">Strategic Objective</p>
                  <div className="card-surface p-5 sm:p-6 bg-[var(--color-accent-dim)] border-[var(--color-border-accent)] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-7xl font-black">🎯</span>
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "var(--color-accent)" }}>
                      TRY THIS WEEK
                    </h3>
                    <p className="text-[17px] leading-[1.6] font-black tracking-tight pr-8 italic" style={{ color: "var(--color-text-strong)" }}>
                      &ldquo;{result.this_week}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-3 mt-4 px-1">
                 <button 
                  onClick={handleReset}
                  className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all border border-dashed border-[var(--color-border-soft)] rounded-2xl active:scale-[0.97]"
                 >
                  Perform New Audit
                 </button>
                 <Link href="/home" className="w-full">
                    <div className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-[var(--color-text-faint)] opacity-60 hover:opacity-100 transition-all">
                      Return to Dashboard
                    </div>
                 </Link>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer || "Maturity is an evolving path. Keep building."}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
