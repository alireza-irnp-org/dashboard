import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const isLoggedIn = session;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnLogin = req.nextUrl.pathname.startsWith("/auth/sign-in");
  const isRoot = req.nextUrl.pathname === "/";

  if (isRoot) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    }
  }

  if (isOnDashboard) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  } else if (isOnLogin) {
    if (isLoggedIn)
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
