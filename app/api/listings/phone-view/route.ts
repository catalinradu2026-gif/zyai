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

    // Citim listing-ul cu metadata (pentru contactPhone)
    const { data: listing, error: fetchError } = await admin
      .from('listings')
      .select('user_id, metadata')
      .eq('id', listingId)
      .single()

    if (fetchError || !listing) {
      return Response.json({ error: 'listing not found' }, { status: 404 })
    }

    // Obține telefonul vânzătorului din profil
    const { data: profile } = await admin
      .from('profiles')
      .select('phone')
      .eq('id', listing.user_id)
      .single()

    // Prioritate: 1) metadata.contactPhone, 2) profil
    const metadata = (listing.metadata as any) || {}
    const phone: string | null = metadata.contactPhone || profile?.phone || null

    // Incrementează phone_views atomic via RPC
    try {
      await admin.rpc('increment_phone_views', { listing_id: listingId })
    } catch {
      // Fallback dacă RPC nu există: citire + scriere simplă
      try {
        const { data: cur } = await admin
          .from('listings')
          .select('phone_views')
          .eq('id', listingId)
          .single()
        const currentViews = (cur as any)?.phone_views ?? 0
        await admin
          .from('listings')
          .update({ phone_views: currentViews + 1 })
          .eq('id', listingId)
      } catch {
        // coloana phone_views nu există — nu blocăm
      }
    }

    return Response.json({ phone })
  } catch (err) {
    console.error('[phone-view] unexpected error:', err)
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
