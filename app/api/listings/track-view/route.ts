import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { listingId, userId, sellerId, listingTitle } = await req.json()
    if (!listingId || !userId || !sellerId || userId === sellerId) {
      return NextResponse.json({ ok: true })
    }

    const admin = createSupabaseAdmin()

    const { data: existing } = await admin
      .from('listing_user_views')
      .select('view_count, notified_at')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .maybeSingle()

    const newCount = (existing?.view_count ?? 0) + 1

    await admin.from('listing_user_views').upsert(
      { listing_id: listingId, user_id: userId, view_count: newCount, last_viewed_at: new Date().toISOString() },
      { onConflict: 'listing_id,user_id', ignoreDuplicates: false }
    )

    const ZYAI_SYSTEM_ID = '00000000-0000-0000-0000-000000000001'

    // La a 3-a vizită, trimite mesaj automat cumpărătorului
    if (newCount === 3 && !existing?.notified_at) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: ZYAI_SYSTEM_ID,
        receiver_id: userId,
        content: `👋 Salut! Ai vizitat de câteva ori anunțul „${listingTitle}" pe zyai.ro — anunțul este încă disponibil! Dacă ești interesat, contactează vânzătorul acum. — Echipa zyai.ro`,
        read: false,
      })
      await admin.from('listing_user_views')
        .update({ notified_at: new Date().toISOString() })
        .eq('listing_id', listingId)
        .eq('user_id', userId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track-view]', err)
    return NextResponse.json({ ok: true })
  }
}
