import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

// POST /api/listings/activate-bidding
// Body: { listingId, durationHours }
export async function POST(req: Request) {
  try {
    const { listingId, durationHours = 2 } = await req.json()
    if (!listingId) return Response.json({ error: 'listingId required' }, { status: 400 })

    const hours = Math.min(Math.max(Number(durationHours), 1), 6)

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createSupabaseAdmin()
    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, status, price, metadata')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) {
      return Response.json({ error: 'Not allowed' }, { status: 403 })
    }
    if (listing.status !== 'activ') {
      return Response.json({ error: 'Listing not active' }, { status: 400 })
    }

    const biddingEndTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    const currentMeta = (listing.metadata as any) || {}

    const { error } = await admin
      .from('listings')
      .update({
        status: 'bidding',
        metadata: {
          ...currentMeta,
          bidding_activated_at: new Date().toISOString(),
          bidding_end_time: biddingEndTime,
          current_highest_bid: listing.price || 0,
        },
      })
      .eq('id', listingId)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ ok: true, status: 'bidding', bidding_end_time: biddingEndTime })
  } catch (err) {
    console.error('[activate-bidding]', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
