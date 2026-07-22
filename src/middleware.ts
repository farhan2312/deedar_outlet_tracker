import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session-constants";

async function readSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.SESSION_SECRET) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET),
    );
    return {
      id: payload.sub,
      role: payload.role === "admin" ? "admin" : payload.role === "SO" ? "SO" : "ISR",
      mustChange: payload.mustChange === true,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const onChangePassword = pathname === "/change-password";

  // Force a password reset before anything else is accessible.
  if (session.mustChange && !onChangePassword) {
    const url = req.nextUrl.clone();
    url.pathname = "/change-password";
    url.search = "";
    return NextResponse.redirect(url);
  }
  // No reset needed — keep users out of the change-password screen.
  if (!session.mustChange && onChangePassword) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protect the app home, admin area, and the forced-reset screen. Everything
// else (login, signup, api, static assets) is handled by the routes/handlers.
export const config = {
  matcher: ["/", "/admin/:path*", "/change-password"],
};
