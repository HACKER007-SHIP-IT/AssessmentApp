"use client"

import { Check, Circle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SectionResult } from "@/lib/types/practical"

type SectionHeaderProps = {
  title: string
  subtitle?: string | null
  result: SectionResult
  oralCount: number
  failCount: number
  onPass: () => void
  onOpenAnnotator: (mode: 'pass_oral' | 'fail') => void
  onClear: () => void
  disabled?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  result,
  oralCount,
  failCount,
  onPass,
  onOpenAnnotator,
  onClear,
  disabled = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-focus-text">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {(oralCount > 0 || failCount > 0) && (
          <div className="mt-2 flex gap-2">
            {oralCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                <Circle className="h-3 w-3" />
                Oral: {oralCount}
              </span>
            )}
            {failCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                <X className="h-3 w-3" />
                Failed: {failCount}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="lg"
          variant={result === 'pass' ? 'default' : 'outline'}
          className={cn(
            "min-h-[44px] min-w-[100px]",
            result === 'pass' && "bg-green-600 hover:bg-green-700"
          )}
          onClick={onPass}
          disabled={disabled}
          aria-pressed={result === 'pass'}
          title="Mark section as Pass (Keyboard: P)"
        >
          <Check className="h-4 w-4 mr-2" />
          Pass
        </Button>

        <Button
          size="lg"
          variant={result === 'pass_oral' ? 'default' : 'outline'}
          className={cn(
            "min-h-[44px] min-w-[120px]",
            result === 'pass_oral' && "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={() => onOpenAnnotator('pass_oral')}
          disabled={disabled}
          aria-pressed={result === 'pass_oral'}
          title="Mark as Pass with oral questioning (Keyboard: O)"
        >
          <Circle className="h-4 w-4 mr-2" />
          Pass (Oral)
        </Button>

        <Button
          size="lg"
          variant={result === 'fail' ? 'destructive' : 'outline'}
          className={cn(
            "min-h-[44px] min-w-[90px]",
            result === 'fail' && "bg-red-600 hover:bg-red-700"
          )}
          onClick={() => onOpenAnnotator('fail')}
          disabled={disabled}
          aria-pressed={result === 'fail'}
          title="Mark section as Failed (Keyboard: F)"
        >
          <X className="h-4 w-4 mr-2" />
          Fail
        </Button>

        {result && (
          <Button
            size="lg"
            variant="ghost"
            className="min-h-[44px]"
            onClick={onClear}
            disabled={disabled}
            title="Clear section marking (Keyboard: C)"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
