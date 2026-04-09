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
}) {
  const user = await getUser()
  if (!user?.id) return { error: 'Trebuie să fii autentificat' }

  const admin = createSupabaseAdmin()

  const isAuto = formData.categorySlug === 'auto' || formData.categorySlug.startsWith('auto')

  // Detectăm dacă categorySlug este o subcategorie (nu e cheia directă din CATEGORY_IDS)
  const isSubcategory = CATEGORY_IDS[formData.categorySlug] === undefined
  const subcategorySlug = isSubcategory ? formData.categorySlug : null

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
    metadata: subcategorySlug ? { subcategory: subcategorySlug } : {},
  }

  if (isAuto) {
    insertData.auto_year = formData.year || null
    insertData.auto_mileage = formData.mileage || null
    insertData.auto_fuel = formData.fuelType || null
    insertData.auto_gearbox = formData.gearbox || null
    insertData.auto_power = formData.power || null
    insertData.auto_condition = formData.condition || null
    insertData.auto_brand = formData.brand || null
    insertData.auto_model = formData.model || null
  }

  let { data, error } = await admin
    .from('listings')
    .insert(insertData)
    .select('id')
    .single()

  // Dacă coloanele auto_ nu există încă, încearcă fără ele
  if (error && (error.message.includes('auto_') || error.message.includes('column'))) {
    const safeData = { ...insertData }
    ;['auto_year','auto_mileage','auto_fuel','auto_gearbox','auto_power','auto_condition','auto_brand','auto_model'].forEach(k => delete safeData[k])
    const { data: d2, error: e2 } = await admin
      .from('listings')
      .insert(safeData)
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
