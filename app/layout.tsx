// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import NavBar from "./components/NavBar";
import Script from "next/script";

export const metadata: Metadata = {
  title: "App",
  description: "Affiliate + Next.js Links Manager",
};

const THEME_INIT = `
(function(){
  try{
    var saved = localStorage.getItem('theme');
    var dark = saved ? (saved === 'dark') : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var el = document.documentElement;
    if(dark){ el.classList.add('dark'); } else { el.classList.remove('dark'); }
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
      </head>
      <body className="min-h-full bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
        <NavBar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
