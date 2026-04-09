import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function getUserFavorites(userId: string) {
  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      listing_id,
      listings(
        id, title, description, price, price_type, currency, city, images, created_at, metadata,
        categories(slug, name),
        profiles(id, full_name, avatar_url)
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return { data: null, error }
  }

  // Flatten the data
  const listings = data?.map((fav: any) => fav.listings).filter(Boolean) || []
  return { data: listings, error: null }
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
