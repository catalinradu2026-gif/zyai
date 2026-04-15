import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (!code) {
    // Fără code — redirecționează la home (nu la error page)
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  if (data.user) {
    try {
      const admin = createSupabaseAdmin()
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id, phone')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // User nou — creează profil și trimite la setup
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'Utilizator'
        await admin.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          phone: '',
          city: '',
        })
        const setupUrl = new URL('/setup-profile', requestUrl.origin)
        if (next !== '/') setupUrl.searchParams.set('next', next)
        return NextResponse.redirect(setupUrl)
      }

      // User existent fără telefon — îl trimitem la setup-profile
      const phone = (existingProfile as any)?.phone
      if (!phone || phone.trim() === '') {
        const setupUrl = new URL('/setup-profile', requestUrl.origin)
        if (next !== '/') setupUrl.searchParams.set('next', next)
        return NextResponse.redirect(setupUrl)
      }
    } catch (e) {
      console.error('[auth/callback] profile error:', e)
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
