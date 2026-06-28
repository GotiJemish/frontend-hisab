import { NextResponse } from "next/server";

const authRoutes = ["/login", "/register", "/forgot-password"];
const publicRoutes = [...authRoutes]; // Add any other public routes like landing page if needed

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is trying to access login/register while ALREADY logged in
  if (isAuthRoute && authToken) {
    try {
      const payload = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString());
      if (payload.user_id || payload.id) {
        return NextResponse.redirect(new URL(`/${payload.user_id || payload.id}`, request.url));
      }
    } catch (e) {}
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is on the root path "/" and ALREADY logged in
  if (pathname === "/" && authToken) {
    try {
      const payload = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString());
      if (payload.user_id || payload.id) {
        return NextResponse.redirect(new URL(`/${payload.user_id || payload.id}`, request.url));
      }
    } catch (e) {}
  }

  // If user is trying to access a protected route while NOT logged in
  if (!isPublicRoute && pathname !== "/" && !authToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // RBAC for protected routes
  if (!isPublicRoute && authToken) {
    try {
      const payload = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString());
      const role = payload.role;
      const perms = payload.permissions || {};
      const isSuper = role === "SUPER_ADMIN";
      const isCompanyAdmin = role === "COMPANY_ADMIN";
      
      const pathParts = pathname.split("/");
      // Path format: /<userId>/<module>
      if (pathParts.length > 2) {
        const module = pathParts[2];
        let hasAccess = true;
        
        if (module === "organizations") {
          hasAccess = isSuper;
        } else if (["users", "roles", "configurations", "reports"].includes(module)) {
          hasAccess = !isSuper && isCompanyAdmin;
        } else if (module === "items") {
          hasAccess = (!isSuper && isCompanyAdmin) || perms.items === true || perms.items?.read;
        } else if (module === "orders" || module === "invoices") {
          hasAccess = (!isSuper && isCompanyAdmin) || perms.invoices === true || perms.invoices?.read;
        } else if (module === "contacts") {
          hasAccess = (!isSuper && isCompanyAdmin) || perms.contacts === true || perms.contacts?.read;
        } else if (module === "accounts") {
          hasAccess = (!isSuper && isCompanyAdmin) || perms.accounts === true || perms.accounts?.read;
        }
        
        if (!hasAccess) {
          return NextResponse.redirect(new URL(`/${payload.user_id || payload.id}`, request.url));
        }
      }
    } catch (e) {
      console.error("Middleware RBAC error:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
