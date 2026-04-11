import { NextResponse } from 'next/server'

export const maxDuration = 20

function formatDetails(category: string, details: Record<string, any> | undefined): string {
  if (!details) return ''
  const lines: string[] = []

  if (category === 'auto' && details.auto) {
    const a = details.auto
    if (a.model) lines.push(`Model: ${a.model}`)
    if (a.year) lines.push(`An fabricație: ${a.year}`)
    if (a.mileage) lines.push(`Kilometraj: ${a.mileage.toLocaleString()} km`)
    if (a.fuel) lines.push(`Combustibil: ${a.fuel}`)
    if (a.transmission) lines.push(`Transmisie: ${a.transmission}`)
    if (a.bodyType) lines.push(`Caroserie: ${a.bodyType}`)
    if (a.damage) lines.push(`Stare vehicul: ${a.damage}`)
  } else if (category === 'imobiliare' && details.imobiliare) {
    const i = details.imobiliare
    if (i.propertyType) lines.push(`Tip: ${i.propertyType}`)
    if (i.rooms) lines.push(`Camere: ${i.rooms}`)
    if (i.area) lines.push(`Suprafață: ${i.area} m²`)
    if (i.floor !== null && i.floor !== undefined) lines.push(`Etaj: ${i.floor}`)
    if (i.furnishing) lines.push(`Mobilare: ${i.furnishing}`)
    if (i.transactionType) lines.push(`Tranzacție: ${i.transactionType}`)
  } else if (category === 'electronice' && details.electronice) {
    const e = details.electronice
    if (e.model) lines.push(`Model: ${e.model}`)
    if (e.storage) lines.push(`Stocare: ${e.storage}`)
    if (e.accessories) lines.push(`Accesorii: ${e.accessories}`)
  }

  if (details.general) {
    const g = details.general
    if (g.size) lines.push(`Mărime: ${g.size}`)
    if (g.material) lines.push(`Material: ${g.material}`)
    if (g.quantity) lines.push(`Cantitate: ${g.quantity} buc`)
  }

  return lines.length > 0 ? '\n' + lines.join('\n') : ''
}

export async function POST(req: Request) {
  try {
    const { title, description, category, subcategory, condition, brand, city, details } = await req.json()
    if (!title || !category) return NextResponse.json({ error: 'title and category required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const detailsText = formatDetails(category, details)

    const prompt = `Ești un expert în prețuri pentru piața românească de second-hand și marketplace (similar OLX Romania).
Estimează prețul corect pentru acest produs bazat pe piața din România în 2025.

Produs: ${title}
Categorie: ${category}${subcategory ? ` / ${subcategory}` : ''}
Descriere: ${description || 'N/A'}
Stare: ${condition || 'N/A'}
Marcă: ${brand || 'N/A'}
Oraș: ${city || 'România'}${detailsText}

Returnează DOAR un JSON valid, fără text suplimentar:
{
  "currency": "EUR sau RON (EUR pentru electronice/auto/imobiliare, RON pentru haine/diverse)",
  "min": număr_minim,
  "max": număr_maxim,
  "suggested": număr_recomandat,
  "reasoning": "explicație scurtă în română (max 80 caractere) de ce acest preț",
  "tips": ["sfat scurt vânzare 1", "sfat scurt vânzare 2"]
}

Reguli:
- Prețuri realiste pentru piața românească (nu prețuri de retail nou)
- Dacă e second-hand, scade 30-60% față de prețul nou
- Dacă e Nou/Ca nou, scade 10-25%
- Bazează-te pe prețuri reale OLX/marketplace România`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'groq_error' }, { status: 500 })

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content || ''

    let parsed: any = null
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'parse_error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: parsed })
  } catch (err) {
    console.error('[suggest-price] unexpected:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
