'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ROMANIAN_CITIES, } from '@/lib/constants/cities'
import {
  AUTO_BRANDS, AUTO_MODELS, CAROSERIE_TYPES, YEARS,
  TRUCK_BRANDS, TRUCK_BODY_TYPES, UTILITY_BRANDS,
  PIESE_CATEGORIES, AGRICOLE_TYPES, AGRICOLE_BRANDS,
  REMORCI_TYPES, CONSTRUCTII_TYPES, CONSTRUCTII_BRANDS,
} from '@/lib/constants/subcategories'
import { useState } from 'react'

interface ListingFiltersProps { category: string }

const label = (text: string) => (
  <label style={{ color: '#000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
    {text}
  </label>
)

const selectStyle = { color: '#000', backgroundColor: '#fff', width: '100%' }
const inputStyle = { color: '#000', backgroundColor: '#fff', width: '100%' }
const selectCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const inputCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition ${
        active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
      }`}
    >{children}</button>
  )
}

function RangeInputs({ labelFrom, labelTo, from, to, setFrom, setTo, placeholder = ['De la', 'Până la'] }: {
  labelFrom?: string; labelTo?: string; from: string; to: string;
  setFrom: (v: string) => void; setTo: (v: string) => void; placeholder?: [string, string]
}) {
  return (
    <div className="flex gap-2">
      <input type="number" value={from} onChange={e => setFrom(e.target.value)}
        placeholder={placeholder[0]} style={{ ...inputStyle, flex: 1 }} className={inputCls} />
      <input type="number" value={to} onChange={e => setTo(e.target.value)}
        placeholder={placeholder[1]} style={{ ...inputStyle, flex: 1 }} className={inputCls} />
    </div>
  )
}

export default function ListingFilters({ category }: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const activeSub = searchParams.get('sub') || 'autoturisme'

  // Common
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [query, setQuery] = useState(searchParams.get('q') || '')

  // Autoturisme & general auto
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [fuel, setFuel] = useState(searchParams.get('fuel') || '')
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '')
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '')
  const [caroserie, setCaroserie] = useState(searchParams.get('caroserie') || '')
  const [kmFrom, setKmFrom] = useState(searchParams.get('kmFrom') || '')
  const [kmTo, setKmTo] = useState(searchParams.get('kmTo') || '')
  const [seller, setSeller] = useState(searchParams.get('seller') || '')
  const [leasing, setLeasing] = useState(searchParams.get('leasing') || '')

  // Autoutilitare
  const [massFrom, setMassFrom] = useState(searchParams.get('massFrom') || '')
  const [massTo, setMassTo] = useState(searchParams.get('massTo') || '')
  const [volume, setVolume] = useState(searchParams.get('volume') || '')
  const [seats, setSeats] = useState(searchParams.get('seats') || '')

  // Piese
  const [pieseCategory, setPieseCategory] = useState(searchParams.get('pieseCategory') || '')
  const [stare, setStare] = useState(searchParams.get('stare') || '')

  // Agricole
  const [agricolType, setAgricolType] = useState(searchParams.get('agricolType') || '')
  const [agricolBrand, setAgricolBrand] = useState(searchParams.get('agricolBrand') || '')
  const [hpFrom, setHpFrom] = useState(searchParams.get('hpFrom') || '')
  const [hpTo, setHpTo] = useState(searchParams.get('hpTo') || '')
  const [oreFrom, setOreFrom] = useState(searchParams.get('oreFrom') || '')
  const [oreTo, setOreTo] = useState(searchParams.get('oreTo') || '')

  // Remorci
  const [remorcaType, setRemorcaType] = useState(searchParams.get('remorcaType') || '')
  const [capacitate, setCapacitate] = useState(searchParams.get('capacitate') || '')

  // Camioane
  const [truckBrand, setTruckBrand] = useState(searchParams.get('truckBrand') || '')
  const [truckModel, setTruckModel] = useState(searchParams.get('truckModel') || '')
  const [truckBody, setTruckBody] = useState(searchParams.get('truckBody') || '')
  const [toneFrom, setToneFrom] = useState(searchParams.get('toneFrom') || '')
  const [toneTo, setToneTo] = useState(searchParams.get('toneTo') || '')
  const [osii, setOsii] = useState(searchParams.get('osii') || '')

  // Constructii
  const [utilajType, setUtilajType] = useState(searchParams.get('utilajType') || '')
  const [utilajBrand, setUtilajBrand] = useState(searchParams.get('utilajBrand') || '')

  const isAuto = category === 'auto'
  const availableModels = brand && AUTO_MODELS[brand] ? AUTO_MODELS[brand] : []

  function handleFilter() {
    const params = new URLSearchParams()
    if (searchParams.get('sub')) params.set('sub', searchParams.get('sub')!)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (query) params.set('q', query)
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (fuel) params.set('fuel', fuel)
    if (yearFrom) params.set('yearFrom', yearFrom)
    if (yearTo) params.set('yearTo', yearTo)
    if (caroserie) params.set('caroserie', caroserie)
    if (kmFrom) params.set('kmFrom', kmFrom)
    if (kmTo) params.set('kmTo', kmTo)
    if (seller) params.set('seller', seller)
    if (leasing) params.set('leasing', leasing)
    if (massFrom) params.set('massFrom', massFrom)
    if (massTo) params.set('massTo', massTo)
    if (volume) params.set('volume', volume)
    if (seats) params.set('seats', seats)
    if (pieseCategory) params.set('pieseCategory', pieseCategory)
    if (stare) params.set('stare', stare)
    if (agricolType) params.set('agricolType', agricolType)
    if (agricolBrand) params.set('agricolBrand', agricolBrand)
    if (hpFrom) params.set('hpFrom', hpFrom)
    if (hpTo) params.set('hpTo', hpTo)
    if (oreFrom) params.set('oreFrom', oreFrom)
    if (oreTo) params.set('oreTo', oreTo)
    if (remorcaType) params.set('remorcaType', remorcaType)
    if (capacitate) params.set('capacitate', capacitate)
    if (truckBrand) params.set('truckBrand', truckBrand)
    if (truckModel) params.set('truckModel', truckModel)
    if (truckBody) params.set('truckBody', truckBody)
    if (toneFrom) params.set('toneFrom', toneFrom)
    if (toneTo) params.set('toneTo', toneTo)
    if (osii) params.set('osii', osii)
    if (utilajType) params.set('utilajType', utilajType)
    if (utilajBrand) params.set('utilajBrand', utilajBrand)
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  function handleReset() {
    const params = new URLSearchParams()
    if (searchParams.get('sub')) params.set('sub', searchParams.get('sub')!)
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  // ——— Oras + Pret (common) ———
  const CommonFields = () => (
    <>
      <div>
        {label('📍 Oraș')}
        <select value={city} onChange={e => setCity(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate orașele</option>
          {ROMANIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        {label('💰 Preț (€)')}
        <RangeInputs from={minPrice} to={maxPrice} setFrom={setMinPrice} setTo={setMaxPrice} />
      </div>
    </>
  )

  // ——— Marca + Model + Combustibil + An (common auto) ———
  const AutoBaseFields = ({ brands = AUTO_BRANDS }: { brands?: string[] }) => (
    <>
      <div>
        {label('🚗 Marcă')}
        <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }} style={selectStyle} className={selectCls}>
          <option value="">Toate mărcile</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {label('📋 Model')}
        {availableModels.length > 0 ? (
          <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle} className={selectCls}>
            <option value="">Toate modelele</option>
            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input type="text" value={model} onChange={e => setModel(e.target.value)}
            placeholder={brand ? 'Scrie modelul...' : 'Alege mai întâi marca'}
            disabled={!brand} style={inputStyle} className={inputCls + ' disabled:bg-gray-100'} />
        )}
      </div>
      <div>
        {label('⛽ Combustibil')}
        <div className="grid grid-cols-2 gap-1.5">
          {[['benzina','⛽ Benzină'],['diesel','🛢️ Diesel'],['hybrid','🔋 Hybrid'],['electric','⚡ Electric'],['gpl','🟢 GPL'],['plug-in-hybrid','🔌 Plug-in']].map(([v,l]) => (
            <ChipButton key={v} active={fuel === v} onClick={() => setFuel(fuel === v ? '' : v)}>{l}</ChipButton>
          ))}
        </div>
      </div>
      <div>
        {label('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </>
  )

  const SellerFields = () => (
    <div className="border-t border-gray-100 pt-3">
      {label('👤 Vânzător')}
      <div className="flex flex-wrap gap-1.5">
        {[['privat','👤 Privat'],['firma','🏢 Firmă'],['dealer','🤝 Dealer']].map(([v,l]) => (
          <ChipButton key={v} active={seller === v} onClick={() => setSeller(seller === v ? '' : v)}>{l}</ChipButton>
        ))}
      </div>
      <div className="mt-2">
        <ChipButton active={!!leasing} onClick={() => setLeasing(leasing ? '' : 'da')}>💳 Leasing</ChipButton>
      </div>
    </div>
  )

  // ——— AUTOTURISME ———
  const FiltersAutoturisme = () => (
    <>
      <AutoBaseFields />
      <button onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1">
        <span>Căutare detaliată</span><span>{showAdvanced ? '▲' : '▼'}</span>
      </button>
      {showAdvanced && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          <div>
            {label('🚙 Caroserie')}
            <div className="flex flex-wrap gap-1">
              {CAROSERIE_TYPES.map(c => (
                <ChipButton key={c} active={caroserie === c} onClick={() => setCaroserie(caroserie === c ? '' : c)}>{c}</ChipButton>
              ))}
            </div>
          </div>
          <div>
            {label('🛣️ Kilometri')}
            <RangeInputs from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} />
          </div>
        </div>
      )}
      <SellerFields />
    </>
  )

  // ——— AUTOUTILITARE ———
  const FiltersAutoutilitare = () => (
    <>
      <AutoBaseFields brands={UTILITY_BRANDS} />
      <div>
        {label('⚖️ Masă maximă (kg)')}
        <RangeInputs from={massFrom} to={massTo} setFrom={setMassFrom} setTo={setMassTo} placeholder={['Min kg', 'Max kg']} />
      </div>
      <div>
        {label('📦 Volum cargo (m³)')}
        <input type="number" value={volume} onChange={e => setVolume(e.target.value)}
          placeholder="ex: 8" style={inputStyle} className={inputCls} />
      </div>
      <div>
        {label('💺 Nr. locuri')}
        <select value={seats} onChange={e => setSeats(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate</option>
          {['2','3','4','5','6','7','8','9+'].map(s => <option key={s} value={s}>{s} locuri</option>)}
        </select>
      </div>
      <div>
        {label('🛣️ Kilometri')}
        <RangeInputs from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} />
      </div>
      <SellerFields />
    </>
  )

  // ——— PIESE AUTO ———
  const FiltersPiese = () => (
    <>
      <div>
        {label('🔩 Categorie piesă')}
        <select value={pieseCategory} onChange={e => setPieseCategory(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate categoriile</option>
          {PIESE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        {label('🚗 Marcă auto compatibilă')}
        <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }} style={selectStyle} className={selectCls}>
          <option value="">Toate mărcile</option>
          {AUTO_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {label('📋 Model auto compatibil')}
        {availableModels.length > 0 ? (
          <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle} className={selectCls}>
            <option value="">Toate</option>
            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input type="text" value={model} onChange={e => setModel(e.target.value)}
            placeholder={brand ? 'Scrie modelul...' : 'Alege mai întâi marca'}
            disabled={!brand} style={inputStyle} className={inputCls + ' disabled:bg-gray-100'} />
        )}
      </div>
      <div>
        {label('📅 An auto')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label('✅ Stare')}
        <div className="flex flex-wrap gap-1.5">
          {['Nou', 'Second-hand', 'Recondiționat'].map(s => (
            <ChipButton key={s} active={stare === s} onClick={() => setStare(stare === s ? '' : s)}>{s}</ChipButton>
          ))}
        </div>
      </div>
    </>
  )

  // ——— AGRICOLE ———
  const FiltersAgricole = () => (
    <>
      <div>
        {label('🚜 Tip utilaj agricol')}
        <select value={agricolType} onChange={e => setAgricolType(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate tipurile</option>
          {AGRICOLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        {label('🏭 Marcă')}
        <select value={agricolBrand} onChange={e => setAgricolBrand(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate mărcile</option>
          {AGRICOLE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {label('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label('⚡ Putere (CP)')}
        <RangeInputs from={hpFrom} to={hpTo} setFrom={setHpFrom} setTo={setHpTo} placeholder={['Min CP', 'Max CP']} />
      </div>
      <div>
        {label('🕐 Ore funcționare')}
        <RangeInputs from={oreFrom} to={oreTo} setFrom={setOreFrom} setTo={setOreTo} placeholder={['Min ore', 'Max ore']} />
      </div>
    </>
  )

  // ——— REMORCI ———
  const FiltersRemorci = () => (
    <>
      <div>
        {label('🔗 Tip remorcă')}
        <select value={remorcaType} onChange={e => setRemorcaType(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate tipurile</option>
          {REMORCI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        {label('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label('⚖️ Capacitate (kg)')}
        <input type="number" value={capacitate} onChange={e => setCapacitate(e.target.value)}
          placeholder="ex: 3500" style={inputStyle} className={inputCls} />
      </div>
    </>
  )

  // ——— CAMIOANE ———
  const FiltersCamioane = () => (
    <>
      <div>
        {label('🚛 Marcă')}
        <select value={truckBrand} onChange={e => setTruckBrand(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate mărcile</option>
          {TRUCK_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {label('📋 Model')}
        <input type="text" value={truckModel} onChange={e => setTruckModel(e.target.value)}
          placeholder="ex: Actros, TGX..." style={inputStyle} className={inputCls} />
      </div>
      <div>
        {label('⛽ Combustibil')}
        <div className="grid grid-cols-2 gap-1.5">
          {[['diesel','🛢️ Diesel'],['electric','⚡ Electric'],['gpl','🟢 GPL'],['hybrid','🔋 Hybrid']].map(([v,l]) => (
            <ChipButton key={v} active={fuel === v} onClick={() => setFuel(fuel === v ? '' : v)}>{l}</ChipButton>
          ))}
        </div>
      </div>
      <div>
        {label('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label('🛣️ Kilometri')}
        <RangeInputs from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} />
      </div>
      <div>
        {label('🚛 Tip caroserie')}
        <select value={truckBody} onChange={e => setTruckBody(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate tipurile</option>
          {TRUCK_BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        {label('⚖️ Masă (tone)')}
        <RangeInputs from={toneFrom} to={toneTo} setFrom={setToneFrom} setTo={setToneTo} placeholder={['Min tone', 'Max tone']} />
      </div>
      <div>
        {label('🔢 Nr. osii')}
        <select value={osii} onChange={e => setOsii(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate</option>
          {['2','3','4','5','6+'].map(o => <option key={o} value={o}>{o} osii</option>)}
        </select>
      </div>
      <SellerFields />
    </>
  )

  // ——— CONSTRUCTII ———
  const FiltersConstructii = () => (
    <>
      <div>
        {label('🏗️ Tip utilaj')}
        <select value={utilajType} onChange={e => setUtilajType(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate tipurile</option>
          {CONSTRUCTII_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        {label('🏭 Marcă')}
        <select value={utilajBrand} onChange={e => setUtilajBrand(e.target.value)} style={selectStyle} className={selectCls}>
          <option value="">Toate mărcile</option>
          {CONSTRUCTII_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {label('📋 Model')}
        <input type="text" value={model} onChange={e => setModel(e.target.value)}
          placeholder="ex: 320, JCB 3CX..." style={inputStyle} className={inputCls} />
      </div>
      <div>
        {label('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...selectStyle, flex: 1 }} className={selectCls}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label('🕐 Ore funcționare')}
        <RangeInputs from={oreFrom} to={oreTo} setFrom={setOreFrom} setTo={setOreTo} placeholder={['Min ore', 'Max ore']} />
      </div>
    </>
  )

  // ——— Decide ce filtre să afișeze ———
  function renderSubFilters() {
    if (!isAuto) return (
      <>
        <div>
          {label('🔍 Caută')}
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Caută..." style={inputStyle} className={inputCls} />
        </div>
      </>
    )

    switch (activeSub) {
      case 'autoutilitare': return <FiltersAutoutilitare />
      case 'piese': return <FiltersPiese />
      case 'agricole': return <FiltersAgricole />
      case 'remorci': return <FiltersRemorci />
      case 'camioane': return <FiltersCamioane />
      case 'constructii': return <FiltersConstructii />
      default: return <FiltersAutoturisme /> // autoturisme + fallback
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        <span>🔍 FILTRE</span>
        <span>{showFilters ? '▲' : '▼'}</span>
      </button>

      {showFilters && (
        <div className="p-4 space-y-4" style={{ color: '#000' }}>
          <CommonFields />
          {renderSubFilters()}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={handleFilter}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm">
              Aplică filtre
            </button>
            <button onClick={handleReset}
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
