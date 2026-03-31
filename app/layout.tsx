import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rel.AI – Your Private Relationship Guide",
  description:
    "Rel.AI is a private, AI-powered relationship guidance app for Indian users. Understand messages, read signals, and navigate your love life with confidence.",
};

import { Suspense } from "react";
import LoadingBar from "@/components/navigation/LoadingBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <LoadingBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
