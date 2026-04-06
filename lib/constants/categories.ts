export const CATEGORIES = {
  joburi: {
    slug: 'joburi',
    name: 'Joburi',
    icon: '💼',
    subcategories: {
      'it-telecom': { slug: 'it-telecom', name: 'IT & Telecomunicații' },
      contabilitate: { slug: 'contabilitate', name: 'Contabilitate & Finanțe' },
      vanzari: { slug: 'vanzari', name: 'Vânzări' },
      productie: { slug: 'productie', name: 'Producție & Industrie' },
      transport: { slug: 'transport', name: 'Transport & Logistică' },
      horeca: { slug: 'horeca', name: 'HoReCa' },
      constructii: { slug: 'constructii', name: 'Construcții' },
      medicina: { slug: 'medicina', name: 'Medicină & Farmacie' },
      educatie: { slug: 'educatie', name: 'Educație' },
      'alte-joburi': { slug: 'alte-joburi', name: 'Alte joburi' },
    },
  },
  imobiliare: {
    slug: 'imobiliare',
    name: 'Imobiliare',
    icon: '🏠',
    subcategories: {
      'apartamente-inchiriere': { slug: 'apartamente-inchiriere', name: 'Apartamente de închiriat' },
      'apartamente-vanzare': { slug: 'apartamente-vanzare', name: 'Apartamente de vânzare' },
      'case-vanzare': { slug: 'case-vanzare', name: 'Case de vânzare' },
      'case-inchiriere': { slug: 'case-inchiriere', name: 'Case de închiriat' },
      terenuri: { slug: 'terenuri', name: 'Terenuri' },
      'spatii-comerciale': { slug: 'spatii-comerciale', name: 'Spații comerciale' },
    },
  },
  auto: {
    slug: 'auto',
    name: 'Auto',
    icon: '🚗',
    subcategories: {
      autoturisme: { slug: 'autoturisme', name: 'Autoturisme' },
      moto: { slug: 'moto', name: 'Moto & Scutere' },
      camioane: { slug: 'camioane', name: 'Camioane & Utilitare' },
      'piese-auto': { slug: 'piese-auto', name: 'Piese & Accesorii' },
    },
  },
  servicii: {
    slug: 'servicii',
    name: 'Servicii',
    icon: '🔧',
    subcategories: {
      reparatii: { slug: 'reparatii', name: 'Reparații & Instalații' },
      curatenie: { slug: 'curatenie', name: 'Curățenie' },
      'transport-servicii': { slug: 'transport-servicii', name: 'Transport persoane/bunuri' },
      'it-servicii': { slug: 'it-servicii', name: 'IT & Web' },
      'alte-servicii': { slug: 'alte-servicii', name: 'Alte servicii' },
    },
  },
} as const

export type CategoryKey = keyof typeof CATEGORIES
export type Category = (typeof CATEGORIES)[CategoryKey]

export function getCategoryBySlug(slug: string): Category | undefined {
  return Object.values(CATEGORIES).find((cat) => cat.slug === slug)
}

export function getAllCategories() {
  return Object.values(CATEGORIES).map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon,
  }))
}
