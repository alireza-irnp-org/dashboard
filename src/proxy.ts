import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { routes } from "./lib/constants/routes";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const isLoggedIn = session;
  const isOnDashboard = req.nextUrl.pathname.startsWith(routes.dashboard());
  const isOnAuthPages = req.nextUrl.pathname.startsWith(routes.authParent());
  const isOnSignin = req.nextUrl.pathname.startsWith(routes.auth.signIn());
  const isOnSignUp = req.nextUrl.pathname.startsWith(routes.auth.signUp());
  const isOnPendingEmailVerification = req.nextUrl.pathname.startsWith(
    routes.auth.pendingEmailVerification(),
  );

  const isRoot = req.nextUrl.pathname === "/";

  if (isRoot) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(routes.dashboard(), req.nextUrl));
    } else {
      return NextResponse.redirect(new URL(routes.auth.signIn(), req.nextUrl));
    }
  }

  // if (isOnDashboard) {
  //   if (!isLoggedIn)
  //     return NextResponse.redirect(new URL(routes.auth.signIn(), req.nextUrl));
  // } else if (isOnAuthPages) {
  //   if (isLoggedIn)
  //     return NextResponse.redirect(new URL(routes.dashboard(), req.nextUrl));
  // }
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
