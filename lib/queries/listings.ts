import { createSupabaseAdmin } from '@/lib/supabase-admin'

export type ListingFilters = {
  category?: string
  subcategory?: string
  city?: string
  county?: string
  minPrice?: number
  maxPrice?: number
  query?: string
  page?: number
  sort?: 'newest' | 'cheapest' | 'expensive'
  // AUTO
  brand?: string
  brands?: string[]
  model?: string
  fuel?: string
  yearFrom?: string
  yearTo?: string
  kmFrom?: string
  kmTo?: string
  caroserie?: string
  seller?: string
  stare?: string
  gearbox?: string
  cilindreeFrom?: string
  cilindreeTo?: string
  putereFrom?: string
  putereTo?: string
  // IMOBILIARE
  tipTranzactie?: string
  tipApartament?: string
  tipCasa?: string
  tipTeren?: string
  tipSpatiu?: string
  compartimentare?: string
  stareImob?: string
  nrCamere?: string
  etaj?: string
  anConstructie?: string
  suprafataFrom?: string
  suprafataTo?: string
  // JOBURI
  jobDomeniu?: string
  tipContract?: string
  regimMunca?: string
  nivelExperienta?: string
  // ELECTRONICE
  electroStare?: string
  telefonBrand?: string
  laptopBrand?: string
  // MODĂ
  modaStare?: string
  modaGen?: string
  // GENERIC
  [key: string]: string | number | string[] | undefined
}

export async function getListings(filters: ListingFilters = {}) {
  const admin = createSupabaseAdmin()
  const PAGE_SIZE = 40
  const page = filters.page ?? 1

  // Query 1: anunțuri active + în licitație — admin client bypass RLS (bidding listings must be visible)
  const sortField = filters.sort === 'cheapest' || filters.sort === 'expensive' ? 'price' : 'created_at'
  const sortAsc = filters.sort === 'cheapest'

  let q = admin
    .from('listings')
    .select(
      `id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata`,
      { count: 'exact' }
    )
    .in('status', ['activ', 'bidding'])
    .order(sortField, { ascending: sortAsc })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (filters.query) {
    q = q.textSearch('search_vector', filters.query, {
      type: 'websearch',
      config: 'romanian',
    })
  }

  if (filters.city) {
    q = q.eq('city', filters.city)
  }

  if (filters.county) {
    q = q.eq('county', filters.county)
  }

  if (filters.minPrice) {
    q = q.gte('price', filters.minPrice)
  }

  if (filters.maxPrice) {
    q = q.lte('price', filters.maxPrice)
  }

  if (filters.category) {
    const { getCategoryIdBySlug } = await import('@/lib/constants/categories')
    const categoryId = getCategoryIdBySlug(filters.category)
    q = q.eq('category_id', categoryId)
  }

  if (filters.subcategory) {
    q = q.eq('metadata->>subcategory', filters.subcategory)
  }

  // ── Filtre metadata AUTO ──────────────────────────────────────
  // Folosim ilike pentru case-insensitive match (user poate scrie bmw/BMW/Bmw)
  if (filters.brands && filters.brands.length > 0) {
    q = q.or(filters.brands.map(b => `metadata->>brand.ilike.${b}`).join(','))
  } else if (filters.brand) q = q.ilike('metadata->>brand', filters.brand)
  if (filters.model) q = q.ilike('metadata->>model', `%${filters.model}%`)
  if (filters.fuel) q = q.ilike('metadata->>fuelType', filters.fuel)
  if (filters.gearbox) q = q.ilike('metadata->>gearbox', filters.gearbox)
  if (filters.caroserie) q = q.ilike('metadata->>caroserie', filters.caroserie)
  if (filters.seller) q = q.ilike('metadata->>sellerType', `%${filters.seller}%`)
  if (filters.stare) q = q.ilike('metadata->>condition', filters.stare)
  // An fabricatie — string comparison pe 4 cifre funcționează corect
  if (filters.yearFrom) q = q.gte('metadata->>year', filters.yearFrom)
  if (filters.yearTo) q = q.lte('metadata->>year', filters.yearTo)
  // Kilometraj — string comparison (aproximativ, poate fi inexact pt numere diferite ca lungime)
  if (filters.kmFrom) q = q.gte('metadata->>mileage', filters.kmFrom.padStart(8, '0'))
  if (filters.kmTo) q = q.lte('metadata->>mileage', filters.kmTo.padStart(8, '0'))
  if (filters.cilindreeFrom) q = q.gte('metadata->>cilindree', filters.cilindreeFrom.padStart(5, '0'))
  if (filters.cilindreeTo) q = q.lte('metadata->>cilindree', filters.cilindreeTo.padStart(5, '0'))
  if (filters.putereFrom) q = q.gte('metadata->>putere', filters.putereFrom.padStart(5, '0'))
  if (filters.putereTo) q = q.lte('metadata->>putere', filters.putereTo.padStart(5, '0'))

  // ── Filtre metadata IMOBILIARE ────────────────────────────────
  if (filters.tipTranzactie) q = q.eq('metadata->>tipTranzactie', filters.tipTranzactie)
  if (filters.tipApartament) q = q.eq('metadata->>tipApartament', filters.tipApartament)
  if (filters.tipCasa) q = q.eq('metadata->>tipCasa', filters.tipCasa)
  if (filters.tipTeren) q = q.eq('metadata->>tipTeren', filters.tipTeren)
  if (filters.tipSpatiu) q = q.eq('metadata->>tipSpatiu', filters.tipSpatiu)
  if (filters.compartimentare) q = q.eq('metadata->>compartimentare', filters.compartimentare)
  if (filters.stareImob) q = q.eq('metadata->>stareImob', filters.stareImob)
  if (filters.nrCamere) q = q.eq('metadata->>nrCamere', filters.nrCamere)
  if (filters.etaj) q = q.eq('metadata->>etaj', filters.etaj)
  if (filters.anConstructie) q = q.eq('metadata->>anConstructie', filters.anConstructie)
  if (filters.suprafataFrom) q = q.gte('metadata->>suprafata', filters.suprafataFrom)
  if (filters.suprafataTo) q = q.lte('metadata->>suprafata', filters.suprafataTo)

  // ── Filtre metadata JOBURI ────────────────────────────────────
  if (filters.jobDomeniu) q = q.eq('metadata->>jobDomeniu', filters.jobDomeniu)
  if (filters.tipContract) q = q.eq('metadata->>tipContract', filters.tipContract)
  if (filters.regimMunca) q = q.eq('metadata->>regimMunca', filters.regimMunca)
  if (filters.nivelExperienta) q = q.eq('metadata->>nivelExperienta', filters.nivelExperienta)

  // ── Filtre metadata ELECTRONICE ───────────────────────────────
  if (filters.electroStare) q = q.eq('metadata->>electroStare', filters.electroStare)
  if (filters.telefonBrand) q = q.eq('metadata->>telefonBrand', filters.telefonBrand)
  if (filters.laptopBrand) q = q.eq('metadata->>laptopBrand', filters.laptopBrand)

  // ── Filtre metadata MODĂ ──────────────────────────────────────
  if (filters.modaStare) q = q.eq('metadata->>modaStare', filters.modaStare)
  if (filters.modaGen) q = q.eq('metadata->>modaGen', filters.modaGen)

  const { data, error, count } = await q

  if (error) {
    console.error('Error fetching listings:', error)
    return { data: null, error, count: 0 }
  }

  return { data: data ?? [], error: null, count: count || 0 }
}

