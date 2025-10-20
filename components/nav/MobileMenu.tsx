"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavLink } from "./NavLink"
import { TrialBadge } from "./TrialBadge"
import { SignOutButton } from "@/components/sign-out-button"
import type { NavItem } from "@/lib/nav/config"

interface MobileMenuProps {
  navItems: NavItem[]
  ctaItems?: NavItem[]
  authItems?: NavItem[]
  showSignOut?: boolean
  trialDays?: number | null
  pathname: string
}

/**
 * MobileMenu Component
 *
 * Sheet-based mobile navigation with:
 * - Focus trap when open
 * - Close on navigation
 * - Keyboard accessible (Esc to close)
 * - Trial badge display
 * - Sign out button for authenticated users
 */
export function MobileMenu({
  navItems,
  ctaItems = [],
  authItems = [],
  showSignOut = false,
  trialDays = null,
  pathname,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const handleNavClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          data-qa="mobile-menu-trigger"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Navigation</SheetTitle>
          {trialDays !== null && trialDays >= 0 && (
            <TrialBadge daysRemaining={trialDays} />
          )}
        </SheetHeader>

        <nav className="flex flex-col gap-6" data-qa="mobile-nav">
          {/* Main Navigation Links */}
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <div key={item.href} onClick={handleNavClick}>
                <NavLink
                  href={item.href}
                  label={item.label}
                  isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                  qa={item.qa}
                  className="w-full justify-start"
                />
              </div>
            ))}
          </div>

          {/* CTA Items */}
          {ctaItems.length > 0 && (
            <div className="border-t pt-4">
              {ctaItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  className="w-full mb-2"
                  data-qa={item.qa}
                  onClick={handleNavClick}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>
          )}

          {/* Auth Items & Sign Out */}
          {(authItems.length > 0 || showSignOut) && (
            <div className="border-t pt-4 flex flex-col gap-2">
              {authItems.map((item) => (
                <div key={item.href} onClick={handleNavClick}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    isActive={pathname.startsWith(item.href)}
                    qa={item.qa}
                    className="w-full justify-start"
                  />
                </div>
              ))}
              {showSignOut && (
                <div className="mt-2">
                  <SignOutButton className="w-full" />
                </div>
              )}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
