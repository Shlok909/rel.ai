import BottomNav from "./BottomNav";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export default function AppShell({
  children,
  showBottomNav = true,
  className,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full mx-auto max-w-md md:max-w-2xl lg:max-w-3xl relative flex flex-col isolation-auto",
        className
      )}
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background layer for extra stability */}
      <div className="fixed inset-0 bg-[var(--bg-base)] -z-10" />

      {/* Primary Accent Glow (Top Left/Center) */}
      <div
        className="fixed top-[-10%] left-1/4 w-[100%] max-w-[800px] aspect-square rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />

      {/* Romantic Wine Glow (Bottom Right) */}
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[100%] max-w-[800px] aspect-square rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--romantic-glow) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      <main
        className={cn(
          "flex-1 flex flex-col relative z-0",
          showBottomNav && "pb-[92px]" /* More precise bottom nav height accounting for labels */
        )}
      >
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
}
