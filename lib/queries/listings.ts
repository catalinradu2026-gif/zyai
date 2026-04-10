import { createSupabaseServerClient } from '@/lib/supabase-server'

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

  let q = supabase
    .from('listings')
    .select(
      `
      id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata
    `,
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

  return { data, error: null, count: count || 0 }
}

export async function getListing(id: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, description, price, price_type, currency, city, county, images, status, views, phone_views, created_at, user_id, category_id, metadata, profiles(full_name, phone, avatar_url, city)')
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
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
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
