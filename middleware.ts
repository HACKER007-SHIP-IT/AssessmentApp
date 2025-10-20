import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_FUSE = "onb_redirect"

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Allow public routes, static assets, and API routes
  // These should never be gated by auth or org checks
  const isPublicRoute = [
    '/', '/pricing', '/join', '/join/confirm', '/attempt',
    '/signup', '/signin', '/legal', '/verify-email',
    '/_next', '/api', '/favicon.ico', '/assets'
  ].some(route => pathname === route || pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Only guard /admin, /trainer, and /onboarding routes beyond this point
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/onboarding') && !pathname.startsWith('/trainer')) {
    return NextResponse.next()
  }

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

  // ===== ONBOARDING ROUTES =====
  // These routes are ALWAYS allowed for authenticated users
  // This prevents redirect loops during the onboarding flow
  // Sub-routes: /onboarding, /onboarding/plan-selection, /onboarding/setup
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    // Require authentication for onboarding
    if (!user) {
      return NextResponse.redirect(new URL('/signup', request.url))
    }
    // Allow access to ALL onboarding pages - NEVER recheck org/membership here
    // The onboarding pages themselves handle the flow logic
    return response
  }

  // ===== ADMIN ROUTES =====
  // Protected routes requiring authentication AND organization membership
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow /admin/sign-in, /admin/setup, and /admin/billing without authentication check
    const isPublicAdminRoute = request.nextUrl.pathname.startsWith('/admin/sign-in') ||
                               request.nextUrl.pathname.startsWith('/admin/setup') ||
                               request.nextUrl.pathname.startsWith('/admin/billing')

    // Require authentication for all non-public admin routes
    if (!isPublicAdminRoute && !user) {
      const to = new URL('/admin/sign-in', request.url)
      to.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(to)
    }

    // If accessing /admin/sign-in and already authenticated, redirect to dashboard
    if (request.nextUrl.pathname.startsWith('/admin/sign-in') && user) {
      const next = request.nextUrl.searchParams.get('next') || '/admin'
      return NextResponse.redirect(new URL(next, request.url))
    }

    // Check org membership for authenticated users accessing protected routes
    // Redirect Matrix:
    // - No membership → /onboarding (user needs to create or join org)
    // - Has membership but no org (edge case) → /onboarding
    // - Has membership and org → allow access
    if (user && !isPublicAdminRoute) {
      // Fuse: if we already redirected once very recently, don't loop
      if (request.cookies.get(COOKIE_FUSE)?.value === "1") {
        // Clear the fuse so normal flow continues on next requests
        response.cookies.set(COOKIE_FUSE, '', { path: '/', maxAge: 0, sameSite: 'lax' as const })
        return response
      }

      // Optional fast path: user/app metadata "onboarding_completed"
      // const completed = (user.user_metadata?.onboarding_completed ?? false)
      // if (completed) return response

      // 1) Get membership (organization_id) cheaply
      const { data: membership, error: memErr } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

      if (memErr || !membership?.organization_id) {
        const to = new URL('/onboarding', request.url)
        to.searchParams.set('next', request.nextUrl.pathname)
        // Set fuse to avoid redirect loops
        const redirect = NextResponse.redirect(to)
        redirect.cookies.set(COOKIE_FUSE, "1", { path: "/", maxAge: 5, sameSite: "lax" as const })
        if (process.env.NODE_ENV !== "production") {
          redirect.headers.set("x-onb", "no-membership")
        }
        return redirect
      }

      // 2) Verify the organization exists (and optionally plan fields)
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("id, plan, trial_end_date, subscription_status")
        .eq("id", membership.organization_id)
        .limit(1)
        .maybeSingle()

      if (orgErr || !org?.id) {
        const to = new URL('/onboarding', request.url)
        to.searchParams.set('next', request.nextUrl.pathname)
        const redirect = NextResponse.redirect(to)
        redirect.cookies.set(COOKIE_FUSE, "1", { path: "/", maxAge: 5, sameSite: "lax" as const })
        if (process.env.NODE_ENV !== "production") {
          redirect.headers.set("x-onb", "no-org")
        }
        return redirect
      }

      // Trial expiry check
      const now = new Date()
      const trialEnd = new Date(org.trial_end_date)
      const isTrialExpired = now > trialEnd && org.plan === 'trial'
      const hasActiveSubscription = org.subscription_status === 'active' || org.subscription_status === 'trialing'

      // If trial expired and no active subscription, redirect to trial-expired page
      // Allow access to billing page
      const isAllowedPage = request.nextUrl.pathname.startsWith('/admin/billing')

      if (isTrialExpired && !hasActiveSubscription && !isAllowedPage) {
        return NextResponse.redirect(new URL('/trial-expired', request.url))
      }
    }
  }

  // Trainer routes protection
  if (request.nextUrl.pathname.startsWith('/trainer')) {
    // Allow /trainer/sign-in and /trainer/[token] (public access for trainer console)
    // Token is a 24-character base32 string
    const isPublicTrainerRoute = request.nextUrl.pathname.startsWith('/trainer/sign-in') ||
                                 request.nextUrl.pathname.match(/^\/trainer\/[A-Z2-9]{24}$/i)

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
  matcher: ['/admin/:path*', '/trainer/dashboard/:path*', '/trainer/sign-in', '/onboarding/:path*'],
}
