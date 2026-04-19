import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export const runtime = 'nodejs'

/**
 * POST /api/ai/smart-filter
 * Parsează un query vocal sau text în filtre structurate pentru marketplace.
 * Input:  { query: string, corrections?: Record<string,string> }
 * Output: { category, redirectUrl, filters, summary, confidence, corrected }
 */
export async function POST(req: Request) {
  try {
    const { query, corrections = {} } = await req.json()
    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query required' }, { status: 400 })
    }

    // Aplică corecții autodidacte din localStorage (trimise de client)
    let processedQuery = query
    for (const [wrong, right] of Object.entries(corrections)) {
      const re = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      processedQuery = processedQuery.replace(re, right as string)
    }

    const systemPrompt = `Ești un agent AI specializat pentru zyAI, un marketplace românesc. Sarcina ta: parsează query-ul utilizatorului (care poate veni din recunoaștere vocală cu greșeli fonetice) în filtre structurate.

CORECȚII FONETICE OBLIGATORII — aplică-le mereu:
AUTO (mărci):
- "bemveu"/"be em ve"/"bm vu"/"bemve"/"bmw" → "BMW"
- "aude"/"audde"/"ode"/"odi"/"audi" → "Audi"
- "mertcedes"/"mersedes"/"mersedez"/"mercedes benz"/"merced" → "Mercedes"
- "datie"/"dacie"/"datia" → "Dacia"
- "folfsvagen"/"folgsvagen"/"vw"/"volkssvagen" → "Volkswagen"
- "opal"/"opel"/"opeil" → "Opel"
- "renol"/"renault"/"reno"/"reno" → "Renault"
- "ford" → "Ford"
- "skoda"/"scoda"/"skolla" → "Skoda"
- "seat"/"siat" → "Seat"
- "pejo"/"pegeot"/"peugeot"/"peugeo" → "Peugeot"
- "citroen"/"citroien"/"citrogen" → "Citroen"
- "fiat"/"fiet" → "Fiat"
- "volvo"/"volvu" → "Volvo"
- "toyota"/"toiota"/"toyotta" → "Toyota"
- "honda"/"hunda" → "Honda"
- "nissan"/"nisan"/"nisson" → "Nissan"
- "hyundai"/"hiundai"/"hiundei"/"hundai" → "Hyundai"
- "kia"/"chia" → "Kia"
- "mitsubishi"/"mitsubisi"/"mitsubishe" → "Mitsubishi"
- "jeep"/"gip" → "Jeep"
- "range rover"/"ranger rover"/"rengerover" → "Land Rover"
- "porsche"/"porse"/"porsa" → "Porsche"
- "ferrari"/"ferari" → "Ferrari"
- "lamborghini"/"lamboghini" → "Lamborghini"
ELECTRONICE:
- "labtop"/"latop"/"laptob"/"latob" → "laptop"
- "iphone"/"aifon"/"aiphone"/"i fon" → "iPhone"
- "samsug"/"samsung"/"samsumg" → "Samsung"
- "playstation"/"pleistation"/"ps5"/"ps4" → "PlayStation"
- "xbox"/"ecsboc" → "Xbox"
IMOBILIARE:
- "apartiman"/"apartiman"/"aparta" → "apartament"
- "garsoniera"/"garsonera"/"garso" → "garsonieră"
- "vila"/"vilă"/"vile" → "vilă"

CATEGORII disponibile (slug-uri exacte):
- "auto" → mașini, autoturisme, autoutilitare, camioane, moto, ATV
- "imobiliare" → apartamente, case, terenuri, garsoniere, birouri
- "electronice" → telefoane, laptopuri, tablete, TV, gaming
- "joburi" → locuri de muncă, angajări, recrutare
- "servicii" → reparații, curățenie, transport, IT
- "moda" → haine, încălțăminte, genți, bijuterii
- "casa-gradina" → mobilă, electrocasnice, decorațiuni, unelte
- "sport" → biciclete, fitness, fotbal, camping
- "animale" → câini, pisici, accesorii animale
- "mama-copilul" → cărucioare, jucării, haine copii

SUBCATEGORII relevante (câmpul "sub"):
AUTO: autoturisme, autoutilitare, camioane, microbuze, motociclete, piese, agricole
IMOBILIARE: apartamente, case, terenuri, spatii-comerciale, birouri, garaje, cazare
ELECTRONICE: telefoane, laptopuri, tablete, desktop, tv-audio, gaming, foto-video
JOBURI: it, marketing, vanzari, constructii, transport, horeca, medical, muncitori
MODĂ: haine-femei, haine-barbati, haine-copii, incaltaminte-femei, incaltaminte-barbati, bijuterii

ORAȘE românești (normalizare):
- "bucuresti"/"bucurresti"/"bucur" → "București"
- "craiova"/"craioba"/"craiofa" → "Craiova"
- "cluj"/"cluj napoca"/"clui" → "Cluj-Napoca"
- "timisoara"/"timisoar"/"timis" → "Timișoara"
- "iasi"/"iași"/"ias" → "Iași"
- "constanta"/"constanța"/"constanta" → "Constanța"
- "brasov"/"brașov"/"brasob" → "Brașov"
- "ploiesti"/"ploiești"/"ploiest" → "Ploiești"
- "oradea"/"oradeia" → "Oradea"
- "galati"/"galați"/"galat" → "Galați"
- "braila"/"brăila"/"braill" → "Brăila"
- "pitesti"/"pitești"/"pites" → "Pitești"
- "sibiu"/"sibiu" → "Sibiu"
- "bacau"/"bacău"/"baca" → "Bacău"
- "arad"/"arat" → "Arad"
- "targu mures"/"targu mureș"/"tg mures"/"tg.mures" → "Târgu Mureș"

RETURNEAZĂ DOAR JSON valid (fără explicații):
{
  "category": "slug-categorie sau null dacă nu știi",
  "sub": "subcategorie slug sau null",
  "city": "oraș corect sau null",
  "brand": "marcă corectată sau null",
  "model": "model sau null",
  "yearFrom": "an minim sau null",
  "yearTo": "an maxim sau null",
  "minPrice": număr sau null,
  "maxPrice": număr sau null,
  "fuel": "Benzina/Diesel/Electric/Hibrid sau null",
  "gearbox": "Manuala/Automata sau null",
  "nrCamere": "1/2/3/4/5+ sau null",
  "tipTranzactie": "vanzare/inchiriere sau null",
  "telefonBrand": "brand telefon sau null",
  "laptopBrand": "brand laptop sau null",
  "q": "cuvinte cheie rămase sau null",
  "corrected": "query corectat lizibil pentru user",
  "confidence": număr 0-100,
  "summary": "ce am înțeles în română, max 15 cuvinte"
}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: processedQuery },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 300,
    })

    const raw = (completion.choices[0].message.content || '{}')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed: any = {}
    try { parsed = JSON.parse(raw) } catch { parsed = {} }

    // Construiește redirect URL
    const category = parsed.category
    let redirectUrl = '/cauta'
    const params = new URLSearchParams()

    if (category) {
      redirectUrl = `/${category}`
      if (parsed.sub) params.set('sub', parsed.sub)
      if (parsed.city) params.set('city', parsed.city)
      if (parsed.brand) params.set('brand', parsed.brand)
      if (parsed.model) params.set('model', parsed.model)
      if (parsed.yearFrom) params.set('yearFrom', parsed.yearFrom)
      if (parsed.yearTo) params.set('yearTo', parsed.yearTo)
      if (parsed.minPrice) params.set('minPrice', String(parsed.minPrice))
      if (parsed.maxPrice) params.set('maxPrice', String(parsed.maxPrice))
      if (parsed.fuel) params.set('fuel', parsed.fuel)
      if (parsed.gearbox) params.set('gearbox', parsed.gearbox)
      if (parsed.nrCamere) params.set('nrCamere', parsed.nrCamere)
      if (parsed.tipTranzactie) params.set('tipTranzactie', parsed.tipTranzactie)
      if (parsed.telefonBrand) params.set('telefonBrand', parsed.telefonBrand)
      if (parsed.laptopBrand) params.set('laptopBrand', parsed.laptopBrand)
      if (parsed.q) params.set('q', parsed.q)
    } else {
      // Fallback search text
      params.set('q', parsed.corrected || processedQuery)
    }

    const qs = params.toString()
    if (qs) redirectUrl += `?${qs}`

    return Response.json({
      category,
      redirectUrl,
      filters: parsed,
      summary: parsed.summary || '',
      confidence: parsed.confidence ?? 50,
      corrected: parsed.corrected || processedQuery,
    })
  } catch (e: any) {
    console.error('smart-filter error:', e)
    return Response.json({ error: 'Failed', redirectUrl: '/cauta' }, { status: 500 })
  }
}
