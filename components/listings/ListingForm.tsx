'use client'

import { useState, useEffect, useRef } from 'react'
import { createListing, updateListing } from '@/lib/actions/listings'
import {
  AUTO_BRANDS, AUTO_MODELS, CAROSERIE_TYPES, YEARS,
  TRUCK_BRANDS, TRUCK_BODY_TYPES, UTILITY_BRANDS,
  PIESE_CATEGORIES, AGRICOLE_TYPES, AGRICOLE_BRANDS,
  REMORCI_TYPES, CONSTRUCTII_TYPES, CONSTRUCTII_BRANDS,
  MOTO_BRANDS, MOTO_TYPES, MOTO_CC,
  IMOB_TIP_TRANZACTIE, IMOB_TIP_APARTAMENT, IMOB_COMPARTIMENTARE,
  IMOB_STARE, IMOB_TIP_CASA, IMOB_TIP_TEREN, IMOB_TIP_SPATIU,
  IMOB_FACILITATI, IMOB_ETAJE, IMOB_AN_CONSTRUCTIE,
  JOB_DOMENII, JOB_TIP_CONTRACT, JOB_NIVEL_EXPERIENTA,
  JOB_REGIM_MUNCA, JOB_NIVEL_STUDII, JOB_BENEFICII, JOB_IT_STACK,
  SERVICII_CATEGORII, SERVICII_DISPONIBILITATE, SERVICII_ZONA, SERVICII_EXPERIENTA,
  ELECTRO_STARE, TELEFON_BRANDS, TELEFON_STOCARE, TELEFON_RAM,
  LAPTOP_BRANDS, LAPTOP_RAM, LAPTOP_STOCARE, LAPTOP_DIAGONALA, LAPTOP_OS, LAPTOP_PROCESOR,
  TV_DIAGONALA, TV_REZOLUTIE, TV_TIP, AUDIO_TIP,
  GAMING_PLATFORMA, GAMING_TIP,
  FOTO_TIP, FOTO_BRANDS, TABLETA_STOCARE, TABLETA_CONECTIVITATE,
  MODA_STARE, MODA_GEN, MODA_MARIMI_ADULTI, MODA_MARIMI_PANTOFI, MODA_MARIMI_COPII,
  MODA_MATERIAL, BIJUTERII_TIP, BIJUTERII_MATERIAL, GENTI_TIP,
  CASA_STARE, MOBILA_TIP, MOBILA_MATERIAL, ELECTROCASNICE_TIP, ELECTROCASNICE_BRANDS,
  GRADINA_TIP, DECORARE_TIP, ILUMINAT_TIP, BRICOLAJ_TIP,
  SPORT_STARE, SPORT_TIP, BICICLETA_TIP, BICICLETA_BRANDS, BICICLETA_CADRU,
  FITNESS_TIP, OUTDOOR_TIP, SPORTURI_APA_TIP, SPORTURI_IARNA_TIP,
  ANIMALE_VARSTA, ANIMALE_SEX, CAINI_RASE, PISICI_RASE, ACCESORII_ANIMALE_TIP,
  MAMA_STARE, MAMA_VARSTA_COPIL, MAMA_GEN_COPIL,
  JUCARII_VARSTA, JUCARII_TIP, CARUCIOR_TIP, CARUCIOR_BRANDS,
  MOBILIER_COPII_TIP, INGRIJIRE_TIP,
} from '@/lib/constants/subcategories'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'
import ImageUploader from './ImageUploader'
import Button from '@/components/ui/Button'

// ─── Subcategorii per categorie ──────────────────────────────────
const SUBS: Record<string, { slug: string; name: string; icon: string }[]> = {
  auto: [
    { slug: 'autoturisme', name: 'Autoturisme', icon: '🚗' },
    { slug: 'autoutilitare', name: 'Autoutilitare', icon: '🚐' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'microbuze', name: 'Microbuze/Autobuze', icon: '🚌' },
    { slug: 'rulote', name: 'Rulote/Autorulote', icon: '🏕️' },
    { slug: 'motociclete', name: 'Moto/Scutere/ATV', icon: '🏍️' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'piese', name: 'Piese & Accesorii Auto', icon: '🔩' },
    { slug: 'agricole', name: 'Utilaje Agricole', icon: '🚜' },
    { slug: 'constructii', name: 'Utilaje Construcții', icon: '🏗️' },
    { slug: 'barci', name: 'Bărci/Ambarcațiuni', icon: '⛵' },
  ],
  imobiliare: [
    { slug: 'apartamente', name: 'Apartamente', icon: '🏢' },
    { slug: 'case', name: 'Case & Vile', icon: '🏠' },
    { slug: 'terenuri', name: 'Terenuri', icon: '🌿' },
    { slug: 'spatii-comerciale', name: 'Spații Comerciale', icon: '🏪' },
    { slug: 'birouri', name: 'Birouri', icon: '🏢' },
    { slug: 'garaje', name: 'Garaje & Parcări', icon: '🅿️' },
    { slug: 'cazare', name: 'Cazare/Turism', icon: '🏨' },
  ],
  joburi: [
    { slug: 'it', name: 'IT & Software', icon: '💻' },
    { slug: 'marketing', name: 'Marketing/PR', icon: '📢' },
    { slug: 'vanzari', name: 'Vânzări', icon: '📊' },
    { slug: 'contabilitate', name: 'Finanțe/Contabilitate', icon: '💰' },
    { slug: 'juridic', name: 'Juridic', icon: '⚖️' },
    { slug: 'hr', name: 'HR/Resurse Umane', icon: '👥' },
    { slug: 'inginerie', name: 'Inginerie/Tehnic', icon: '⚙️' },
    { slug: 'constructii', name: 'Construcții', icon: '🔨' },
    { slug: 'transport', name: 'Transport/Logistică', icon: '🚚' },
    { slug: 'horeca', name: 'HoReCa', icon: '🍽️' },
    { slug: 'medical', name: 'Sănătate/Farmacie', icon: '🏥' },
    { slug: 'educatie', name: 'Educație', icon: '🎓' },
    { slug: 'administrativ', name: 'Administrativ/Secretariat', icon: '📋' },
    { slug: 'muncitori', name: 'Muncitori Calificați', icon: '🔧' },
    { slug: 'necalificati', name: 'Necalificați', icon: '👷' },
    { slug: 'alte-joburi', name: 'Altele', icon: '💼' },
  ],
  servicii: [
    { slug: 'reparatii', name: 'Construcții & Renovări', icon: '🏗️' },
    { slug: 'curatenie', name: 'Curățenie', icon: '🧹' },
    { slug: 'transport-serviciu', name: 'Transport & Mutări', icon: '🚚' },
    { slug: 'it-serviciu', name: 'IT & Tehnic', icon: '💻' },
    { slug: 'auto-service', name: 'Auto Service', icon: '🔧' },
    { slug: 'frumusete', name: 'Frumusețe & Wellness', icon: '💅' },
    { slug: 'evenimente', name: 'Evenimente', icon: '🎉' },
    { slug: 'meditatii', name: 'Educație & Meditații', icon: '📚' },
    { slug: 'juridic-financiar', name: 'Juridic & Financiar', icon: '⚖️' },
    { slug: 'sanatate', name: 'Sănătate', icon: '❤️' },
    { slug: 'gradinarit', name: 'Grădină & Exterior', icon: '🌿' },
    { slug: 'animale-servicii', name: 'Animale de companie', icon: '🐾' },
    { slug: 'foto-video', name: 'Foto/Video', icon: '📷' },
    { slug: 'alte-servicii', name: 'Altele', icon: '🔩' },
  ],
  electronice: [
    { slug: 'telefoane', name: 'Telefoane Mobile', icon: '📱' },
    { slug: 'laptopuri', name: 'Laptopuri', icon: '💻' },
    { slug: 'tablete', name: 'Tablete', icon: '📲' },
    { slug: 'desktop', name: 'Desktop PC', icon: '🖥️' },
    { slug: 'tv-audio', name: 'TV & Audio', icon: '📺' },
    { slug: 'gaming', name: 'Console Gaming', icon: '🎮' },
    { slug: 'foto-video', name: 'Camere Foto/Video', icon: '📷' },
    { slug: 'accesorii-electronice', name: 'Accesorii', icon: '🔌' },
    { slug: 'componente-pc', name: 'Componente PC', icon: '💾' },
    { slug: 'alte-electronice', name: 'Alte Electronice', icon: '🔋' },
  ],
  moda: [
    { slug: 'haine-femei', name: 'Îmbrăcăminte Femei', icon: '👗' },
    { slug: 'haine-barbati', name: 'Îmbrăcăminte Bărbați', icon: '👔' },
    { slug: 'haine-copii', name: 'Îmbrăcăminte Copii', icon: '🧒' },
    { slug: 'incaltaminte-femei', name: 'Încălțăminte Femei', icon: '👠' },
    { slug: 'incaltaminte-barbati', name: 'Încălțăminte Bărbați', icon: '👟' },
    { slug: 'incaltaminte-copii', name: 'Încălțăminte Copii', icon: '👞' },
    { slug: 'genti-accesorii', name: 'Genți & Accesorii', icon: '👜' },
    { slug: 'bijuterii', name: 'Bijuterii & Ceasuri', icon: '💍' },
    { slug: 'ochelari', name: 'Ochelari', icon: '👓' },
    { slug: 'lenjerie', name: 'Lenjerie & Costum Baie', icon: '👙' },
  ],
  'casa-gradina': [
    { slug: 'mobila', name: 'Mobilă', icon: '🛋️' },
    { slug: 'electrocasnice', name: 'Electrocasnice', icon: '🫙' },
    { slug: 'decoratiuni', name: 'Decorațiuni', icon: '🖼️' },
    { slug: 'iluminat', name: 'Iluminat', icon: '💡' },
    { slug: 'gradina', name: 'Grădină & Exterior', icon: '🌿' },
    { slug: 'unelte', name: 'Bricolaj & Unelte', icon: '🔨' },
    { slug: 'textile', name: 'Textile Casă', icon: '🛏️' },
    { slug: 'bucatarie', name: 'Bucătărie', icon: '🍳' },
    { slug: 'baie', name: 'Baie', icon: '🚿' },
    { slug: 'alte-casa', name: 'Altele', icon: '🏠' },
  ],
  sport: [
    { slug: 'fitness', name: 'Fitness & Sală', icon: '💪' },
    { slug: 'biciclete', name: 'Biciclete', icon: '🚴' },
    { slug: 'sporturi-apa', name: 'Sporturi de Apă', icon: '🏄' },
    { slug: 'sporturi-iarna', name: 'Sporturi de Iarnă', icon: '⛷️' },
    { slug: 'sporturi-echipa', name: 'Fotbal & Sporturi de Echipă', icon: '⚽' },
    { slug: 'tenis', name: 'Tenis & Sporturi cu Racheta', icon: '🎾' },
    { slug: 'running', name: 'Running & Atletism', icon: '🏃' },
    { slug: 'arte-martiale', name: 'Arte Marțiale', icon: '🥋' },
    { slug: 'outdoor', name: 'Outdoor & Camping', icon: '🏕️' },
    { slug: 'extreme', name: 'Sporturi Extreme', icon: '🪂' },
    { slug: 'echipament-sport', name: 'Echipament Sportiv General', icon: '🏅' },
  ],
  animale: [
    { slug: 'caini', name: 'Câini', icon: '🐕' },
    { slug: 'pisici', name: 'Pisici', icon: '🐈' },
    { slug: 'pesti', name: 'Pești & Acvaristică', icon: '🐠' },
    { slug: 'pasari', name: 'Păsări', icon: '🦜' },
    { slug: 'rozatoare', name: 'Rozătoare', icon: '🐹' },
    { slug: 'reptile', name: 'Reptile & Amfibieni', icon: '🦎' },
    { slug: 'accesorii-animale', name: 'Accesorii Animale', icon: '🦴' },
    { slug: 'hrana', name: 'Hrană & Îngrijire', icon: '🥩' },
    { slug: 'alte-animale', name: 'Alte animale', icon: '🐾' },
  ],
  'mama-copilul': [
    { slug: 'carucioare', name: 'Cărucioare & Scaune Auto', icon: '🍼' },
    { slug: 'scaune-auto', name: 'Scaune Auto Copii', icon: '🚗' },
    { slug: 'mobilier-copii', name: 'Mobilier Copii', icon: '🛏️' },
    { slug: 'haine-bebe', name: 'Haine Copii', icon: '👶' },
    { slug: 'jucarii', name: 'Jucării & Jocuri', icon: '🧸' },
    { slug: 'alaptare', name: 'Alăptare & Hrănire', icon: '🍼' },
    { slug: 'siguranta', name: 'Siguranță Copii', icon: '🛡️' },
    { slug: 'ingrijire', name: 'Îngrijire Bebeluși', icon: '👶' },
    { slug: 'carti-educative', name: 'Cărți & Educație', icon: '📚' },
    { slug: 'alte-mama-copilul', name: 'Altele', icon: '🎀' },
  ],
}

