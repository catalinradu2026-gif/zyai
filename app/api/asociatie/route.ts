import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function checkAdmin(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  return key?.trim() === process.env.ASOCIATIE_ADMIN_KEY?.trim()
}

export async function GET(request: NextRequest) {
  const sectiune = request.nextUrl.searchParams.get('s') || 'proprietar'
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('asociatie_blaxy')
    .select('*')
    .eq('sectiune', sectiune)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nume, prenume, studiouri, nr_camera, saptamana, sectiune = 'proprietar' } = body

  if (!nume?.trim() || !prenume?.trim()) {
    return NextResponse.json({ error: 'Nume și prenume sunt obligatorii' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('asociatie_blaxy')
    .insert({
      nume: nume.trim(),
      prenume: prenume.trim(),
      studiouri: Number(studiouri) || 1,
      nr_camera: nr_camera?.trim() || null,
      saptamana: saptamana?.trim() || null,
      sectiune,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
