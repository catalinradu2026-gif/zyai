import { getListings } from '@/lib/queries/listings'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters from '@/components/listings/ListingFilters'
import { getCategoryBySlug } from '@/lib/constants/categories'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  return {
    title: cat ? `${cat.name} - zyAI` : 'zyAI',
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const sp = await searchParams

  const categoryData = getCategoryBySlug(category)
  if (!categoryData) {
    notFound()
  }

  let listings: any[] = []
  let count: number = 0
  let error: any = null

  // Try to fetch listings from database
  try {
    const result = await getListings({
      category: category,
      city: sp.city,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      query: sp.q,
      page: sp.pagina ? Number(sp.pagina) : 1,
    })
    listings = result.data || []
    count = result.count || 0
    error = result.error
  } catch (err) {
    console.error('Error fetching listings:', err)
    error = err
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {categoryData.icon} {categoryData.name}
        </h1>
        <p className="text-gray-600">
          {count} anunț{count !== 1 ? 'uri' : ''} disponibil{count !== 1 ? 'e' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ListingFilters category={category} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {error ? (
            // Error State
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">
                Database is not connected
              </h2>
              <p className="text-yellow-800 mb-6">
                Use the chat bubble 💬 to search for listings instead!
              </p>
              <p className="text-sm text-yellow-700">
                Or try: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">apartament cluj</span>
              </p>
            </div>
          ) : listings && listings.length > 0 ? (
            // Listings Grid
            <ListingGrid listings={listings} />
          ) : (
            // Empty State
            <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
              <span className="text-5xl mb-4 block">📭</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nu sunt anunțuri</h2>
              <p className="text-gray-600 mb-6">
                Nu am găsit anunțuri în categoria "{categoryData.name}" cu filtrele tale.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={`/marketplace/${category}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Șterge filtrele
                </Link>
                <Link
                  href="/anunt/nou"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  ➕ Postează anunț
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                💡 Sau folosește chat-ul pentru a căuta ce vrei
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
