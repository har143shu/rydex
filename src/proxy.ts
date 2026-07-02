import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public page routes and public auth API routes
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Fetch session
  const session = await auth();
  const role = session?.user?.role;

  // 3. Handle API Route Auth (Return JSON 401 instead of a redirect)
  if (pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. Handle Page Route Auth (Redirect unauthenticated users to home)
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 5. Role-based Page Routing

  if (pathname.startsWith("/partner")) {
    if (pathname.startsWith("/partner/onboarding")) {
      return NextResponse.next();
    }
    if (role !== "partner") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // The matcher handles skipping static files, images, and favicons natively
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
