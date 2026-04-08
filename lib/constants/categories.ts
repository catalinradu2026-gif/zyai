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
  electronice: {
    slug: 'electronice',
    name: 'Electronice',
    icon: '📱',
    subcategories: {
      telefoane: { slug: 'telefoane', name: 'Telefoane' },
      laptopuri: { slug: 'laptopuri', name: 'Laptopuri' },
      tv: { slug: 'tv', name: 'TV & Audio' },
      gaming: { slug: 'gaming', name: 'Gaming' },
      'alte-electronice': { slug: 'alte-electronice', name: 'Alte electronice' },
    },
  },
  moda: {
    slug: 'moda',
    name: 'Modă',
    icon: '👗',
    subcategories: {
      haine: { slug: 'haine', name: 'Haine' },
      incaltaminte: { slug: 'incaltaminte', name: 'Încălțăminte' },
      accesorii: { slug: 'accesorii', name: 'Accesorii' },
      copii: { slug: 'copii', name: 'Copii' },
    },
  },
  'casa-gradina': {
    slug: 'casa-gradina',
    name: 'Casă & Grădină',
    icon: '🏡',
    subcategories: {
      mobila: { slug: 'mobila', name: 'Mobilă' },
      electrocasnice: { slug: 'electrocasnice', name: 'Electrocasnice' },
      gradina: { slug: 'gradina', name: 'Grădină' },
      decorare: { slug: 'decorare', name: 'Decorare' },
    },
  },
  sport: {
    slug: 'sport',
    name: 'Sport',
    icon: '⚽',
    subcategories: {
      echipament: { slug: 'echipament', name: 'Echipament' },
      biciclete: { slug: 'biciclete', name: 'Biciclete' },
      fitness: { slug: 'fitness', name: 'Fitness' },
      outdoor: { slug: 'outdoor', name: 'Outdoor' },
    },
  },
  animale: {
    slug: 'animale',
    name: 'Animale',
    icon: '🐾',
    subcategories: {
      caini: { slug: 'caini', name: 'Câini' },
      pisici: { slug: 'pisici', name: 'Pisici' },
      accesorii: { slug: 'accesorii', name: 'Accesorii' },
      'alte-animale': { slug: 'alte-animale', name: 'Alte animale' },
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

export function getCategoryIdBySlug(slug: string): number {
  const categoryMap: Record<string, number> = {
    joburi: 1,
    imobiliare: 2,
    auto: 3,
    servicii: 4,
  }
  return categoryMap[slug] || 1
}
