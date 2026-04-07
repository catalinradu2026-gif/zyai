export type Subcategory = {
  slug: string
  name: string
  icon: string
}

export type CategorySubs = {
  [categorySlug: string]: Subcategory[]
}

export const SUBCATEGORIES: CategorySubs = {
  auto: [
    { slug: 'autoturisme', name: 'Autoturisme', icon: '🚗' },
    { slug: 'autoutilitare', name: 'Autoutilitare', icon: '🚐' },
    { slug: 'piese', name: 'Piese auto', icon: '🔩' },
    { slug: 'motociclete', name: 'Motociclete', icon: '🏍️' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'agricole', name: 'Agricole', icon: '🚜' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'constructii', name: 'Constructii', icon: '🏗️' },
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

export const AUTO_BRANDS = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Citroën',
  'Dacia', 'Daewoo', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep',
  'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Smart',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
]

export const AUTO_MODELS: Record<string, string[]> = {
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Spring', 'Jogger', 'Dokker'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo', 'T-Roc', 'Touareg', 'Touran'],
  'BMW': ['Seria 1', 'Seria 2', 'Seria 3', 'Seria 4', 'Seria 5', 'X1', 'X3', 'X5'],
  'Audi': ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  'Mercedes-Benz': ['Clasa A', 'Clasa B', 'Clasa C', 'Clasa E', 'GLA', 'GLC', 'GLE'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'EcoSport', 'Puma'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Grandland'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Koleos'],
  'Peugeot': ['208', '308', '3008', '5008', '2008'],
  'Toyota': ['Yaris', 'Corolla', 'RAV4', 'Camry', 'C-HR', 'Prius'],
}

export const CAROSERIE_TYPES = [
  'Berlina', 'SUV', 'Hatchback', 'Break/Combi', 'Coupe', 'Cabrio', 'Monovolum', 'Pickup', 'Van'
]

const currentYear = new Date().getFullYear()
export const YEARS = Array.from({ length: 40 }, (_, i) => String(currentYear - i))