const MAIN_CATS = [
  { slug: 'auto', name: 'Auto', icon: '🚗' },
  { slug: 'imobiliare', name: 'Imobiliare', icon: '🏠' },
  { slug: 'joburi', name: 'Joburi', icon: '💼' },
  { slug: 'servicii', name: 'Servicii', icon: '🔧' },
  { slug: 'electronice', name: 'Electronice', icon: '📱' },
  { slug: 'moda', name: 'Modă', icon: '👗' },
  { slug: 'casa-gradina', name: 'Casă & Grădină', icon: '🏡' },
  { slug: 'sport', name: 'Sport', icon: '⚽' },
  { slug: 'animale', name: 'Animale', icon: '🐾' },
  { slug: 'mama-copilul', name: 'Mama & Copilul', icon: '👶' },
]

// ─── Helpers ──────────────────────────────────────────────────────
const lbl = (text: string, required = false) => (
  <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>
    {text}{required && <span style={{ color: '#f87171' }}> *</span>}
  </label>
)

const sc = 'px-3 py-2.5 rounded-lg text-sm focus:outline-none w-full'
const ic = 'px-3 py-2.5 rounded-lg text-sm focus:outline-none w-full'
const ss = {
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-card-hover)',
  border: '1px solid var(--border-subtle)',
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all duration-200"
      style={{
        background: active ? 'rgba(59,130,246,0.15)' : 'var(--bg-card-hover)',
        borderColor: active ? 'var(--blue-electric)' : 'var(--border-subtle)',
        color: active ? '#60a5fa' : 'var(--text-secondary)',
      }}>
      {children}
    </button>
  )
}

function MultiChips({ val, set, options }: { val: string[]; set: (v: string[]) => void; options: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <Chip key={o} active={val.includes(o)} onClick={() => set(val.includes(o) ? val.filter(x => x !== o) : [...val, o])}>{o}</Chip>
      ))}
    </div>
  )
}

function SelField({ label, val, set, options, required = false, placeholder = 'Alege...' }: { label: string; val: string; set: (v: string) => void; options: readonly string[]; required?: boolean; placeholder?: string }) {
  return (
    <div>
      {lbl(label, required)}
      <select value={val} onChange={e => set(e.target.value)} style={ss} className={sc}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function InputField({ label, val, set, type = 'text', required = false, placeholder = '' }: { label: string; val: string; set: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      {lbl(label, required)}
      <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
        style={ss} className={ic} />
    </div>
  )
}

function ChipsField({ label, val, set, options }: { label: string; val: string; set: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      {lbl(label)}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => <Chip key={o} active={val === o} onClick={() => set(val === o ? '' : o)}>{o}</Chip>)}
      </div>
    </div>
  )
}

// ─── Category reverse map ─────────────────────────────────────
const CAT_SLUG_BY_ID: Record<number, string> = {
  1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii',
  5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport',
  9: 'animale', 10: 'mama-copilul',
}

interface ListingFormProps {
  initialData?: any // existing listing for edit mode
}

