"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: (active: boolean) => (
      <svg
        className={cn("w-[22px] h-[22px] transition-colors")}
        style={{ color: active ? "var(--accent)" : "var(--text-faint)" }}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (active: boolean) => (
      <svg
        className="w-[22px] h-[22px] transition-colors"
        style={{ color: active ? "var(--accent)" : "var(--text-faint)" }}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg
        className="w-[22px] h-[22px] transition-colors"
        style={{ color: active ? "var(--accent)" : "var(--text-faint)" }}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl"
      style={{
        background: "rgba(19,19,26,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div 
        className="flex justify-around items-center px-6 pt-3"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      > {/* Responsive pb for home indicator safety */}
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 min-w-[64px] transition-all active:scale-90"
            >
              <div className="relative">
                {icon(active)}
                {active && (
                  <div
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: active ? "var(--accent)" : "var(--text-faint)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
