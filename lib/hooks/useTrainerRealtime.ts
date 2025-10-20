"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type RealtimeCallbacks = {
  onEnrolmentChange?: () => void
  onAttemptChange?: () => void
  onSittingChange?: () => void
}

/**
 * Hook to subscribe to real-time updates for a sitting
 * Manages three channels: enrolments, attempts, and sittings
 */
export function useTrainerRealtime(sittingId: string | null, callbacks: RealtimeCallbacks) {
  const channelsRef = useRef<RealtimeChannel[]>([])

  useEffect(() => {
    if (!sittingId) return

    const supabase = createClient()
    const channels: RealtimeChannel[] = []

    // Channel 1: Enrolments (new students, status changes)
    if (callbacks.onEnrolmentChange) {
      const enrolmentsChannel = supabase
        .channel(`enrolments:${sittingId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'enrolments',
            filter: `sitting_id=eq.${sittingId}`,
          },
          () => {
            callbacks.onEnrolmentChange?.()
          }
        )
        .subscribe()

      channels.push(enrolmentsChannel)
    }

    // Channel 2: Attempts (submissions)
    if (callbacks.onAttemptChange) {
      const attemptsChannel = supabase
        .channel(`attempts:${sittingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'attempts',
            filter: `sitting_id=eq.${sittingId}`,
          },
          () => {
            callbacks.onAttemptChange?.()
          }
        )
        .subscribe()

      channels.push(attemptsChannel)
    }

    // Channel 3: Sittings (timer, lock, end)
    if (callbacks.onSittingChange) {
      const sittingsChannel = supabase
        .channel(`sittings:${sittingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sittings',
            filter: `id=eq.${sittingId}`,
          },
          () => {
            callbacks.onSittingChange?.()
          }
        )
        .subscribe()

      channels.push(sittingsChannel)
    }

    channelsRef.current = channels

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [sittingId, callbacks.onEnrolmentChange, callbacks.onAttemptChange, callbacks.onSittingChange])
}

/**
 * Broadcast timer update to all connected clients
 */
export async function broadcastTimerUpdate(sittingId: string) {
  const supabase = createClient()

  // Trigger a no-op update to fire the realtime event
  await supabase
    .from('sittings')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sittingId)
}

/**
 * Broadcast sitting update (lock, end, etc.)
 */
export async function broadcastSittingUpdate(sittingId: string) {
  const supabase = createClient()

  // The actual update will be done by the action,
  // this is just to ensure the realtime event fires
  await supabase
    .from('sittings')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sittingId)
}
