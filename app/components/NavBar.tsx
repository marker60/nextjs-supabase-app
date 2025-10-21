// app/components/NavBar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const linkBtn = cn(
  "rounded-lg px-3 py-1.5 text-sm transition-colors",
  "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  "dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
);

const btn = cn(
  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
  "bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900",
  "dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
);

export default function NavBar() {
  const pathname = usePathname() || "/";

  // Show auth buttons ONLY on auth pages
  const showAuthButtons = /^\/(?:(?:login|sign-?in|signup|sign-?up)|auth(?:\/.*)?)$/i.test(pathname);

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-gray-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-950/60">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Left: brand + primary nav */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            App
          </Link>
          <Link href="/brief" className={linkBtn}>
            Briefs
          </Link>
          <Link href="/links" className={linkBtn}>
            Links
          </Link>
        </div>

        {/* Right: Theme toggle always; auth buttons ONLY on auth pages */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showAuthButtons ? (
            <>
              <Link href="/login" className={btn}>
                Log in
              </Link>
              <Link href="/signup" className={btn}>
                Sign up
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
