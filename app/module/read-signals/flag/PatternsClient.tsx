"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { LoadingResults, ErrorAlert } from "@/components/ui/StateFeedback";
import Link from "next/link";

interface PatternsResult {
  observation: string;
  what_it_may_mean: string;
  what_to_notice: string;
  suggested_action: string;
  disclaimer?: string;
}

const MIXED_OPTIONS = ["Yes, definitely", "Sometimes", "Not really", "Not sure"];
const WHO_OPTIONS = ["Mostly me", "Mostly them", "Equal effort", "Neither / Stagnant"];

export default function PatternsClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({
    dur: "",
    who: "",
    pattern: "",
    ignored: "",
    confusing: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PatternsResult | null>(null);

  const allAnswered = answers.dur.trim() && answers.who && answers.pattern.trim() && answers.ignored && answers.confusing.trim();

  const handleReset = () => {
    setResult(null);
    setAnswers({
      dur: "",
      who: "",
      pattern: "",
      ignored: "",
      confusing: "",
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError("Please answer all questions before continuing.");
      return;
    }
    setError(null);
    setLoading(true);
    if (!result) setResult(null);

    try {
      const res = await fetch("/api/ai/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "no_credits") {
          router.push(`/subscription?featureId=patterns&featureName=Patterns%20to%20Reflect%20On&reason=out_of_credits&source=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }

      if (data.success && data.data) {
        setResult(data.data as PatternsResult);
        router.refresh();
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate reflection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="card-surface p-6 flex flex-col gap-10 shadow-2xl">
        <div className="flex flex-col gap-2">
          <p className="label-section px-1">Structural Analysis</p>
          <p className="text-[13px] font-medium opacity-50 px-1" style={{ color: "var(--color-text-muted)" }}>
            A 5-part deep dive into your relationship architecture.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Input 1: Duration */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-50" style={{ color: "var(--color-text-faint)" }}>
              1. Duration of Dynamic
            </label>
            <input
              className="input-base text-[15px] font-medium px-5 py-4"
              placeholder="e.g. 3 months, Just met"
              value={answers.dur}
              onChange={e => setAnswers(p => ({ ...p, dur: e.target.value }))}
            />
          </div>

          {/* Input 2: Who initiates */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-50" style={{ color: "var(--color-text-faint)" }}>
              2. Initiation Effort
            </label>
            <div className="grid grid-cols-2 gap-3">
              {WHO_OPTIONS.map(opt => {
                const isSelected = answers.who === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers(p => ({ ...p, who: opt }))}
                    className={cn(
                      "px-4 py-4 rounded-2xl border text-[13px] font-bold transition-all active:scale-[0.96]",
                      isSelected 
                        ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)]" 
                        : "bg-[var(--color-bg-overlay)] border-[var(--color-border-soft)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input 3: Reply pattern */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-50" style={{ color: "var(--color-text-faint)" }}>
              3. Communication Pattern
            </label>
            <input
              className="input-base text-[15px] font-medium px-5 py-4"
              placeholder="e.g. Inconsistent, Fast, Always slow"
              value={answers.pattern}
              onChange={e => setAnswers(p => ({ ...p, pattern: e.target.value }))}
            />
          </div>

          {/* Input 4: Ignored */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-50" style={{ color: "var(--color-text-faint)" }}>
              4. Mixed Signals?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MIXED_OPTIONS.map(opt => {
                const isSelected = answers.ignored === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers(p => ({ ...p, ignored: opt }))}
                    className={cn(
                      "px-4 py-4 rounded-2xl border text-[13px] font-bold transition-all active:scale-[0.96]",
                      isSelected 
                        ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)]" 
                        : "bg-[var(--color-bg-overlay)] border-[var(--color-border-soft)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input 5: What's confusing */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] ml-1 opacity-50" style={{ color: "var(--color-text-faint)" }}>
              5. The Core Uncertainty
            </label>
            <textarea
              className="input-base min-h-[140px] resize-none text-[15px] font-medium py-3 px-5 py-4"
              placeholder="What specifically feels confusing right now?"
              value={answers.confusing}
              onChange={e => setAnswers(p => ({ ...p, confusing: e.target.value }))}
            />
          </div>
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
            Generate Reflection (1 Credit)
          </Button>
          <p className="text-[10px] text-center font-bold tracking-widest opacity-30 mt-4 uppercase" style={{ color: "var(--color-text-faint)" }}>
             Architectural Insight &bull; Private
          </p>
        </div>
      </div>

      {loading && !result && <LoadingResults message="Analyzing structural integrity..." />}

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
                <h2 className="text-2xl font-black tracking-tighter" style={{ color: "var(--color-text-strong)" }}>Reflection Summary</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]" style={{ color: "var(--color-text-muted)" }}>LIVE</span>
              </div>

              <div className="flex flex-col gap-5">
                <div className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] shadow-xl">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3" style={{ color: "var(--color-accent)" }}>
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-accent-dim)] flex items-center justify-center text-[10px] border border-[var(--color-accent-border)] font-black">01</span>
                    Observation
                  </h3>
                  <p className="text-[16px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-strong)" }}>{result.observation}</p>
                </div>

                <div className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3" style={{ color: "var(--color-text-strong)" }}>
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-bg-overlay)] flex items-center justify-center text-[10px] border border-[var(--color-border-subtle)] font-black opacity-50">02</span>
                    Potential Drivers
                  </h3>
                  <p className="text-[15px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-body)" }}>{result.what_it_may_mean}</p>
                </div>

                <div className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3" style={{ color: "var(--color-text-strong)" }}>
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-bg-overlay)] flex items-center justify-center text-[10px] border border-[var(--color-border-subtle)] font-black opacity-50">03</span>
                    What to Notice
                  </h3>
                  <p className="text-[15px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-body)" }}>{result.what_to_notice}</p>
                </div>

                <div className="card-surface p-5 sm:p-6 bg-[var(--color-accent-dim)] border-[var(--color-border-accent)] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3" style={{ color: "var(--color-accent)" }}>
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[10px] border border-[var(--color-accent-border)] text-white font-black">04</span>
                    Strategic Step
                  </h3>
                  <p className="text-[17px] leading-[1.6] font-black tracking-tight italic" style={{ color: "var(--color-text-strong)" }}>&ldquo;{result.suggested_action}&rdquo;</p>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-3 mt-4 px-1">
                 <button 
                  onClick={handleReset}
                  className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all border border-dashed border-[var(--color-border-soft)] rounded-2xl active:scale-[0.97]"
                 >
                  Analyze New Pattern
                 </button>
                 <Link href="/home" className="w-full">
                    <div className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-[var(--color-text-faint)] opacity-60 hover:opacity-100 transition-all">
                      Return to Dashboard
                    </div>
                 </Link>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer || "Insight provides direction; choice provides the way."}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
