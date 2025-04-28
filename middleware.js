import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the path starts with /console
  if (pathname.startsWith("/console")) {
    // If the user is not authenticated, redirect to the login page
    if (!token) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and trying to access home or auth pages, redirect to console
  if (token && (pathname === "/" || pathname.startsWith("/auth"))) {
    return NextResponse.redirect(new URL("/console", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/console/:path*", "/", "/auth/:path*"],
}
