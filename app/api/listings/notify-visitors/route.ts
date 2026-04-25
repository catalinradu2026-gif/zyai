import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'


export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user?.id) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId lipsă' }, { status: 400 })

    const admin = createSupabaseAdmin()

    const { data: listing } = await admin
      .from('listings')
      .select('id, title, price, currency, user_id')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    const { data: visitors } = await admin
      .from('listing_user_views')
      .select('user_id, view_count')
      .eq('listing_id', listingId)
      .gte('view_count', 2)

    if (!visitors || visitors.length === 0) {
      return NextResponse.json({ ok: true, count: 0 })
    }

    const siteUrl = 'https://zyai.ro'
    const listingUrl = `${siteUrl}/anunt/${listingId}`
    const priceText = listing.price
      ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
      : 'preț negociabil'

    // AI generează mesajul — vânzătorul nu scrie nimic
    let content = `👀 Anunțul „${listing.title}" pe care l-ai vizitat pe zyai.ro este încă disponibil (${priceText}). Și alți utilizatori îl urmăresc acum — nu rata oportunitatea! ${listingUrl} — Echipa zyai.ro`

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          messages: [
            {
              role: 'system',
              content: 'Ești echipa zyai.ro. Scrii mesaje scurte, prietenoase, în română, către utilizatori care au vizitat un anunț. Nu ești un vânzător — ești platforma. Nu folosi "vânzătorul vrea" sau similar.',
            },
            {
              role: 'user',
              content: `Scrie un mesaj scurt (2-3 propoziții) pentru un utilizator care a vizitat de mai multe ori anunțul „${listing.title}" (${priceText}) pe zyai.ro. Folosește indicații subtile și naturale: anunțul e încă disponibil, alți utilizatori îl urmăresc în prezent, disponibilitatea nu e garantată pe termen lung. Tonul e prietenos, fără presiune. Mesajul vine de la echipa platformei, nu de la vânzător. Include linkul: ${listingUrl}. Termină cu "— Echipa zyai.ro".`,
            },
          ],
        }),
      })

      if (groqRes.ok) {
        const groqData = await groqRes.json()
        const generated = groqData.choices?.[0]?.message?.content?.trim()
        if (generated) content = generated
      }
    } catch {}

    let sent = 0
    for (const visitor of visitors) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: visitor.user_id,
        content,
        is_system: true,
        read: false,
      })
      sent++
    }

    await admin
      .from('listing_user_views')
      .update({ seller_notified_at: new Date().toISOString() })
      .eq('listing_id', listingId)

    return NextResponse.json({ ok: true, count: sent })
  } catch (err) {
    console.error('[notify-visitors]', err)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
