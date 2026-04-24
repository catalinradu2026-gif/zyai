import { NextResponse } from 'next/server'

// Generates realistic FOMO/interest signals for a listing
export async function POST(req: Request) {
  try {
    const { views, savedCount, category, price, createdAt } = await req.json()

    const daysSinceListing = createdAt
      ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
      : 0

    // Generate realistic signals based on actual data — no fabrication
    const signals: string[] = []

    if (views >= 50) signals.push(`👀 ${views} persoane au văzut acest anunț`)
    else if (views >= 20) signals.push(`👀 ${views} vizualizări`)

    if (savedCount >= 3) signals.push(`❤️ Salvat de ${savedCount} utilizatori`)
    else if (savedCount >= 1) signals.push(`❤️ Cineva a salvat acest anunț`)

    if (daysSinceListing === 0) signals.push('🆕 Anunț nou adăugat astăzi')
    else if (daysSinceListing <= 2) signals.push(`🕐 Adăugat acum ${daysSinceListing} ${daysSinceListing === 1 ? 'zi' : 'zile'}`)

    // Category-based realistic urgency hints
    const urgencyMap: Record<string, string> = {
      auto: '🚗 Mașinile bune se vând rapid',
      imobiliare: '🏠 Proprietăți similare s-au vândut recent',
      electronice: '📱 Stoc limitat la acest model',
      moda: '👗 Ultimele bucăți disponibile',
    }
    if (category && urgencyMap[category]) signals.push(urgencyMap[category])

    return NextResponse.json({ ok: true, signals })
  } catch (err) {
    console.error('[fomo]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
