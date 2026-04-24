import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const NOTIFY_AT_VIEWS = 3

export async function POST(req: Request) {
  try {
    const { listingId, userId, sellerId, listingTitle } = await req.json()
    if (!listingId || !userId || !sellerId || userId === sellerId) {
      return NextResponse.json({ ok: true })
    }

    const admin = createSupabaseAdmin()

    // Upsert view count
    const { data: existing } = await admin
      .from('listing_user_views')
      .select('view_count, notified_at')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .single()

    const newCount = (existing?.view_count ?? 0) + 1

    await admin.from('listing_user_views').upsert({
      listing_id: listingId,
      user_id: userId,
      view_count: newCount,
      last_viewed_at: new Date().toISOString(),
      notified_at: existing?.notified_at ?? null,
    }, { onConflict: 'listing_id,user_id' })

    // Trimite mesaj la NOTIFY_AT_VIEWS vizite și doar o singură dată
    if (newCount === NOTIFY_AT_VIEWS && !existing?.notified_at) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: userId,
        receiver_id: sellerId,
        content: `👀 Am vizitat anunțul tău „${listingTitle}" de ${NOTIFY_AT_VIEWS} ori — sunt interesat! Poți să mă contactezi?`,
        read: false,
      })

      await admin.from('listing_user_views')
        .update({ notified_at: new Date().toISOString() })
        .eq('listing_id', listingId)
        .eq('user_id', userId)
    }

    return NextResponse.json({ ok: true, views: newCount })
  } catch (err) {
    console.error('[track-view]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
