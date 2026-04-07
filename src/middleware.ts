import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Unauthenticated guards ─────────────────────────────────────────────────
  const protectedPaths = ["/dashboard", "/coach", "/onboarding"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Authenticated guards ───────────────────────────────────────────────────
  const authPaths = ["/auth/login", "/auth/signup"];
  if (user && authPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Onboarding enforcement ─────────────────────────────────────────────────
  // If user is authenticated but hasn't completed onboarding, redirect to /onboarding
  // Skip this check when already on /onboarding or auth callback
  if (
    user &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/auth/callback") &&
    !pathname.startsWith("/api/") &&
    isProtected
  ) {
    // Check onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_done, role")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_done) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Role-based route guard: coaches shouldn't access /dashboard swimmer-only routes
    // and swimmers shouldn't access /coach routes
    if (profile?.role === "swimmer" && pathname.startsWith("/coach")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (profile?.role === "coach" && pathname.startsWith("/dashboard")) {
      // Coaches can view swimmer dashboards if needed, but default to /coach
      // Allow for now – we can restrict specific sub-routes later
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
