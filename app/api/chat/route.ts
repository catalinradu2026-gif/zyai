import Groq from 'groq-sdk'
import { getCategoryIdBySlug } from '@/lib/constants/categories'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export type ChatListing = {
  id: string
  title: string
  price: number | null
  price_type: string
  currency: string
  city: string
  images: string[]
  created_at: string
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatResponse = {
  type: 'search' | 'chat'
  message: string
  listings?: ChatListing[]
}

// Helper: getCategoryIdBySlug sigur (nu returnează 1 pentru null)
const getCatId = (cat: string | null): number | null => {
  if (!cat) return null
  const id = getCategoryIdBySlug(cat)
  return id > 0 ? id : null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history = [] }: { message: string; history: HistoryMessage[] } = body

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }
    if (message.length > 500) {
      return Response.json({ error: 'Mesaj prea lung (max 500 caractere)' }, { status: 400 })
    }

    const validHistory = (history as HistoryMessage[]).filter(
      (m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length < 1000
    )

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ type: 'chat', message: 'Asistentul AI este în configurare. Încearcă din nou!' } satisfies ChatResponse)
    }

    const systemPrompt = `Ești "zyAI", expertul #1 în marketplace din România. Ești consultant specializat pe TOATE categoriile — auto, imobiliare, joburi, electronice, modă, servicii, casă-grădină, sport, animale, mama-copilul. Cunoști piața românească perfect. Vorbești DOAR în română, natural, ca un prieten expert.

## Expertiza ta:
- **Auto**: Toate mărcile, fiabilitate, prețuri reale, consum, întreținere, piese. Cunoști diferența dintre generații (Golf 6 vs 7, F10 vs G30 etc.)
- **Imobiliare**: Prețuri pe zone, cartiere, ce să verifici, preț/mp orientativ
- **Joburi**: Salarii reale, firme, beneficii, red flags în anunțuri
- **Electronice**: Raport calitate-preț, ce merită SH, ce să verifici
- **Servicii, Modă, Sport, Animale, Casă**: Expert pe fiecare domeniu

## Categorii DB (slug → category_id):
auto=3, imobiliare=2, joburi=1, servicii=4, electronice=5, moda=6, casa-gradina=7, sport=8, animale=9, mama-copilul=10

## Subcategorii EXACTE din DB (metadata.subcategory):
- auto: "autoturisme" | "autoutilitare" | "camioane" | "motociclete" | "piese" | "rulote" | "remorci" | "barci"
- imobiliare: "apartamente" | "case" | "terenuri" | "spatii-comerciale" | "birouri" | "garaje" | "cazare"
- electronice: "telefoane" | "laptopuri" | "tablete" | "desktop" | "tv-audio" | "gaming" | "foto-video" | "componente-pc"
- joburi: "it" | "marketing" | "vanzari" | "contabilitate" | "transport" | "horeca" | "medical" | "educatie" | "constructii" | "muncitori"
- servicii: "reparatii" | "curatenie" | "transport-serviciu" | "it-serviciu" | "auto-service" | "frumusete" | "meditatii"
- sport: "fitness" | "biciclete" | "outdoor" | "running" | "tenis"
- animale: "caini" | "pisici" | "pesti" | "pasari" | "rozatoare"
- moda: "haine-femei" | "haine-barbati" | "incaltaminte-femei" | "incaltaminte-barbati" | "genti-accesorii" | "bijuterii"
- casa-gradina: "mobila" | "electrocasnice" | "decoratiuni" | "gradina" | "unelte" | "bucatarie"
- mama-copilul: "carucioare" | "mobilier-copii" | "haine-bebe" | "jucarii" | "ingrijire"

## Normalizare input:
- Mărci auto (corectează voce): "bemveu/be em ve/bm vu"→BMW, "aude/ode"→Audi, "mersedes/mertcedes"→Mercedes, "datie"→Dacia, "vw/folfsvagen/folsvagen"→Volkswagen, "opel"→Opel, "ford"→Ford, "toyota"→Toyota, "skoda"→Skoda, "seat"→Seat, "renault/reno"→Renault, "peugeot/peugeo"→Peugeot, "kia"→Kia, "hyundai/hundai"→Hyundai, "porsche/porse"→Porsche, "volvo"→Volvo, "tesla"→Tesla
- Modele auto: "seria 3/seria3/s3"→"Seria 3", "seria 5/seria5/s5"→"Seria 5", "seria 7/seria7"→"Seria 7", "a3/a4/a6/a8/q5/q7"→păstrează, "golf/polo/passat/tiguan/touareg"→păstrează, "logan/sandero/duster/jogger"→păstrează, "520d/520/320d/730d"→include seria în model
- Telefoane: "aifor/aifon/iphone/ios"→telefonBrand:Apple, "samsung/samson/galax"→Samsung, "xiaomi/siomi/redmi"→Xiaomi, "huawei/huavei"→Huawei
- Laptop: "labtop/latop/notebook"→laptopuri, "dell"→Dell, "hp/hewlett"→HP, "lenovo/lenova"→Lenovo, "asus"→Asus, "acer"→Acer, "msi"→MSI, "macbook/mac"→Apple
- Imobiliare: "masina/bolid/rabla/auto/autoturism"→autoturisme, "garso/garsoniera/garsonieră/studio/1 camera"→subcategory:apartamente+nrCamere:"1", "ap 2/apartament 2/2 camere/doua camere"→apartamente+nrCamere:"2", "ap 3/3 camere/trei camere"→apartamente+nrCamere:"3", "4 camere/4c/5 camere/patru camere"→apartamente+nrCamere:"4+", "casa/casuta/vila"→case, "teren/lot/parcela"→terenuri, "birou/office"→birouri, "spatiu comercial/spatiu/depozit"→spatii-comerciale, "garaj/parcare/loc parcare"→garaje
- Orașe: "buc/bucuresti/bucharest"→București, "cluj/cluj napoca"→Cluj-Napoca, "timisoara/tm/timis"→Timișoara, "craiova"→Craiova, "iasi/iași"→Iași, "brasov/brașov"→Brașov, "constanta/constanța"→Constanța, "galati/galați"→Galați, "ploiesti/ploiești"→Ploiești, "oradea"→Oradea, "sibiu"→Sibiu, "pitesti/pitești"→Pitești
- "chirie/inchiriere/de inchiriat/rent"→listingType:inchiriere, "vanzare/cumpar/de vanzare/vand"→listingType:vanzare

## Reguli comportament:
1. Orice marcă auto, model, categorie sau produs specific → intent:"search" IMEDIAT. NICIODATĂ "clarify" pentru cuvinte concrete.
2. Mesaj fără nicio categorie sau produs ("ceva ieftin", "vreau să cumpăr ceva") → intent:"clarify"
3. Salut, mulțumire, întrebare despre platformă → intent:"chat"
4. Rafinare căutare anterioară ("mai ieftin", "în cluj", "altele") → intent:"search" cu filtrele din history
5. Cerere ANALIZĂ mașină ("ce parere BMW X5", "merita Golf 4") → intent:"auto_verdict"
6. "alte oferte/variante/mai arată/mai cauta" → intent:"search" cu aceleași filtre din history
REGULA DE AUR: "apartament", "audi", "bmw", "casa", "laptop", "telefon" singure → intent:"search" imediat, NU "clarify"

## Ton:
- Prieten expert, relaxat, natural. 1-3 propoziții.
- Nu: "Cu plăcere!", "Desigur!", "Bineînțeles!" — fraze goale
- Când găsești: mini-sfat expert relevant
- Fiecare răspuns se termină cu O întrebare de ghidare (fără excepție)

## Format răspuns JSON strict:
{
  "intent": "search"|"chat"|"clarify"|"auto_verdict",
  "message": "răspuns în română",
  "filters": {
    "product": "termenul specific (brand+model sau produs) sau null",
    "city": "orașul normalizat sau null",
    "maxPrice": număr sau null,
    "minPrice": număr sau null,
    "category": "slug categorie sau null",
    "subcategory": "slug subcategorie EXACT din lista de mai sus sau null",
    "brand": "marca auto exactă (BMW/Audi/Dacia/VW/Mercedes/Ford/Toyota/Opel/Renault/Skoda/Seat/Hyundai/KIA/Peugeot/Fiat/Nissan/Honda/Volvo/Porsche/Subaru/Tesla) sau null",
    "model": "modelul auto (X5/A4/Logan/Golf/Octavia/Focus/Clio/308/Sandero/Passat/Tiguan etc.) sau null",
    "telefonBrand": "Apple/Samsung/Huawei/Xiaomi/OnePlus/Nokia sau null",
    "laptopBrand": "Dell/HP/Lenovo/Asus/Acer/Apple/MSI sau null",
    "nrCamere": "1=garsonieră|2=2 camere|3=3 camere|4+=4 sau mai multe camere|null=fără filtru. REGULI: garsonieră/garsoniera/studio/1 cameră→"1", 2 camere/2c→"2", 3 camere/3c→"3", 4 camere/4c/5 camere/5c/6+→"4+", fără mențiune→null",
    "listingType": "vanzare"|"inchiriere"|null,
    "keywords": ["cuvinte", "cheie"]
  }
}

## Exemple:
"caut BMW X5 in craiova sub 30000 euro"
→ {"intent":"search","message":"Caut BMW X5 în Craiova sub 30.000€. La SUV-uri premium, verifică istoricul de service și starea suspensiei — sunt costisitoare. Ai preferință pentru an de fabricație?","filters":{"product":"BMW X5","city":"Craiova","maxPrice":30000,"minPrice":null,"category":"auto","subcategory":"autoturisme","brand":"BMW","model":"X5","telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":"vanzare","keywords":["BMW","X5"]}}

"vreau apartament 2 camere bucuresti pana in 600 euro chirie"
→ {"intent":"search","message":"Caut apartamente 2 camere în București până la 600€ chirie. Pentru chirie, verifică dacă prețul include sau nu utilitățile. Preferi o anumită zonă?","filters":{"product":null,"city":"București","maxPrice":600,"minPrice":null,"category":"imobiliare","subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"2","listingType":"inchiriere","keywords":["apartament","2 camere"]}}

"cauta iPhone 15 Pro"
→ {"intent":"search","message":"Caut iPhone 15 Pro disponibil. La telefoanele Apple SH, verifică dacă bateria e originală și dacă are Find My dezactivat. Vrei nou sau second-hand?","filters":{"product":"iPhone 15 Pro","city":null,"maxPrice":null,"minPrice":null,"category":"electronice","subcategory":"telefoane","brand":null,"model":null,"telefonBrand":"Apple","laptopBrand":null,"nrCamere":null,"listingType":null,"keywords":["iPhone","iPhone 15 Pro"]}}

"laptop Dell sub 2000"
→ {"intent":"search","message":"Caut laptopuri Dell sub 2000€. Dell EliteBook și Latitude sunt cele mai fiabile pentru muncă. Ai nevoie de performanță sau portabilitate?","filters":{"product":"Dell","city":null,"maxPrice":2000,"minPrice":null,"category":"electronice","subcategory":"laptopuri","brand":null,"model":null,"telefonBrand":null,"laptopBrand":"Dell","nrCamere":null,"listingType":null,"keywords":["laptop","Dell"]}}

"caut casa in craiova"
→ {"intent":"search","message":"Caut case în Craiova disponibile. Zona centrală e mai scumpă dar mai căutată la revânzare. Ai un buget orientativ?","filters":{"product":null,"city":"Craiova","maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"case","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":null,"keywords":["casa"]}}

"masina sub 5000"
→ {"intent":"search","message":"Caut mașini sub 5.000€. La acest buget, Dacia Logan/Sandero sau VW Golf 5-6 sunt cele mai fiabile alegeri. Ai preferință de marcă?","filters":{"product":null,"city":null,"maxPrice":5000,"minPrice":null,"category":"auto","subcategory":"autoturisme","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":"vanzare","keywords":["masina"]}}

"bicicleta"
→ {"intent":"search","message":"Caut biciclete disponibile. Spune-mi tipul — MTB, cursieră, city bike — și bugetul, să-ți găsesc ceva potrivit.","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":"sport","subcategory":"biciclete","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":null,"keywords":["bicicleta"]}}

"apartament"
→ {"intent":"search","message":"Caut apartamente disponibile. Câte camere și ce buget ai în vedere?","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":null,"keywords":["apartament"]}}

"apartament 2 camere"
→ {"intent":"search","message":"Caut apartamente cu 2 camere. Ai un buget sau o zonă preferată?","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"2","listingType":null,"keywords":["apartament","2 camere"]}}

"garsoniera"
→ {"intent":"search","message":"Caut garsoniere disponibile. Ai un buget sau o zonă preferată?","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"1","listingType":null,"keywords":["garsoniera"]}}

"apartament 4 camere"
→ {"intent":"search","message":"Caut apartamente cu 4+ camere disponibile. Ce zonă și buget ai?","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"4+","listingType":null,"keywords":["apartament","4 camere"]}}

"audi"
→ {"intent":"search","message":"Caut Audi disponibile. Ce model și an de fabricație preferi?","filters":{"product":"Audi","city":null,"maxPrice":null,"minPrice":null,"category":"auto","subcategory":"autoturisme","brand":"Audi","model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null,"listingType":null,"keywords":["Audi"]}}`

    const recentHistory = validHistory.slice(-2)

    let rawText = ''
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentHistory,
          { role: 'user', content: message },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 500,
      })
      rawText = completion.choices[0].message.content || '{}'
    } catch (groqError) {
      console.error('Groq error:', groqError)
      return Response.json({ type: 'chat', message: 'Am o problemă temporară. Încearcă din nou!' } satisfies ChatResponse)
    }

    let parsed: {
      intent: 'search' | 'chat' | 'clarify' | 'auto_verdict'
      message: string
      filters: {
        product: string | null
        city: string | null
        maxPrice: number | null
        minPrice: number | null
        category: string | null
        subcategory: string | null
        brand: string | null
        model: string | null
        telefonBrand: string | null
        laptopBrand: string | null
        nrCamere: string | null
        listingType: 'vanzare' | 'inchiriere' | null
        keywords: string[]
      }
    }

    try {
      const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('no JSON')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({ type: 'chat', message: 'Sunt aici să te ajut! Spune-mi ce cauți.' } satisfies ChatResponse)
    }

    // ── Auto verdict ──────────────────────────────────────────────────────────
    if (parsed.intent === 'auto_verdict') {
      let verdictText = ''
      try {
        const vc = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: `Ești expert auto profesionist, obiectiv, pentru piața românească SH. Analizezi mașini concis și sincer. Maxim 280 cuvinte, doar română, fără markdown/bold/asteriscuri. Structura EXACTĂ:
🔎 ANALIZĂ RAPIDĂ:
- Tip mașină: [sedan/suv/break/hatchback]
- Puncte forte: [max 3, concret]
- Probleme cunoscute: [max 3, specific modelului]
💸 COSTURI:
- Consum: [oraș/drum L/100km]
- Întreținere: [ieftină/medie/scumpă + motiv]
- Piese: [ușor/medii/scumpe și rare]
⚠️ RISCURI:
- [2-3 riscuri concrete]
🧠 AI VERDICT: [🔥 MERITĂ / ⚖️ DEPINDE / ❌ NU MERITĂ]
📊 SCOR FINAL: [număr]/10
🗣 RECOMANDARE:
[2-3 propoziții directe pentru un prieten care cumpără în România]` },
            { role: 'user', content: message },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 700,
        })
        verdictText = vc.choices[0].message.content || ''
      } catch { verdictText = 'Nu am putut analiza mașina. Încearcă din nou.' }
      return Response.json({ type: 'chat', message: verdictText } satisfies ChatResponse)
    }

    if (parsed.intent === 'clarify') {
      return Response.json({ type: 'chat', message: parsed.message || 'Ce anume cauți?' } satisfies ChatResponse)
    }

    // ── Search ────────────────────────────────────────────────────────────────
    if (parsed.intent === 'search') {
      const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
      const supabase = createSupabaseAdmin()
      const f = parsed.filters
      const catId = getCatId(f.category)

      const isMoreRequest = /alte|altele|altceva|mai mult|mai arat|mai caut|mai vezi|alte variante|alte optiuni|alte oferte/i.test(message)
      const randomOffset = isMoreRequest ? Math.floor(Math.random() * 8) : 0

      const SELECT = 'id, title, price, price_type, currency, city, images, created_at'

      // Builder query cu toate filtrele disponibile
      const buildQ = (opts: {
        keyword?: string | null
        withCity?: boolean
        withCat?: boolean
        withSubcat?: boolean
        withBrand?: boolean
        withNrCamere?: boolean
        withPrice?: boolean
        offset?: number
      }) => {
        let q = supabase
          .from('listings')
          .select(SELECT)
          .in('status', ['activ', 'bidding'])
          .order('created_at', { ascending: false })
          .limit(6)

        const off = opts.offset ?? randomOffset
        if (off > 0) q = (q as any).range(off, off + 5)

        if (opts.withCat && catId) q = q.eq('category_id', catId)
        if (opts.withSubcat && f.subcategory) q = q.eq('metadata->>subcategory', f.subcategory)
        if (opts.withBrand) {
          if (f.brand) q = q.ilike('metadata->>brand', f.brand)
          if (f.model) q = q.ilike('metadata->>model', `%${f.model}%`)
          if (f.telefonBrand) q = q.ilike('metadata->>telefonBrand', f.telefonBrand)
          if (f.laptopBrand) q = q.ilike('metadata->>laptopBrand', f.laptopBrand)
        }
        if (opts.withNrCamere && f.nrCamere) q = q.eq('metadata->>nrCamere', f.nrCamere)
        if (opts.withCity && f.city) q = q.ilike('city', `%${f.city}%`)
        if (opts.withPrice) {
          if (f.maxPrice && f.maxPrice > 0) q = q.lte('price', f.maxPrice)
          if (f.minPrice && f.minPrice > 0) q = q.gte('price', f.minPrice)
        }
        if (opts.keyword) q = q.ilike('title', `%${opts.keyword}%`)
        return q
      }

      const run = async (opts: Parameters<typeof buildQ>[0]) => {
        const { data, error } = await buildQ(opts)
        if (error) console.error('[chat search]', error)
        return data || []
      }

      let listings: any[] = []

      const hasBrand = !!(f.brand || f.telefonBrand || f.laptopBrand)
      const keyword = f.product || (f.keywords?.length ? f.keywords[0] : null)

      // ── Cu keyword/brand specific (BMW X5, iPhone, laptop Dell) ──
      if (keyword || hasBrand) {
        // 1. keyword + toți filtrii + oraș + preț
        listings = await run({ keyword, withCat: true, withSubcat: true, withBrand: true, withNrCamere: true, withCity: true, withPrice: true })

        // 2. keyword + categorie + brand + preț (fără subcategorie și fără oraș)
        if (!listings.length)
          listings = await run({ keyword, withCat: true, withSubcat: false, withBrand: true, withNrCamere: false, withCity: false, withPrice: true })

        // 3. keyword + categorie (fără brand, fără preț, fără oraș)
        if (!listings.length)
          listings = await run({ keyword, withCat: true, withSubcat: false, withBrand: false, withNrCamere: false, withCity: false, withPrice: false })

        // 4. keyword în titlu fără niciun filtru
        if (!listings.length && keyword)
          listings = await run({ keyword, withCat: false, withSubcat: false, withBrand: false, withNrCamere: false, withCity: false, withPrice: false })

        // 5. brand singur (fără keyword în titlu)
        if (!listings.length && hasBrand)
          listings = await run({ withCat: true, withSubcat: false, withBrand: true, withNrCamere: false, withCity: false, withPrice: false })

        // 6. keywords alternative
        if (!listings.length && f.keywords && f.keywords.length > 1) {
          for (const kw of f.keywords.slice(1)) {
            listings = await run({ keyword: kw, withCat: !!catId, withSubcat: false, withBrand: false, withNrCamere: false, withCity: false, withPrice: false })
            if (listings.length) break
          }
        }
      }

      // ── Fără keyword (termen generic: "casa", "masina", "bicicleta") ──
      if (!listings.length && catId) {
        // 7. categorie + subcategorie + nrCamere + oraș + preț
        listings = await run({ withCat: true, withSubcat: true, withBrand: false, withNrCamere: true, withCity: true, withPrice: true, offset: randomOffset })

        // 8. categorie + subcategorie + nrCamere + preț (fără oraș)
        if (!listings.length)
          listings = await run({ withCat: true, withSubcat: true, withBrand: false, withNrCamere: true, withCity: false, withPrice: true })

        // 9. categorie + subcategorie (fără nrCamere, fără preț, fără oraș)
        if (!listings.length)
          listings = await run({ withCat: true, withSubcat: true, withBrand: false, withNrCamere: false, withCity: false, withPrice: false })

        // 10. categorie + nrCamere + city (fără subcategorie — poate nu e setată)
        if (!listings.length)
          listings = await run({ withCat: true, withSubcat: false, withBrand: false, withNrCamere: true, withCity: true, withPrice: false })

        // 11. categorie + city
        if (!listings.length)
          listings = await run({ withCat: true, withSubcat: false, withBrand: false, withNrCamere: false, withCity: true, withPrice: false })

        // 12. doar categorie
        if (!listings.length)
          listings = await run({ withCat: true, withSubcat: false, withBrand: false, withNrCamere: false, withCity: false, withPrice: false })
      }

      const count = listings.length
      const cityText = f.city ? ` în ${f.city}` : ''
      const priceText = f.maxPrice ? ` până la ${f.maxPrice.toLocaleString('ro-RO')} EUR` : ''

      const resultMessage = count > 0
        ? `${parsed.message} ${count > 1 ? `(${count} anunțuri găsite)` : '(1 anunț găsit)'}`.trim()
        : `Nu am găsit nimic pentru "${keyword || f.subcategory || f.category || 'căutarea ta'}"${cityText}${priceText}. Poate încerc cu alte criterii?`

      return Response.json({ type: 'search', message: resultMessage, listings } satisfies ChatResponse)
    }

    // ── Chat conversațional ───────────────────────────────────────────────────
    return Response.json({ type: 'chat', message: parsed.message || 'Sunt aici să te ajut! Spune-mi ce cauți.' } satisfies ChatResponse)

  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
