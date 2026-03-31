"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      
      // If the URL contains auth hash fragments from Supabase implicit flow
      if (hash.includes("type=signup") || hash.includes("access_token=")) {
        // Forward to the new dedicated success page, preserving the hash
        // so the Supabase browser client can establish the session
        router.replace("/email-confirmed" + window.location.search + hash);
      }
    }
  }, [router]);

  return null;
}
