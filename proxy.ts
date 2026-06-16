import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminSession = request.cookies.get("admin_auth")?.value === "true";
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const roleRoutes = [
    { prefix: "/admin", role: "admin" },
    { prefix: "/teacher", role: "teacher" },
    { prefix: "/student", role: "student" },
    { prefix: "/parent", role: "parent" },
  ];

  for (const route of roleRoutes) {
    const isValidAdmin = route.role === "admin" && (role === "admin" || isAdminSession);
    const isValidRole = role === route.role || isValidAdmin;

    if (pathname.startsWith(route.prefix) && (!token || !isValidRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login" && token && (role === "admin" || isAdminSession)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/login" && token && role === "teacher") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  if (pathname === "/login" && token && role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  if (pathname === "/login" && token && role === "parent") {
    return NextResponse.redirect(new URL("/parent", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/parent/:path*", "/login"],
};
