// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refresh Supabase auth cookies so server components/layouts
 * can read the current session (prevents false "logged out" redirects).
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create a server client bound to the request/response cookies.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
      },
    },
  });

  // Touch the session so helper refreshes cookies if needed.
  await supabase.auth.getSession();

  return res;
}

/**
 * Run on all pages except:
 * - static assets
 * - Next.js internals
 * - API routes
 * - image/og routes
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/|og/).*)",
  ],
};
