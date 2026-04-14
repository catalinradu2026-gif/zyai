import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export type ListingFilters = {
  category?: string
  subcategory?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  query?: string
  page?: number
}

export async function getListings(filters: ListingFilters = {}) {
  const supabase = await createSupabaseServerClient()
  const PAGE_SIZE = 20
  const page = filters.page ?? 1

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Query 1: anunțuri active
  let q = supabase
    .from('listings')
    .select(
      `id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata`,
      { count: 'exact' }
    )
    .eq('status', 'activ')
    .order('created_at', { ascending: false })
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

  const { data, error, count } = await q

  if (error) {
    console.error('Error fetching listings:', error)
    return { data: null, error, count: 0 }
  }

  // Query 2: anunțuri vandute din ultimele 24h — apar în feed cu badge SOLD
  const { data: allSold } = await supabase
    .from('listings')
    .select(`id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata`)
    .eq('status', 'vandut')
    .order('created_at', { ascending: false })
    .limit(50)

  const h72ago = Date.now() - 72 * 60 * 60 * 1000
  const soldRecent = (allSold || []).filter((l: any) => {
    const soldAt = l.metadata?.sold_at
    if (!soldAt) return true // fără sold_at → arată oricum (a fost marcat sold recent)
    return new Date(soldAt).getTime() >= h72ago
  })

  const activeIds = new Set((data || []).map((l: any) => l.id))
  const uniqueSold = soldRecent.filter((l: any) => !activeIds.has(l.id))

  // Mixăm vandutele cu activele, sortat după data vânzării / publicării
  const merged = [...(data || []), ...uniqueSold]
    .sort((a: any, b: any) => {
      const aTime = a.status === 'vandut' && a.metadata?.sold_at
        ? new Date(a.metadata.sold_at).getTime()
        : new Date(a.created_at).getTime()
      const bTime = b.status === 'vandut' && b.metadata?.sold_at
        ? new Date(b.metadata.sold_at).getTime()
        : new Date(b.created_at).getTime()
      return bTime - aTime
    })
    .slice(0, PAGE_SIZE)

  return { data: merged, error: null, count: (count || 0) + uniqueSold.length }
}

export async function getListing(id: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, description, price, price_type, currency, city, county, images, status, views, created_at, user_id, category_id, metadata, profiles(full_name, phone, avatar_url, city)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return { data: null, error }
  }

  // Increment views
  await supabase
    .from('listings')
    .update({ views: (data?.views ?? 0) + 1 })
    .eq('id', id)

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
