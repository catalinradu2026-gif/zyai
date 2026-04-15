import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

// GET /api/listings/[id]/bid — fetch bids for a listing
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createSupabaseAdmin()

  const { data: bids, error } = await admin
    .from('bids')
    .select('id, amount, user_name, created_at')
    .eq('listing_id', id)
    .order('amount', { ascending: false })
    .limit(20)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ bids: bids ?? [] })
}

// POST /api/listings/[id]/bid — place a bid
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { amount } = await req.json()

    if (!amount || isNaN(Number(amount))) {
      return Response.json({ error: 'Sumă invalidă' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Trebuie să fii autentificat' }, { status: 401 })

    const admin = createSupabaseAdmin()

    // Re-citim listing cu date complete
    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, status, price, currency, title, metadata')
      .eq('id', id)
      .single()

    if (!listing) return Response.json({ error: 'Anunț negăsit' }, { status: 404 })
    if (listing.user_id === user.id) return Response.json({ error: 'Nu poți licita pe propriul anunț' }, { status: 400 })
    if (listing.status !== 'bidding') return Response.json({ error: 'Licitația nu este activă' }, { status: 400 })

    const meta = (listing.metadata as any) || {}
    const endTime = new Date(meta.bidding_end_time)
    if (Date.now() >= endTime.getTime()) {
      await finalizeBidding(admin, id)
      return Response.json({ error: 'Licitația s-a încheiat' }, { status: 400 })
    }

    const minBid = (meta.current_highest_bid || listing.price || 0) + 1
    if (Number(amount) < minBid) {
      return Response.json({ error: `Oferta minimă este ${minBid}` }, { status: 400 })
    }

    // Profil cumpărător
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()
    const userName = (profile as any)?.full_name || 'Utilizator'
    const buyerPhone = (profile as any)?.phone || null

    // Insert bid
    const { error: bidErr } = await admin
      .from('bids')
      .insert({ listing_id: id, user_id: user.id, user_name: userName, amount: Number(amount) })

    if (bidErr) return Response.json({ error: bidErr.message }, { status: 500 })

    // Update highest bid în metadata
    const { error: updateErr } = await admin
      .from('listings')
      .update({ metadata: { ...meta, current_highest_bid: Number(amount), bidding_winner_id: user.id } })
      .eq('id', id)

    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

    // Notificare vânzător prin mesaj intern
    const currency = (listing as any).currency || 'RON'
    const title = (listing as any).title || 'anunțul tău'
    const amountFormatted = Number(amount).toLocaleString('ro-RO')
    const phoneText = buyerPhone ? ` Numărul lui: ${buyerPhone}.` : ''

    const sellerMessage = `🔥 Ofertă nouă la licitație!\n\n${userName} a oferit ${amountFormatted} ${currency} pentru "${title}".\n\nSună-l pentru o vizionare și decide dacă accepți prețul final.${phoneText}\n\n⚠️ Nu vinde fără vizionare — prețul final se stabilește față în față.`

    await admin
      .from('messages')
      .insert({
        listing_id: id,
        sender_id: user.id,
        receiver_id: listing.user_id,
        content: sellerMessage,
        read: false,
      })

    return Response.json({ ok: true, amount: Number(amount) })
  } catch (err) {
    console.error('[bid]', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

async function finalizeBidding(admin: any, listingId: string) {
  const { data: listing } = await admin
    .from('listings')
    .select('status, metadata')
    .eq('id', listingId)
    .single()

  if (!listing || listing.status !== 'bidding') return

  const currentMeta = listing.metadata || {}
  await admin
    .from('listings')
    .update({
      status: 'vandut',
      metadata: {
        ...currentMeta,
        sold_at: new Date().toISOString(),
        sold_via: 'bidding',
        winning_bid: currentMeta.current_highest_bid,
        winner_id: currentMeta.bidding_winner_id,
      },
    })
    .eq('id', listingId)
}
