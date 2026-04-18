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

  // Collect cookies set during session exchange
  const cookiesToSet: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(items) {
          items.forEach(item => cookiesToSet.push(item))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] error:', error.message)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  // Decide redirect target
  let targetUrl = new URL(next.startsWith('/') && !next.startsWith('//') ? next : '/', requestUrl.origin)

  if (data.user) {
    try {
      const admin = createSupabaseAdmin()
      const { data: profile } = await admin
        .from('profiles')
        .select('id, full_name, phone, city')
        .eq('id', data.user.id)
        .single()

      const phone: string = profile?.phone ?? ''
      const fullName: string = profile?.full_name ?? ''

      // Create or ensure profile exists
      const metaName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Utilizator'

      if (!profile) {
        await admin.from('profiles').insert({
          id: data.user.id,
          full_name: metaName,
          phone: '',
          city: '',
        })
      }

      // Send to setup-profile if phone or name is missing
      if (!phone.trim() || !fullName.trim()) {
        targetUrl = new URL('/setup-profile', requestUrl.origin)
      }
    } catch (e) {
      console.error('[auth/callback] profile error:', e)
      targetUrl = new URL('/setup-profile', requestUrl.origin)
    }
  }

  // Build response and attach ALL session cookies
  const response = NextResponse.redirect(targetUrl)
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...options,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
  })

  return response
}
