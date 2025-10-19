// [LABEL: FILE] app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "App",
  description: "Affiliate / Supabase tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNav />
          <main className="min-h-[calc(100vh-3.25rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
