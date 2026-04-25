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

    // Verify caller is the listing owner
    const { data: listing } = await admin
      .from('listings')
      .select('id, title, price, currency, user_id')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    // Get visitors who viewed at least 2 times and haven't been seller-notified
    const { data: visitors } = await admin
      .from('listing_user_views')
      .select('user_id, view_count, seller_notified_at')
      .eq('listing_id', listingId)
      .gte('view_count', 2)
      .is('seller_notified_at', null)

    if (!visitors || visitors.length === 0) {
      return NextResponse.json({ ok: true, count: 0, message: 'Niciun vizitator eligibil' })
    }

    // Generate AI message once for all visitors
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'Ești un asistent al platformei zyai.ro. Generezi mesaje scurte, prietenoase și eficiente în română.',
          },
          {
            role: 'user',
            content: `Generează un mesaj scurt (2-3 propoziții) de la zyai.ro către un utilizator care a vizitat de mai multe ori anunțul "${listing.title}" (${listing.price ? listing.price.toLocaleString('ro-RO') + ' ' + listing.currency : 'preț negociabil'}). Mesajul îl invită să ia legătura cu vânzătorul înainte ca anunțul să dispară. Nu folosi salutare cu "Bună ziua". Începe direct cu conținutul. Termină cu "— Echipa zyai.ro".`,
          },
        ],
      }),
    })

    let messageContent = `Ai vizitat recent anunțul „${listing.title}" pe zyai.ro. Vânzătorul este disponibil și te invită să iei legătura cât mai curând — anunțul s-ar putea vinde în curând! — Echipa zyai.ro`

    if (groqRes.ok) {
      const groqData = await groqRes.json()
      const generated = groqData.choices?.[0]?.message?.content?.trim()
      if (generated) messageContent = generated
    }

    // Send platform message to each visitor
    let sent = 0
    for (const visitor of visitors) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: visitor.user_id,
        content: messageContent,
        read: false,
      })

      await admin
        .from('listing_user_views')
        .update({ seller_notified_at: new Date().toISOString() })
        .eq('listing_id', listingId)
        .eq('user_id', visitor.user_id)

      sent++
    }

    return NextResponse.json({ ok: true, count: sent })
  } catch (err) {
    console.error('[notify-visitors]', err)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
