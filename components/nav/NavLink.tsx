import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  label: string
  isActive: boolean
  qa: string
  className?: string
}

/**
 * NavLink Component
 *
 * Reusable navigation link with:
 * - Active state styling (Focus Blue underline)
 * - aria-current for screen readers
 * - Focus visible ring for keyboard navigation
 * - data-qa for e2e testing
 */
export function NavLink({ href, label, isActive, qa, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      data-qa={qa}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-blue focus-visible:ring-offset-2",
        isActive
          ? "text-focus-blue font-semibold underline underline-offset-4 decoration-2"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        className
      )}
    >
      {label}
    </Link>
  )
}
