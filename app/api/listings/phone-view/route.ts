import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()
    if (!listingId) {
      return Response.json({ error: 'listingId required' }, { status: 400 })
    }

    // Verifică autentificarea
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const admin = createSupabaseAdmin()

    // Citim listing-ul și profilul vânzătorului într-un singur query
    const { data: listing, error: fetchError } = await admin
      .from('listings')
      .select('user_id, phone_views')
      .eq('id', listingId)
      .single()

    if (fetchError) {
      console.error('[phone-view] fetch listing error:', fetchError)
      // Încearcă fără phone_views (coloana poate să nu existe)
      const { data: listing2, error: fetchError2 } = await admin
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single()
      if (fetchError2 || !listing2) {
        return Response.json({ error: 'listing not found' }, { status: 404 })
      }
      // Obține telefonul și returnează
      const { data: profile2 } = await admin
        .from('profiles')
        .select('phone')
        .eq('id', listing2.user_id)
        .single()
      return Response.json({ phone: profile2?.phone || null })
    }

    if (!listing) {
      return Response.json({ error: 'listing not found' }, { status: 404 })
    }

    // Obține telefonul vânzătorului
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('phone')
      .eq('id', listing.user_id)
      .single()

    if (profileError) {
      console.error('[phone-view] fetch profile error:', profileError)
    }

    const phone: string | null = profile?.phone || null

    // Incrementează phone_views atomic
    try {
      await admin
        .from('listings')
        .update({ phone_views: (listing.phone_views ?? 0) + 1 })
        .eq('id', listingId)
    } catch {
      // ignorăm — nu blocăm returnarea numărului
    }

    return Response.json({ phone })
  } catch (err) {
    console.error('[phone-view] unexpected error:', err)
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
