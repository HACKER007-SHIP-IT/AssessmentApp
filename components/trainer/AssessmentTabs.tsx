"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClipboardList, Clipboard } from "lucide-react"

type AssessmentTabsProps = {
  token: string
}

export function AssessmentTabs({ token }: AssessmentTabsProps) {
  const pathname = usePathname()
  const isPracticalActive = pathname.includes('/practical')

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-8" aria-label="Assessment tabs">
          <Link
            href={`/trainer/${token}`}
            className={cn(
              "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              !isPracticalActive
                ? "border-focus-blue text-focus-blue"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Written Assessment
          </Link>

          <Link
            href={`/trainer/${token}/practical`}
            className={cn(
              "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              isPracticalActive
                ? "border-focus-blue text-focus-blue"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Clipboard className="h-4 w-4" />
            Practical Assessment
          </Link>
        </nav>
      </div>
    </div>
  )
}
