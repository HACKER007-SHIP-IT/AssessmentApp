"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavLink } from "./NavLink"
import { TrialBadge } from "./TrialBadge"
import { MobileMenu } from "./MobileMenu"
import { SignOutButton } from "@/components/sign-out-button"
import {
  publicNavItems,
  publicAuthItems,
  providerNavItems,
  providerCtaItems,
  providerAuthItems,
  isNavItemActive,
} from "@/lib/nav/config"

interface NavBarProps {
  authed: boolean
  trialDays?: number | null
  pathname: string
}

/**
 * NavBar Component (Client)
 *
 * Main navigation component that orchestrates all nav elements.
 * Receives server-computed data as props to avoid hydration issues.
 *
 * Navigation rules:
 * - Public (not authed): Home | Join course | Pricing | Sign in | [Start free trial]
 * - Provider (authed): Dashboard | Trainers | Sittings | [New sitting] | Profile | Sign out
 * - Trial badge shown for authenticated trial users
 * - Mobile menu available on small screens
 */
export function NavBar({ authed, trialDays = null, pathname }: NavBarProps) {
  const navItems = authed ? providerNavItems : publicNavItems
  const ctaItems = authed ? providerCtaItems : []
  const authItems = authed ? providerAuthItems : []
  const authButtons = authed ? [] : publicAuthItems

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={authed ? "/admin" : "/"}
            className="flex items-center gap-2 font-semibold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-blue focus-visible:ring-offset-2 rounded-lg"
            data-qa="nav-logo"
          >
            <div className="h-8 w-8 rounded-lg bg-focus-gradient flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="hidden sm:inline">Focus Assessments</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" data-qa="desktop-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isNavItemActive(item.href, pathname)}
                qa={item.qa}
              />
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Trial Badge */}
            {authed && trialDays !== null && trialDays >= 0 && (
              <TrialBadge daysRemaining={trialDays} />
            )}

            {/* CTA Buttons (authenticated) */}
            {ctaItems.map((item) => (
              <Button
                key={item.href}
                asChild
                size="sm"
                data-qa={item.qa}
                className="rounded-xl"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}

            {/* Profile Links (authenticated) */}
            {authItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isNavItemActive(item.href, pathname)}
                qa={item.qa}
              />
            ))}

            {/* Sign Out (authenticated) */}
            {authed && <SignOutButton />}

            {/* Auth Buttons (public) */}
            {authButtons.map((item, index) => (
              <Button
                key={item.href}
                asChild
                variant={index === authButtons.length - 1 ? "default" : "outline"}
                size="sm"
                data-qa={item.qa}
                className="rounded-xl"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            navItems={navItems}
            ctaItems={ctaItems}
            authItems={authItems}
            showSignOut={authed}
            trialDays={trialDays}
            pathname={pathname}
          />
        </div>
      </div>
    </header>
  )
}
