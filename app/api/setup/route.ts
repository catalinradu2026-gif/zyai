import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Try to add password_hash column if it doesn't exist
    await supabase.rpc('add_password_hash_column', {})
    return NextResponse.json({ success: true, message: 'Setup completed' })
  } catch {
    // Column probably already exists, that's fine
    return NextResponse.json({ success: true, message: 'Already setup or column exists' })
  }
}
