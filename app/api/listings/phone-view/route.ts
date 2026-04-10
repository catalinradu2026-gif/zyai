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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'not_authenticated' }, { status: 401 })
    }

    // Folosim admin client pentru bypass RLS
    const admin = createSupabaseAdmin()

    // Citim listing-ul pentru numărul de telefon și phone_views curent
    const { data: listing, error: fetchError } = await admin
      .from('listings')
      .select('phone_views, user_id, profiles(phone)')
      .eq('id', listingId)
      .single()

    if (fetchError || !listing) {
      return Response.json({ error: 'listing not found' }, { status: 404 })
    }

    // Incrementăm phone_views
    const currentViews = (listing as any).phone_views ?? 0
    await admin
      .from('listings')
      .update({ phone_views: currentViews + 1 })
      .eq('id', listingId)

    // Extragem numărul de telefon din profil
    const profileRaw = (listing as any).profiles
    const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw
    const phone: string | null = profile?.phone ?? null

    return Response.json({ phone })
  } catch (err) {
    console.error('phone-view route error:', err)
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
