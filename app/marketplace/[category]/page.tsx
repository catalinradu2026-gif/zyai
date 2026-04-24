import { getListings } from '@/lib/queries/listings'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters from '@/components/listings/ListingFilters'
import SortBar from '@/components/listings/SortBar'
import { getCategoryBySlug } from '@/lib/constants/categories'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const SUBS: Record<string, { slug: string; name: string; icon: string }[]> = {
  auto: [
    { slug: 'autoturisme', name: 'Autoturisme', icon: '🚗' },
    { slug: 'autoutilitare', name: 'Autoutilitare', icon: '🚐' },
    { slug: 'piese', name: 'Piese auto', icon: '🔩' },
    { slug: 'agricole', name: 'Agricole', icon: '🚜' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'constructii', name: 'Constructii', icon: '🏗️' },
    { slug: 'motociclete', name: 'Motociclete', icon: '🏍️' },
  ],
  imobiliare: [
    { slug: 'apartamente', name: 'Apartamente', icon: '🏢' },
    { slug: 'case', name: 'Case', icon: '🏠' },
    { slug: 'terenuri', name: 'Terenuri', icon: '🌿' },
    { slug: 'spatii-comerciale', name: 'Spatii comerciale', icon: '🏪' },
    { slug: 'garaje', name: 'Garaje', icon: '🅿️' },
  ],
  joburi: [
    { slug: 'it', name: 'IT & Tech', icon: '💻' },
    { slug: 'vanzari', name: 'Vânzări', icon: '📊' },
    { slug: 'horeca', name: 'HoReCa', icon: '🍽️' },
    { slug: 'constructii', name: 'Construcții', icon: '🔨' },
    { slug: 'transport', name: 'Transport', icon: '🚚' },
    { slug: 'medical', name: 'Medical', icon: '🏥' },
  ],
  servicii: [
    { slug: 'reparatii', name: 'Reparații', icon: '🔧' },
    { slug: 'curatenie', name: 'Curățenie', icon: '🧹' },
    { slug: 'transport', name: 'Transport', icon: '🚚' },
    { slug: 'it', name: 'IT & Web', icon: '💻' },
    { slug: 'constructii', name: 'Construcții', icon: '🏗️' },
    { slug: 'frumusete', name: 'Frumusețe', icon: '💅' },
  ],
}

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
    const brandsArr = sp.brands ? sp.brands.split(',').filter(Boolean) : undefined
    const result = await getListings({
      category,
      subcategory: sp.sub || undefined,
      city: sp.city,
      county: sp.county,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      query: sp.q,
      page: sp.pagina ? Number(sp.pagina) : 1,
      sort: (sp.sort as any) || 'newest',
      // AUTO filters
      brand: sp.brand,
      brands: brandsArr,
      model: sp.model,
      fuel: sp.fuel,
      yearFrom: sp.yearFrom,
      yearTo: sp.yearTo,
      kmFrom: sp.kmFrom,
      kmTo: sp.kmTo,
      gearbox: sp.gearbox,
      caroserie: sp.caroserie,
      seller: sp.seller,
      stare: sp.stare,
      cilindreeFrom: sp.cilindreeFrom,
      cilindreeTo: sp.cilindreeTo,
      putereFrom: sp.putereFrom,
      putereTo: sp.putereTo,
      // IMOBILIARE filters
      tipTranzactie: sp.tipTranzactie,
      tipApartament: sp.tipApartament,
      tipCasa: sp.tipCasa,
      tipTeren: sp.tipTeren,
      tipSpatiu: sp.tipSpatiu,
      compartimentare: sp.compartimentare,
      stareImob: sp.stareImob,
      nrCamere: sp.nrCamere,
      etaj: sp.etaj,
      anConstructie: sp.anConstructie,
      suprafataFrom: sp.suprafataFrom,
      suprafataTo: sp.suprafataTo,
      // JOBURI filters
      jobDomeniu: sp.jobDomeniu,
      tipContract: sp.tipContract,
      regimMunca: sp.regimMunca,
      nivelExperienta: sp.nivelExperienta,
      // ELECTRONICE filters
      electroStare: sp.electroStare,
      telefonBrand: sp.telefonBrand,
      laptopBrand: sp.laptopBrand,
      // MODĂ filters
      modaStare: sp.modaStare,
      modaGen: sp.modaGen,
    })
    listings = result.data || []
    count = result.count || 0
    error = result.error
  } catch (err) {
    error = err
  }

  const subs = SUBS[category] || []

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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#000' }}>
          {categoryData!.icon} {categoryData!.name}
        </h1>
      </div>

      {/* SUBCATEGORIES BAR */}
      {subs.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
            <Link
              href={`/marketplace/${category}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                border: `2px solid ${!activeSub ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: !activeSub ? '#eff6ff' : '#ffffff',
                color: !activeSub ? '#1d4ed8' : '#374151',
                whiteSpace: 'nowrap',
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
                  backgroundColor: activeSub === sub.slug ? '#eff6ff' : '#ffffff',
                  color: activeSub === sub.slug ? '#1d4ed8' : '#374151',
                  whiteSpace: 'nowrap',
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-1">
          <Suspense fallback={<div style={{ height: '200px' }} />}>
            <ListingFilters category={category} />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={null}>
            <SortBar count={count} />
          </Suspense>
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
