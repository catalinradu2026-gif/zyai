'use server'

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
  try {
    const user = await getUser()
    if (!user?.id) return { error: 'Trebuie să fii autentificat' }

    const admin = createSupabaseAdmin()

    // Ensure profile exists — prevents FK violation for OAuth users whose profile creation failed
    await admin.from('profiles').upsert({
      id: user.id,
      full_name: user.full_name || user.email?.split('@')[0] || 'Utilizator',
      phone: user.phone || '',
      city: user.city || '',
    }, { onConflict: 'id', ignoreDuplicates: true })

    const isAuto = formData.categorySlug === 'auto' || formData.categorySlug.startsWith('auto')
    const isSubcategory = CATEGORY_IDS[formData.categorySlug] === undefined
    const subcategorySlug = isSubcategory ? formData.categorySlug : null

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

    const { data, error } = await admin
      .from('listings')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('createListing error:', error)
      return { error: error.message }
    }

    if (!data?.id) return { error: 'Eroare la creare anunț' }

    revalidatePath('/marketplace')
    return { id: data.id }
  } catch (err: any) {
    console.error('createListing unexpected error:', err)
    return { error: err?.message || 'Eroare neașteptată' }
  }
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
    metadata?: Record<string, any>
    categorySlug?: string
  }
) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Neautorizat' }

    const supabase = await createSupabaseServerClient()
    const updateData: any = {
      title: formData.title,
      description: formData.description,
      city: formData.city,
      county: formData.county || formData.city,
      price: formData.price || null,
      price_type: formData.priceType,
      currency: formData.currency,
      images: formData.images,
    }
    if (formData.metadata) updateData.metadata = formData.metadata
    if (formData.categorySlug) updateData.category_id = getCatId(formData.categorySlug)

    const { error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/anunt/${id}`)
    revalidatePath('/cont/anunturi')
    return { id }
  } catch (err: any) {
    console.error('updateListing unexpected error:', err)
    return { error: err?.message || 'Eroare neașteptată' }
  }
}

export async function deleteListing(id: string) {
  try {
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
    return { deleted: true }
  } catch (err: any) {
    console.error('deleteListing unexpected error:', err)
    return { error: err?.message || 'Eroare neașteptată' }
  }
}

export async function toggleListingStatus(listingId: string) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Neautorizat' }

    const admin = createSupabaseAdmin()
    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, status')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) return { error: 'Nu ai permisiunea' }
    if (listing.status === 'bidding' || listing.status === 'vandut') return { error: 'Nu poți dezactiva un anunț în licitație sau vândut' }

    const newStatus = listing.status === 'activ' ? 'inactiv' : 'activ'
    const { error } = await admin.from('listings').update({ status: newStatus }).eq('id', listingId)
    if (error) return { error: error.message }

    revalidatePath('/cont/anunturi')
    return { ok: true, newStatus }
  } catch (err: any) {
    return { error: err?.message || 'Eroare neașteptată' }
  }
}

export async function activateBidding(listingId: string, durationHours: number) {
  try {
    const user = await getUser()
    if (!user) return { error: 'Neautorizat' }

    const hours = Math.min(Math.max(Number(durationHours), 1), 6)
    const admin = createSupabaseAdmin()

    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id, status, price, metadata')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== user.id) return { error: 'Nu ai permisiunea' }

    if (listing.status === 'bidding') {
      const existingMeta = (listing.metadata as any) || {}
      const endTime = new Date(existingMeta.bidding_end_time || 0)
      if (Date.now() < endTime.getTime()) {
        return { error: 'Licitația e deja activă' }
      }
    }

    const biddingEndTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    const currentMeta = (listing.metadata as any) || {}

    const { error } = await admin
      .from('listings')
      .update({
        status: 'bidding',
        metadata: {
          ...currentMeta,
          bidding_activated_at: new Date().toISOString(),
          bidding_end_time: biddingEndTime,
          current_highest_bid: listing.price || 0,
        },
      })
      .eq('id', listingId)

    if (error) return { error: error.message }

    revalidatePath(`/anunt/${listingId}`)
    revalidatePath('/cont/anunturi')
    revalidatePath('/')
    revalidatePath('/marketplace', 'layout')
    return { ok: true, biddingEndTime }
  } catch (err: any) {
    console.error('activateBidding error:', err)
    return { error: err?.message || 'Eroare neașteptată' }
  }
}

export async function stopBidding(listingId: string) {
  'use server'
  const user = await getUser()
  if (!user) return { error: 'Neautentificat' }

  const admin = createSupabaseAdmin()

  // Verifică că e anunțul vânzătorului
  const { data: listing } = await admin
    .from('listings')
    .select('id, user_id, status, metadata')
    .eq('id', listingId)
    .single()

  if (!listing) return { error: 'Anunț negăsit' }
  if (listing.user_id !== user.id) return { error: 'Nu ești proprietarul' }
  if (listing.status !== 'bidding') return { error: 'Licitația nu e activă' }

  const meta = (listing.metadata as any) || {}

  // Dacă există oferte, marchează sold cu câștigătorul curent
  // Dacă nu există oferte, întoarce la activ
  const hasWinner = !!meta.bidding_winner_id

  if (hasWinner) {
    // Finalizează cu câștigătorul curent
    const { error } = await admin.from('listings').update({
      status: 'vandut',
      metadata: {
        ...meta,
        sold_at: new Date().toISOString(),
        sold_via: 'bidding_manual_stop',
        winning_bid: meta.current_highest_bid,
        winner_id: meta.bidding_winner_id,
        winner_name: meta.bidding_winner_name,
        winner_phone: meta.bidding_winner_phone,
        winner_email: meta.bidding_winner_email,
      }
    }).eq('id', listingId)
    if (error) return { error: error.message }
  } else {
    // Fără oferte — întoarce la activ
    const { error } = await admin.from('listings').update({
      status: 'activ',
      metadata: {
        ...meta,
        bidding_end_time: null,
        bidding_stopped_at: new Date().toISOString(),
      }
    }).eq('id', listingId)
    if (error) return { error: error.message }
  }

  revalidatePath(`/anunt/${listingId}`)
  revalidatePath('/cont/anunturi')
  revalidatePath('/')

  return { ok: true, soldWithWinner: hasWinner }
}
