import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { views, savedCount, category, price, createdAt } = await req.json()

    const daysSinceListing = createdAt
      ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
      : 0

    const signals: string[] = []

    // Utilizatori activi acum — estimat realist din views
    if (views >= 100) signals.push(`👥 ${Math.floor(views * 0.04) + 2} persoane văd acum acest anunț`)
    else if (views >= 40) signals.push(`👥 ${Math.floor(views * 0.05) + 1} persoane văd acum acest anunț`)
    else if (views >= 15) signals.push('👥 Cineva vede acum acest anunț')

    // Vizualizări totale
    if (views >= 50) signals.push(`👀 ${views} persoane au văzut acest anunț`)
    else if (views >= 10) signals.push(`👀 ${views} vizualizări`)
    else if (views >= 1) signals.push(`👀 ${views} ${views === 1 ? 'vizualizare' : 'vizualizări'}`)

    // Salvat
    if (savedCount >= 3) signals.push(`❤️ Salvat de ${savedCount} utilizatori`)
    else if (savedCount >= 1) signals.push('❤️ Cineva a salvat acest anunț')

    // Vârstă anunț
    if (daysSinceListing === 0) signals.push('🆕 Adăugat astăzi')
    else if (daysSinceListing <= 2) signals.push(`🕐 Adăugat acum ${daysSinceListing} ${daysSinceListing === 1 ? 'zi' : 'zile'}`)

    // Urgență per categorie
    const urgencyMap: Record<string, string> = {
      auto: '🚗 Mașinile bune se vând rapid',
      imobiliare: '🏠 Proprietăți similare s-au vândut recent',
      electronice: '📱 Prețul poate crește oricând',
      moda: '👗 Ultimele bucăți disponibile',
      sport: '⚽ Articolele sport se vând sezonier',
      'casa-gradina': '🏡 Produsele verificate se vând repede',
      animale: '🐾 Animalele găsesc familie rapid',
      'mama-copilul': '👶 Produse la cerere mare',
    }
    if (category && urgencyMap[category]) signals.push(urgencyMap[category])

    if (!signals.length) signals.push('🔔 Fii primul care contactează vânzătorul')

    return NextResponse.json({ ok: true, signals })
  } catch (err) {
    console.error('[fomo]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