// ════════════════════════════════════════════════════════════════
export default function ListingForm({ initialData }: ListingFormProps = {}) {
  const isEditMode = !!initialData?.id
  const initMeta = initialData?.metadata || {}
  const initMainCat = initialData ? (CAT_SLUG_BY_ID[initialData.category_id] || '') : ''
  const initSubCat = initMeta.subcategory || ''

  const [step, setStep] = useState(isEditMode ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>(initialData?.images || [])

  // Bid Popup after publish
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [showBidPopup, setShowBidPopup] = useState(false)
  const [bidActivating, setBidActivating] = useState(false)
  const [bidHours, setBidHours] = useState(3)

  // AI Image Analysis
  const analyzingRef = useRef(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiLoadStep, setAiLoadStep] = useState(0)
  const [aiError, setAiError] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<{
    title: string; description: string; category: string; subcategory: string;
    condition: string; brand: string | null; tags: string[]; confidence: number;
    _visualDescription?: string;
    details?: {
      auto?: {
        model: string | null; year: number | null; mileage: number | null;
        fuel: string | null; transmission: string | null; bodyType: string | null;
        damage: string | null; color: string | null;
      }
    }
  } | null>(null)
  const [aiAnalysisAccepted, setAiAnalysisAccepted] = useState(false)

  // AI Price Suggestion
  const [aiPriceLoading, setAiPriceLoading] = useState(false)
  const [aiPrice, setAiPrice] = useState<{
    currency: string; min: number; max: number; suggested: number;
    reasoning: string; tips: string[];
  } | null>(null)

  // Category
  const [mainCat, setMainCat] = useState(initMainCat)
  const [subCat, setSubCat] = useState(initSubCat)

  // Common
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '')
  const [priceType, setPriceType] = useState(initialData?.price_type || 'fix')
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR')

  // AUTO - common
  const [brand, setBrand] = useState(initMeta.brand || '')
  const [model, setModel] = useState(initMeta.model || '')
  const [fuel, setFuel] = useState(initMeta.fuelType || '')
  const [year, setYear] = useState(initMeta.year || '')
  const [km, setKm] = useState(initMeta.mileage || '')
  const [bodyType, setBodyType] = useState(initMeta.bodyType || initMeta.car_body || '')
  const [sellerType, setSellerType] = useState(initMeta.sellerType || '')
  const [leasing, setLeasing] = useState(initMeta.leasing || false)
  const [engineSize, setEngineSize] = useState(initMeta.engineSize || '')
  const [power, setPower] = useState(initMeta.power || '')
  const [gearbox, setGearbox] = useState(initMeta.gearbox || '')
  const [color, setColor] = useState(initMeta.color || '')
  const [doorsNr, setDoorsNr] = useState(initMeta.doorsNr || '')
  const [condition, setCondition] = useState(initMeta.condition || initMeta.state || '')
  // AUTO - autoutilitare
  const [maxMass, setMaxMass] = useState(initMeta.maxMass || '')
  const [cargo, setCargo] = useState(initMeta.cargo || '')
  const [seatsNr, setSeatsNr] = useState(initMeta.seatsNr || '')
  // AUTO - piese
  const [pieseCategory, setPieseCategory] = useState(initMeta.pieseCategory || '')
  const [pieseStare, setPieseStare] = useState(initMeta.pieseStare || '')
  // AUTO - agricole
  const [agricolType, setAgricolType] = useState(initMeta.agricolType || '')
  const [agricolBrand, setAgricolBrand] = useState(initMeta.agricolBrand || '')
  const [hp, setHp] = useState(initMeta.hp || '')
  const [workHours, setWorkHours] = useState(initMeta.workHours || '')
  // AUTO - remorci
  const [remorcaType, setRemorcaType] = useState(initMeta.remorcaType || '')
  const [remorcaCapacity, setRemorcaCapacity] = useState(initMeta.remorcaCapacity || '')
  // AUTO - camioane
  const [truckBrand, setTruckBrand] = useState(initMeta.truckBrand || '')
  const [truckModel, setTruckModel] = useState(initMeta.truckModel || '')
  const [truckBody, setTruckBody] = useState(initMeta.truckBody || '')
  const [truckTone, setTruckTone] = useState(initMeta.truckTone || '')
  const [truckOsii, setTruckOsii] = useState(initMeta.truckOsii || '')
  // AUTO - utilaje constructii
  const [utilajType, setUtilajType] = useState(initMeta.utilajType || '')
  const [utilajBrand, setUtilajBrand] = useState(initMeta.utilajBrand || '')
  // MOTO
  const [motoBrand, setMotoBrand] = useState(initMeta.motoBrand || '')
  const [motoType, setMotoType] = useState(initMeta.motoType || '')
  const [motoCC, setMotoCC] = useState(initMeta.motoCC || '')

  // IMOBILIARE
  const [tipTranzactie, setTipTranzactie] = useState(initMeta.tipTranzactie || '')
  const [tipApartament, setTipApartament] = useState(initMeta.tipApartament || '')
  const [compartimentare, setCompartimentare] = useState(initMeta.compartimentare || '')
  const [etaj, setEtaj] = useState(initMeta.etaj || '')
  const [suprafata, setSuprafata] = useState(initMeta.suprafata || '')
  const [suprafataTeren, setSuprafataTeren] = useState(initMeta.suprafataTeren || '')
  const [stareImob, setStareImob] = useState(initMeta.stareImob || '')
  const [anConstructie, setAnConstructie] = useState(initMeta.anConstructie || '')
  const [tipCasa, setTipCasa] = useState(initMeta.tipCasa || '')
  const [nrCamere, setNrCamere] = useState(initMeta.nrCamere || '')
  const [nrBai, setNrBai] = useState(initMeta.nrBai || '')
  const [tipTeren, setTipTeren] = useState(initMeta.tipTeren || '')
  const [tipSpatiu, setTipSpatiu] = useState(initMeta.tipSpatiu || '')
  const [facilitati, setFacilitati] = useState<string[]>(initMeta.facilitati || [])

  // JOBURI
  const [jobDomeniu, setJobDomeniu] = useState(initMeta.jobDomeniu || '')
  const [jobCompanie, setJobCompanie] = useState(initMeta.jobCompanie || '')
  const [tipContract, setTipContract] = useState(initMeta.tipContract || '')
  const [regimMunca, setRegimMunca] = useState(initMeta.regimMunca || '')
  const [nivelExperienta, setNivelExperienta] = useState(initMeta.nivelExperienta || '')
  const [nivelStudii, setNivelStudii] = useState(initMeta.nivelStudii || '')
  const [salariuFrom, setSalariuFrom] = useState(initMeta.salariuFrom || '')
  const [salariuTo, setSalariuTo] = useState(initMeta.salariuTo || '')
  const [beneficii, setBeneficii] = useState<string[]>(initMeta.beneficii || [])
  const [itStack, setItStack] = useState<string[]>(initMeta.itStack || [])

  // SERVICII
  const [serviciiCategorie, setServiciiCategorie] = useState(initMeta.serviciiCategorie || '')
  const [disponibilitate, setDisponibilitate] = useState(initMeta.disponibilitate || '')
  const [zona, setZona] = useState(initMeta.zona || '')
  const [experienta, setExperienta] = useState(initMeta.experienta || '')

  // ELECTRONICE
  const [electroStare, setElectroStare] = useState(initMeta.electroStare || '')
  const [telefonBrand, setTelefonBrand] = useState(initMeta.telefonBrand || '')
  const [telefonStoraj, setTelefonStoraj] = useState(initMeta.telefonStoraj || '')
  const [telefonRam, setTelefonRam] = useState(initMeta.telefonRam || '')
  const [laptopBrand, setLaptopBrand] = useState(initMeta.laptopBrand || '')
  const [laptopRam, setLaptopRam] = useState(initMeta.laptopRam || '')
  const [laptopStoraj, setLaptopStoraj] = useState(initMeta.laptopStoraj || '')
  const [laptopDiag, setLaptopDiag] = useState(initMeta.laptopDiag || '')
  const [laptopOs, setLaptopOs] = useState(initMeta.laptopOs || '')
  const [laptopProcesor, setLaptopProcesor] = useState(initMeta.laptopProcesor || '')
  const [tvDiag, setTvDiag] = useState(initMeta.tvDiag || '')
  const [tvRez, setTvRez] = useState(initMeta.tvRez || '')
  const [tvTip, setTvTip] = useState(initMeta.tvTip || '')
  const [audioTip, setAudioTip] = useState(initMeta.audioTip || '')
  const [gamingPlatforma, setGamingPlatforma] = useState(initMeta.gamingPlatforma || '')
  const [gamingTip, setGamingTip] = useState(initMeta.gamingTip || '')
  const [fotoTip, setFotoTip] = useState(initMeta.fotoTip || '')
  const [fotoBrand, setFotoBrand] = useState(initMeta.fotoBrand || '')
  const [tabletaStoraj, setTabletaStoraj] = useState(initMeta.tabletaStoraj || '')
  const [tabletaConect, setTabletaConect] = useState(initMeta.tabletaConect || '')

  // MODĂ
  const [modaStare, setModaStare] = useState(initMeta.modaStare || '')
  const [modaGen, setModaGen] = useState(initMeta.modaGen || '')
  const [modaMarimiAdulti, setModaMarimiAdulti] = useState(initMeta.modaMarimiAdulti || '')
  const [modaMarimiPantofi, setModaMarimiPantofi] = useState(initMeta.modaMarimiPantofi || '')
  const [modaMarimiCopii, setModaMarimiCopii] = useState(initMeta.modaMarimiCopii || '')
  const [modaMaterial, setModaMaterial] = useState(initMeta.modaMaterial || '')
  const [bijuteriiTip, setBijuteriiTip] = useState(initMeta.bijuteriiTip || '')
  const [bijuteriiMaterial, setBijuteriiMaterial] = useState(initMeta.bijuteriiMaterial || '')
  const [gentiTip, setGentiTip] = useState(initMeta.gentiTip || '')

  // CASĂ & GRĂDINĂ
  const [casaStare, setCasaStare] = useState(initMeta.casaStare || '')
  const [mobilaTip, setMobilaTip] = useState(initMeta.mobilaTip || '')
  const [mobilaMaterial, setMobilaMaterial] = useState(initMeta.mobilaMaterial || '')
  const [electrocasniceTip, setElectrocasniceTip] = useState(initMeta.electrocasniceTip || '')
  const [electrocasniceBrand, setElectrocasniceBrand] = useState(initMeta.electrocasniceBrand || '')
  const [gradinaTip, setGradinaTip] = useState(initMeta.gradinaTip || '')
  const [decorareTip, setDecoriareTip] = useState(initMeta.decorareTip || '')
  const [iluminatTip, setIluminatTip] = useState(initMeta.iluminatTip || '')
  const [bricolajTip, setBricolajTip] = useState(initMeta.bricolajTip || '')

  // SPORT
  const [sportStare, setSportStare] = useState(initMeta.sportStare || '')
  const [sportTip, setSportTip] = useState(initMeta.sportTip || '')
  const [bicicletaTip, setBicicletaTip] = useState(initMeta.bicicletaTip || '')
  const [bicicletaBrand, setBicicletaBrand] = useState(initMeta.bicicletaBrand || '')
  const [bicicletaCadru, setBicicletaCadru] = useState(initMeta.bicicletaCadru || '')
  const [fitnessTip, setFitnessTip] = useState(initMeta.fitnessTip || '')
  const [outdoorTip, setOutdoorTip] = useState(initMeta.outdoorTip || '')
  const [sporturiApaTip, setSporturiApaTip] = useState(initMeta.sporturiApaTip || '')
  const [sporturiIarnaTip, setSporturiIarnaTip] = useState(initMeta.sporturiIarnaTip || '')

  // ANIMALE
  const [animaleVarsta, setAnimaleVarsta] = useState(initMeta.animaleVarsta || '')
  const [animaleSex, setAnimaleSex] = useState(initMeta.animaleSex || '')
  const [cainRasa, setCainRasa] = useState(initMeta.cainRasa || '')
  const [pisicaRasa, setPisicaRasa] = useState(initMeta.pisicaRasa || '')
  const [pedigree, setPedigree] = useState(initMeta.pedigree || '')
  const [vaccinat, setVaccinat] = useState(initMeta.vaccinat || '')
  const [castrat, setCastrat] = useState(initMeta.castrat || '')
  const [microcip, setMicrocip] = useState(initMeta.microcip || '')
  const [accesoriiAnimaleTip, setAccesoriiAnimaleTip] = useState(initMeta.accesoriiAnimaleTip || '')

  // MAMĂ & COPILUL
  const [mamaStare, setMamaStare] = useState(initMeta.mamaStare || '')
  const [mamaVarstaCopil, setMamaVarstaCopil] = useState(initMeta.mamaVarstaCopil || '')
  const [mamaGenCopil, setMamaGenCopil] = useState(initMeta.mamaGenCopil || '')
  const [jucariiVarsta, setJucariiVarsta] = useState(initMeta.jucariiVarsta || '')
  const [jucariiTip, setJucariiTip] = useState(initMeta.jucariiTip || '')
  const [caruciTip, setCaruciTip] = useState(initMeta.caruciTip || '')
  const [caruciiBrand, setCaruciiBrand] = useState(initMeta.caruciiBrand || '')
  const [mobilierCopiiTip, setMobilierCopiiTip] = useState(initMeta.mobilierCopiiTip || '')
  const [ingrijireTip, setIngrijireTip] = useState(initMeta.ingrijireTip || '')

  // Contact
  const [contactPhone, setContactPhone] = useState(initMeta.contactPhone || '')

  // AI load step cycle
  useEffect(() => {
    if (!aiAnalyzing) { setAiLoadStep(0); return }
    const msgs = ['AI analizează produsul...', 'Se generează titlul...', 'Se calculează prețul...']
    const t = setInterval(() => setAiLoadStep(s => (s + 1) % msgs.length), 1500)
    return () => clearInterval(t)
  }, [aiAnalyzing])

  const availableModels = brand && AUTO_MODELS[brand] ? AUTO_MODELS[brand] : []
  const subs = SUBS[mainCat] || []

  function handleCatSelect(cat: string) {
    setMainCat(cat)
    setSubCat('')
    setCurrency(cat === 'joburi' ? 'RON' : 'EUR')
  }

  async function analyzeImages(uploadedImages: string[]) {
    if (!uploadedImages.length || analyzingRef.current) return
    analyzingRef.current = true
    setAiAnalyzing(true)
    setAiAnalysis(null)
    setAiError('')
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadedImages[0] }),
      })
      const data = await res.json()
      if (!data.ok || !data.result) {
        setAiError(`AI eroare: ${data.error || 'necunoscut'}${data.detail ? ' — ' + data.detail.slice(0, 120) : ''}. Completează manual.`)
        return
      }
      const result = data.result
      setAiAnalysis(result)
    } catch {
      setAiError('Eroare conexiune AI. Completează manual.')
    } finally {
      setAiAnalyzing(false)
      analyzingRef.current = false
    }
  }

  function acceptAiAnalysis() {
    if (!aiAnalysis) return
    setTitle(aiAnalysis.title || '')
    setDescription(aiAnalysis.description || '')
    // mapare categorie
    const catMap: Record<string, string> = {
      'auto': 'auto', 'imobiliare': 'imobiliare', 'electronice': 'electronice',
      'moda': 'moda', 'casa-gradina': 'casa-gradina', 'sport': 'sport',
      'animale': 'animale', 'mama-copilul': 'mama-copilul',
      'servicii': 'servicii', 'joburi': 'joburi',
    }
    const detectedCat = catMap[aiAnalysis.category] || ''
    if (detectedCat) {
      handleCatSelect(detectedCat)
      // setează subcategorie dacă există
      const detectedSubs = SUBS[detectedCat] || []
      const matchedSub = detectedSubs.find(s =>
        s.slug === aiAnalysis.subcategory ||
        s.name.toLowerCase().includes(aiAnalysis.subcategory?.toLowerCase() || '')
      )
      if (matchedSub) setSubCat(matchedSub.slug)
    }
    if (aiAnalysis.brand) setBrand(aiAnalysis.brand)
    if (aiAnalysis.condition) setCondition(aiAnalysis.condition)
    // Populare câmpuri auto din details
    const autoD = aiAnalysis.details?.auto
    if (autoD) {
      if (autoD.model) setModel(autoD.model)
      if (autoD.year) setYear(String(autoD.year))
      if (autoD.mileage) setKm(String(autoD.mileage))
      if (autoD.fuel) setFuel(autoD.fuel)
      if (autoD.transmission) setGearbox(autoD.transmission)
      if (autoD.bodyType) setBodyType(autoD.bodyType)
      if (autoD.color) setColor(autoD.color)
    }
    setAiAnalysisAccepted(true)
    setStep(1)
  }

  async function suggestPrice() {
    if (!title && !aiAnalysis?.title) return
    setAiPriceLoading(true)
    setAiPrice(null)
    try {
      const res = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || aiAnalysis?.title,
          description: description || aiAnalysis?.description,
          category: mainCat || aiAnalysis?.category,
          subcategory: subCat || aiAnalysis?.subcategory,
          condition: condition || aiAnalysis?.condition,
          brand: brand || aiAnalysis?.brand,
          city,
        }),
      })
      const data = await res.json()
      if (data.ok && data.result) {
        setAiPrice(data.result)
        // pre-fill prețul sugerat
        if (data.result.suggested) {
          setPrice(String(data.result.suggested))
          setCurrency(data.result.currency || currency)
        }
      }
    } catch {
      // eșuat — nu blocăm
    } finally {
      setAiPriceLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 0) {
      setStep(1); return
    }
    if (step === 1 && !isEditMode) {
      if (!mainCat) { setError('Alege o categorie'); return }
      if (!title || !description) { setError('Completează titlul și descrierea'); return }
      setError(''); setStep(2); return
    }

    setLoading(true); setError('')
    try {
      if (isEditMode) {
        // Build full metadata for edit
        const isAuto = mainCat === 'auto'
        const metadata: Record<string, any> = {}
        if (subCat) metadata.subcategory = subCat
        if (isAuto) {
          if (brand || truckBrand || motoBrand) metadata.brand = brand || truckBrand || motoBrand
          if (model || truckModel) metadata.model = model || truckModel
          if (fuel) metadata.fuelType = fuel
          if (year) metadata.year = year
          if (km) metadata.mileage = km
          if (gearbox) metadata.gearbox = gearbox
          if (power) metadata.power = power
          if (condition) metadata.condition = condition
          if (bodyType || truckBody) metadata.bodyType = bodyType || truckBody
          if (sellerType) metadata.sellerType = sellerType
          if (leasing) metadata.leasing = leasing
          if (engineSize) metadata.engineSize = engineSize
          if (color) metadata.color = color
          if (doorsNr) metadata.doorsNr = doorsNr
          if (maxMass) metadata.maxMass = maxMass
          if (cargo) metadata.cargo = cargo
          if (seatsNr) metadata.seatsNr = seatsNr
          if (pieseCategory) metadata.pieseCategory = pieseCategory
          if (pieseStare) metadata.pieseStare = pieseStare
          if (agricolType) metadata.agricolType = agricolType
          if (agricolBrand) metadata.agricolBrand = agricolBrand
          if (hp) metadata.hp = hp
          if (workHours) metadata.workHours = workHours
          if (remorcaType) metadata.remorcaType = remorcaType
          if (remorcaCapacity) metadata.remorcaCapacity = remorcaCapacity
          if (truckTone) metadata.truckTone = truckTone
          if (truckOsii) metadata.truckOsii = truckOsii
          if (utilajType) metadata.utilajType = utilajType
          if (utilajBrand) metadata.utilajBrand = utilajBrand
          if (motoBrand) metadata.motoBrand = motoBrand
          if (motoType) metadata.motoType = motoType
          if (motoCC) metadata.motoCC = motoCC
        }
        if (mainCat === 'imobiliare') {
          if (tipTranzactie) metadata.tipTranzactie = tipTranzactie
          if (tipApartament) metadata.tipApartament = tipApartament
          if (compartimentare) metadata.compartimentare = compartimentare
          if (etaj) metadata.etaj = etaj
          if (suprafata) metadata.suprafata = suprafata
          if (suprafataTeren) metadata.suprafataTeren = suprafataTeren
          if (stareImob) metadata.stareImob = stareImob
          if (anConstructie) metadata.anConstructie = anConstructie
          if (tipCasa) metadata.tipCasa = tipCasa
          if (nrCamere) metadata.nrCamere = nrCamere
          if (nrBai) metadata.nrBai = nrBai
          if (tipTeren) metadata.tipTeren = tipTeren
          if (tipSpatiu) metadata.tipSpatiu = tipSpatiu
          if (facilitati.length) metadata.facilitati = facilitati
        }
        if (mainCat === 'joburi') {
          if (jobDomeniu) metadata.jobDomeniu = jobDomeniu
          if (jobCompanie) metadata.jobCompanie = jobCompanie
          if (tipContract) metadata.tipContract = tipContract
          if (regimMunca) metadata.regimMunca = regimMunca
          if (nivelExperienta) metadata.nivelExperienta = nivelExperienta
          if (nivelStudii) metadata.nivelStudii = nivelStudii
          if (salariuFrom) metadata.salariuFrom = salariuFrom
          if (salariuTo) metadata.salariuTo = salariuTo
          if (beneficii.length) metadata.beneficii = beneficii
          if (itStack.length) metadata.itStack = itStack
        }
        if (mainCat === 'servicii') {
          if (serviciiCategorie) metadata.serviciiCategorie = serviciiCategorie
          if (disponibilitate) metadata.disponibilitate = disponibilitate
          if (zona) metadata.zona = zona
          if (experienta) metadata.experienta = experienta
        }
        if (mainCat === 'electronice') {
          if (electroStare) metadata.electroStare = electroStare
          if (telefonBrand) metadata.telefonBrand = telefonBrand
          if (telefonStoraj) metadata.telefonStoraj = telefonStoraj
          if (telefonRam) metadata.telefonRam = telefonRam
          if (laptopBrand) metadata.laptopBrand = laptopBrand
          if (laptopRam) metadata.laptopRam = laptopRam
          if (laptopStoraj) metadata.laptopStoraj = laptopStoraj
          if (laptopDiag) metadata.laptopDiag = laptopDiag
          if (laptopOs) metadata.laptopOs = laptopOs
          if (laptopProcesor) metadata.laptopProcesor = laptopProcesor
          if (tvDiag) metadata.tvDiag = tvDiag
          if (tvRez) metadata.tvRez = tvRez
          if (tvTip) metadata.tvTip = tvTip
          if (audioTip) metadata.audioTip = audioTip
          if (gamingPlatforma) metadata.gamingPlatforma = gamingPlatforma
          if (gamingTip) metadata.gamingTip = gamingTip
          if (fotoTip) metadata.fotoTip = fotoTip
          if (fotoBrand) metadata.fotoBrand = fotoBrand
          if (tabletaStoraj) metadata.tabletaStoraj = tabletaStoraj
          if (tabletaConect) metadata.tabletaConect = tabletaConect
        }
        if (mainCat === 'moda') {
          if (modaStare) metadata.modaStare = modaStare
          if (modaGen) metadata.modaGen = modaGen
          if (modaMarimiAdulti) metadata.modaMarimiAdulti = modaMarimiAdulti
          if (modaMarimiPantofi) metadata.modaMarimiPantofi = modaMarimiPantofi
          if (modaMarimiCopii) metadata.modaMarimiCopii = modaMarimiCopii
          if (modaMaterial) metadata.modaMaterial = modaMaterial
          if (bijuteriiTip) metadata.bijuteriiTip = bijuteriiTip
          if (bijuteriiMaterial) metadata.bijuteriiMaterial = bijuteriiMaterial
          if (gentiTip) metadata.gentiTip = gentiTip
        }
        if (mainCat === 'casa-gradina') {
          if (casaStare) metadata.casaStare = casaStare
          if (mobilaTip) metadata.mobilaTip = mobilaTip
          if (mobilaMaterial) metadata.mobilaMaterial = mobilaMaterial
          if (electrocasniceTip) metadata.electrocasniceTip = electrocasniceTip
          if (electrocasniceBrand) metadata.electrocasniceBrand = electrocasniceBrand
          if (gradinaTip) metadata.gradinaTip = gradinaTip
          if (decorareTip) metadata.decorareTip = decorareTip
          if (iluminatTip) metadata.iluminatTip = iluminatTip
          if (bricolajTip) metadata.bricolajTip = bricolajTip
        }
        if (mainCat === 'sport') {
          if (sportStare) metadata.sportStare = sportStare
          if (sportTip) metadata.sportTip = sportTip
          if (bicicletaTip) metadata.bicicletaTip = bicicletaTip
          if (bicicletaBrand) metadata.bicicletaBrand = bicicletaBrand
          if (bicicletaCadru) metadata.bicicletaCadru = bicicletaCadru
          if (fitnessTip) metadata.fitnessTip = fitnessTip
          if (outdoorTip) metadata.outdoorTip = outdoorTip
          if (sporturiApaTip) metadata.sporturiApaTip = sporturiApaTip
          if (sporturiIarnaTip) metadata.sporturiIarnaTip = sporturiIarnaTip
        }
        if (mainCat === 'animale') {
          if (animaleVarsta) metadata.animaleVarsta = animaleVarsta
          if (animaleSex) metadata.animaleSex = animaleSex
          if (cainRasa) metadata.cainRasa = cainRasa
          if (pisicaRasa) metadata.pisicaRasa = pisicaRasa
          if (pedigree) metadata.pedigree = pedigree
          if (vaccinat) metadata.vaccinat = vaccinat
          if (castrat) metadata.castrat = castrat
          if (microcip) metadata.microcip = microcip
          if (accesoriiAnimaleTip) metadata.accesoriiAnimaleTip = accesoriiAnimaleTip
        }
        if (mainCat === 'mama-copilul') {
          if (mamaStare) metadata.mamaStare = mamaStare
          if (mamaVarstaCopil) metadata.mamaVarstaCopil = mamaVarstaCopil
          if (mamaGenCopil) metadata.mamaGenCopil = mamaGenCopil
          if (jucariiVarsta) metadata.jucariiVarsta = jucariiVarsta
          if (jucariiTip) metadata.jucariiTip = jucariiTip
          if (caruciTip) metadata.caruciTip = caruciTip
          if (caruciiBrand) metadata.caruciiBrand = caruciiBrand
          if (mobilierCopiiTip) metadata.mobilierCopiiTip = mobilierCopiiTip
          if (ingrijireTip) metadata.ingrijireTip = ingrijireTip
        }
        if (contactPhone) metadata.contactPhone = contactPhone
        // Preserve sold_at if listing was vandut (shouldn't happen from edit but just in case)
        if (initialData?.metadata?.sold_at) metadata.sold_at = initialData.metadata.sold_at

        const result = await updateListing(initialData.id, {
          title, description, city, county: city,
          price: price ? Number(price) : undefined,
          priceType, currency, images, metadata,
          categorySlug: subCat || mainCat,
        })
        if (result?.error) {
          setError(result.error)
          setLoading(false)
        } else if (result?.id) {
          window.location.href = `/anunt/${initialData.id}`
        }
      } else {
        const result = await createListing({
          title, description,
          categorySlug: subCat || mainCat,
          categoryName: subs.find(s => s.slug === subCat)?.name || MAIN_CATS.find(c => c.slug === mainCat)?.name || mainCat,
          city, county: city,
          price: price ? Number(price) : undefined,
          priceType, currency, images,
          brand: brand || truckBrand || motoBrand || undefined,
          model: model || truckModel || undefined,
          fuelType: fuel || undefined,
          year: year || undefined,
          mileage: km || undefined,
          bodyType: bodyType || truckBody || undefined,
          sellerType: sellerType || undefined,
          leasing,
          gearbox: gearbox || undefined,
          power: power || undefined,
          condition: condition || undefined,
          contactPhone: contactPhone || undefined,
        })
        if (result?.error) {
          setError(result.error)
          setLoading(false)
        } else if (result?.id) {
          setPublishedId(result.id)
          setShowBidPopup(true)
          setLoading(false)
        }
      }
    } catch (err: any) {
      setError('Eroare la postare. Încearcă din nou.')
      setLoading(false)
    }
  }

  // ─── STEP 2 FIELDS per categorie ────────────────────────────────
  function renderAutoFields() {
    if (subCat === 'autoutilitare') return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelField label="🏭 Marcă" val={brand} set={v => { setBrand(v); setModel('') }} options={UTILITY_BRANDS} />
          <div>
            {lbl('📋 Model')}
            {availableModels.length > 0
              ? <select value={model} onChange={e => setModel(e.target.value)} style={ss} className={sc}><option value="">Toate</option>{availableModels.map(m => <option key={m} value={m}>{m}</option>)}</select>
              : <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder={brand ? 'Model...' : 'Alege marca'} disabled={!brand} style={ss} className={ic + ' disabled:bg-gray-100'} />}
          </div>
        </div>
        <ChipsField label="⛽ Combustibil" val={fuel} set={setFuel} options={['Benzină', 'Diesel', 'Electric', 'GPL', 'Hybrid']} />
        <ChipsField label="⚙️ Cutie de viteze" val={gearbox} set={setGearbox} options={['Manuală', 'Automată', 'Semi-automată']} />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An" val={year} set={setYear} options={YEARS} />
          <InputField label="🛣️ Kilometri" val={km} set={setKm} type="number" placeholder="ex: 120000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="⚖️ Masă max (kg)" val={maxMass} set={setMaxMass} type="number" placeholder="ex: 3500" />
          <InputField label="📦 Volum cargo (m³)" val={cargo} set={setCargo} type="number" placeholder="ex: 8" />
        </div>
        <SelField label="💺 Nr. locuri" val={seatsNr} set={setSeatsNr} options={['2', '3', '4', '5', '6', '7', '8', '9+']} />
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - stare bună', 'Accidentat', 'Necesită reparații']} />
        <ChipsField label="👤 Tip vânzător" val={sellerType} set={setSellerType} options={['Privat', 'Firmă', 'Dealer']} />
        <Chip active={leasing} onClick={() => setLeasing(!leasing)}>💳 Predare leasing</Chip>
      </div>
    )

    if (subCat === 'piese') return (
      <div className="space-y-4">
        <SelField label="🔩 Categorie piesă" val={pieseCategory} set={setPieseCategory} options={PIESE_CATEGORIES} required />
        <SelField label="🚗 Marcă auto compatibilă" val={brand} set={v => { setBrand(v); setModel('') }} options={AUTO_BRANDS} />
        <div>
          {lbl('📋 Model compatibil')}
          {availableModels.length > 0
            ? <select value={model} onChange={e => setModel(e.target.value)} style={ss} className={sc}><option value="">Toate</option>{availableModels.map(m => <option key={m} value={m}>{m}</option>)}</select>
            : <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder={brand ? 'Model...' : 'Alege marca'} disabled={!brand} style={ss} className={ic + ' disabled:bg-gray-100'} />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An auto" val={year} set={setYear} options={YEARS} />
        </div>
        <ChipsField label="✅ Stare" val={pieseStare} set={setPieseStare} options={['Nou', 'Second-hand', 'Recondiționat']} />
      </div>
    )

    if (subCat === 'agricole') return (
      <div className="space-y-4">
        <SelField label="🚜 Tip utilaj agricol" val={agricolType} set={setAgricolType} options={AGRICOLE_TYPES} required />
        <SelField label="🏭 Marcă" val={agricolBrand} set={setAgricolBrand} options={AGRICOLE_BRANDS} />
        <InputField label="📋 Model" val={model} set={setModel} placeholder="ex: 8R 410, 5090M..." />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An fabricație" val={year} set={setYear} options={YEARS} />
          <InputField label="⚡ Putere (CP)" val={hp} set={setHp} type="number" placeholder="ex: 150" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="🕐 Ore funcționare" val={workHours} set={setWorkHours} type="number" placeholder="ex: 3500" />
        </div>
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - stare bună', 'Folosit - necesită reparații']} />
      </div>
    )

    if (subCat === 'remorci') return (
      <div className="space-y-4">
        <SelField label="🔗 Tip remorcă" val={remorcaType} set={setRemorcaType} options={REMORCI_TYPES} required />
        <SelField label="📅 An fabricație" val={year} set={setYear} options={YEARS} />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="⚖️ Capacitate (kg)" val={remorcaCapacity} set={setRemorcaCapacity} type="number" placeholder="ex: 3500" />
          <InputField label="📐 Lungime (m)" val={cargo} set={setCargo} type="number" placeholder="ex: 6" />
        </div>
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - bun', 'Folosit - reparații']} />
      </div>
    )

    if (subCat === 'camioane') return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelField label="🚛 Marcă" val={truckBrand} set={setTruckBrand} options={TRUCK_BRANDS} required />
          <InputField label="📋 Model" val={truckModel} set={setTruckModel} placeholder="ex: Actros, TGX..." />
        </div>
        <ChipsField label="⛽ Combustibil" val={fuel} set={setFuel} options={['Diesel', 'Electric', 'GPL', 'Hybrid']} />
        <ChipsField label="⚙️ Cutie de viteze" val={gearbox} set={setGearbox} options={['Manuală', 'Automată', 'Semi-automată']} />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An" val={year} set={setYear} options={YEARS} />
          <InputField label="🛣️ Kilometri" val={km} set={setKm} type="number" placeholder="ex: 500000" />
        </div>
        <SelField label="🚛 Tip caroserie" val={truckBody} set={setTruckBody} options={TRUCK_BODY_TYPES} />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="⚖️ Masă (tone)" val={truckTone} set={setTruckTone} type="number" placeholder="ex: 18" />
          <SelField label="🔢 Nr. osii" val={truckOsii} set={setTruckOsii} options={['2', '3', '4', '5', '6+']} />
        </div>
        <InputField label="⚙️ Euro (normă emisii)" val={engineSize} set={setEngineSize} placeholder="ex: Euro 6" />
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - stare bună', 'Accidentat', 'Necesită reparații']} />
        <ChipsField label="👤 Tip vânzător" val={sellerType} set={setSellerType} options={['Privat', 'Firmă', 'Dealer']} />
        <Chip active={leasing} onClick={() => setLeasing(!leasing)}>💳 Predare leasing</Chip>
      </div>
    )

    if (subCat === 'constructii') return (
      <div className="space-y-4">
        <SelField label="🏗️ Tip utilaj" val={utilajType} set={setUtilajType} options={CONSTRUCTII_TYPES} required />
        <SelField label="🏭 Marcă" val={utilajBrand} set={setUtilajBrand} options={CONSTRUCTII_BRANDS} />
        <InputField label="📋 Model" val={model} set={setModel} placeholder="ex: 320GC, JCB 3CX..." />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An" val={year} set={setYear} options={YEARS} />
          <InputField label="🕐 Ore funcționare" val={workHours} set={setWorkHours} type="number" placeholder="ex: 5000" />
        </div>
        <InputField label="⚡ Putere (CP)" val={hp} set={setHp} type="number" placeholder="ex: 120" />
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - bun', 'Folosit - reparații']} />
      </div>
    )

    if (subCat === 'motociclete') return (
      <div className="space-y-4">
        <SelField label="🏍️ Marcă" val={motoBrand} set={setMotoBrand} options={MOTO_BRANDS} required />
        <InputField label="📋 Model" val={model} set={setModel} placeholder="ex: CBR 600RR, R1250GS..." />
        <ChipsField label="🏷️ Tip" val={motoType} set={setMotoType} options={MOTO_TYPES} />
        <ChipsField label="🔧 Cilindree" val={motoCC} set={setMotoCC} options={MOTO_CC} />
        <ChipsField label="⛽ Combustibil" val={fuel} set={setFuel} options={['Benzină', 'Electric', 'Hybrid']} />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An" val={year} set={setYear} options={YEARS} />
          <InputField label="🛣️ Kilometri" val={km} set={setKm} type="number" placeholder="ex: 25000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="⚡ Putere (CP)" val={power} set={setPower} type="number" placeholder="ex: 85" />
          <InputField label="🔧 Motor (cc)" val={engineSize} set={setEngineSize} type="number" placeholder="ex: 600" />
        </div>
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - bun', 'Folosit - reparații']} />
        <ChipsField label="👤 Tip vânzător" val={sellerType} set={setSellerType} options={['Privat', 'Firmă', 'Dealer']} />
        <Chip active={leasing} onClick={() => setLeasing(!leasing)}>💳 Predare leasing</Chip>
      </div>
    )

    // default = autoturisme
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelField label="🚗 Marcă" val={brand} set={v => { setBrand(v); setModel('') }} options={AUTO_BRANDS} required />
          <div>
            {lbl('📋 Model', true)}
            {availableModels.length > 0
              ? <select value={model} onChange={e => setModel(e.target.value)} style={ss} className={sc}><option value="">Alege modelul</option>{availableModels.map(m => <option key={m} value={m}>{m}</option>)}</select>
              : <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder={brand ? 'Scrie modelul...' : 'Alege marca'} disabled={!brand} style={ss} className={ic + ' disabled:bg-gray-100'} />}
          </div>
        </div>
        <div>
          {lbl('⛽ Combustibil', true)}
          <div className="grid grid-cols-3 gap-2">
            {[['Benzină','⛽'],['Diesel','🛢️'],['Hybrid','🔋'],['Electric','⚡'],['GPL','🟢'],['Plug-in Hybrid','🔌']].map(([v, ic]) => (
              <Chip key={v} active={fuel === v} onClick={() => setFuel(fuel === v ? '' : v)}>{ic} {v}</Chip>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📅 An fabricație" val={year} set={setYear} options={YEARS} required />
          <InputField label="🛣️ Kilometri" val={km} set={setKm} type="number" required placeholder="ex: 85000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="🔧 Motor (cc)" val={engineSize} set={setEngineSize} type="number" placeholder="ex: 2000" />
          <InputField label="⚡ Putere (CP)" val={power} set={setPower} type="number" placeholder="ex: 150" />
        </div>
        <ChipsField label="⚙️ Cutie de viteze" val={gearbox} set={setGearbox} options={['Manuală', 'Automată', 'Semi-automată']} />
        <div>
          {lbl('🚙 Tip caroserie')}
          <div className="flex flex-wrap gap-1.5">
            {CAROSERIE_TYPES.map(c => <Chip key={c} active={bodyType === c} onClick={() => setBodyType(bodyType === c ? '' : c)}>{c}</Chip>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelField label="🚪 Nr. uși" val={doorsNr} set={setDoorsNr} options={['2', '3', '4', '5']} />
          <InputField label="🎨 Culoare" val={color} set={setColor} placeholder="ex: Alb, Negru..." />
        </div>
        <ChipsField label="✅ Stare" val={condition} set={setCondition} options={['Nou', 'Folosit - stare bună', 'Accidentat', 'Necesită reparații']} />
        <ChipsField label="👤 Tip vânzător" val={sellerType} set={setSellerType} options={['Privat', 'Firmă', 'Dealer']} />
        <Chip active={leasing} onClick={() => setLeasing(!leasing)}>💳 {leasing ? '✓ ' : ''}Predare leasing</Chip>
      </div>
    )
  }

  function renderImobiliareFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="🔄 Tip tranzacție" val={tipTranzactie} set={setTipTranzactie} options={IMOB_TIP_TRANZACTIE} />
        {(subCat === 'apartamente' || !subCat) && (
          <>
            <ChipsField label="🏢 Tip apartament" val={tipApartament} set={setTipApartament} options={IMOB_TIP_APARTAMENT} />
            <ChipsField label="🏗️ Compartimentare" val={compartimentare} set={setCompartimentare} options={IMOB_COMPARTIMENTARE} />
            <div className="grid grid-cols-2 gap-3">
              <SelField label="🏢 Etaj" val={etaj} set={setEtaj} options={IMOB_ETAJE} />
              <SelField label="🛏️ Nr. camere" val={nrCamere} set={setNrCamere} options={['1', '2', '3', '4', '5', '6+']} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="🛁 Nr. băi" val={nrBai} set={setNrBai} type="number" placeholder="ex: 1" />
              <InputField label="📐 Suprafață utilă (mp)" val={suprafata} set={setSuprafata} type="number" required placeholder="ex: 65" />
            </div>
          </>
        )}
        {subCat === 'case' && (
          <>
            <ChipsField label="🏠 Tip casă" val={tipCasa} set={setTipCasa} options={IMOB_TIP_CASA} />
            <div className="grid grid-cols-2 gap-3">
              <SelField label="🛏️ Nr. camere" val={nrCamere} set={setNrCamere} options={['1', '2', '3', '4', '5', '6', '7+']} />
              <InputField label="🛁 Nr. băi" val={nrBai} set={setNrBai} type="number" placeholder="ex: 2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="📐 Suprafață construită (mp)" val={suprafata} set={setSuprafata} type="number" required placeholder="ex: 150" />
              <InputField label="🌿 Teren total (mp)" val={suprafataTeren} set={setSuprafataTeren} type="number" placeholder="ex: 500" />
            </div>
          </>
        )}
        {subCat === 'terenuri' && (
          <>
            <ChipsField label="🌿 Tip teren" val={tipTeren} set={setTipTeren} options={IMOB_TIP_TEREN} />
            <InputField label="📐 Suprafață (mp)" val={suprafata} set={setSuprafata} type="number" required placeholder="ex: 1000" />
          </>
        )}
        {subCat === 'spatii-comerciale' && (
          <>
            <ChipsField label="🏪 Tip spațiu" val={tipSpatiu} set={setTipSpatiu} options={IMOB_TIP_SPATIU} />
            <InputField label="📐 Suprafață (mp)" val={suprafata} set={setSuprafata} type="number" required placeholder="ex: 200" />
          </>
        )}
        {subCat === 'garaje' && (
          <InputField label="📐 Suprafață (mp)" val={suprafata} set={setSuprafata} type="number" placeholder="ex: 20" />
        )}
        <div className="grid grid-cols-2 gap-3">
          <ChipsField label="🔨 Stare" val={stareImob} set={setStareImob} options={IMOB_STARE} />
          <SelField label="📅 An construcție" val={anConstructie} set={setAnConstructie} options={IMOB_AN_CONSTRUCTIE} />
        </div>
        <div>
          {lbl('✅ Facilități')}
          <MultiChips val={facilitati} set={setFacilitati} options={IMOB_FACILITATI} />
        </div>
      </div>
    )
  }

  function renderJoburiFields() {
    return (
      <div className="space-y-4">
        <InputField label="🏢 Companie" val={jobCompanie} set={setJobCompanie} placeholder="Numele companiei" />
        <SelField label="💼 Domeniu" val={jobDomeniu} set={setJobDomeniu} options={JOB_DOMENII} required />
        {(subCat === 'it' || jobDomeniu === 'IT & Software') && (
          <div>
            {lbl('💻 Tehnologii/Stack')}
            <MultiChips val={itStack} set={setItStack} options={JOB_IT_STACK} />
          </div>
        )}
        <ChipsField label="📄 Tip contract" val={tipContract} set={setTipContract} options={JOB_TIP_CONTRACT} />
        <ChipsField label="🏢 Regim muncă" val={regimMunca} set={setRegimMunca} options={JOB_REGIM_MUNCA} />
        <div className="grid grid-cols-2 gap-3">
          <SelField label="📊 Nivel experiență" val={nivelExperienta} set={setNivelExperienta} options={JOB_NIVEL_EXPERIENTA} />
          <SelField label="🎓 Studii minime" val={nivelStudii} set={setNivelStudii} options={JOB_NIVEL_STUDII} />
        </div>
        <div>
          {lbl('💰 Salariu net lunar (RON)')}
          <div className="flex gap-2">
            <input type="number" value={salariuFrom} onChange={e => setSalariuFrom(e.target.value)} placeholder="De la" style={ss} className={ic} />
            <input type="number" value={salariuTo} onChange={e => setSalariuTo(e.target.value)} placeholder="Până la" style={ss} className={ic} />
          </div>
        </div>
        <div>
          {lbl('🎁 Beneficii oferite')}
          <MultiChips val={beneficii} set={setBeneficii} options={JOB_BENEFICII} />
        </div>
      </div>
    )
  }

  function renderServiciiFields() {
    return (
      <div className="space-y-4">
        <SelField label="🔧 Categorie serviciu" val={serviciiCategorie} set={setServiciiCategorie} options={SERVICII_CATEGORII} required />
        <ChipsField label="📅 Disponibilitate" val={disponibilitate} set={setDisponibilitate} options={SERVICII_DISPONIBILITATE} />
        <ChipsField label="📍 Zonă acoperire" val={zona} set={setZona} options={SERVICII_ZONA} />
        <ChipsField label="⭐ Ani experiență" val={experienta} set={setExperienta} options={SERVICII_EXPERIENTA} />
      </div>
    )
  }

  function renderElectronicoFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="✅ Stare" val={electroStare} set={setElectroStare} options={ELECTRO_STARE} />
        {(subCat === 'telefoane' || !subCat) && (
          <>
            <SelField label="📱 Marcă" val={telefonBrand} set={setTelefonBrand} options={TELEFON_BRANDS} />
            <ChipsField label="💾 Stocare" val={telefonStoraj} set={setTelefonStoraj} options={TELEFON_STOCARE} />
            <ChipsField label="🧠 RAM" val={telefonRam} set={setTelefonRam} options={TELEFON_RAM} />
          </>
        )}
        {subCat === 'laptopuri' && (
          <>
            <SelField label="💻 Marcă" val={laptopBrand} set={setLaptopBrand} options={LAPTOP_BRANDS} />
            <SelField label="⚙️ Procesor" val={laptopProcesor} set={setLaptopProcesor} options={LAPTOP_PROCESOR} />
            <div className="grid grid-cols-2 gap-3">
              <ChipsField label="🧠 RAM" val={laptopRam} set={setLaptopRam} options={LAPTOP_RAM} />
              <ChipsField label="💾 Stocare" val={laptopStoraj} set={setLaptopStoraj} options={LAPTOP_STOCARE} />
            </div>
            <ChipsField label="🖥️ Diagonală" val={laptopDiag} set={setLaptopDiag} options={LAPTOP_DIAGONALA} />
            <SelField label="💿 Sistem de operare" val={laptopOs} set={setLaptopOs} options={LAPTOP_OS} />
          </>
        )}
        {subCat === 'tv-audio' && (
          <>
            <ChipsField label="📺 Tip afișaj" val={tvTip} set={setTvTip} options={TV_TIP} />
            <ChipsField label="📐 Diagonală" val={tvDiag} set={setTvDiag} options={TV_DIAGONALA} />
            <ChipsField label="🔍 Rezoluție" val={tvRez} set={setTvRez} options={TV_REZOLUTIE} />
            <SelField label="🔊 Audio" val={audioTip} set={setAudioTip} options={AUDIO_TIP} />
          </>
        )}
        {subCat === 'gaming' && (
          <>
            <ChipsField label="🎮 Platformă" val={gamingPlatforma} set={setGamingPlatforma} options={GAMING_PLATFORMA} />
            <ChipsField label="🕹️ Tip produs" val={gamingTip} set={setGamingTip} options={GAMING_TIP} />
          </>
        )}
        {subCat === 'tablete' && (
          <>
            <ChipsField label="💾 Stocare" val={tabletaStoraj} set={setTabletaStoraj} options={TABLETA_STOCARE} />
            <ChipsField label="📡 Conectivitate" val={tabletaConect} set={setTabletaConect} options={TABLETA_CONECTIVITATE} />
          </>
        )}
        {(subCat === 'foto-video' || subCat === 'accesorii-electronice') && (
          <>
            <SelField label="📷 Tip" val={fotoTip} set={setFotoTip} options={FOTO_TIP} />
            <SelField label="🏷️ Marcă" val={fotoBrand} set={setFotoBrand} options={FOTO_BRANDS} />
          </>
        )}
      </div>
    )
  }

  function renderModaFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="✅ Stare" val={modaStare} set={setModaStare} options={MODA_STARE} />
        <ChipsField label="👤 Gen" val={modaGen} set={setModaGen} options={MODA_GEN} />
        {(subCat === 'haine-femei' || subCat === 'haine-barbati' || !subCat) && (
          <>
            <ChipsField label="📏 Mărime" val={modaMarimiAdulti} set={setModaMarimiAdulti} options={MODA_MARIMI_ADULTI} />
            <SelField label="🧶 Material" val={modaMaterial} set={setModaMaterial} options={MODA_MATERIAL} />
          </>
        )}
        {subCat === 'incaltaminte' && (
          <ChipsField label="👟 Pointure" val={modaMarimiPantofi} set={setModaMarimiPantofi} options={MODA_MARIMI_PANTOFI} />
        )}
        {subCat === 'haine-copii' && (
          <ChipsField label="🧒 Vârstă / Talie" val={modaMarimiCopii} set={setModaMarimiCopii} options={MODA_MARIMI_COPII} />
        )}
        {subCat === 'bijuterii' && (
          <>
            <SelField label="💍 Tip bijuterie" val={bijuteriiTip} set={setBijuteriiTip} options={BIJUTERII_TIP} />
            <ChipsField label="⚗️ Material" val={bijuteriiMaterial} set={setBijuteriiMaterial} options={BIJUTERII_MATERIAL} />
          </>
        )}
        {subCat === 'genti-accesorii' && (
          <SelField label="👜 Tip geantă" val={gentiTip} set={setGentiTip} options={GENTI_TIP} />
        )}
      </div>
    )
  }

  function renderCasaGradinaFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="✅ Stare" val={casaStare} set={setCasaStare} options={CASA_STARE} />
        {(subCat === 'mobila' || !subCat) && (
          <>
            <SelField label="🛋️ Tip mobilă" val={mobilaTip} set={setMobilaTip} options={MOBILA_TIP} />
            <SelField label="🪵 Material" val={mobilaMaterial} set={setMobilaMaterial} options={MOBILA_MATERIAL} />
          </>
        )}
        {subCat === 'electrocasnice' && (
          <>
            <SelField label="🏠 Tip electrocasnic" val={electrocasniceTip} set={setElectrocasniceTip} options={ELECTROCASNICE_TIP} />
            <SelField label="🏭 Marcă" val={electrocasniceBrand} set={setElectrocasniceBrand} options={ELECTROCASNICE_BRANDS} />
          </>
        )}
        {(subCat === 'gradina' || subCat === 'decoratiuni') && (
          <>
            <SelField label="🌿 Tip produs grădină" val={gradinaTip} set={setGradinaTip} options={GRADINA_TIP} />
            <SelField label="🖼️ Tip decorare" val={decorareTip} set={setDecoriareTip} options={DECORARE_TIP} />
          </>
        )}
        {subCat === 'unelte' && (
          <SelField label="🔨 Tip bricolaj" val={bricolajTip} set={setBricolajTip} options={BRICOLAJ_TIP} />
        )}
        {subCat === 'iluminat' && (
          <SelField label="💡 Tip iluminat" val={iluminatTip} set={setIluminatTip} options={ILUMINAT_TIP} />
        )}
      </div>
    )
  }

  function renderSportFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="✅ Stare" val={sportStare} set={setSportStare} options={SPORT_STARE} />
        {(subCat === 'echipament-sport' || subCat === 'sporturi-echipa' || !subCat) && (
          <SelField label="⚽ Sport" val={sportTip} set={setSportTip} options={SPORT_TIP} />
        )}
        {subCat === 'biciclete' && (
          <>
            <ChipsField label="🚲 Tip bicicletă" val={bicicletaTip} set={setBicicletaTip} options={BICICLETA_TIP} />
            <SelField label="🏭 Marcă" val={bicicletaBrand} set={setBicicletaBrand} options={BICICLETA_BRANDS} />
            <ChipsField label="📐 Mărime cadru" val={bicicletaCadru} set={setBicicletaCadru} options={BICICLETA_CADRU} />
          </>
        )}
        {subCat === 'fitness' && (
          <SelField label="💪 Tip echipament" val={fitnessTip} set={setFitnessTip} options={FITNESS_TIP} />
        )}
        {subCat === 'outdoor' && (
          <SelField label="🏕️ Tip produs" val={outdoorTip} set={setOutdoorTip} options={OUTDOOR_TIP} />
        )}
        {subCat === 'sporturi-apa' && (
          <SelField label="🏄 Tip sport acvatic" val={sporturiApaTip} set={setSporturiApaTip} options={SPORTURI_APA_TIP} />
        )}
        {subCat === 'sporturi-iarna' && (
          <SelField label="⛷️ Tip sport de iarnă" val={sporturiIarnaTip} set={setSporturiIarnaTip} options={SPORTURI_IARNA_TIP} />
        )}
      </div>
    )
  }

  function renderAnimaleFields() {
    return (
      <div className="space-y-4">
        {(subCat === 'caini' || subCat === 'pisici' || !subCat) && (
          <>
            <SelField label="🐾 Vârstă" val={animaleVarsta} set={setAnimaleVarsta} options={ANIMALE_VARSTA} />
            <ChipsField label="♂️ Sex" val={animaleSex} set={setAnimaleSex} options={ANIMALE_SEX} />
            <ChipsField label="📋 Pedigree" val={pedigree} set={setPedigree} options={['Cu pedigree', 'Fără pedigree']} />
            <ChipsField label="💉 Vaccinat" val={vaccinat} set={setVaccinat} options={['Vaccinat', 'Nevaccinat']} />
            <ChipsField label="✂️ Castrat" val={castrat} set={setCastrat} options={['Da', 'Nu']} />
            <ChipsField label="📟 Microcip" val={microcip} set={setMicrocip} options={['Da', 'Nu']} />
          </>
        )}
        {subCat === 'caini' && (
          <SelField label="🐕 Rasă" val={cainRasa} set={setCainRasa} options={CAINI_RASE} />
        )}
        {subCat === 'pisici' && (
          <SelField label="🐈 Rasă" val={pisicaRasa} set={setPisicaRasa} options={PISICI_RASE} />
        )}
        {subCat === 'accesorii-animale' && (
          <SelField label="🦴 Tip accesoriu" val={accesoriiAnimaleTip} set={setAccesoriiAnimaleTip} options={ACCESORII_ANIMALE_TIP} />
        )}
      </div>
    )
  }

  function renderMamaCopilulFields() {
    return (
      <div className="space-y-4">
        <ChipsField label="✅ Stare" val={mamaStare} set={setMamaStare} options={MAMA_STARE} />
        {(subCat === 'haine-bebe' || subCat === 'haine-copii' || !subCat) && (
          <>
            <ChipsField label="👶 Vârstă copil" val={mamaVarstaCopil} set={setMamaVarstaCopil} options={MAMA_VARSTA_COPIL} />
            <ChipsField label="👤 Gen" val={mamaGenCopil} set={setMamaGenCopil} options={MAMA_GEN_COPIL} />
          </>
        )}
        {subCat === 'jucarii' && (
          <>
            <ChipsField label="🎯 Vârstă recomandată" val={jucariiVarsta} set={setJucariiVarsta} options={JUCARII_VARSTA} />
            <SelField label="🧸 Tip jucărie" val={jucariiTip} set={setJucariiTip} options={JUCARII_TIP} />
          </>
        )}
        {subCat === 'carucioare' && (
          <>
            <SelField label="🍼 Tip" val={caruciTip} set={setCaruciTip} options={CARUCIOR_TIP} />
            <SelField label="🏭 Marcă" val={caruciiBrand} set={setCaruciiBrand} options={CARUCIOR_BRANDS} />
          </>
        )}
        {subCat === 'mobilier-copii' && (
          <SelField label="🛏️ Tip mobilier" val={mobilierCopiiTip} set={setMobilierCopiiTip} options={MOBILIER_COPII_TIP} />
        )}
        {subCat === 'ingrijire' && (
          <SelField label="👶 Tip produs" val={ingrijireTip} set={setIngrijireTip} options={INGRIJIRE_TIP} />
        )}
      </div>
    )
  }

  function renderStep2Fields() {
    if (mainCat === 'auto') return renderAutoFields()
    if (mainCat === 'imobiliare') return renderImobiliareFields()
    if (mainCat === 'joburi') return renderJoburiFields()
    if (mainCat === 'servicii') return renderServiciiFields()
    if (mainCat === 'electronice') return renderElectronicoFields()
    if (mainCat === 'moda') return renderModaFields()
    if (mainCat === 'casa-gradina') return renderCasaGradinaFields()
    if (mainCat === 'sport') return renderSportFields()
    if (mainCat === 'animale') return renderAnimaleFields()
    if (mainCat === 'mama-copilul') return renderMamaCopilulFields()
    return null
  }

  // Summary for Step 3
  function renderSummary() {
    const entries: [string, string][] = [
      ['Titlu', title],
      ['Categorie', `${MAIN_CATS.find(c => c.slug === mainCat)?.name || mainCat}${subCat ? ' › ' + (subs.find(s => s.slug === subCat)?.name || subCat) : ''}`],
      ['Locație', city],
      ['Preț', price ? `${price} ${currency}` : '—'],
    ]
    if (mainCat === 'auto') {
      if (brand) entries.push(['Marcă/Model', `${brand} ${model}`])
      if (fuel) entries.push(['Combustibil', fuel])
      if (year) entries.push(['An', year])
      if (km) entries.push(['KM', `${Number(km).toLocaleString()} km`])
    }
    if (mainCat === 'imobiliare') {
      if (tipTranzactie) entries.push(['Tranzacție', tipTranzactie])
      if (suprafata) entries.push(['Suprafață', `${suprafata} mp`])
    }
    if (mainCat === 'joburi') {
      if (tipContract) entries.push(['Contract', tipContract])
      if (regimMunca) entries.push(['Regim', regimMunca])
      if (salariuFrom) entries.push(['Salariu', `${salariuFrom}${salariuTo ? '-'+salariuTo : '+'} RON`])
    }
    return (
      <div className="space-y-2 text-sm" style={{ color: '#000' }}>
        {entries.filter(([, v]) => v).map(([k, v]) => (
          <p key={k}><span className="font-semibold">{k}:</span> {v}</p>
        ))}
        <p><span className="font-semibold">Imagini:</span> {images.length}/1</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
      {showBidPopup && publishedId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '24px', padding: '32px',
            maxWidth: '420px', width: '100%', textAlign: 'center',
            border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 60px rgba(139,92,246,0.3)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              Anunț publicat!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Anunțul tău este acum live pe zyAI.
            </p>

            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '16px', padding: '20px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
                Vrei să vinzi mai scump?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Dacă sunt mai mulți cumpărători, prețul crește automat
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[1,2,3,6].map(h => (
                  <button key={h} type="button" onClick={() => setBidHours(h)}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: '2px solid',
                      background: bidHours === h ? 'var(--gradient-main)' : 'transparent',
                      borderColor: bidHours === h ? 'transparent' : 'rgba(255,255,255,0.2)',
                      color: bidHours === h ? 'white' : 'var(--text-secondary)',
                    }}>
                    {h}h
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={bidActivating}
                onClick={async () => {
                  setBidActivating(true)
                  try {
                    const { activateBidding } = await import('@/lib/actions/listings')
                    await activateBidding(publishedId, bidHours)
                  } catch {}
                  window.location.href = `/anunt/${publishedId}`
                }}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
                  background: 'linear-gradient(135deg,#EF4444,#F97316)', color: 'white', cursor: 'pointer',
                  border: 'none', opacity: bidActivating ? 0.7 : 1
                }}>
                {bidActivating ? '⏳ Se activează...' : `🔥 Activează licitația (${bidHours}h)`}
              </button>
            </div>

            <button type="button"
              onClick={() => { window.location.href = `/anunt/${publishedId}` }}
              style={{ color: 'var(--text-secondary)', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
              Nu acum, mergi la anunț →
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="gradient-main-text" style={{ fontSize: '28px', fontWeight: 700 }}>
            {isEditMode ? 'Editează anunț' : 'Postează un anunț'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isEditMode ? 'Modifică orice detaliu al anunțului tău' : step === 0 ? '✨ AI analizează poza ta automat' : `Pasul ${step} din 2`}
          </p>
        </div>

        {/* Progress */}
        {!isEditMode && (
          <div className="flex gap-2 mb-6">
            {[0, 1, 2].map(s => (
              <div key={s} className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full transition-all duration-500 gradient-main" style={{ width: s <= step ? '100%' : '0%' }} />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-lg" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}><p style={{ color: '#f87171' }}>❌ {error}</p></div>}

            {/* ─── STEP 0: Foto + AI Analiză ─── */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">🤖</div>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                    Lasă AI-ul să completeze pentru tine
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Încarcă o poză cu produsul tău și zyAI detectează automat ce vinzi, completează titlul, descrierea și categoria
                  </p>
                </div>

                <div className="rounded-2xl p-5" style={{ background: 'rgba(139,92,246,0.06)', border: '1px dashed rgba(139,92,246,0.4)' }}>
                  <ImageUploader
                    onImagesChange={(imgs) => {
                      setImages(imgs)
                      if (imgs.length > 0 && !aiAnalysis) analyzeImages(imgs)
                    }}
                    initialImages={images}
                    category={mainCat}
                  />
                </div>

                {/* AI Loading */}
                {aiAnalyzing && (
                  <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="flex gap-1">
                        {[0,1,2,3,4,5,6,7].map(i => (
                          <span key={i} style={{
                            display: 'block', width: '3px', borderRadius: '2px',
                            background: 'linear-gradient(to top,#8B5CF6,#3B82F6)',
                            height: '16px',
                            animation: `vbarIdle 1.2s ease-in-out ${i*0.12}s infinite alternate`,
                          }} />
                        ))}
                      </div>
                      <span style={{ color: '#A78BFA', fontWeight: 700, fontSize: '15px' }}>{(['AI analizează produsul...', 'Se generează titlul...', 'Se calculează prețul...'])[aiLoadStep]}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Detectez produsul, starea și detaliile...</p>
                  </div>
                )}

                {/* AI Result */}
                {aiAnalysis && !aiAnalyzing && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.5)', boxShadow: '0 0 30px rgba(139,92,246,0.15)' }}>
                    <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
                      <span className="text-white text-lg">🤖</span>
                      <span className="text-white font-bold text-sm">zyAI a detectat produsul tău</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {Math.round((aiAnalysis.confidence || 0.8) * 100)}% sigur
                      </span>
                    </div>
                    <div className="p-5 space-y-3" style={{ background: 'var(--bg-card)' }}>
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Titlu detectat</p>
                        <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{aiAnalysis.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Descriere generată</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{aiAnalysis.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}>
                          {MAIN_CATS.find(c => c.slug === aiAnalysis.category)?.icon} {aiAnalysis.category}
                        </span>
                        {aiAnalysis.subcategory && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }}>
                            {aiAnalysis.subcategory}
                          </span>
                        )}
                        {aiAnalysis.condition && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' }}>
                            ✅ {aiAnalysis.condition}
                          </span>
                        )}
                        {aiAnalysis.brand && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(234,179,8,0.15)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.3)' }}>
                            🏷️ {aiAnalysis.brand}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={acceptAiAnalysis}
                          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
                          ✓ Acceptă și continuă
                        </button>
                        <button type="button" onClick={() => { setAiAnalysis(null); setAiAnalysisAccepted(false) }}
                          className="px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                          style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
                          🔄 Reanaliza
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Error */}
                {aiError && !aiAnalyzing && (
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p className="text-sm" style={{ color: '#FCA5A5' }}>⚠️ {aiError}</p>
                  </div>
                )}

                {/* Skip if no photo */}
                {!aiAnalyzing && (
                  <div className="text-center">
                    <button type="button" onClick={() => setStep(1)}
                      className="text-sm transition"
                      style={{ color: 'var(--text-secondary)' }}>
                      Completez manual →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 1: Categorie → Câmpuri specifice → Titlu → Descriere ─── */}
            {step === 1 && (
              <div className="space-y-6">

                {/* Categorie principală */}
                <div>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Ce dorești să postezi?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {MAIN_CATS.map(c => (
                      <button key={c.slug} type="button" onClick={() => handleCatSelect(c.slug)}
                        className="p-3 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105"
                        style={{
                          background: mainCat === c.slug ? 'rgba(139,92,246,0.15)' : 'var(--bg-card-hover)',
                          borderColor: mainCat === c.slug ? 'var(--purple)' : 'var(--border-subtle)',
                          boxShadow: mainCat === c.slug ? 'var(--glow-purple)' : 'none',
                        }}>
                        <span className="text-2xl block mb-1">{c.icon}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px' }}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategorii */}
                {mainCat && subs.length > 0 && (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>Subcategorie</p>
                    <div className="flex flex-wrap gap-2">
                      {subs.map(s => (
                        <button key={s.slug} type="button" onClick={() => setSubCat(subCat === s.slug ? '' : s.slug)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200"
                          style={{
                            background: subCat === s.slug ? 'rgba(59,130,246,0.15)' : 'var(--bg-card-hover)',
                            borderColor: subCat === s.slug ? 'var(--blue-electric)' : 'var(--border-subtle)',
                            color: subCat === s.slug ? '#60a5fa' : 'var(--text-secondary)',
                          }}>
                          <span>{s.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Titlu — PRIMUL */}
                {mainCat && (
                  <div>
                    {lbl('Titlu anunț', true)}
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder={mainCat === 'auto' ? 'ex: BMW X5 3.0d 2020, full options' : mainCat === 'imobiliare' ? 'ex: Apartament 3 camere, decomandat, Floreasca' : mainCat === 'joburi' ? 'ex: Senior React Developer, remote, full-time' : 'ex: Instalator autorizat, intervenții rapide'}
                      style={ss} className={ic} required />
                  </div>
                )}

                {/* Descriere — sus de tot */}
                {mainCat && (
                  <div>
                    {lbl('Descriere detaliată', true)}
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Descrie în detaliu oferta ta..."
                      rows={5} style={{ ...ss, width: '100%', resize: 'vertical' }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                )}

                {/* AI Price Suggestion — imediat sub descriere */}
                {mainCat && mainCat !== 'joburi' && mainCat !== 'imobiliare' && title && (
                  <div>
                    {!aiPrice && !aiPriceLoading && (
                      <button type="button" onClick={suggestPrice}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm transition hover:scale-[1.02] flex items-center justify-center gap-2"
                        style={{ background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.5)', color: '#A78BFA' }}>
                        🤖 Generează preț AI
                      </button>
                    )}
                    {aiPriceLoading && (
                      <div className="py-3 text-center rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <span style={{ color: '#A78BFA', fontSize: '13px' }}>⏳ zyAI calculează prețul corect pentru piața română...</span>
                      </div>
                    )}
                    {aiPrice && (
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 20px rgba(139,92,246,0.1)' }}>
                        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
                          <span className="text-white text-base">💡</span>
                          <span className="text-white font-bold text-sm">Sugestie preț — piața română 2025</span>
                        </div>
                        <div className="p-4 space-y-3" style={{ background: 'var(--bg-card)' }}>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Minim</p>
                              <p className="text-lg font-black" style={{ color: '#60A5FA' }}>{aiPrice.min} {aiPrice.currency}</p>
                            </div>
                            <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)' }}>
                              <p className="text-xs mb-1" style={{ color: '#A78BFA' }}>Preț recomandat</p>
                              <p className="text-2xl font-black price-text">{aiPrice.suggested} {aiPrice.currency}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Maxim</p>
                              <p className="text-lg font-black" style={{ color: '#60A5FA' }}>{aiPrice.max} {aiPrice.currency}</p>
                            </div>
                          </div>
                          <p className="text-xs italic text-center" style={{ color: 'var(--text-secondary)' }}>💬 {aiPrice.reasoning}</p>
                          {aiPrice.tips?.length > 0 && (
                            <div className="space-y-1.5">
                              {aiPrice.tips.map((tip, i) => (
                                <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                  <span style={{ color: '#4ADE80' }}>✓</span> {tip}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button type="button"
                              onClick={() => { setPrice(String(aiPrice.suggested)); setCurrency(aiPrice.currency) }}
                              className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition hover:scale-105"
                              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                              ✓ Folosește {aiPrice.suggested} {aiPrice.currency}
                            </button>
                            <button type="button" onClick={() => setAiPrice(null)}
                              className="px-3 py-2 rounded-lg text-xs transition"
                              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Locație + Preț */}
                {mainCat && (
                  <div className="space-y-4">
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px' }}>📍 Locație și preț</h3>
                    <SelField label="Oraș" val={city} set={setCity} options={ROMANIAN_CITIES} required placeholder="Alege orașul" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        {lbl(mainCat === 'joburi' ? 'Salariu (RON)' : 'Preț')}
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                          placeholder="0" style={ss} className={ic} />
                      </div>
                      <div>
                        {lbl('Tip')}
                        <select value={priceType} onChange={e => setPriceType(e.target.value)} style={ss} className={sc}>
                          <option value="fix">Fix</option>
                          <option value="negociabil">Negociabil</option>
                          {mainCat === 'joburi' && <option value="la-negociere">La negociere</option>}
                          {mainCat !== 'joburi' && <option value="gratuit">Gratuit</option>}
                        </select>
                      </div>
                      <div>
                        {lbl('Monedă')}
                        <select value={currency} onChange={e => setCurrency(e.target.value)} style={ss} className={sc}>
                          <option value="EUR">EUR</option>
                          <option value="RON">RON</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Câmpuri specifice categoriei — jos, după scroll */}
                {mainCat && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>
                      {MAIN_CATS.find(c => c.slug === mainCat)?.icon} {subs.find(s => s.slug === subCat)?.name || MAIN_CATS.find(c => c.slug === mainCat)?.name} — detalii extra
                    </h3>
                    {renderStep2Fields()}
                  </div>
                )}

                {/* Imagini — doar în edit mode (step 2 le are în new mode) */}
                {isEditMode && mainCat && (
                  <div>
                    {lbl('📷 Imagini (max 8)')}
                    <ImageUploader onImagesChange={setImages} initialImages={images} category={mainCat} />
                  </div>
                )}

                {/* Contact — doar în edit mode */}
                {isEditMode && mainCat && (
                  <div>
                    {lbl('📞 Telefon contact (opțional)')}
                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                      placeholder="+40 723 123 456" style={ss} className={ic} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>Dacă nu completezi, se folosește numărul din profil</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2: Contact + Imagini extra + Publică ─── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>Finalizare și publicare</h2>
                <div>
                  {lbl('📞 Număr de telefon pentru contact (opțional)')}
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+40 723 123 456"
                    style={ss}
                    className={ic}
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>Dacă nu completezi, se folosește numărul din profil</p>
                </div>
                {/* Adaugă mai multe imagini dacă doresc */}
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>
                    {images.length > 0 ? `📸 Ai ${images.length} imagine (plan gratuit: 1 poză).` : 'Adaugă o imagine pentru a atrage mai mulți cumpărători.'}
                  </p>
                  <ImageUploader onImagesChange={setImages} initialImages={images} category={mainCat} />
                </div>
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px' }}>📋 Sumar anunț</h3>
                  {renderSummary()}
                </div>
              </div>
            )}

            {/* Butoane */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {isEditMode ? (
                <a href={`/anunt/${initialData.id}`}
                  className="px-6 py-2.5 rounded-xl font-semibold transition hover:scale-105"
                  style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-card-hover)' }}>
                  ← Anulare
                </a>
              ) : step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-xl font-semibold transition hover:scale-105"
                  style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-card-hover)' }}>
                  ← Înapoi
                </button>
              )}
              <div className="flex-1" />
              {step === 0 && (
                <button type="button" onClick={() => setStep(1)}
                  disabled={images.length === 0 && !aiAnalyzing}
                  className="flex-1 md:flex-none md:px-8 py-2.5 gradient-main text-white font-bold rounded-xl transition hover:scale-105 disabled:opacity-40"
                  style={{ boxShadow: 'var(--glow-purple)' }}>
                  {aiAnalyzing ? '⏳ Analizez...' : images.length > 0 ? 'Continuă →' : 'Sari peste →'}
                </button>
              )}
              {step === 1 && !isEditMode && (
                <button type="submit"
                  disabled={!mainCat || !title || !description}
                  className="flex-1 md:flex-none md:px-8 py-2.5 gradient-main text-white font-bold rounded-xl transition hover:scale-105 disabled:opacity-40"
                  style={{ boxShadow: 'var(--glow-purple)' }}>
                  Continuă →
                </button>
              )}
              {step === 1 && isEditMode && (
                <button type="submit" disabled={loading || !mainCat || !title || !description}
                  className="flex-1 md:flex-none md:px-8 py-2.5 text-white font-bold rounded-xl transition hover:scale-105 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                  {loading ? '⏳ Se salvează...' : '✓ Salvează modificări'}
                </button>
              )}
              {step === 2 && (
                <button type="submit" disabled={loading}
                  className="flex-1 md:flex-none md:px-8 py-2.5 text-white font-bold rounded-xl transition hover:scale-105 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                  {loading ? '⏳ Se postează...' : '✓ Publică anunțul'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
