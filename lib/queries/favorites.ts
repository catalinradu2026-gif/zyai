import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function getUserFavorites(userId: string) {
  const supabase = createSupabaseAdmin()

  // Pas 1: ia listing_id-urile favorite
  const { data: favData, error: favError } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (favError) {
    console.error('Error fetching favorites:', favError)
    return { data: null, error: favError }
  }

  if (!favData || favData.length === 0) {
    return { data: [], error: null }
  }

  const listingIds = favData.map((f: any) => f.listing_id)

  // Pas 2: ia anunțurile — fără join-uri complexe
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, description, price, price_type, currency, city, images, created_at, metadata, category_id')
    .in('id', listingIds)
    .eq('status', 'activ')

  if (listingsError) {
    console.error('Error fetching favorite listings:', listingsError)
    return { data: null, error: listingsError }
  }

  // Sortează în ordinea favoritelor
  const sorted = listingIds
    .map((id: string) => listings?.find((l: any) => l.id === id))
    .filter(Boolean)

  return { data: sorted, error: null }
}

export async function getFavoritedIds(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching favorited ids:', error)
    return { data: [], error }
  }

  return { data: data?.map((f: any) => f.listing_id) || [], error: null }
}

export async function isFavorited(userId: string, listingId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite:', error)
    return { isFavorited: false, error }
  }

  return { isFavorited: !!data, error: null }
}
