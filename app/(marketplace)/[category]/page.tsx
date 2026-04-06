import { getListings } from '@/lib/queries/listings'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters from '@/components/listings/ListingFilters'
import { getCategoryBySlug } from '@/lib/constants/categories'
import { notFound } from 'next/navigation'

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

  const { data: listings, count } = await getListings({
    category,
    city: sp.city,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    query: sp.q,
    page: sp.pagina ? Number(sp.pagina) : 1,
  })

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">
          {categoryData.icon} {categoryData.name}
        </h1>
        <p className="text-gray-600 mt-2">{count} anunțuri disponibile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div>
          <ListingFilters category={category} />
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          <ListingGrid listings={listings || []} />
        </div>
      </div>
    </main>
  )
}
