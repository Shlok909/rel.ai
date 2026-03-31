"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { LoadingResults, ErrorAlert } from "@/components/ui/StateFeedback";
import Link from "next/link";

interface Signal {
  label: string;
  observation: string;
}

interface SignsResult {
  vibe_label: string;
  vibe_level: number;
  signals: Signal[];
  overall_read: string;
  tips: string[];
  disclaimer?: string;
}

const QUESTIONS = [
  { key: "freq",  label: "How often do you interact?",       options: ["Daily", "Few times a week", "Rarely"] },
  { key: "reply", label: "How quickly do they reply?",       options: ["Immediately", "Within hours", "A day or more", "Inconsistent"] },
  { key: "topic", label: "Topics you usually discuss?",      options: ["Deep & personal", "Mixed topics", "Just small talk"] },
  { key: "eye",   label: "Their eye contact with you?",      options: ["Warm & holds it", "Brief glances", "Avoids it"] },
  { key: "body",  label: "Their body language around you?",  options: ["Open & leaning in", "Neutral", "Distant / closed"] },
];

export default function SignsObservationsClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignsResult | null>(null);

  const allAnswered = QUESTIONS.every(q => answers[q.key]);

  const handleSelect = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setResult(null);
    setAnswers({});
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
      const res = await fetch("/api/ai/signs-observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "no_credits") {
          router.push(`/subscription?featureId=signs&featureName=Signs%20%26%20Observations&reason=out_of_credits&source=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }

      if (data.success && data.data) {
        setResult(data.data as SignsResult);
        router.refresh();
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze signals.");
    } finally {
      setLoading(false);
    }
  };

  // Vibe level colors mapped to Tailwind variables
  const vibeColors = [
    "var(--color-danger)",
    "var(--color-warning)",
    "var(--color-warning)",
    "var(--color-accent)",
    "var(--color-success)"
  ];

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Questionnaire */}
      <div className="card-surface p-5 sm:p-6 flex flex-col gap-10 shadow-2xl">
        <div className="flex flex-col gap-2">
          <p className="label-section px-1">Observation Pulse</p>
          <p className="text-[13px] font-medium opacity-50 px-1" style={{ color: "var(--color-text-muted)" }}>
            Answer these 5 questions about your recent interactions.
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
              <div className="flex flex-col gap-2">
                {q.options.map(opt => {
                  const isSelected = answers[q.key] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.key, opt)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-2xl text-[14px] font-bold border transition-all active:scale-[0.97]",
                        isSelected 
                          ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent-glow)]" 
                          : "bg-[var(--color-bg-overlay)] border-[var(--color-border-soft)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {isSelected && <span className="text-lg">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
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
            Decrypt Signals (1 Credit)
          </Button>
          <p className="text-[10px] text-center font-bold tracking-widest opacity-30 mt-4 uppercase" style={{ color: "var(--color-text-faint)" }}>
             Behavioral AI Analysis &bull; Private
          </p>
        </div>
      </div>

      {loading && !result && <LoadingResults message="Interpreting behavioral cues..." />}

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
              {/* Vibe Header */}
              <div className="card-surface p-5 sm:p-6 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-danger)] via-[var(--color-accent)] to-[var(--color-success)] opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-50" style={{ color: "var(--color-text-faint)" }}>
                  Overall Dynamic Read
                </p>
                <h2 className="text-3xl font-black tracking-tighter mb-5" style={{ color: "var(--color-text-strong)" }}>
                  {result.vibe_label}
                </h2>
                <div className="flex gap-2 justify-center mb-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: level <= result.vibe_level ? '42px' : '30px',
                        background: level <= result.vibe_level ? vibeColors[level - 1] : 'var(--color-bg-overlay)',
                        opacity: level <= result.vibe_level ? 1 : 0.2,
                        boxShadow: level <= result.vibe_level ? `0 0 15px ${vibeColors[level - 1]}` : 'none',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-30" style={{ color: "var(--color-text-faint)" }}>Signal Intensity Meter</p>
              </div>

              {/* Signal Cards */}
              <div className="flex flex-col gap-5">
                <p className="label-section px-1">Detected Signals</p>
                <div className="flex flex-col gap-5">
                  {result.signals.map((sig, idx) => (
                    <div key={idx} className="card-surface p-5 sm:p-6 border-[var(--color-border-soft)] group">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                        <span className="text-xl">📡</span> {sig.label}
                      </h3>
                      <p className="text-[16px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-strong)" }}>{sig.observation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Read */}
              <div className="card-surface p-5 sm:p-6 border-[var(--color-border-accent)] bg-[var(--color-bg-elevated)]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "var(--color-text-strong)" }}>
                  <span className="text-xl">🔮</span> Social Analytics Read
                </h3>
                <p className="text-[16px] leading-[1.7] font-medium tracking-tight" style={{ color: "var(--color-text-body)" }}>{result.overall_read}</p>
              </div>

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="card-surface p-5 sm:p-6 bg-[var(--color-accent-dim)] border-[var(--color-border-accent)] flex flex-col gap-5 shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--color-accent)" }}>
                    💡 Suggested Movements
                  </p>
                  <div className="flex flex-col gap-4">
                    {result.tips.map((tip, idx) => (
                      <p key={idx} className="text-[15px] leading-[1.6] font-semibold" style={{ color: "var(--color-text-strong)" }}>
                        &bull; {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="flex flex-col gap-3 mt-4 px-1">
                 <button 
                  onClick={handleReset}
                  className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all border border-dashed border-[var(--color-border-soft)] rounded-2xl active:scale-[0.97]"
                 >
                  Analyze New Behavior
                 </button>
                 <Link href="/home" className="w-full">
                    <div className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-[var(--color-text-faint)] opacity-60 hover:opacity-100 transition-all">
                      Return to Dashboard
                    </div>
                 </Link>
              </div>

              {/* Disclaimer */}
              <div className="text-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer || "Clarity is a journey. This is your compass."}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
