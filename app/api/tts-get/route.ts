import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// Voce românească naturală Microsoft Neural — nu sună robotic
const VOICE = 'ro-RO-AlinaNeural'

const PHONETICS: [RegExp, string][] = [
  // ── Unități tehnice / Măsurători ──
  [/(\d+)\s*km\/h\b/gi, '$1 kilometri pe oră'],
  [/(\d+)\s*km\/l\b/gi, '$1 kilometri pe litru'],
  [/(\d+)\s*l\/100\s*km/gi, '$1 litri la sută de kilometri'],
  [/(\d+)\s*L\/100\s*km/gi, '$1 litri la sută de kilometri'],
  [/(\d+)\s*mp\b/gi, '$1 metri pătrați'],
  [/(\d+)\s*m²/g, '$1 metri pătrați'],
  [/(\d+)\s*m³/g, '$1 metri cubi'],
  [/(\d+)\s*m2\b/g, '$1 metri pătrați'],
  [/(\d+)\s*kW\b/gi, '$1 kilowați'],
  [/(\d+)\s*CP\b/g, '$1 cai putere'],
  [/(\d+)\s*cc\b/gi, '$1 centimetri cubi'],
  [/(\d+)\s*cm³/g, '$1 centimetri cubi'],
  [/(\d+)\s*cmc\b/gi, '$1 centimetri cubi'],
  [/(\d+)\s*kg\b/gi, '$1 kilograme'],
  [/(\d+)\s*mm\b/gi, '$1 milimetri'],
  [/(\d+)\s*cm\b/gi, '$1 centimetri'],
  [/(\d+)\s*W\b/g, '$1 wați'],
  [/(\d+)\s*Ah\b/gi, '$1 amperi oră'],
  [/(\d+)\s*mAh\b/gi, '$1 miliamperi oră'],
  [/(\d+)\s*V\b/g, '$1 volți'],
  [/(\d+)\s*GB\b/g, '$1 gigabaiți'],
  [/(\d+)\s*TB\b/g, '$1 terabaiți'],
  [/(\d+)\s*MB\b/g, '$1 megabaiți'],
  [/(\d+)\s*RAM\b/g, '$1 RAM'],
  [/(\d+)\s*GHz\b/gi, '$1 gigaherți'],
  [/(\d+)\s*MHz\b/gi, '$1 megaherți'],
  [/(\d+)\s*Hz\b/g, '$1 herți'],
  [/(\d+)\s*RPM\b/gi, '$1 rotații pe minut'],
  [/(\d+)\s*FPS\b/gi, '$1 cadre pe secundă'],
  [/(\d+)\s*dB\b/gi, '$1 decibeli'],
  [/(\d+)\s*BTU\b/gi, '$1 BTU'],

  // Fracții / Slash-uri tehnice (ex: 12/8, 3/4)
  [/(\d+)\/(\d+)/g, '$1 pe $2'],

  // ── Tech / Telefoane ──
  [/\biPhone\b/gi, 'iPhone'],
  [/\biPad\b/gi, 'iPad'],
  [/\bMacBook\b/gi, 'MacBook'],
  [/\bAirPods?\b/gi, 'AirPods'],
  [/\bSamsung Galaxy\b/gi, 'Samsung Galaxy'],
  [/\bPlayStation\b/gi, 'PlayStation'],
  [/\bXbox\b/gi, 'Xbox'],
  [/\bWi-?Fi\b/gi, 'uai-fai'],
  [/\bBluetooth\b/gi, 'blutuf'],
  [/\bgaming\b/gi, 'gheiming'],
  [/\bNVIDIA\b/gi, 'en-vidia'],
  [/\bAMD\b/g, 'A M D'],
  [/\bSSD\b/g, 'es es de'],
  [/\bHDD\b/g, 'ha de de'],
  [/\bOLED\b/g, 'o-led'],
  [/\bQLED\b/g, 'kiu-led'],
  [/\bLED\b/g, 'led'],
  [/\bLCD\b/g, 'el ce de'],
  [/\bUSB\b/g, 'u es be'],
  [/\bHDMI\b/g, 'ha de em i'],
  [/\bNFC\b/g, 'en ef ce'],
  [/\bGPS\b/g, 'ge pe es'],
  [/\b4K\b/g, 'patru K'],
  [/\b8K\b/g, 'opt K'],
  [/\bFull HD\b/gi, 'ful HD'],
  [/\bsmart\s*home\b/gi, 'smart home'],
  [/\bsmart\s*watch\b/gi, 'smart uoci'],
  [/\bsmartphone\b/gi, 'smartphone'],
  [/\bnotebook\b/gi, 'notebook'],
  [/\bdesktop\b/gi, 'desktop'],
  [/\bdisplay\b/gi, 'displeî'],
  [/\btouchscreen\b/gi, 'taci-scriin'],
  [/\bwireless\b/gi, 'uairles'],
  [/\bcharger\b/gi, 'ciargăr'],

  // ── Auto / Moto ──
  [/\bBMW\b/g, 'BMW'],
  [/\bVolkswagen\b/gi, 'Volkswagen'],
  [/\bPeugeot\b/gi, 'Peugeot'],
  [/\bRenault\b/gi, 'Renault'],
  [/\bHyundai\b/gi, 'Hiundai'],
  [/\bToyota\b/gi, 'Toyota'],
  [/\bMercedes[\s-]?Benz\b/gi, 'Mercedes Benz'],
  [/\bDacia\b/gi, 'Dacia'],
  [/\bSkoda\b/gi, 'Știkoda'],
  [/\bAudi\b/gi, 'Audi'],
  [/\bSUV\b/g, 'SUV'],
  [/\bGPL\b/g, 'ge pe el'],
  [/\bABS\b/g, 'a be es'],
  [/\bESP\b/g, 'e es pe'],
  [/\bDSG\b/g, 'de es ge'],
  [/\bTDI\b/g, 'te de i'],
  [/\bTSI\b/g, 'te es i'],
  [/\bTFSI\b/g, 'te ef es i'],
  [/\bTurbo\b/gi, 'turbo'],
  [/\bhatchback\b/gi, 'hecibec'],
  [/\bsedan\b/gi, 'sedan'],
  [/\bbreak\b/gi, 'breic'],
  [/\bcrosover\b/gi, 'crosover'],
  [/\bcrossover\b/gi, 'crosover'],
  [/\bairbag\b/gi, 'erbeg'],
  [/\bairbag-uri\b/gi, 'erbeg-uri'],
  [/\bdiesel\b/gi, 'diizel'],
  [/\bhybrid\b/gi, 'hibrid'],
  [/\bplug-in\b/gi, 'plug-in'],

  // ── Imobiliare ──
  [/\betaj\b/gi, 'etaj'],
  [/\bgarsonier[aă]\b/gi, 'garsonieră'],
  [/\bpenthouse\b/gi, 'penthause'],
  [/\bduplex\b/gi, 'duplex'],
  [/\bopen[\s-]?space\b/gi, 'open speis'],

  // ── Modă / Brand-uri ──
  [/\bNike\b/gi, 'Naik'],
  [/\bAdidas\b/gi, 'Adidas'],
  [/\bGucci\b/gi, 'Gucii'],
  [/\bLouis Vuitton\b/gi, 'Lui Viton'],
  [/\bZara\b/gi, 'Zara'],
  [/\bvintage\b/gi, 'vintij'],
  [/\bbrand\b/gi, 'brand'],
  [/\bsneakers?\b/gi, 'sniichersi'],
  [/\boutlet\b/gi, 'autlet'],
  [/\bsize\b/gi, 'saiz'],

  // ── Marketplace general ──
  [/\bdelivery\b/gi, 'delivări'],
  [/\bfeedback\b/gi, 'fiidbec'],
  [/\bonline\b/gi, 'onlain'],
  [/\boffline\b/gi, 'oflain'],
  [/\bcheck\b/gi, 'cec'],
  [/\bupgrade\b/gi, 'apgreid'],
  [/\bwarranty\b/gi, 'uoranți'],
  [/\bsecond[\s-]?hand\b/gi, 'second hend'],
  [/\bbrand new\b/gi, 'brand niu'],
  [/\blike new\b/gi, 'laic niu'],
  [/\brefurbished\b/gi, 'refărbișt'],
  [/\bdealer\b/gi, 'diiler'],
  [/\bshowroom\b/gi, 'șourum'],
  [/\bstock\b/gi, 'stoc'],

  // ── Monede / Prețuri ──
  [/\bRON\b/g, 'lei'],
  [/\bEUR\b/g, 'euro'],
  [/\beure\b/gi, 'euro'],
  [/\bUSD\b/g, 'dolari'],
  [/(\d+)\s*€/g, '$1 euro'],
  [/(\d+)\s*\$/g, '$1 dolari'],
  [/(\d+)\s*lei\/lun[aă]/gi, '$1 lei pe lună'],
  [/(\d+)\s*lei\/noapte/gi, '$1 lei pe noapte'],
  [/(\d+)\s*lei\/zi/gi, '$1 lei pe zi'],
  [/(\d+)\s*euro\/lun[aă]/gi, '$1 euro pe lună'],
  [/(\d+)\s*euro\/noapte/gi, '$1 euro pe noapte'],

  // ── Scor / Rating ──
  [/(\d+)\/10\b/g, '$1 din 10'],
  [/(\d+)\/5\b/g, '$1 din 5'],

  // ── Cleanup (emojis, markdown) ──
  [/[\u{1F300}-\u{1FFFF}]/gu, ''],
  [/[\u{2600}-\u{27FF}]/gu, ''],
  [/[*_~`#]/g, ''],
]

function prepareForSpeech(text: string): string {
  let result = text
  for (const [pattern, replacement] of PHONETICS) {
    result = result.replace(pattern, replacement)
  }
  return result.replace(/\s+/g, ' ').trim()
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const rawText = url.searchParams.get('text')?.trim()
    if (!rawText) return new Response('No text', { status: 400 })

    const text = prepareForSpeech(rawText).slice(0, 300)

    const tts = new MsEdgeTTS()
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)

    const { audioStream } = tts.toStream(text)

    // Colectăm buffer-ele audio din stream
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      audioStream.on('end', resolve)
      audioStream.on('error', reject)
    })
    const audioBuffer = Buffer.concat(chunks)

    if (audioBuffer.length === 0) {
      return new Response('TTS empty', { status: 502 })
    }

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    // Fallback la Google Translate TTS
    try {
      const url = new URL(req.url)
      const text = (url.searchParams.get('text') || '').trim().slice(0, 200)
      const encoded = encodeURIComponent(text)
      const res = await fetch(
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ro&client=tw-ob&ttsspeed=0.9`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://translate.google.com/',
          },
        }
      )
      if (!res.ok) return new Response('TTS failed', { status: 502 })
      const audio = await res.arrayBuffer()
      return new Response(audio, {
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      })
    } catch {
      return new Response('TTS failed', { status: 500 })
    }
  }
}
