import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl

  // If user is authenticated and tries to access sign-in or sign-up, redirect to dashboard
  if (
    token &&
    (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and tries to access dashboard, redirect to sign-in
  if (
    !token &&
    url.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Otherwise, allow the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
    '/verify/:path*'
  ]
}