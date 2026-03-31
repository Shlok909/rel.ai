"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import CopyButton from "@/components/ui/CopyButton";
import { LoadingResults, ErrorAlert } from "@/components/ui/StateFeedback";
import Link from "next/link";

interface ToneVersion {
  label: string;
  message: string;
}

interface MultiToneResult {
  versions: ToneVersion[];
  tip?: string;
  disclaimer?: string;
}

const TONES = [
  { id: "casual", label: "Casual", emoji: "👋" },
  { id: "flirty", label: "Flirty", emoji: "❤️" },
  { id: "mature", label: "Mature", emoji: "🎓" },
  { id: "apologetic", label: "Apologetic", emoji: "🙏" },
  { id: "confident", label: "Confident", emoji: "⚡" }
];

export default function MultiToneClient() {
  const router = useRouter();
  const [selectedTone, setSelectedTone] = useState<string>("casual");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiToneResult | null>(null);

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      setError("Please explain the purpose of the message.");
      return;
    }
    setError(null);
    setLoading(true);
    if (!result) setResult(null);

    try {
      const res = await fetch("/api/ai/multi-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: selectedTone, purpose, context }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === "no_credits") {
          router.push(`/subscription?featureId=tone&featureName=Multi-Tone%20Message&reason=out_of_credits&source=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }
      
      if (data.success && data.data) {
        setResult(data.data as MultiToneResult);
        router.refresh(); 
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate drafts.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPurpose("");
    setContext("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Tone Selector */}
      <section>
        <p className="label-section mb-4 px-1">Choose the Vibe</p>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map(tone => {
            const isSelected = selectedTone === tone.id;
            return (
              <button 
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={cn(
                  "p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.94] relative overflow-hidden rounded-2xl border",
                  isSelected 
                    ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] shadow-[0_0_20px_var(--color-accent-glow)]" 
                    : "bg-[var(--color-bg-elevated)] border-[var(--color-border-soft)] hover:border-[var(--color-border-strong)]"
                )}
              >
                <span className="text-2xl mb-1">{tone.emoji}</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                   isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-strong)]"
                )}>
                  {tone.label}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Input Section */}
      <div className="card-surface p-4 sm:p-5 flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2.5">
          <label className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--color-text-faint)" }}>
            The Objective
          </label>
          <input 
            className="input-base text-[15px] font-medium"
            placeholder="e.g. Asking them for coffee"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--color-text-faint)" }}>
            The Context (Optional)
          </label>
          <textarea 
            className="input-base min-h-[120px] resize-none text-[15px] font-medium py-3"
            placeholder="e.g. We met at a gallery and they mentioned they love dark roasts..."
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </div>

        {error && <ErrorAlert error={error} onRetry={handleGenerate} />}

        <div className="pt-2">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={handleGenerate}
            loading={loading}
            disabled={!purpose.trim()}
            className="font-black tracking-tight"
          >
            Draft Insights (1 Credit)
          </Button>
        </div>

        <p className="text-[10px] text-center font-bold tracking-widest opacity-30 mt-1 uppercase" style={{ color: "var(--color-text-faint)" }}>
          Neural Drafting &bull; Private
        </p>
      </div>

      {loading && !result && <LoadingResults message="Crafting personalized drafts..." />}

      {/* Results Section */}
      {result && !loading && (
        <div className="mt-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-black tracking-tighter" style={{ color: "var(--color-text-strong)" }}>Generated Drafts</h2>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] px-1 leading-none">Choose your voice</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]" style={{ color: "var(--color-text-muted)" }}>LIVE</span>
              </div>
              
              <div className="flex flex-col gap-5">
                {result.versions.map((ver, idx) => (
                  <div key={idx} className="card-surface p-5 sm:p-6 bg-[var(--color-bg-overlay)] border-[var(--color-border-soft)] group hover:border-[var(--color-accent-border)] transition-all duration-300 shadow-xl overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--color-accent-glow)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-center mb-5 relative z-10">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--color-accent)" }}>
                          {ver.label}
                        </span>
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest leading-none">Recommended Variation</p>
                      </div>
                      <CopyButton text={ver.message} />
                    </div>
                    <div className="p-6 sm:p-7 bg-[var(--color-bg-base)] rounded-2xl border border-[var(--color-border-soft)] shadow-inner relative z-10">
                      <p className="text-[17px] font-semibold leading-[1.6] tracking-tight italic" style={{ color: "var(--color-text-strong)" }}>
                         &ldquo;{ver.message}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {result.tip && (
                <div className="card-surface p-5 sm:p-6 bg-[var(--color-accent-dim)] border-[var(--color-border-accent)] flex gap-4 items-start shadow-xl">
                  <span className="text-3xl mt-1">💡</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Insight</span>
                    <p className="text-[15px] leading-[1.6] font-medium" style={{ color: "var(--color-text-strong)" }}>
                      {result.tip}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="flex flex-col gap-3 mt-4 px-1">
                 <button 
                  onClick={handleReset}
                  className="w-full py-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all border border-dashed border-[var(--color-border-soft)] rounded-2xl active:scale-[0.97]"
                 >
                  Draft Another Message
                 </button>
                 <Link href="/home" className="w-full">
                    <div className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-[var(--color-text-faint)] opacity-60 hover:opacity-100 transition-all">
                      Return to Dashboard
                    </div>
                 </Link>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.disclaimer || "Choices are yours. Guidance is ours."}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
