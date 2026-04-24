import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CATEGORY_NAMES: Record<string, string> = {
  auto: 'Auto',
  imobiliare: 'Imobiliare',
  electronice: 'Electronice',
  moda: 'Modă',
  sport: 'Sport',
  'casa-gradina': 'Casă & Grădină',
  animale: 'Animale',
  'mama-copilul': 'Mamă & Copil',
  joburi: 'Joburi',
  servicii: 'Servicii',
}

// Called internally after a new listing is created
// POST /api/alerts/notify  { listingId, title, price, currency, city, category }
export async function POST(req: Request) {
  try {
    const { listingId, title, price, currency, city, category } = await req.json()

    const admin = createSupabaseAdmin()

    // Fetch all active alerts
    const { data: alerts } = await admin
      .from('buyer_alerts')
      .select('*')
      .eq('is_active', true)

    if (!alerts || alerts.length === 0) return NextResponse.json({ ok: true, sent: 0 })

    const matching = alerts.filter((alert: any) => {
      // Category match
      if (alert.category && alert.category !== category) return false
      // City match (partial, case-insensitive)
      if (alert.city && city && !city.toLowerCase().includes(alert.city.toLowerCase()) &&
          !alert.city.toLowerCase().includes(city.toLowerCase())) return false
      // Price range
      if (alert.min_price && price && price < alert.min_price) return false
      if (alert.max_price && price && price > alert.max_price) return false
      // Query match — title or category
      if (alert.query) {
        const q = alert.query.toLowerCase()
        const titleMatch = title.toLowerCase().includes(q)
        const catMatch = category?.toLowerCase().includes(q)
        if (!titleMatch && !catMatch) return false
      }
      return true
    })

    if (matching.length === 0) return NextResponse.json({ ok: true, sent: 0 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zyai.ro'
    const listingUrl = `${siteUrl}/anunt/${listingId}`
    const priceStr = price ? `${price} ${currency || 'EUR'}` : 'Preț necomunicat'
    const categoryLabel = CATEGORY_NAMES[category] || category || ''

    let sent = 0
    for (const alert of matching) {
      const message = `🔔 *Alertă zyAI — Anunț nou!*\n\n` +
        `Ai setat o alertă pentru: *${alert.query || categoryLabel || 'toate categoriile'}*\n\n` +
        `📌 *${title}*\n` +
        `💰 ${priceStr}\n` +
        `📍 ${city || 'România'}\n\n` +
        `👉 Vezi anunțul: ${listingUrl}\n\n` +
        `_Dezactivează alerta: ${siteUrl}/alerte?unsubscribe=${alert.id}_`

      try {
        const res = await fetch('http://localhost:3001/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: alert.phone,
            message,
          }),
        })
        if (res.ok) sent++
      } catch {
        // Bridge offline — skip silently
      }
    }

    return NextResponse.json({ ok: true, sent, total: matching.length })
  } catch (err) {
    console.error('[alerts/notify]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
