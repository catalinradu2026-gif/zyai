import { NextResponse } from 'next/server'

export const maxDuration = 10

const REMBG_URL = process.env.REMBG_SERVICE_URL || 'http://localhost:8002'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${REMBG_URL}/health`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
