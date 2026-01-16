import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  applicationName: "English Vocabulary Builder",
  themeColor: "#0f172a",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Vocab",
    statusBarStyle: "default"
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-white to-muted">
          <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur safe-top">
            <div className="mx-auto flex max-w-5xl items-center justify-between py-3 safe-px">
              <Link
                href="/"
                className="min-w-0 max-w-[65%] truncate text-sm font-semibold tracking-tight sm:max-w-none sm:text-base"
              >
                English Vocabulary Builder
              </Link>
              <nav className="hidden items-center gap-4 text-sm text-mutedForeground sm:flex">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <Link href="/words" className="hover:text-foreground">
                  Words
                </Link>
              </nav>
              <nav className="flex items-center gap-2 sm:hidden">
                <Link
                  href="/words"
                  className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-foreground"
                >
                  Words
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

