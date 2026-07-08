import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function getSessionRole(request: NextRequest): string | null {
  const raw = request.cookies.get("session_user")?.value;
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return typeof user.role === "string" ? user.role : null;
  } catch {
    try {
      const user = JSON.parse(decodeURIComponent(raw));
      return typeof user.role === "string" ? user.role : null;
    } catch {
      return null;
    }
  }
}

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);
  const { pathname } = request.nextUrl;
  const role = getSessionRole(request);

  const isAdmin = pathname.startsWith("/admin");
  const isModerator = pathname.startsWith("/moderator");

  const loginPath = "/admin/login";

  // Logged-in users landing on the root page go straight to their home
  if (pathname === "/") {
    if (role === "student") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "moderator") {
      return NextResponse.redirect(new URL("/moderator/dashboard", request.url));
    }
    return supabaseResponse;
  }

  if (!isAdmin && !isModerator) {
    return supabaseResponse;
  }

  // Authenticated staff should not see the login page
  if (pathname === loginPath) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "moderator") {
      return NextResponse.redirect(new URL("/moderator/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Not logged in -> send to login
  if (!role) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // Logged in but wrong area -> send to their own dashboard
  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(
      new URL(role === "moderator" ? "/moderator/dashboard" : loginPath, request.url)
    );
  }
  if (isModerator && role !== "moderator") {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : loginPath, request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
