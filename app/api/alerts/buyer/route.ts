import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/alerts/buyer — save a buyer alert
export async function POST(req: Request) {
  try {
    const { phone, query, category, city, minPrice, maxPrice } = await req.json()

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Număr de telefon invalid' }, { status: 400 })
    }

    const admin = createSupabaseAdmin()

    const { data, error } = await admin
      .from('buyer_alerts')
      .insert({
        phone: phone.replace(/\D/g, ''),
        query: query || null,
        category: category || null,
        city: city || null,
        min_price: minPrice || null,
        max_price: maxPrice || null,
        is_active: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[buyer-alert save]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('[buyer-alert]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// DELETE /api/alerts/buyer?id=xxx — unsubscribe
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const admin = createSupabaseAdmin()
    await admin.from('buyer_alerts').update({ is_active: false }).eq('id', id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
