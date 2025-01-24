import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If we're on a secure connection, enforce secure cookies
            if (req.url.startsWith("https://")) {
              options.secure = true;
            }
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    // Refresh the session if it exists
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      // Clear auth cookies on session error
      response.cookies.set({
        name: "sb-access-token",
        value: "",
        maxAge: 0,
      });
      response.cookies.set({
        name: "sb-refresh-token",
        value: "",
        maxAge: 0,
      });
    }

    // If accessing admin routes without auth, redirect to login
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
      if (!session) {
        const redirectUrl = new URL("/admin/login", req.url);
        redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    // Return the original response if there's an error
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
