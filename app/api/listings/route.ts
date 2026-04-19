import { getListings, type ListingFilters } from '@/lib/queries/listings'

export const dynamic = 'force-dynamic'

/**
 * GET /api/listings?category=auto&page=2&brand=BMW&city=Craiova...
 * Folosit de infinite scroll pe paginile de categorie.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const filters: ListingFilters = {
    category: searchParams.get('category') || undefined,
    subcategory: searchParams.get('sub') || undefined,
    city: searchParams.get('city') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    query: searchParams.get('q') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    // AUTO
    brand: searchParams.get('brand') || undefined,
    model: searchParams.get('model') || undefined,
    fuel: searchParams.get('fuel') || undefined,
    yearFrom: searchParams.get('yearFrom') || undefined,
    yearTo: searchParams.get('yearTo') || undefined,
    kmFrom: searchParams.get('kmFrom') || undefined,
    kmTo: searchParams.get('kmTo') || undefined,
    caroserie: searchParams.get('caroserie') || undefined,
    seller: searchParams.get('seller') || undefined,
    stare: searchParams.get('stare') || undefined,
    gearbox: searchParams.get('gearbox') || undefined,
    // IMOBILIARE
    tipTranzactie: searchParams.get('tipTranzactie') || undefined,
    tipApartament: searchParams.get('tipApartament') || undefined,
    tipCasa: searchParams.get('tipCasa') || undefined,
    tipTeren: searchParams.get('tipTeren') || undefined,
    tipSpatiu: searchParams.get('tipSpatiu') || undefined,
    compartimentare: searchParams.get('compartimentare') || undefined,
    stareImob: searchParams.get('stareImob') || undefined,
    nrCamere: searchParams.get('nrCamere') || undefined,
    etaj: searchParams.get('etaj') || undefined,
    anConstructie: searchParams.get('anConstructie') || undefined,
    suprafataFrom: searchParams.get('suprafataFrom') || undefined,
    suprafataTo: searchParams.get('suprafataTo') || undefined,
    // JOBURI
    jobDomeniu: searchParams.get('jobDomeniu') || undefined,
    tipContract: searchParams.get('tipContract') || undefined,
    regimMunca: searchParams.get('regimMunca') || undefined,
    nivelExperienta: searchParams.get('nivelExperienta') || undefined,
    // ELECTRONICE
    electroStare: searchParams.get('electroStare') || undefined,
    telefonBrand: searchParams.get('telefonBrand') || undefined,
    laptopBrand: searchParams.get('laptopBrand') || undefined,
    // MODĂ
    modaStare: searchParams.get('modaStare') || undefined,
    modaGen: searchParams.get('modaGen') || undefined,
  }

  const { data, error, count } = await getListings(filters)

  if (error) {
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  return Response.json({ data, count, page: filters.page })
}
