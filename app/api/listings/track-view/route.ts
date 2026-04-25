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

    // La a 3-a vizită, trimite mesaj automat cumpărătorului
    if (newCount === 3 && !existing?.notified_at) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: sellerId,
        receiver_id: userId,
        content: `👀 Ai vizitat de câteva ori anunțul „${listingTitle}" pe zyai.ro. Anunțul este încă disponibil, însă și alți utilizatori îl urmăresc în prezent. Disponibilitatea nu poate fi garantată — dacă ești interesat, e momentul potrivit să iei legătura. — Echipa zyai.ro`,
        is_system: true,
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
