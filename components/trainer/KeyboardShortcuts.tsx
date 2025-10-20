"use client"

import { useEffect } from "react"

type KeyboardShortcutsProps = {
  onStartAll?: () => void
  onExtend5?: () => void
  onExtend10?: () => void
  onLock?: () => void
  onEnd?: () => void
  onToggleProjector?: () => void
  onShowHelp?: () => void
}

export function KeyboardShortcuts({
  onStartAll,
  onExtend5,
  onExtend10,
  onLock,
  onEnd,
  onToggleProjector,
  onShowHelp,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 's':
          onStartAll?.()
          break
        case '5':
          onExtend5?.()
          break
        case '=':
          onExtend10?.()
          break
        case '0':
          onLock?.()
          break
        case 'e':
          onEnd?.()
          break
        case 'p':
          onToggleProjector?.()
          break
        case '?':
          onShowHelp?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onStartAll, onExtend5, onExtend10, onLock, onEnd, onToggleProjector, onShowHelp])

  return null // This component doesn't render anything
}

// TODO: Create help modal component showing all shortcuts
