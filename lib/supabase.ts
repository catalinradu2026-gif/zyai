import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Lazy singleton - use createSupabaseBrowserClient() instead
let _supabase: ReturnType<typeof createBrowserClient> | null = null
export function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createSupabaseBrowserClient()
  }
  return _supabase
}
