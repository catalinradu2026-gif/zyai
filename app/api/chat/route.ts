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
    // Validare history — previne prompt injection via history falsificat
    const validHistory = (history as HistoryMessage[]).filter(
      (m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length < 1000
    )

    // Fallback simple chat if GROQ_API_KEY is missing
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured')
      return Response.json({
        type: 'chat',
        message: '🤖 Asistentul AI este în configurare. Încearcă din nou în câteva momente!',
      } satisfies ChatResponse)
    }

    // PASUL 1: Groq decide intent + extrage filtre (un singur apel)
    const systemPrompt = `Ești "zyAI", expertul #1 în marketplace din România. Ești consultant specializat pe TOATE tipurile de anunțuri — auto, imobiliare, joburi, electronice, modă, servicii, casă-grădină, sport, animale, copii. Ai experiență vastă și cunoști piața românească perfect. Vorbești DOAR în română, natural, ca un om adevărat.

## Platforma zyAI
Cel mai avansat marketplace românesc cu AI integrat. Utilizatorii caută, compară, cumpără, vând, închiriază și găsesc joburi.

## Expertiza ta pe categorii:
- **Auto**: Cunoști toate mărcile, știi ce mașini sunt fiabile, ce probleme au, prețuri reale pe piața românească, consum, întreținere, piesele care se strică
- **Imobiliare**: Știi prețuri pe zone, cartiere bune/rele, ce întrebări să pui proprietarului, diferența între ofertele bune și cele suspecte
- **Joburi**: Cunoști salariile reale pe industrii, ce firme sunt ok, beneficii standard, red flags în anunțuri
- **Electronice**: Știi raportul calitate-preț, ce merită nou vs second-hand, ce să verifici la un telefon/laptop SH
- **Modă**: Cunoști branduri, cum verifici autenticitatea, sezon vs off-season
- **Servicii**: Știi prețuri orientative pentru meșteri, electricieni, instalatori, IT, curățenie
- **Casă-grădină**: Sfaturi despre mobilă, electrocasnice, ce merită investiția
- **Sport**: Echipament, biciclete, fitness — ce e overpriced și ce e chilipir
- **Animale**: Rase, prețuri normale, ce să verifici la un crescător
- **Mama-copilul**: Ce merită nou, ce poți lua SH fără probleme

## Categorii și subcategorii disponibile:
- **joburi**: it-telecom, contabilitate, vanzari, productie, transport, horeca, constructii, medicina, educatie, alte-joburi
- **imobiliare**: apartamente-inchiriere, apartamente-vanzare, case-vanzare, case-inchiriere, terenuri, spatii-comerciale
- **auto**: autoturisme, moto, camioane, piese-auto
- **servicii**: reparatii, curatenie, transport-servicii, it-servicii, alte-servicii
- **electronice**: telefoane, laptopuri, tv, gaming, alte-electronice
- **moda**: haine, incaltaminte, accesorii, copii
- **casa-gradina**: mobila, electrocasnice, gradina, decorare
- **sport**: echipament, biciclete, fitness, outdoor
- **animale**: caini, pisici, accesorii, alte-animale
- **mama-copilul**: haine, jucarii, carucior, mobilier, ingrijire-bebelusi, carti-jocuri, alte-mama-copilul

## Orașe principale România (normalizare):
- "cluj" / "cluj napoca" / "clujul" → Cluj-Napoca
- "buc" / "bucuresti" / "capitala" → București
- "tm" / "timis" / "timisoara" → Timișoara
- "iasi" → Iași
- "constanta" / "constanța" → Constanța
- "brasov" → Brașov
- "craiova" → Craiova
- "galati" → Galați
- "oradea" → Oradea
- "bacau" → Bacău
- "arad" → Arad
- "pitesti" → Pitești
- "sibiu" → Sibiu
- "targu mures" / "tg mures" → Târgu Mureș
- Returnează orașul cu diacritice corecte în "city"

## Cum înțelegi mesajele românești (informal → formal):
- "garsoniera" / "garso" → apartamente-inchiriere sau apartamente-vanzare
- "ap 2 camere" / "2 cam" / "doua camere" → apartamente
- "masina" / "auto" / "bolid" / "rabla" → autoturisme
- "job" / "munca" / "angajare" / "serviciu" / "lucru" → joburi
- "chirie" / "inchiriez" / "de inchiriat" → inchiriere
- "de vanzare" / "vand" / "cumpar" / "vrei sa cumperi" → vanzare
- "telefon" / "smartphone" / "iphone" / "samsung" → telefoane
- "laptop" / "PC" / "calculator" → laptopuri
- "bicicleta" / "bike" → biciclete
- numere cu "€" / "euro" / "eur" → EUR; "lei" / "ron" → RON
- "ieftin" → înseamnă maxPrice mic (relativ la categorie)
- "urgent" → utilizatorul vrea să cumpere/vândă rapid

## Reguli de comportament:
1. Dacă mesajul e CLAR ce caută → intent: "search", extrage filtrele
2. Dacă mesajul e VAGUE sau GENERAL (ex: "ceva ieftin", "vreau sa cumpar") → intent: "clarify", pune o singură întrebare concisă
3. Dacă mesajul e salut, mulțumire, întrebare despre platformă → intent: "chat"
4. Dacă utilizatorul rafineaza o cautare anterioara (ex: "mai ieftin", "in cluj", "doar apartamente") → combina cu contextul din history și returnează intent: "search"
5. Dacă mesajul cere PARERE / ANALIZA despre o mașină anume (ex: "ce parere ai despre Dacia Logan", "merită Golf 4", "e bun BMW X5", "analizează Skoda Octavia 2018", "ia iau sau nu", "merita cumparata") → intent: "auto_verdict"
6. **CRITICAL**: Dacă utilizatorul cere "alte oferte", "alte variante", "mai arată-mi", "mai multe", "alte opțiuni", "altceva", "alte anunțuri", "mai cauta" → intent: "search" cu ACELEAȘI filtre din conversația anterioară (din history). NU răspunde textual, caută efectiv în platformă.

## Ton și stil:
- **Vorbești ca un prieten expert** — natural, relaxat, dar competent. Ca și cum ai vorbi cu cineva la o cafea care se pricepe la toate.
- Răspunsuri de 1-3 propoziții maxim
- Nu folosi: "Cu plăcere!", "Desigur!", "Cu siguranță!", "Bineînțeles!" — fraze goale
- Nu folosi emoji excesiv
- Folosește "tu" mereu — conversație naturală
- Când găsești → dă un mini-sfat de expert: "Am găsit X anunțuri. La prețul ăsta, verifică dacă..."
- Când nu găsești → sugerezi concret alternativa cu o explicație de ce
- Adaugă MEREU o mică recomandare sau insight de expert (1 propoziție): "La mașinile astea, kilometrajul real contează mai mult decât anul" / "Prețul e sub media pieței, merită verificat" / "Pentru zona asta, e un preț corect"
- **OBLIGATORIU: Fiecare răspuns se termină MEREU cu o întrebare** — ca un consultant care ghidează clientul. Ex: "Vrei să restrâng pe un anumit buget?" / "Preferi ceva mai nou sau mai ieftin?" / "Cauți ceva specific sau orice variantă merge?" / "Ai o preferință de zonă?" — Fără excepție.

## Format răspuns (JSON strict, fără markdown):
{
  "intent": "search" | "chat" | "clarify" | "auto_verdict",
  "message": "răspuns în română, scurt și direct",
  "filters": {
    "product": "ce cauta exact (null dacă chat/clarify)",
    "city": "orașul sau null",
    "maxPrice": număr sau null,
    "minPrice": număr sau null,
    "category": "slug-ul categoriei principale sau null",
    "subcategory": "slug-ul subcategoriei sau null",
    "listingType": "vanzare" | "inchiriere" | null,
    "keywords": ["cuvinte", "cheie", "relevante"]
  }
}

## Exemple:
User: "caut ap 2 camere in cluj pana in 400 euro"
→ {"intent":"search","message":"Caut apartamente 2 camere în Cluj până la 400€...","filters":{"product":"apartament 2 camere","city":"Cluj","maxPrice":400,"minPrice":null,"category":"imobiliare","subcategory":"apartamente-inchiriere","listingType":"inchiriere","keywords":["2 camere","apartament"]}}

User: "vreau o masina sub 5000 euro"
→ {"intent":"search","message":"Caut autoturisme sub 5000€...","filters":{"product":"autoturism","city":null,"maxPrice":5000,"minPrice":null,"category":"auto","subcategory":"autoturisme","listingType":"vanzare","keywords":["masina","auto"]}}

User: "ceva ieftin"
→ {"intent":"clarify","message":"Ce anume cauți? (apartament, mașină, job, telefon...)","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}

User: "salut"
→ {"intent":"chat","message":"Salut! Spune-mi ce cauți și găsim împreună cel mai bun anunț.","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}

User: "ce parere ai despre Dacia Logan 2015"
→ {"intent":"auto_verdict","message":"","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}

[History: user căutase "apartament 2 camere Cluj"] User: "alte oferte" / "mai arată-mi" / "mai multe opțiuni"
→ {"intent":"search","message":"Caut mai multe apartamente 2 camere în Cluj...","filters":{"product":"apartament 2 camere","city":"Cluj-Napoca","maxPrice":null,"minPrice":null,"category":"imobiliare","subcategory":"apartamente-inchiriere","listingType":"inchiriere","keywords":["apartament","2 camere"]}}

[History: user căutase "masina sub 5000 euro"] User: "altele" / "alte variante" / "mai cauta"
→ {"intent":"search","message":"Caut mai multe autoturisme sub 5000€...","filters":{"product":"autoturism","city":null,"maxPrice":5000,"minPrice":null,"category":"auto","subcategory":"autoturisme","listingType":"vanzare","keywords":["masina","auto"]}}`

    // Construieste mesajele cu history validat (max ultimele 6 pentru context)
    const recentHistory = validHistory.slice(-6)

    let rawText = ''
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentHistory,
          { role: 'user', content: message },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 400,
      })

      rawText = completion.choices[0].message.content || '{}'
    } catch (groqError) {
      console.error('Groq error:', groqError)
      // Fallback - just return simple chat
      return Response.json({
        type: 'chat',
        message: '🤖 Asistentul AI are o problemă temporară. Încearcă din nou în câteva secunde!',
      } satisfies ChatResponse)
    }

    // Parseaza raspunsul JSON de la Groq
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
        listingType: 'vanzare' | 'inchiriere' | null
        keywords: string[]
      }
    }

    try {
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Extrage obiectul JSON chiar dacă modelul adaugă text înainte/după
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('no JSON found')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({
        type: 'chat',
        message: 'Sunt aici să te ajut! Spune-mi ce cauți — apartament, mașină, job, telefon...',
      } satisfies ChatResponse)
    }

    // Intent "auto_verdict" — analiză expert mașină
    if (parsed.intent === 'auto_verdict') {
      const autoExpertPrompt = `Ești un expert auto profesionist, obiectiv și sincer, specializat pe piața românească second-hand.

Rolul tău este să analizezi mașini și să oferi un "AI VERDICT" clar, scurt și util.

Reguli stricte:
- Fii SPECIFIC la problemele REALE ale modelului respectiv (nu generic)
- Ține cont de piața românească: service, disponibilitate piese, prețuri uzuale OLX/autovit
- Dacă sunt mai mulți ani/versiuni cu diferențe importante, menționează-le scurt
- Maxim 280 cuvinte total
- Vorbești DOAR în română, fără markdown, fără bold, fără asteriscuri
- Folosește EXACT structura de mai jos, cu emoji-urile indicate

Structura răspunsului (respectă EXACT):

🔎 ANALIZĂ RAPIDĂ:
- Tip mașină: [sedan/suv/break/hatchback/monovolum]
- Puncte forte: [max 3, concret]
- Probleme cunoscute: [max 3, specific acestui model]

💸 COSTURI:
- Consum: [oraș/drum ex: 9/6 L/100km]
- Întreținere: [ieftină/medie/scumpă + motiv scurt]
- Piese: [ușor de găsit și ieftine / medii / scumpe și rare]

⚠️ RISCURI:
- [2-3 riscuri specifice, concrete]

🧠 AI VERDICT: [EXACT unul din: 🔥 MERITĂ / ⚖️ DEPINDE / ❌ NU MERITĂ]

📊 SCOR FINAL: [număr]/10

🗣 RECOMANDARE:
[2-3 propoziții directe, ca pentru un prieten care vrea să cumpere această mașină în România]`

      let verdictText = ''
      try {
        const verdictCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: autoExpertPrompt },
            { role: 'user', content: message },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 700,
        })
        verdictText = verdictCompletion.choices[0].message.content || ''
      } catch (e) {
        console.error('auto_verdict groq error:', e)
        verdictText = 'Nu am putut analiza mașina în acest moment. Încearcă din nou.'
      }

      return Response.json({
        type: 'chat',
        message: verdictText,
      } satisfies ChatResponse)
    }

    // Intent "clarify" — pune întrebare fără căutare
    if (parsed.intent === 'clarify') {
      return Response.json({
        type: 'chat',
        message: parsed.message || 'Ce anume cauți mai exact?',
      } satisfies ChatResponse)
    }

    // PASUL 2: Daca intent este "search", cauta in Supabase
    if (parsed.intent === 'search') {
      // Folosim admin client pentru a bypassa RLS — search-ul trebuie să vadă toate anunțurile active
      const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
      const supabase = createSupabaseAdmin()
      const f = parsed.filters

      // Detectează dacă e cerere de "alte oferte" — adaugă offset aleator pentru varietate
      const isMoreRequest = /alte|altele|altceva|mai mult|mai arat|mai caut|mai vezi|alte variante|alte optiuni|alte oferte/i.test(message)
      const randomOffset = isMoreRequest ? Math.floor(Math.random() * 10) : 0

      // Helper: obține categoryId valid sau null (evită bug-ul getCategoryIdBySlug care returnează 1 pentru null)
      const getCatId = (cat: string | null): number | null => {
        if (!cat) return null
        const id = getCategoryIdBySlug(cat)
        return id > 0 ? id : null
      }

      const SELECT = 'id, title, price, price_type, currency, city, images, created_at'

      const base = () => supabase
        .from('listings')
        .select(SELECT)
        .in('status', ['activ', 'bidding'])
        .order('created_at', { ascending: false })

      // Construieste query cu filtre progresive
      const runQuery = async (opts: {
        product?: string | null
        useCity?: boolean
        useCategory?: boolean
        usePret?: boolean
        useKeyword?: string | null
        limit?: number
        offset?: number
      }) => {
        let q = base().limit(opts.limit ?? 6)
        if (opts.offset && opts.offset > 0) q = (q as any).range(opts.offset, opts.offset + (opts.limit ?? 6) - 1)

        const catId = getCatId(f.category)
        if (opts.useCategory && catId) q = q.eq('category_id', catId)
        if (opts.useCity && f.city) q = q.ilike('city', `%${f.city}%`)
        if (opts.usePret) {
          if (f.maxPrice && f.maxPrice > 0) q = q.lte('price', f.maxPrice)
          if (f.minPrice && f.minPrice > 0) q = q.gte('price', f.minPrice)
        }
        if (opts.product) q = q.ilike('title', `%${opts.product}%`)
        else if (opts.useKeyword) q = q.ilike('title', `%${opts.useKeyword}%`)

        const { data, error: qErr } = await q
        if (qErr) console.error('Supabase chat search error:', qErr)
        return data || []
      }

      let listings: any[] = []

      // Pregătește termenul de căutare (product sau primul keyword)
      const searchTerm = f.product || (f.keywords && f.keywords.length > 0 ? f.keywords[0] : null)
      const catId = getCatId(f.category)

      if (searchTerm) {
        // Nivel 1: product + categorie + oraș + preț
        listings = await runQuery({ product: searchTerm, useCategory: true, useCity: true, usePret: true, offset: randomOffset })

        // Nivel 2: product + categorie + preț (fără oraș)
        if (!listings.length) {
          listings = await runQuery({ product: searchTerm, useCategory: true, useCity: false, usePret: true })
        }

        // Nivel 3: product + categorie (fără preț și fără oraș)
        if (!listings.length) {
          listings = await runQuery({ product: searchTerm, useCategory: true, useCity: false, usePret: false })
        }

        // Nivel 4: product fără nicio restricție
        if (!listings.length) {
          listings = await runQuery({ product: searchTerm, useCategory: false, useCity: false, usePret: false })
        }

        // Nivel 5: keywords secundare în titlu
        if (!listings.length && f.keywords && f.keywords.length > 1) {
          for (const kw of f.keywords.slice(1)) {
            listings = await runQuery({ useKeyword: kw, useCategory: !!catId, useCity: false, usePret: false })
            if (listings.length) break
          }
        }
      }

      // Fără searchTerm (categorie generică: "casa", "masina")
      if (!listings.length && catId) {
        // Nivel 6: categorie + oraș + preț
        listings = await runQuery({ useCategory: true, useCity: true, usePret: true, offset: randomOffset })

        // Nivel 7: categorie + preț (fără oraș)
        if (!listings.length) {
          listings = await runQuery({ useCategory: true, useCity: false, usePret: true })
        }

        // Nivel 8: doar categorie
        if (!listings.length) {
          listings = await runQuery({ useCategory: true, useCity: false, usePret: false })
        }
      }

      // Nivel final: primele 6 anunțuri active (ultimă soluție)
      if (!listings.length) {
        listings = await runQuery({ useCategory: false, useCity: false, usePret: false })
      }

      const count = listings?.length ?? 0
      const cityText = f.city ? ` în ${f.city}` : ''
      const priceText = f.maxPrice ? ` până la ${f.maxPrice} euro` : ''

      const resultMessage =
        count > 0
          ? `${parsed.message || `Am găsit ${count} anunț${count !== 1 ? 'uri' : ''}${cityText}${priceText}.`} Vrei să cauți altceva?`
          : `Nu am găsit nimic pentru "${f.product || f.keywords?.[0] || 'căutarea ta'}"${cityText}. Vrei să cauți altceva?`

      return Response.json({
        type: 'search',
        message: resultMessage,
        listings: listings ?? [],
      } satisfies ChatResponse)
    }

    // PASUL 3: Raspuns conversational
    return Response.json({
      type: 'chat',
      message: parsed.message || 'Sunt aici să te ajut! Spune-mi ce cauți.',
    } satisfies ChatResponse)
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
