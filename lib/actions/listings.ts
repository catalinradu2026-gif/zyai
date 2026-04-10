'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from './auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const CATEGORY_IDS: Record<string, number> = {
  joburi: 1,
  imobiliare: 2,
  auto: 3,
  servicii: 4,
  electronice: 5,
  moda: 6,
  'casa-gradina': 7,
  sport: 8,
  animale: 9,
  'mama-copilul': 10,
}

function getCatId(slug: string) {
  // Match exact first, then prefix-match for subcategory slugs (e.g. "auto-autoturisme" → 3)
  if (CATEGORY_IDS[slug] !== undefined) return CATEGORY_IDS[slug]
  const parentKey = Object.keys(CATEGORY_IDS).find(k => slug.startsWith(k))
  return parentKey ? CATEGORY_IDS[parentKey] : 1
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
  contactPhone?: string
}) {
  const user = await getUser()
  if (!user?.id) return { error: 'Trebuie să fii autentificat' }

  const admin = createSupabaseAdmin()

  const isAuto = formData.categorySlug === 'auto' || formData.categorySlug.startsWith('auto')

  // Detectăm dacă categorySlug este o subcategorie (nu e cheia directă din CATEGORY_IDS)
  const isSubcategory = CATEGORY_IDS[formData.categorySlug] === undefined
  const subcategorySlug = isSubcategory ? formData.categorySlug : null

  // Salvăm totul în metadata JSONB — garantat existent, nu depinde de coloane extra
  const metadata: Record<string, any> = {}
  if (subcategorySlug) metadata.subcategory = subcategorySlug
  if (isAuto) {
    if (formData.year) metadata.year = formData.year
    if (formData.mileage) metadata.mileage = formData.mileage
    if (formData.fuelType) metadata.fuelType = formData.fuelType
    if (formData.gearbox) metadata.gearbox = formData.gearbox
    if (formData.power) metadata.power = formData.power
    if (formData.condition) metadata.condition = formData.condition
    if (formData.brand) metadata.brand = formData.brand
    if (formData.model) metadata.model = formData.model
  }

  if (formData.contactPhone) metadata.contactPhone = formData.contactPhone

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
    metadata,
  }

  let { data, error } = await admin
    .from('listings')
    .insert(insertData)
    .select('id')
    .single()

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
