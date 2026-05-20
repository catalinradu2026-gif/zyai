import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function checkAdmin(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  return key?.trim() === process.env.ASOCIATIE_ADMIN_KEY?.trim()
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { studiouri, nr_camera, saptamana } = body

  // Studiouri necesita admin, nr_camera si saptamana pot fi modificate de oricine
  if (studiouri !== undefined && !checkAdmin(request)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const update: Record<string, unknown> = {}
  if (typeof studiouri === 'number') {
    if (studiouri < 1) return NextResponse.json({ error: 'Valoare invalida' }, { status: 400 })
    update.studiouri = studiouri
  }
  if (nr_camera !== undefined) update.nr_camera = nr_camera?.trim() || null
  if (saptamana !== undefined) update.saptamana = saptamana?.trim() || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nimic de actualizat' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('asociatie_blaxy')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { id } = await params
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('asociatie_blaxy').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
