import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user?.id) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

    const { listingId, note } = await req.json()
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

    // Toți vizitatorii cu 2+ vizite (permite re-trimitere)
    const { data: visitors } = await admin
      .from('listing_user_views')
      .select('user_id, view_count')
      .eq('listing_id', listingId)
      .gte('view_count', 2)

    if (!visitors || visitors.length === 0) {
      return NextResponse.json({ ok: true, count: 0 })
    }

    // Generează mesaj AI
    const noteText = note ? `\n\nMesaj de la vânzător: "${note}"` : ''
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
            content: 'Ești un asistent al platformei zyai.ro. Generezi mesaje scurte, prietenoase în română.',
          },
          {
            role: 'user',
            content: `Generează un mesaj scurt (2-3 propoziții) de la zyai.ro către un utilizator care a vizitat anunțul "${listing.title}" (${listing.price ? listing.price.toLocaleString('ro-RO') + ' ' + listing.currency : 'preț negociabil'}). Anunțul este încă disponibil și vânzătorul vrea să ia legătura.${noteText ? ' ' + noteText : ''} Nu folosi salutare formale. Termină cu "— Echipa zyai.ro".`,
          },
        ],
      }),
    })

    let messageContent = `Anunțul „${listing.title}" pe care l-ai vizitat pe zyai.ro este încă disponibil!${note ? ` ${note}` : ''} Vânzătorul este pregătit să discute — scrie-i acum. — Echipa zyai.ro`

    if (groqRes.ok) {
      const groqData = await groqRes.json()
      const generated = groqData.choices?.[0]?.message?.content?.trim()
      if (generated) messageContent = generated
    }

    const ZYAI_SYSTEM_ID = '00000000-0000-0000-0000-000000000001'

    // Trimite mesaj fiecărui vizitator — de la Echipa zyai.ro
    let sent = 0
    for (const visitor of visitors) {
      await admin.from('messages').insert({
        listing_id: listingId,
        sender_id: ZYAI_SYSTEM_ID,
        receiver_id: visitor.user_id,
        content: messageContent,
        read: false,
      })
      sent++
    }

    // Update seller_notified_at
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
