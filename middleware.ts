import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow /admin/sign-in and /admin/setup without authentication
    const isPublicAdminRoute = request.nextUrl.pathname.startsWith('/admin/sign-in') ||
                               request.nextUrl.pathname.startsWith('/admin/setup')

    if (!isPublicAdminRoute && !user) {
      return NextResponse.redirect(new URL('/admin/sign-in', request.url))
    }

    // If accessing /admin/sign-in and already authenticated, redirect to dashboard
    if (request.nextUrl.pathname.startsWith('/admin/sign-in') && user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Trainer routes protection
  if (request.nextUrl.pathname.startsWith('/trainer')) {
    // Allow /trainer/sign-in and /trainer/[token] (public access for students joining)
    const isPublicTrainerRoute = request.nextUrl.pathname.startsWith('/trainer/sign-in') ||
                                 request.nextUrl.pathname.match(/^\/trainer\/[A-Z]{3}-[A-Z0-9]{4}$/)

    // Protect /trainer/dashboard
    if (request.nextUrl.pathname.startsWith('/trainer/dashboard') && !user) {
      return NextResponse.redirect(new URL('/trainer/sign-in', request.url))
    }

    // If accessing /trainer/sign-in and already authenticated, redirect to dashboard
    if (request.nextUrl.pathname.startsWith('/trainer/sign-in') && user) {
      return NextResponse.redirect(new URL('/trainer/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/trainer/dashboard/:path*', '/trainer/sign-in'],
}
