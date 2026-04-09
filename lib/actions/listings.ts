'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from './auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const CATEGORY_IDS: Record<string, number> = {
  joburi: 1, imobiliare: 2, auto: 3, servicii: 4,
}

function getCatId(slug: string) {
  return CATEGORY_IDS[slug] || CATEGORY_IDS[Object.keys(CATEGORY_IDS).find(k => slug.startsWith(k)) || ''] || 1
}

export async function createListing(formData: {
  title: string
  description: string
  categorySlug: string
  categoryName: string
  city: string
  county?: string
  price?: number
  priceType: string
  currency: string
  images: string[]
  // Auto-specific
  brand?: string
  model?: string
  fuelType?: string
  year?: string
  mileage?: string
  bodyType?: string
  sellerType?: string
  leasing?: boolean
  gearbox?: string
  power?: string
  condition?: string
}) {
  const user = await getUser()
  if (!user?.id) return { error: 'Trebuie să fii autentificat' }

  const admin = createSupabaseAdmin()

  const isAuto = formData.categorySlug === 'auto' || formData.categorySlug.startsWith('auto-')

  const metadata = isAuto ? {
    brand: formData.brand || null,
    model: formData.model || null,
    fuelType: formData.fuelType || null,
    year: formData.year || null,
    mileage: formData.mileage || null,
    bodyType: formData.bodyType || null,
    sellerType: formData.sellerType || null,
    leasing: formData.leasing || false,
    gearbox: formData.gearbox || null,
    power: formData.power || null,
    condition: formData.condition || null,
  } : null

  // Try with metadata first
  const insertData: any = {
    user_id: user.id,
    title: formData.title,
    description: formData.description,
    category_id: getCatId(formData.categorySlug),
    city: formData.city,
    county: formData.county || formData.city,
    price: formData.price || null,
    price_type: formData.priceType,
    currency: formData.currency,
    images: formData.images,
    status: 'activ',
  }

  if (metadata) insertData.metadata = metadata

  let { data, error } = await admin
    .from('listings')
    .insert(insertData)
    .select('id')
    .single()

  // If metadata column doesn't exist, retry without it
  if (error && error.message.includes('metadata')) {
    const { data: d2, error: e2 } = await admin
      .from('listings')
      .insert({ ...insertData, metadata: undefined })
      .select('id')
      .single()
    data = d2
    error = e2
  }

  if (error) {
    console.error('createListing error:', error)
    return { error: error.message }
  }

  revalidatePath('/marketplace')
  redirect(`/anunt/${data!.id}`)
}

export async function updateListing(
  id: string,
  formData: {
    title: string
    description: string
    city: string
    county?: string
    price?: number
    priceType: string
    currency: string
    images: string[]
  }
) {
  const user = await getUser()
  if (!user) return { error: 'Neautorizat' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('listings')
    .update({
      title: formData.title,
      description: formData.description,
      city: formData.city,
      county: formData.county || formData.city,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/anunt/${id}`)
  revalidatePath('/cont/anunturi')
  redirect(`/anunt/${id}`)
}

export async function deleteListing(id: string) {
  const user = await getUser()
  if (!user) return { error: 'Neautorizat' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/cont/anunturi')
  redirect('/cont/anunturi')
}
