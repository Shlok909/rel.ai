"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function EmailConfirmedPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen w-full mx-auto max-w-md md:max-w-2xl lg:max-w-3xl flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-[24px] p-8 flex flex-col items-center gap-5 text-center"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Success icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent)",
            border: "1px solid var(--accent-border)",
            boxShadow: "0 0 30px var(--accent-glow)",
          }}
        >
          ✨
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[24px] font-extrabold tracking-tight"
            style={{ color: "var(--text-strong)" }}
          >
            Your email is confirmed!!
          </h1>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Thank you for verifying your email address. Click below to sign in and start using the app.
          </p>
        </div>

        {/* Sign In button */}
        <div className="w-full mt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push("/onboarding/auth")}
          >
            Sign In
          </Button>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 mt-1">
          <svg
            className="w-3.5 h-3.5"
            style={{ color: "var(--success)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--text-faint)" }}
          >
            Verified & Secure
          </p>
        </div>
      </div>
    </div>
  );
}