export async function getListing(id: string) {
  // Use admin client to bypass RLS — sold listings must be readable too
  const admin = createSupabaseAdmin()

  const { data, error } = await admin
    .from('listings')
    .select('id, title, description, price, price_type, currency, city, county, images, status, views, created_at, user_id, category_id, metadata, profiles(full_name, phone, avatar_url, city)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return { data: null, error }
  }

  // Auto-finalize expired bidding listings
  const meta = (data as any)?.metadata || {}
  if (data?.status === 'bidding' && meta.bidding_end_time) {
    const endTime = new Date(meta.bidding_end_time)
    if (Date.now() >= endTime.getTime()) {
      await admin.from('listings').update({
        status: 'vandut',
        metadata: {
          ...meta,
          sold_at: new Date().toISOString(),
          sold_via: 'bidding',
          winning_bid: meta.current_highest_bid,
          winner_id: meta.bidding_winner_id,
        },
      }).eq('id', id)
      // Return updated data
      const { data: updated } = await admin
        .from('listings')
        .select('id, title, description, price, price_type, currency, city, county, images, status, views, created_at, user_id, category_id, metadata, profiles(full_name, phone, avatar_url, city)')
        .eq('id', id)
        .single()
      return { data: updated, error: null }
    }
  }

  // Increment views (only for active/bidding listings)
  if (data?.status === 'activ' || data?.status === 'bidding') {
    await admin
      .from('listings')
      .update({ views: (data?.views ?? 0) + 1 })
      .eq('id', id)
  }

  return { data, error: null }
}

export async function getUserListings(userId: string) {
  // Folosim admin client pentru a bypassa RLS și vedea toate statusurile (activ, vandut, inactiv)
  const admin = createSupabaseAdmin()

  const { data, error } = await admin
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user listings:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
