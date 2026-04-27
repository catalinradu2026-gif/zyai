import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export const maxDuration = 60

const REMBG_URL = process.env.REMBG_SERVICE_URL || 'http://localhost:8002'

export async function POST(req: Request) {
  try {
    const { imageUrl: rawUrl, category } = await req.json()
    const imageUrl = (rawUrl || '').replace(/[\x00-\x1f\x7f]/g, '').trim()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

    // ── Elimină fundalul via serviciul local rembg ────────────────
    const rbRes = await fetch(`${REMBG_URL}/remove-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
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

    // Normalize PNG from OpenCV (may have non-standard channel order) to RGBA
    const noBgBuffer = await sharp(rawBuffer).ensureAlpha().png().toBuffer()

    const subjectMeta = await sharp(noBgBuffer).metadata()
    const sw = subjectMeta.width || 900
    const sh = subjectMeta.height || 900

    const isAuto = (category || '').toLowerCase() === 'auto'

    // ── Fundal profesional SVG ─────────────────────────────────────
    const floorY = Math.round(sh * 0.67)
    const podiumY = Math.round(sh * 0.72)
    const podiumW = Math.round(sw * 0.7)
    const podiumH = Math.round(sh * 0.06)
    const fontSize = Math.round(sh * 0.028)

    const bgSvg = isAuto
      ? `<svg width="${sw}" height="${sh}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="${floorY}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#0d0d1a"/>
              <stop offset="55%" stop-color="#141428"/>
              <stop offset="100%" stop-color="#0a0a15"/>
            </linearGradient>
            <linearGradient id="floor" x1="0" y1="${floorY}" x2="0" y2="${sh}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#1a1a38"/>
              <stop offset="100%" stop-color="#05050f"/>
            </linearGradient>
            <radialGradient id="spot" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stop-color="#5050c0" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#0d0d1a" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="podGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2a2a6a"/>
              <stop offset="100%" stop-color="#111130"/>
            </linearGradient>
            <radialGradient id="podGlow" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stop-color="#4444cc" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#0d0d1a" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="${sw}" height="${floorY}" fill="url(#wall)"/>
          <rect y="${floorY}" width="${sw}" height="${sh - floorY}" fill="url(#floor)"/>
          <rect width="${sw}" height="${floorY}" fill="url(#spot)"/>
          <line x1="0" y1="${floorY}" x2="${sw}" y2="${floorY}" stroke="#3535b0" stroke-width="1" stroke-opacity="0.25"/>
          <ellipse cx="${sw / 2}" cy="${podiumY}" rx="${podiumW / 2}" ry="${podiumH / 2}" fill="url(#podGrad)"/>
          <ellipse cx="${sw / 2}" cy="${podiumY}" rx="${podiumW / 2}" ry="${podiumH / 2}" fill="url(#podGlow)"/>
          <ellipse cx="${sw / 2}" cy="${podiumY}" rx="${podiumW / 2}" ry="${podiumH / 2}" fill="none" stroke="#5555dd" stroke-width="1" stroke-opacity="0.5"/>
          <text x="${sw / 2}" y="${sh - Math.round(sh * 0.025)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" fill-opacity="0.18" letter-spacing="2">zy.ai</text>
        </svg>`
      : `<svg width="${sw}" height="${sh}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="studio" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="65%" stop-color="#f0f0f5"/>
              <stop offset="100%" stop-color="#e0e0ea"/>
            </radialGradient>
          </defs>
          <rect width="${sw}" height="${sh}" fill="url(#studio)"/>
          <text x="${sw / 2}" y="${sh - Math.round(sh * 0.025)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#000000" fill-opacity="0.12" letter-spacing="2">zy.ai</text>
        </svg>`

    const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer()

    const result = await sharp(bgBuffer)
      .composite([{ input: noBgBuffer, blend: 'over', gravity: 'centre' }])
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
