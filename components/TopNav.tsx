// [LABEL: FILE] components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TopNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    pathname?.startsWith(href)
      ? "bg-gray-100 dark:bg-gray-900 font-medium"
      : "hover:bg-gray-50 dark:hover:bg-gray-900";

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">App</Link>
          <nav className="ml-2 flex gap-1">
            <Link href="/brief" className={`px-3 py-2 rounded-lg text-sm ${active("/brief")}`}>Briefs</Link>
		<Link href="/links" className={`px-3 py-2 rounded-lg text-sm ${active("/links")}`}>Links</Link>
          </nav>
        </div>
        <nav className="flex gap-2">
          <Link href="/auth/login" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900">Log in</Link>
          <Link href="/auth/sign-up" className="px-3 py-2 rounded-lg text-sm border hover:bg-gray-50 dark:hover:bg-gray-900">Sign up</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
