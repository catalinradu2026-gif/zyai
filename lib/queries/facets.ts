import { createSupabaseAdmin } from '@/lib/supabase-admin'

export type Facet = { value: string; count: number }
export type FacetGroup = { key: string; label: string; facets: Facet[] }

/**
 * Returnează facete dinamice (valori cu contoare) pentru o categorie.
 * Folosit pe pagina de categorie pentru quick-filter chips.
 */
export async function getListingFacets(
  category: string,
  categoryId: number,
  activeSub?: string
): Promise<FacetGroup[]> {
  const admin = createSupabaseAdmin()

  // Fetch toate anunțurile active din categorie (doar câmpurile necesare)
  let q = admin
    .from('listings')
    .select('city, metadata')
    .in('status', ['activ', 'bidding'])
    .eq('category_id', categoryId)

  if (activeSub) q = q.eq('metadata->>subcategory', activeSub)

  const { data } = await q.limit(500)
  if (!data || data.length === 0) return []

  const groups: FacetGroup[] = []

  // ── ORASE ──────────────────────────────────────────────────────
  const cityCounts: Record<string, number> = {}
  for (const l of data) {
    if (l.city) cityCounts[l.city] = (cityCounts[l.city] || 0) + 1
  }
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }))
  if (topCities.length > 0) {
    groups.push({ key: 'city', label: '📍 Orașe', facets: topCities })
  }

  // ── FACETE SPECIFICE CATEGORIEI ───────────────────────────────
  if (category === 'auto') {
    // Mărci
    const brandCounts: Record<string, number> = {}
    for (const l of data) {
      const b = l.metadata?.brand
      if (b) brandCounts[b] = (brandCounts[b] || 0) + 1
    }
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }))
    if (topBrands.length > 0) {
      groups.push({ key: 'brand', label: '🚗 Mărci', facets: topBrands })
    }

    // Combustibil
    const fuelCounts: Record<string, number> = {}
    for (const l of data) {
      const f = l.metadata?.fuelType
      if (f) fuelCounts[f] = (fuelCounts[f] || 0) + 1
    }
    const topFuels = Object.entries(fuelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (topFuels.length > 1) {
      groups.push({ key: 'fuel', label: '⛽ Combustibil', facets: topFuels })
    }

    // Interval an fabricație
    const yearBuckets: Record<string, number> = { 'Înainte de 2010': 0, '2010–2015': 0, '2016–2019': 0, '2020+': 0 }
    for (const l of data) {
      const y = parseInt(l.metadata?.year || '0')
      if (y < 2010 && y > 1900) yearBuckets['Înainte de 2010']++
      else if (y >= 2010 && y <= 2015) yearBuckets['2010–2015']++
      else if (y >= 2016 && y <= 2019) yearBuckets['2016–2019']++
      else if (y >= 2020) yearBuckets['2020+']++
    }
    const yearFacets = Object.entries(yearBuckets)
      .filter(([, c]) => c > 0)
      .map(([value, count]) => ({ value, count }))
    if (yearFacets.length > 1) {
      groups.push({ key: 'yearRange', label: '📅 An fabricație', facets: yearFacets })
    }
  }

  if (category === 'imobiliare') {
    // Tip tranzacție
    const tranzactieCounts: Record<string, number> = {}
    for (const l of data) {
      const t = l.metadata?.tipTranzactie
      if (t) tranzactieCounts[t] = (tranzactieCounts[t] || 0) + 1
    }
    const tipFacets = Object.entries(tranzactieCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (tipFacets.length > 0) groups.push({ key: 'tipTranzactie', label: '🔄 Tip tranzacție', facets: tipFacets })

    // Nr camere
    const camereCounts: Record<string, number> = {}
    for (const l of data) {
      const c = l.metadata?.nrCamere
      if (c) camereCounts[c] = (camereCounts[c] || 0) + 1
    }
    const cameraFacets = Object.entries(camereCounts)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([value, count]) => ({ value, count }))
    if (cameraFacets.length > 0) groups.push({ key: 'nrCamere', label: '🛏️ Camere', facets: cameraFacets })
  }

  if (category === 'electronice') {
    // Brand telefon
    const tBrandCounts: Record<string, number> = {}
    for (const l of data) {
      const b = l.metadata?.telefonBrand || l.metadata?.laptopBrand
      if (b) tBrandCounts[b] = (tBrandCounts[b] || 0) + 1
    }
    const tBrandFacets = Object.entries(tBrandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([value, count]) => ({ value, count }))
    if (tBrandFacets.length > 0) groups.push({ key: 'telefonBrand', label: '📱 Mărci', facets: tBrandFacets })

    // Stare
    const stareCounts: Record<string, number> = {}
    for (const l of data) {
      const s = l.metadata?.electroStare
      if (s) stareCounts[s] = (stareCounts[s] || 0) + 1
    }
    const stareFacets = Object.entries(stareCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (stareFacets.length > 0) groups.push({ key: 'electroStare', label: '✅ Stare', facets: stareFacets })
  }

  if (category === 'joburi') {
    const domeniuCounts: Record<string, number> = {}
    for (const l of data) {
      const d = l.metadata?.jobDomeniu
      if (d) domeniuCounts[d] = (domeniuCounts[d] || 0) + 1
    }
    const domeniuFacets = Object.entries(domeniuCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([value, count]) => ({ value, count }))
    if (domeniuFacets.length > 0) groups.push({ key: 'jobDomeniu', label: '💼 Domeniu', facets: domeniuFacets })

    const contractCounts: Record<string, number> = {}
    for (const l of data) {
      const c = l.metadata?.tipContract
      if (c) contractCounts[c] = (contractCounts[c] || 0) + 1
    }
    const contractFacets = Object.entries(contractCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (contractFacets.length > 0) groups.push({ key: 'tipContract', label: '📄 Contract', facets: contractFacets })
  }

  if (category === 'moda') {
    const genCounts: Record<string, number> = {}
    for (const l of data) {
      const g = l.metadata?.modaGen
      if (g) genCounts[g] = (genCounts[g] || 0) + 1
    }
    const genFacets = Object.entries(genCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (genFacets.length > 0) groups.push({ key: 'modaGen', label: '👤 Gen', facets: genFacets })

    const stareCounts: Record<string, number> = {}
    for (const l of data) {
      const s = l.metadata?.modaStare
      if (s) stareCounts[s] = (stareCounts[s] || 0) + 1
    }
    const stareFacets = Object.entries(stareCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
    if (stareFacets.length > 0) groups.push({ key: 'modaStare', label: '✅ Stare', facets: stareFacets })
  }

  return groups
}
