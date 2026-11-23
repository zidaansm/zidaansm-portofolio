import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isAuthorizedAdminEmail } from "@/lib/supabase/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { url, anonKey, configured } = getSupabaseConfig();

  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!configured || !url || !anonKey) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "Supabase is not configured in environment variables." },
        { status: 503 }
      );
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminApi) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAuthorizedAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return response;
  }

  if (isAdminPage && !isLoginPage) {
    if (!user || !isAuthorizedAdminEmail(user.email)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      if (user && !isAuthorizedAdminEmail(user.email)) {
        loginUrl.searchParams.set("error", "forbidden");
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginPage && user && isAuthorizedAdminEmail(user.email)) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
