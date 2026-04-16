import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// Voce românească naturală Microsoft Neural — nu sună robotic
const VOICE = 'ro-RO-AlinaNeural'

const PHONETICS: [RegExp, string][] = [
  // Tech / Telefoane
  [/\biPhone\b/gi, 'iPhone'],
  [/\biPad\b/gi, 'iPad'],
  [/\bMacBook\b/gi, 'MacBook'],
  [/\bAirPods?\b/gi, 'AirPods'],
  [/\bSamsung Galaxy\b/gi, 'Samsung Galaxy'],
  [/\bPlayStation\b/gi, 'PlayStation'],
  [/\bXbox\b/gi, 'Xbox'],
  [/\bWi-?Fi\b/gi, 'WiFi'],
  [/\bBluetooth\b/gi, 'Bluetooth'],
  [/\bgaming\b/gi, 'gaming'],

  // Auto
  [/\bBMW\b/g, 'BMW'],
  [/\bVolkswagen\b/gi, 'Volkswagen'],
  [/\bPeugeot\b/gi, 'Peugeot'],
  [/\bRenault\b/gi, 'Renault'],
  [/\bHyundai\b/gi, 'Hyundai'],
  [/\bSUV\b/g, 'SUV'],
  [/\bGPL\b/g, 'GPL'],

  // Monede / Unități
  [/\bRON\b/g, 'lei'],
  [/\bEUR\b/g, 'euro'],
  [/\beure\b/gi, 'euro'],
  [/(\d+)\s*€/g, '$1 euro'],
  [/(\d+)\s*lei\/lună/gi, '$1 lei pe lună'],
  [/(\d+)\s*lei\/noapte/gi, '$1 lei pe noapte'],
  [/(\d+)\s*lei\/zi/gi, '$1 lei pe zi'],

  // Cleanup
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
