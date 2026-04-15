import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return Response.json({ error: 'listingId required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createSupabaseAdmin()

    // Verifică că anunțul aparține userului
    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, status, metadata')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) {
      return Response.json({ error: 'Not allowed' }, { status: 403 })
    }

    if (listing.status === 'vandut') {
      return Response.json({ ok: true, status: 'vandut' })
    }

    // Salvează sold_at în metadata pentru filtrul de 24h
    const meta = (listing as any).metadata || {}
    const isBidding = listing.status === 'bidding'

    const metadataUpdate = isBidding ? {
      ...meta,
      sold_at: new Date().toISOString(),
      sold_via: 'bidding_manual',
      winning_bid: meta.current_highest_bid,
      winner_id: meta.bidding_winner_id,
      winner_name: meta.bidding_winner_name,
      winner_phone: meta.bidding_winner_phone,
      winner_email: meta.bidding_winner_email,
    } : {
      ...meta,
      sold_at: new Date().toISOString(),
      sold_via: 'direct',
    }

    const { error } = await admin
      .from('listings')
      .update({
        status: 'vandut',
        metadata: metadataUpdate,
      })
      .eq('id', listingId)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ ok: true, status: 'vandut' })
  } catch (err) {
    console.error('[mark-sold]', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
