'use client'

import { useState } from 'react'
import { createListing } from '@/lib/actions/listings'
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
} from '@/lib/constants/subcategories'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'
import ImageUploader from './ImageUploader'
import Button from '@/components/ui/Button'

// ─── Subcategorii per categorie ──────────────────────────────────
const SUBS: Record<string, { slug: string; name: string; icon: string }[]> = {
  auto: [
    { slug: 'autoturisme', name: 'Autoturisme', icon: '🚗' },
    { slug: 'autoutilitare', name: 'Autoutilitare', icon: '🚐' },
    { slug: 'piese', name: 'Piese auto', icon: '🔩' },
    { slug: 'agricole', name: 'Agricole', icon: '🚜' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'constructii', name: 'Constructii utilaje', icon: '🏗️' },
    { slug: 'motociclete', name: 'Motociclete', icon: '🏍️' },
  ],
  imobiliare: [
    { slug: 'apartamente', name: 'Apartamente', icon: '🏢' },
    { slug: 'case', name: 'Case & Vile', icon: '🏠' },
    { slug: 'terenuri', name: 'Terenuri', icon: '🌿' },
    { slug: 'spatii-comerciale', name: 'Spații comerciale', icon: '🏪' },
    { slug: 'garaje', name: 'Garaje', icon: '🅿️' },
  ],
  joburi: [
    { slug: 'it', name: 'IT & Tech', icon: '💻' },
    { slug: 'vanzari', name: 'Vânzări', icon: '📊' },
    { slug: 'horeca', name: 'HoReCa', icon: '🍽️' },
    { slug: 'constructii-job', name: 'Construcții', icon: '🔨' },
    { slug: 'transport', name: 'Transport', icon: '🚚' },
    { slug: 'medical', name: 'Medical', icon: '🏥' },
  ],
  servicii: [
    { slug: 'reparatii', name: 'Reparații', icon: '🔧' },
    { slug: 'curatenie', name: 'Curățenie', icon: '🧹' },
    { slug: 'transport-serviciu', name: 'Transport', icon: '🚚' },
    { slug: 'it-serviciu', name: 'IT & Web', icon: '💻' },
    { slug: 'constructii-serviciu', name: 'Construcții', icon: '🏗️' },
    { slug: 'frumusete', name: 'Frumusețe', icon: '💅' },
  ],
  electronice: [
    { slug: 'telefoane', name: 'Telefoane', icon: '📱' },
    { slug: 'laptopuri', name: 'Laptopuri', icon: '💻' },
    { slug: 'tv-audio', name: 'TV & Audio', icon: '📺' },
    { slug: 'gaming', name: 'Gaming', icon: '🎮' },
    { slug: 'tablete', name: 'Tablete', icon: '📟' },
    { slug: 'accesorii-electronice', name: 'Accesorii', icon: '🔌' },
  ],
  moda: [
    { slug: 'haine-barbati', name: 'Haine bărbați', icon: '👔' },
    { slug: 'haine-femei', name: 'Haine femei', icon: '👗' },
    { slug: 'incaltaminte', name: 'Încălțăminte', icon: '👟' },
    { slug: 'genti-accesorii', name: 'Genți & Accesorii', icon: '👜' },
    { slug: 'bijuterii', name: 'Bijuterii & Ceasuri', icon: '💍' },
    { slug: 'haine-copii', name: 'Haine copii', icon: '👕' },
  ],
  'casa-gradina': [
    { slug: 'mobila', name: 'Mobilă', icon: '🛋️' },
    { slug: 'electrocasnice', name: 'Electrocasnice', icon: '🫙' },
    { slug: 'decoratiuni', name: 'Decorațiuni', icon: '🖼️' },
    { slug: 'gradina', name: 'Grădină', icon: '🌱' },
    { slug: 'unelte', name: 'Unelte & Bricolaj', icon: '🔨' },
  ],
  sport: [
    { slug: 'fitness', name: 'Fitness & Gym', icon: '🏋️' },
    { slug: 'biciclete', name: 'Biciclete', icon: '🚴' },
    { slug: 'sporturi-echipa', name: 'Sporturi de echipă', icon: '⚽' },
    { slug: 'sporturi-apa', name: 'Sporturi de apă', icon: '🏊' },
    { slug: 'sporturi-iarna', name: 'Sporturi de iarnă', icon: '⛷️' },
    { slug: 'outdoor', name: 'Outdoor & Camping', icon: '🏕️' },
  ],
  animale: [
    { slug: 'caini', name: 'Câini', icon: '🐕' },
    { slug: 'pisici', name: 'Pisici', icon: '🐈' },
    { slug: 'pasari', name: 'Păsări', icon: '🦜' },
    { slug: 'pesti', name: 'Pești & Acvarii', icon: '🐠' },
    { slug: 'accesorii-animale', name: 'Accesorii animale', icon: '🦴' },
    { slug: 'alte-animale', name: 'Alte animale', icon: '🐾' },
  ],
  'mama-copilul': [
    { slug: 'carucioare', name: 'Cărucioare & Scaune auto', icon: '🍼' },
    { slug: 'jucarii', name: 'Jucării', icon: '🧸' },
    { slug: 'haine-bebe', name: 'Haine bebeluși', icon: '👶' },
    { slug: 'mobilier-copii', name: 'Mobilier copii', icon: '🛏️' },
    { slug: 'ingrijire', name: 'Îngrijire & Sănătate', icon: '🩺' },
    { slug: 'carti-educative', name: 'Cărți & Jocuri educative', icon: '📚' },
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

// ════════════════════════════════════════════════════════════════
export default function ListingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])

  // Category
  const [mainCat, setMainCat] = useState('')
  const [subCat, setSubCat] = useState('')

  // Common
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [priceType, setPriceType] = useState('fix')
  const [currency, setCurrency] = useState('EUR')

  // AUTO - common
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [fuel, setFuel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [sellerType, setSellerType] = useState('')
  const [leasing, setLeasing] = useState(false)
  const [engineSize, setEngineSize] = useState('')
  const [power, setPower] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [color, setColor] = useState('')
  const [doorsNr, setDoorsNr] = useState('')
  const [condition, setCondition] = useState('')
  // AUTO - autoutilitare
  const [maxMass, setMaxMass] = useState('')
  const [cargo, setCargo] = useState('')
  const [seatsNr, setSeatsNr] = useState('')
  // AUTO - piese
  const [pieseCategory, setPieseCategory] = useState('')
  const [pieseStare, setPieseStare] = useState('')
  // AUTO - agricole
  const [agricolType, setAgricolType] = useState('')
  const [agricolBrand, setAgricolBrand] = useState('')
  const [hp, setHp] = useState('')
  const [workHours, setWorkHours] = useState('')
  // AUTO - remorci
  const [remorcaType, setRemorcaType] = useState('')
  const [remorcaCapacity, setRemorcaCapacity] = useState('')
  // AUTO - camioane
  const [truckBrand, setTruckBrand] = useState('')
  const [truckModel, setTruckModel] = useState('')
  const [truckBody, setTruckBody] = useState('')
  const [truckTone, setTruckTone] = useState('')
  const [truckOsii, setTruckOsii] = useState('')
  // AUTO - utilaje constructii
  const [utilajType, setUtilajType] = useState('')
  const [utilajBrand, setUtilajBrand] = useState('')
  // MOTO
  const [motoBrand, setMotoBrand] = useState('')
  const [motoType, setMotoType] = useState('')
  const [motoCC, setMotoCC] = useState('')

  // IMOBILIARE
  const [tipTranzactie, setTipTranzactie] = useState('')
  const [tipApartament, setTipApartament] = useState('')
  const [compartimentare, setCompartimentare] = useState('')
  const [etaj, setEtaj] = useState('')
  const [suprafata, setSuprafata] = useState('')
  const [suprafataTeren, setSuprafataTeren] = useState('')
  const [stareImob, setStareImob] = useState('')
  const [anConstructie, setAnConstructie] = useState('')
  const [tipCasa, setTipCasa] = useState('')
  const [nrCamere, setNrCamere] = useState('')
  const [nrBai, setNrBai] = useState('')
  const [tipTeren, setTipTeren] = useState('')
  const [tipSpatiu, setTipSpatiu] = useState('')
  const [facilitati, setFacilitati] = useState<string[]>([])

  // JOBURI
  const [jobDomeniu, setJobDomeniu] = useState('')
  const [jobCompanie, setJobCompanie] = useState('')
  const [tipContract, setTipContract] = useState('')
  const [regimMunca, setRegimMunca] = useState('')
  const [nivelExperienta, setNivelExperienta] = useState('')
  const [nivelStudii, setNivelStudii] = useState('')
  const [salariuFrom, setSalariuFrom] = useState('')
  const [salariuTo, setSalariuTo] = useState('')
  const [beneficii, setBeneficii] = useState<string[]>([])
  const [itStack, setItStack] = useState<string[]>([])

  // SERVICII
  const [serviciiCategorie, setServiciiCategorie] = useState('')
  const [disponibilitate, setDisponibilitate] = useState('')
  const [zona, setZona] = useState('')
  const [experienta, setExperienta] = useState('')

  // Contact
  const [contactPhone, setContactPhone] = useState('')

  const availableModels = brand && AUTO_MODELS[brand] ? AUTO_MODELS[brand] : []
  const subs = SUBS[mainCat] || []

  function handleCatSelect(cat: string) {
    setMainCat(cat)
    setSubCat('')
    setCurrency(cat === 'joburi' ? 'RON' : 'EUR')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) {
      if (!mainCat) { setError('Alege o categorie'); return }
      if (!title || !description) { setError('Completează titlul și descrierea'); return }
      setError(''); setStep(2); return
    }

    setLoading(true); setError('')
    try {
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
      if (result?.error) { setError(result.error); setLoading(false) }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
      setError('Eroare la postare. Încearcă din nou.'); setLoading(false)
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

  function renderStep2Fields() {
    if (mainCat === 'auto') return renderAutoFields()
    if (mainCat === 'imobiliare') return renderImobiliareFields()
    if (mainCat === 'joburi') return renderJoburiFields()
    if (mainCat === 'servicii') return renderServiciiFields()
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
        <p><span className="font-semibold">Imagini:</span> {images.length}/8</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="gradient-main-text" style={{ fontSize: '28px', fontWeight: 700 }}>Postează un anunț</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Pasul {step} din 2</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div className={`h-full transition-all gradient-main`} style={{ width: s <= step ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-lg" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}><p style={{ color: '#f87171' }}>❌ {error}</p></div>}

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

                {/* Câmpuri specifice categoriei */}
                {mainCat && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>
                      {MAIN_CATS.find(c => c.slug === mainCat)?.icon} {subs.find(s => s.slug === subCat)?.name || MAIN_CATS.find(c => c.slug === mainCat)?.name} — detalii
                    </h3>
                    {renderStep2Fields()}
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

                {/* Descriere — ULTIMA */}
                {mainCat && (
                  <div>
                    {lbl('Descriere detaliată', true)}
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Descrie în detaliu oferta ta..."
                      rows={6} style={{ ...ss, width: '100%', resize: 'vertical' }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2: Imagini + Publică ─── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>Imagini și finalizare</h2>
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
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>Anunțurile cu imagini primesc de 3x mai multe răspunsuri. Maxim 8 imagini.</p>
                  <ImageUploader onImagesChange={setImages} initialImages={images} />
                </div>
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px' }}>📋 Sumar anunț</h3>
                  {renderSummary()}
                </div>
              </div>
            )}

            {/* Butoane */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-lg font-semibold transition hover:scale-105"
                  style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-card-hover)' }}>
                  ← Înapoi
                </button>
              )}
              <div className="flex-1" />
              {step < 2 ? (
                <button type="submit"
                  disabled={!mainCat || !title || !description}
                  className="flex-1 md:flex-none md:px-8 py-2.5 gradient-main text-white font-bold rounded-lg transition hover:scale-105 disabled:opacity-40"
                  style={{ boxShadow: 'var(--glow-purple)' }}>
                  Continuă →
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex-1 md:flex-none md:px-8 py-2.5 text-white font-bold rounded-lg transition hover:scale-105 disabled:opacity-40"
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
