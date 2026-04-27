import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export const maxDuration = 60

const REMBG_URL = process.env.REMBG_SERVICE_URL || 'http://localhost:8002'

function makeGradientPixels(w: number, h: number, isAuto: boolean): Buffer {
  const buf = Buffer.alloc(w * h * 3)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3
      if (isAuto) {
        // Dark showroom: top dark navy → bottom near-black
        const t = y / h
        buf[idx]     = Math.round(13 + t * 5)   // R
        buf[idx + 1] = Math.round(13 + t * 5)   // G
        buf[idx + 2] = Math.round(26 + t * (-21)) // B
      } else {
        // White studio: center bright → edges slightly grey
        const cx = (x - w / 2) / (w / 2)
        const cy = (y - h * 0.3) / h
        const d = Math.min(1, Math.sqrt(cx * cx + cy * cy) / 0.65)
        const v = Math.round(255 - d * 30)
        buf[idx] = v; buf[idx + 1] = v; buf[idx + 2] = Math.round(v - d * 10 + 10)
      }
    }
  }
  return buf
}

export async function POST(req: Request) {
  try {
    const { imageUrl: rawUrl, category } = await req.json()
    const imageUrl = (rawUrl || '').replace(/[\x00-\x1f\x7f]/g, '').trim()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

    const rbRes = await fetch(`${REMBG_URL}/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
      signal: AbortSignal.timeout(25000),
    })

    if (!rbRes.ok) {
      const errText = await rbRes.text().catch(() => 'rembg error')
      let errMsg = errText
      try { errMsg = JSON.parse(errText).error || errText } catch {}
      throw new Error(errMsg || `rembg error ${rbRes.status}`)
    }

    const contentType = rbRes.headers.get('content-type') || ''
    if (!contentType.includes('image/')) {
      const errText = await rbRes.text().catch(() => '')
      throw new Error(`rembg non-image response: ${errText.slice(0, 200)}`)
    }

    const rawBuffer = Buffer.from(await rbRes.arrayBuffer())
    if (rawBuffer.length < 100) {
      throw new Error(`rembg returned empty buffer (${rawBuffer.length} bytes)`)
    }

    // Normalize PNG from OpenCV to standard RGBA
    const noBgBuffer = await sharp(rawBuffer).ensureAlpha().png().toBuffer()

    const subjectMeta = await sharp(noBgBuffer).metadata()
    const sw = subjectMeta.width || 900
    const sh = subjectMeta.height || 900

    const isAuto = (category || '').toLowerCase() === 'auto'

    // Generate background using raw pixels (no SVG/librsvg dependency)
    const bgPixels = makeGradientPixels(sw, sh, isAuto)
    const bgBuffer = await sharp(bgPixels, {
      raw: { width: sw, height: sh, channels: 3 },
    }).png().toBuffer()

    // Add podium for auto category
    const layers: sharp.OverlayOptions[] = [{ input: noBgBuffer, blend: 'over', gravity: 'centre' }]

    if (isAuto) {
      const podiumY = Math.round(sh * 0.72)
      const podiumW = Math.round(sw * 0.7)
      const podiumH = Math.round(sh * 0.06)
      const podiumBuf = Buffer.alloc(podiumW * podiumH * 4)
      for (let py = 0; py < podiumH; py++) {
        for (let px = 0; px < podiumW; px++) {
          const i = (py * podiumW + px) * 4
          const ex = (px - podiumW / 2) / (podiumW / 2)
          const ey = (py - podiumH / 2) / (podiumH / 2)
          const inEllipse = ex * ex + ey * ey <= 1
          if (inEllipse) {
            const t = py / podiumH
            podiumBuf[i] = Math.round(42 + t * (17 - 42))
            podiumBuf[i + 1] = Math.round(42 + t * (17 - 42))
            podiumBuf[i + 2] = Math.round(106 + t * (48 - 106))
            podiumBuf[i + 3] = 200
          }
        }
      }
      layers.unshift({
        input: await sharp(podiumBuf, { raw: { width: podiumW, height: podiumH, channels: 4 } }).png().toBuffer(),
        blend: 'over',
        top: podiumY - Math.round(podiumH / 2),
        left: Math.round((sw - podiumW) / 2),
      })
    }

    const result = await sharp(bgBuffer)
      .composite(layers)
      .webp({ quality: 82, effort: 4 })
      .toBuffer()

    const now = new Date()
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const path = `${folder}/${uid}_pro.webp`

    let url: string
    if (isR2Configured()) {
      url = await uploadToR2(result, path, 'image/webp')
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const admin = createClient(supabaseUrl, serviceKey)
      const { error } = await admin.storage
        .from('listings')
        .upload(path, result, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      url = `${supabaseUrl}/storage/v1/object/public/listings/${path}`
    }

    return NextResponse.json({ ok: true, url })
  } catch (err: any) {
    console.error('[enhance-pro]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
