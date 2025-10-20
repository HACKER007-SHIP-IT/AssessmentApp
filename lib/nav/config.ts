/**
 * Navigation Configuration
 * Single source of truth for all navigation items
 */

export interface NavItem {
  label: string
  href: string
  qa: string // data-qa attribute for e2e testing
}

/**
 * Public navigation items (shown when not authenticated)
 */
export const publicNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    qa: "nav-home",
  },
  {
    label: "Join course",
    href: "/join",
    qa: "nav-join",
  },
  {
    label: "Pricing",
    href: "/pricing",
    qa: "nav-pricing",
  },
]

/**
 * Public auth buttons (shown when not authenticated)
 */
export const publicAuthItems: NavItem[] = [
  {
    label: "Sign in",
    href: "/signin",
    qa: "nav-signin",
  },
  {
    label: "Start free trial",
    href: "/signup",
    qa: "nav-signup",
  },
]

/**
 * Provider navigation items (shown when authenticated as provider)
 */
export const providerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    qa: "nav-dashboard",
  },
  {
    label: "Trainers",
    href: "/admin/trainers",
    qa: "nav-trainers",
  },
  {
    label: "Sittings",
    href: "/admin/sittings",
    qa: "nav-sittings",
  },
]

/**
 * Provider auth buttons (shown when authenticated)
 */
export const providerAuthItems: NavItem[] = [
  {
    label: "Profile",
    href: "/admin/profile",
    qa: "nav-profile",
  },
]

/**
 * CTA buttons for authenticated users
 */
export const providerCtaItems: NavItem[] = [
  {
    label: "New sitting",
    href: "/admin/sittings/new",
    qa: "nav-new-sitting",
  },
]

/**
 * Routes where no header should be displayed
 */
export const noHeaderRoutes = [
  "/trainer/",
]

/**
 * Check if a route should display the header
 */
export function shouldShowHeader(pathname: string): boolean {
  return !noHeaderRoutes.some(route => pathname.startsWith(route))
}

/**
 * Check if a nav item is active based on current pathname
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  // Exact match for home
  if (href === "/") {
    return pathname === "/"
  }

  // For other routes, check if pathname starts with href
  return pathname.startsWith(href)
}
