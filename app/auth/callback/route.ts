import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  // Build the redirect response first so we can attach cookies to it
  const setupUrl = new URL('/setup-profile', requestUrl.origin)
  let redirectTarget = new URL(next.startsWith('/') ? next : '/', requestUrl.origin)

  const response = NextResponse.redirect(redirectTarget)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on both request and response so session persists on mobile
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    const errUrl = new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    return NextResponse.redirect(errUrl)
  }

  if (data.user) {
    try {
      const admin = createSupabaseAdmin()
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id, full_name, phone, city')
        .eq('id', data.user.id)
        .single()

      const phone: string = existingProfile?.phone ?? ''
      const fullName: string = existingProfile?.full_name ?? ''

      const metaName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Utilizator'

      await admin.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || metaName,
        phone,
        city: existingProfile?.city ?? '',
      }, { onConflict: 'id', ignoreDuplicates: true })

      // Redirect to setup-profile if phone or name missing
      if (!phone.trim() || !fullName.trim()) {
        const res = NextResponse.redirect(setupUrl)
        // Copy session cookies to setup-profile redirect
        response.cookies.getAll().forEach(cookie => {
          res.cookies.set(cookie.name, cookie.value, { path: '/', sameSite: 'lax', httpOnly: true })
        })
        return res
      }
    } catch (e) {
      console.error('[auth/callback] profile error:', e)
      const res = NextResponse.redirect(setupUrl)
      response.cookies.getAll().forEach(cookie => {
        res.cookies.set(cookie.name, cookie.value, { path: '/', sameSite: 'lax', httpOnly: true })
      })
      return res
    }
  }

  return response
}
