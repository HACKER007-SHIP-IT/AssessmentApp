import { createClient } from '@supabase/supabase-js'

// Service role client for server-side operations
// This bypasses RLS and should ONLY be used in server actions/routes
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
