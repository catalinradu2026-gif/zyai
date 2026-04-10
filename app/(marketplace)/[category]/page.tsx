import { getListings } from '@/lib/queries/listings'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters from '@/components/listings/ListingFilters'
import { getCategoryBySlug } from '@/lib/constants/categories'
import { SUBCATEGORIES } from '@/lib/constants/subcategories'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  return { title: cat ? `${cat.name} - zyAI` : 'zyAI' }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const sp = await searchParams
  const activeSub = sp.sub || ''

  const categoryData = getCategoryBySlug(category)
  if (!categoryData) notFound()

  let listings: any[] = []
  let count = 0
  let error: any = null

  try {
    const result = await getListings({
      category,
      subcategory: activeSub || undefined,
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
    error = err
  }

  const subs = SUBCATEGORIES[category] || []

  const CATEGORY_SLUGS: Record<number, string> = { 1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii', 5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport', 9: 'animale', 10: 'mama-copilul' }
  const mappedListings = listings.map((l: any) => ({
    ...l,
    category: l.category ?? CATEGORY_SLUGS[l.category_id] ?? undefined,
    metadata: l.metadata ?? null,
  }))

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#000', marginBottom: '4px' }}>
          {categoryData!.icon} {categoryData!.name}
        </h1>
        <p style={{ color: '#555', fontSize: '14px' }}>
          {count} anunț{count !== 1 ? 'uri' : ''} disponibil{count !== 1 ? 'e' : ''}
        </p>
      </div>

      {/* SUBCATEGORIES BAR */}
      {subs.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
            {/* Toate */}
            <Link
              href={`/marketplace/${category}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                border: `2px solid ${!activeSub ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: !activeSub ? '#eff6ff' : '#fff',
                color: !activeSub ? '#1d4ed8' : '#374151',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '24px' }}>🔍</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Toate</span>
            </Link>

            {subs.map((sub) => (
              <Link
                key={sub.slug}
                href={`/marketplace/${category}?sub=${sub.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                  border: `2px solid ${activeSub === sub.slug ? '#3b82f6' : '#e5e7eb'}`,
                  backgroundColor: activeSub === sub.slug ? '#eff6ff' : '#fff',
                  color: activeSub === sub.slug ? '#1d4ed8' : '#374151',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '24px' }}>{sub.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>{sub.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* GRID: Filters + Listings */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">

        {/* Filters */}
        <div>
          <ListingFilters category={category} />
        </div>

        {/* Listings */}
        <div>
          {error ? (
            <div style={{ background: '#fefce8', border: '2px solid #fde047', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>⚠️</span>
              <h2 style={{ color: '#713f12', fontSize: '20px', fontWeight: 700 }}>Baza de date nu e conectată</h2>
              <p style={{ color: '#92400e', marginTop: '8px' }}>Folosește chat-ul 💬 pentru a căuta anunțuri!</p>
            </div>
          ) : mappedListings && mappedListings.length > 0 ? (
            <ListingGrid listings={mappedListings} />
          ) : (
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
              <h2 style={{ color: '#111', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Nu sunt anunțuri</h2>
              <p style={{ color: '#555', marginBottom: '24px' }}>
                Nu am găsit anunțuri în {categoryData!.name}{activeSub ? ` › ${subs.find(s => s.slug === activeSub)?.name}` : ''}.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={`/marketplace/${category}`}
                  style={{ padding: '8px 24px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                  Șterge filtrele
                </Link>
                <Link href="/anunt/nou"
                  style={{ padding: '8px 24px', background: '#16a34a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                  ➕ Postează anunț
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
