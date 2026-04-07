/**
 * Category-specific form field configurations
 * Defines what additional fields appear for each category
 */

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'radio'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  helperText?: string
}

export const CATEGORY_FORM_FIELDS: Record<string, FormField[]> = {
  joburi: [
    {
      name: 'position',
      label: 'Poziție / Rol',
      type: 'text',
      placeholder: 'ex: Senior Developer, Manager',
      required: true,
      helperText: 'Titlul pozitiei la care angajezi',
    },
    {
      name: 'experience',
      label: 'Experiență necesară',
      type: 'select',
      required: false,
      options: [
        { value: 'fara-experienta', label: 'Fără experiență' },
        { value: '0-1-ani', label: '0-1 ani' },
        { value: '1-3-ani', label: '1-3 ani' },
        { value: '3-5-ani', label: '3-5 ani' },
        { value: 'peste-5-ani', label: 'Peste 5 ani' },
      ],
    },
    {
      name: 'employmentType',
      label: 'Tip angajare',
      type: 'select',
      required: true,
      options: [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
        { value: 'freelance', label: 'Freelance' },
      ],
    },
    {
      name: 'salary',
      label: 'Salariu (RON/lună)',
      type: 'number',
      placeholder: '3000',
      required: false,
    },
    {
      name: 'salaryNegotiable',
      label: 'Salariu negociabil',
      type: 'radio',
      required: false,
    },
    {
      name: 'skills',
      label: 'Skills necesare (separate cu virgulă)',
      type: 'textarea',
      placeholder: 'React, Node.js, PostgreSQL',
      required: false,
    },
  ],

  imobiliare: [
    {
      name: 'propertyType',
      label: 'Tip proprietate',
      type: 'select',
      required: true,
      options: [
        { value: 'apartament', label: 'Apartament' },
        { value: 'casa', label: 'Casă' },
        { value: 'teren', label: 'Teren' },
        { value: 'spatiu-comercial', label: 'Spațiu comercial' },
        { value: 'birou', label: 'Birou' },
        { value: 'garaj', label: 'Garaj' },
      ],
    },
    {
      name: 'rooms',
      label: 'Număr camere',
      type: 'select',
      required: false,
      options: [
        { value: '1', label: '1 cameră' },
        { value: '2', label: '2 camere' },
        { value: '3', label: '3 camere' },
        { value: '4', label: '4 camere' },
        { value: '5+', label: '5+ camere' },
      ],
    },
    {
      name: 'area',
      label: 'Suprafață (m²)',
      type: 'number',
      placeholder: '85',
      required: false,
    },
    {
      name: 'floor',
      label: 'Etaj',
      type: 'number',
      placeholder: '3',
      required: false,
    },
    {
      name: 'utilities',
      label: 'Utilități incluse (separate cu virgulă)',
      type: 'textarea',
      placeholder: 'Apă, gaz, electricitate, internet',
      required: false,
    },
    {
      name: 'furnishing',
      label: 'Mobilare',
      type: 'select',
      required: false,
      options: [
        { value: 'neamenajat', label: 'Neamenajat' },
        { value: 'partial', label: 'Parțial mobilat' },
        { value: 'complet', label: 'Complet mobilat' },
      ],
    },
    {
      name: 'transactionType',
      label: 'Tip tranzacție',
      type: 'select',
      required: true,
      options: [
        { value: 'inchiriere', label: 'Închiriere' },
        { value: 'vanzare', label: 'Vânzare' },
      ],
    },
  ],

  auto: [
    {
      name: 'brand',
      label: 'Marcă',
      type: 'text',
      placeholder: 'ex: Dacia, Audi, BMW',
      required: true,
    },
    {
      name: 'model',
      label: 'Model',
      type: 'text',
      placeholder: 'ex: Logan, A4, M3',
      required: true,
    },
    {
      name: 'year',
      label: 'Anul fabricației',
      type: 'number',
      placeholder: '2015',
      required: true,
    },
    {
      name: 'mileage',
      label: 'Kilometrajul (km)',
      type: 'number',
      placeholder: '125000',
      required: false,
    },
    {
      name: 'fuel',
      label: 'Tip combustibil',
      type: 'select',
      required: true,
      options: [
        { value: 'benzina', label: 'Benzină' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'gaz', label: 'Gaz' },
        { value: 'hibrid', label: 'Hibrid' },
        { value: 'electric', label: 'Electric' },
      ],
    },
    {
      name: 'transmission',
      label: 'Transmisie',
      type: 'select',
      required: false,
      options: [
        { value: 'manuala', label: 'Manuală' },
        { value: 'automata', label: 'Automată' },
      ],
    },
    {
      name: 'bodyType',
      label: 'Tip caroserie',
      type: 'select',
      required: false,
      options: [
        { value: 'sedan', label: 'Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'hatchback', label: 'Hatchback' },
        { value: 'combi', label: 'Combi' },
        { value: 'mpv', label: 'MPV' },
        { value: 'coupe', label: 'Coupe' },
      ],
    },
    {
      name: 'damage',
      label: 'Stare vehiculului',
      type: 'select',
      required: false,
      options: [
        { value: 'neaccidentat', label: 'Neaccidentat' },
        { value: 'accident-minor', label: 'Accident minor' },
        { value: 'accident-major', label: 'Accident major' },
        { value: 'piese-schimbate', label: 'Piese schimbate' },
      ],
    },
  ],

  servicii: [
    {
      name: 'serviceType',
      label: 'Tip serviciu',
      type: 'select',
      required: true,
      options: [
        { value: 'reparatii', label: 'Reparații' },
        { value: 'curatenie', label: 'Curățenie' },
        { value: 'transport', label: 'Transport' },
        { value: 'it-servicii', label: 'IT & Web' },
        { value: 'tutoring', label: 'Tutoring & Curs' },
        { value: 'design', label: 'Design & Grafică' },
        { value: 'traducere', label: 'Traduceri' },
        { value: 'altele', label: 'Altele' },
      ],
    },
    {
      name: 'availability',
      label: 'Disponibilitate',
      type: 'select',
      required: false,
      options: [
        { value: 'imediat', label: 'Imediat' },
        { value: 'saptamana', label: 'Această săptămână' },
        { value: 'luna', label: 'Această lună' },
        { value: 'negociabil', label: 'Negociabil' },
      ],
    },
    {
      name: 'warranty',
      label: 'Garanție / Siguranță',
      type: 'select',
      required: false,
      options: [
        { value: 'niciuna', label: 'Nicio garanție' },
        { value: '1-luna', label: '1 lună' },
        { value: '3-luni', label: '3 luni' },
        { value: '6-luni', label: '6 luni' },
        { value: '1-an', label: '1 an' },
      ],
    },
    {
      name: 'experience',
      label: 'Ani de experiență',
      type: 'number',
      placeholder: '5',
      required: false,
    },
    {
      name: 'portfolio',
      label: 'Link portofoliu / site',
      type: 'text',
      placeholder: 'https://...',
      required: false,
    },
  ],
}

/**
 * Get form fields for a specific category
 */
export function getFormFieldsForCategory(category: string): FormField[] {
  return CATEGORY_FORM_FIELDS[category] || []
}
