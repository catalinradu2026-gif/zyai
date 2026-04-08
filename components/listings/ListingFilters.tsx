'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'
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
import { useState } from 'react'

interface ListingFiltersProps { category: string }

// ─── helpers ────────────────────────────────────────────────────
const lbl = (text: string) => (
  <label style={{ color: '#000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>{text}</label>
)
const ss = { color: '#000', backgroundColor: '#fff', width: '100%' }
const is = { color: '#000', backgroundColor: '#fff', width: '100%' }
const sc = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const ic = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1.5 rounded-lg border-2 text-xs font-semibold transition ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'}`}>
      {children}
    </button>
  )
}

function Row({ from, to, setFrom, setTo, ph = ['De la', 'Până la'] }: { from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void; ph?: [string, string] }) {
  return (
    <div className="flex gap-2">
      <input type="number" value={from} onChange={e => setFrom(e.target.value)} placeholder={ph[0]} style={{ ...is, flex: 1 }} className={ic} />
      <input type="number" value={to} onChange={e => setTo(e.target.value)} placeholder={ph[1]} style={{ ...is, flex: 1 }} className={ic} />
    </div>
  )
}

function Sel({ val, set, options, placeholder = 'Alege...' }: { val: string; set: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <select value={val} onChange={e => set(e.target.value)} style={ss} className={sc}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Chips({ val, set, options }: { val: string; set: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => <Chip key={o} active={val === o} onClick={() => set(val === o ? '' : o)}>{o}</Chip>)}
    </div>
  )
}

function MultiChips({ val, set, options }: { val: string[]; set: (v: string[]) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <Chip key={o} active={val.includes(o)} onClick={() => set(val.includes(o) ? val.filter(x => x !== o) : [...val, o])}>{o}</Chip>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────
export default function ListingFilters({ category }: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const activeSub = searchParams.get('sub') || ''

  // Common
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // AUTO - autoturisme
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [fuel, setFuel] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [caroserie, setCaroserie] = useState('')
  const [kmFrom, setKmFrom] = useState('')
  const [kmTo, setKmTo] = useState('')
  const [seller, setSeller] = useState('')
  const [leasing, setLeasing] = useState(false)
  // AUTO - autoutilitare
  const [massFrom, setMassFrom] = useState('')
  const [massTo, setMassTo] = useState('')
  const [volume, setVolume] = useState('')
  const [seats, setSeats] = useState('')
  // AUTO - piese
  const [pieseCategory, setPieseCategory] = useState('')
  const [stare, setStare] = useState('')
  // AUTO - agricole
  const [agricolType, setAgricolType] = useState('')
  const [agricolBrand, setAgricolBrand] = useState('')
  const [hpFrom, setHpFrom] = useState('')
  const [hpTo, setHpTo] = useState('')
  const [oreFrom, setOreFrom] = useState('')
  const [oreTo, setOreTo] = useState('')
  // AUTO - remorci
  const [remorcaType, setRemorcaType] = useState('')
  const [capacitate, setCapacitate] = useState('')
  // AUTO - camioane
  const [truckBrand, setTruckBrand] = useState('')
  const [truckModel, setTruckModel] = useState('')
  const [truckBody, setTruckBody] = useState('')
  const [toneFrom, setToneFrom] = useState('')
  const [toneTo, setToneTo] = useState('')
  const [osii, setOsii] = useState('')
  // AUTO - constructii utilaje
  const [utilajType, setUtilajType] = useState('')
  const [utilajBrand, setUtilajBrand] = useState('')
  // MOTO
  const [motoBrand, setMotoBrand] = useState('')
  const [motoType, setMotoType] = useState('')
  const [motoCC, setMotoCC] = useState('')

  // IMOBILIARE
  const [tipTranzactie, setTipTranzactie] = useState('')
  const [tipApartament, setTipApartament] = useState('')
  const [suprafataFrom, setSuprafataFrom] = useState('')
  const [suprafataTo, setSuprafataTo] = useState('')
  const [etaj, setEtaj] = useState('')
  const [compartimentare, setCompartimentare] = useState('')
  const [stareImob, setStareImob] = useState('')
  const [anConstructie, setAnConstructie] = useState('')
  const [tipCasa, setTipCasa] = useState('')
  const [terenFrom, setTerenFrom] = useState('')
  const [terenTo, setTerenTo] = useState('')
  const [nrCamere, setNrCamere] = useState('')
  const [tipTeren, setTipTeren] = useState('')
  const [tipSpatiu, setTipSpatiu] = useState('')
  const [facilitati, setFacilitati] = useState<string[]>([])

  // JOBURI
  const [jobDomeniu, setJobDomeniu] = useState('')
  const [tipContract, setTipContract] = useState('')
  const [nivelExperienta, setNivelExperienta] = useState('')
  const [regimMunca, setRegimMunca] = useState('')
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

  const availableModels = brand && AUTO_MODELS[brand] ? AUTO_MODELS[brand] : []

  function buildParams() {
    const p = new URLSearchParams()
    if (activeSub) p.set('sub', activeSub)
    if (city) p.set('city', city)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    // auto
    if (brand) p.set('brand', brand)
    if (model) p.set('model', model)
    if (fuel) p.set('fuel', fuel)
    if (yearFrom) p.set('yearFrom', yearFrom)
    if (yearTo) p.set('yearTo', yearTo)
    if (caroserie) p.set('caroserie', caroserie)
    if (kmFrom) p.set('kmFrom', kmFrom)
    if (kmTo) p.set('kmTo', kmTo)
    if (seller) p.set('seller', seller)
    if (leasing) p.set('leasing', 'da')
    if (massFrom) p.set('massFrom', massFrom)
    if (massTo) p.set('massTo', massTo)
    if (volume) p.set('volume', volume)
    if (seats) p.set('seats', seats)
    if (pieseCategory) p.set('pieseCategory', pieseCategory)
    if (stare) p.set('stare', stare)
    if (agricolType) p.set('agricolType', agricolType)
    if (agricolBrand) p.set('agricolBrand', agricolBrand)
    if (hpFrom) p.set('hpFrom', hpFrom)
    if (hpTo) p.set('hpTo', hpTo)
    if (oreFrom) p.set('oreFrom', oreFrom)
    if (oreTo) p.set('oreTo', oreTo)
    if (remorcaType) p.set('remorcaType', remorcaType)
    if (capacitate) p.set('capacitate', capacitate)
    if (truckBrand) p.set('truckBrand', truckBrand)
    if (truckModel) p.set('truckModel', truckModel)
    if (truckBody) p.set('truckBody', truckBody)
    if (toneFrom) p.set('toneFrom', toneFrom)
    if (toneTo) p.set('toneTo', toneTo)
    if (osii) p.set('osii', osii)
    if (utilajType) p.set('utilajType', utilajType)
    if (utilajBrand) p.set('utilajBrand', utilajBrand)
    if (motoBrand) p.set('motoBrand', motoBrand)
    if (motoType) p.set('motoType', motoType)
    if (motoCC) p.set('motoCC', motoCC)
    // imobiliare
    if (tipTranzactie) p.set('tipTranzactie', tipTranzactie)
    if (tipApartament) p.set('tipApartament', tipApartament)
    if (suprafataFrom) p.set('suprafataFrom', suprafataFrom)
    if (suprafataTo) p.set('suprafataTo', suprafataTo)
    if (etaj) p.set('etaj', etaj)
    if (compartimentare) p.set('compartimentare', compartimentare)
    if (stareImob) p.set('stareImob', stareImob)
    if (anConstructie) p.set('anConstructie', anConstructie)
    if (tipCasa) p.set('tipCasa', tipCasa)
    if (terenFrom) p.set('terenFrom', terenFrom)
    if (terenTo) p.set('terenTo', terenTo)
    if (nrCamere) p.set('nrCamere', nrCamere)
    if (tipTeren) p.set('tipTeren', tipTeren)
    if (tipSpatiu) p.set('tipSpatiu', tipSpatiu)
    if (facilitati.length) p.set('facilitati', facilitati.join(','))
    // joburi
    if (jobDomeniu) p.set('jobDomeniu', jobDomeniu)
    if (tipContract) p.set('tipContract', tipContract)
    if (nivelExperienta) p.set('nivelExperienta', nivelExperienta)
    if (regimMunca) p.set('regimMunca', regimMunca)
    if (nivelStudii) p.set('nivelStudii', nivelStudii)
    if (salariuFrom) p.set('salariuFrom', salariuFrom)
    if (salariuTo) p.set('salariuTo', salariuTo)
    if (beneficii.length) p.set('beneficii', beneficii.join(','))
    if (itStack.length) p.set('itStack', itStack.join(','))
    // servicii
    if (serviciiCategorie) p.set('serviciiCategorie', serviciiCategorie)
    if (disponibilitate) p.set('disponibilitate', disponibilitate)
    if (zona) p.set('zona', zona)
    if (experienta) p.set('experienta', experienta)
    return p
  }

  const CityField = () => (
    <div>
      {lbl('📍 Oraș')}
      <Sel val={city} set={setCity} options={ROMANIAN_CITIES} placeholder="Toate orașele" />
    </div>
  )

  const PriceField = ({ currency = 'EUR' }: { currency?: string }) => (
    <div>
      {lbl(`💰 Preț (${currency})`)}
      <Row from={minPrice} to={maxPrice} setFrom={setMinPrice} setTo={setMaxPrice} />
    </div>
  )

  const SellerField = () => (
    <div className="border-t border-gray-100 pt-3">
      {lbl('👤 Vânzător')}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {['privat', 'firma', 'dealer'].map(v => (
          <Chip key={v} active={seller === v} onClick={() => setSeller(seller === v ? '' : v)}>
            {v === 'privat' ? '👤 Privat' : v === 'firma' ? '🏢 Firmă' : '🤝 Dealer'}
          </Chip>
        ))}
      </div>
      <Chip active={leasing} onClick={() => setLeasing(!leasing)}>💳 Predare leasing</Chip>
    </div>
  )

  const AutoBaseFields = ({ brands = AUTO_BRANDS }: { brands?: string[] }) => (
    <>
      <div>
        {lbl('🚗 Marcă')}
        <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }} style={ss} className={sc}>
          <option value="">Toate mărcile</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        {lbl('📋 Model')}
        {availableModels.length > 0 ? (
          <Sel val={model} set={setModel} options={availableModels} placeholder="Toate modelele" />
        ) : (
          <input type="text" value={model} onChange={e => setModel(e.target.value)}
            placeholder={brand ? 'Scrie modelul...' : 'Alege mai întâi marca'}
            disabled={!brand} style={is} className={ic + ' disabled:bg-gray-100 disabled:text-gray-400'} />
        )}
      </div>
      <div>
        {lbl('⛽ Combustibil')}
        <div className="grid grid-cols-2 gap-1.5">
          {[['benzina', '⛽ Benzină'], ['diesel', '🛢️ Diesel'], ['hybrid', '🔋 Hybrid'], ['electric', '⚡ Electric'], ['gpl', '🟢 GPL'], ['plug-in-hybrid', '🔌 Plug-in']].map(([v, l]) => (
            <Chip key={v} active={fuel === v} onClick={() => setFuel(fuel === v ? '' : v)}>{l}</Chip>
          ))}
        </div>
      </div>
      <div>
        {lbl('📅 An fabricație')}
        <div className="flex gap-2">
          <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}>
            <option value="">De la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}>
            <option value="">Până la</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </>
  )

  // ════════════════════════════════════════
  // AUTO SUBCATEGORY FILTERS
  // ════════════════════════════════════════
  function renderAutoFilters() {
    switch (activeSub) {
      case 'autoutilitare': return (
        <>
          <AutoBaseFields brands={UTILITY_BRANDS} />
          <div>{lbl('⚖️ Masă max (kg)')}<Row from={massFrom} to={massTo} setFrom={setMassFrom} setTo={setMassTo} ph={['Min kg', 'Max kg']} /></div>
          <div>{lbl('📦 Volum cargo (m³)')}<input type="number" value={volume} onChange={e => setVolume(e.target.value)} placeholder="ex: 8" style={is} className={ic} /></div>
          <div>{lbl('💺 Nr. locuri')}<Sel val={seats} set={setSeats} options={['2', '3', '4', '5', '6', '7', '8', '9+']} placeholder="Toate" /></div>
          <div>{lbl('🛣️ Kilometri')}<Row from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} /></div>
          <SellerField />
        </>
      )
      case 'piese': return (
        <>
          <div>{lbl('🔩 Categorie piesă')}<Sel val={pieseCategory} set={setPieseCategory} options={PIESE_CATEGORIES} /></div>
          <div>{lbl('🚗 Marcă compatibilă')}
            <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }} style={ss} className={sc}>
              <option value="">Toate</option>
              {AUTO_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>{lbl('📋 Model compatibil')}
            {availableModels.length > 0
              ? <Sel val={model} set={setModel} options={availableModels} placeholder="Toate" />
              : <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder={brand ? 'Scrie modelul...' : 'Alege marca'} disabled={!brand} style={is} className={ic + ' disabled:bg-gray-100'} />}
          </div>
          <div>{lbl('📅 An auto')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('✅ Stare')}<Chips val={stare} set={setStare} options={['Nou', 'Second-hand', 'Recondiționat']} /></div>
        </>
      )
      case 'agricole': return (
        <>
          <div>{lbl('🚜 Tip utilaj')}<Sel val={agricolType} set={setAgricolType} options={AGRICOLE_TYPES} /></div>
          <div>{lbl('🏭 Marcă')}<Sel val={agricolBrand} set={setAgricolBrand} options={AGRICOLE_BRANDS} /></div>
          <div>{lbl('📅 An')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('⚡ Putere (CP)')}<Row from={hpFrom} to={hpTo} setFrom={setHpFrom} setTo={setHpTo} ph={['Min CP', 'Max CP']} /></div>
          <div>{lbl('🕐 Ore funcționare')}<Row from={oreFrom} to={oreTo} setFrom={setOreFrom} setTo={setOreTo} ph={['Min', 'Max']} /></div>
        </>
      )
      case 'remorci': return (
        <>
          <div>{lbl('🔗 Tip remorcă')}<Sel val={remorcaType} set={setRemorcaType} options={REMORCI_TYPES} /></div>
          <div>{lbl('📅 An')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('⚖️ Capacitate (kg)')}<input type="number" value={capacitate} onChange={e => setCapacitate(e.target.value)} placeholder="ex: 3500" style={is} className={ic} /></div>
        </>
      )
      case 'camioane': return (
        <>
          <div>{lbl('🚛 Marcă')}<Sel val={truckBrand} set={setTruckBrand} options={TRUCK_BRANDS} /></div>
          <div>{lbl('📋 Model')}<input type="text" value={truckModel} onChange={e => setTruckModel(e.target.value)} placeholder="ex: Actros, TGX..." style={is} className={ic} /></div>
          <div>{lbl('⛽ Combustibil')}
            <div className="grid grid-cols-2 gap-1.5">
              {[['diesel', '🛢️ Diesel'], ['electric', '⚡ Electric'], ['gpl', '🟢 GPL'], ['hybrid', '🔋 Hybrid']].map(([v, l]) => (
                <Chip key={v} active={fuel === v} onClick={() => setFuel(fuel === v ? '' : v)}>{l}</Chip>
              ))}
            </div>
          </div>
          <div>{lbl('📅 An')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('🛣️ Kilometri')}<Row from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} /></div>
          <div>{lbl('🚛 Tip caroserie')}<Sel val={truckBody} set={setTruckBody} options={TRUCK_BODY_TYPES} /></div>
          <div>{lbl('⚖️ Masă (tone)')}<Row from={toneFrom} to={toneTo} setFrom={setToneFrom} setTo={setToneTo} ph={['Min', 'Max']} /></div>
          <div>{lbl('🔢 Nr. osii')}<Sel val={osii} set={setOsii} options={['2', '3', '4', '5', '6+']} placeholder="Toate" /></div>
          <SellerField />
        </>
      )
      case 'constructii': return (
        <>
          <div>{lbl('🏗️ Tip utilaj')}<Sel val={utilajType} set={setUtilajType} options={CONSTRUCTII_TYPES} /></div>
          <div>{lbl('🏭 Marcă')}<Sel val={utilajBrand} set={setUtilajBrand} options={CONSTRUCTII_BRANDS} /></div>
          <div>{lbl('📋 Model')}<input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="ex: 320, JCB 3CX..." style={is} className={ic} /></div>
          <div>{lbl('📅 An')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('🕐 Ore funcționare')}<Row from={oreFrom} to={oreTo} setFrom={setOreFrom} setTo={setOreTo} ph={['Min', 'Max']} /></div>
        </>
      )
      case 'motociclete': return (
        <>
          <div>{lbl('🏍️ Marcă')}<Sel val={motoBrand} set={setMotoBrand} options={MOTO_BRANDS} /></div>
          <div>{lbl('🏷️ Tip')}<Chips val={motoType} set={setMotoType} options={MOTO_TYPES} /></div>
          <div>{lbl('🔧 Cilindree')}<Chips val={motoCC} set={setMotoCC} options={MOTO_CC} /></div>
          <div>{lbl('📅 An')}<div className="flex gap-2">
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">De la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={{ ...ss, flex: 1 }} className={sc}><option value="">Până la</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div></div>
          <div>{lbl('🛣️ Kilometri')}<Row from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} /></div>
          <SellerField />
        </>
      )
      default: return ( // autoturisme
        <>
          <AutoBaseFields />
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1">
            <span>Căutare detaliată</span><span>{showAdvanced ? '▲' : '▼'}</span>
          </button>
          {showAdvanced && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div>{lbl('🚙 Caroserie')}<Chips val={caroserie} set={setCaroserie} options={CAROSERIE_TYPES} /></div>
              <div>{lbl('🛣️ Kilometri')}<Row from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} /></div>
            </div>
          )}
          <SellerField />
        </>
      )
    }
  }

  // ════════════════════════════════════════
  // IMOBILIARE SUBCATEGORY FILTERS
  // ════════════════════════════════════════
  function renderImobiliareFilters() {
    return (
      <>
        <div>{lbl('🔄 Tip tranzacție')}<Chips val={tipTranzactie} set={setTipTranzactie} options={IMOB_TIP_TRANZACTIE} /></div>

        {(activeSub === 'apartamente' || activeSub === '') && (
          <>
            <div>{lbl('🏢 Tip apartament')}<Chips val={tipApartament} set={setTipApartament} options={IMOB_TIP_APARTAMENT} /></div>
            <div>{lbl('🏗️ Compartimentare')}<Chips val={compartimentare} set={setCompartimentare} options={IMOB_COMPARTIMENTARE} /></div>
            <div>{lbl('🏢 Etaj')}<Sel val={etaj} set={setEtaj} options={IMOB_ETAJE} /></div>
          </>
        )}
        {activeSub === 'case' && (
          <>
            <div>{lbl('🏠 Tip casă')}<Chips val={tipCasa} set={setTipCasa} options={IMOB_TIP_CASA} /></div>
            <div>{lbl('🌿 Teren (mp)')}<Row from={terenFrom} to={terenTo} setFrom={setTerenFrom} setTo={setTerenTo} ph={['Min mp', 'Max mp']} /></div>
            <div>{lbl('🛏️ Nr. camere')}<Chips val={nrCamere} set={setNrCamere} options={['1', '2', '3', '4', '5', '6+']} /></div>
          </>
        )}
        {activeSub === 'terenuri' && (
          <div>{lbl('🌿 Tip teren')}<Chips val={tipTeren} set={setTipTeren} options={IMOB_TIP_TEREN} /></div>
        )}
        {activeSub === 'spatii-comerciale' && (
          <div>{lbl('🏪 Tip spațiu')}<Chips val={tipSpatiu} set={setTipSpatiu} options={IMOB_TIP_SPATIU} /></div>
        )}

        <div>{lbl('📐 Suprafață (mp)')}<Row from={suprafataFrom} to={suprafataTo} setFrom={setSuprafataFrom} setTo={setSuprafataTo} ph={['Min mp', 'Max mp']} /></div>
        <div>{lbl('🔨 Stare')}<Chips val={stareImob} set={setStareImob} options={IMOB_STARE} /></div>
        <div>{lbl('📅 An construcție')}<Sel val={anConstructie} set={setAnConstructie} options={IMOB_AN_CONSTRUCTIE} /></div>

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1">
          <span>Facilități</span><span>{showAdvanced ? '▲' : '▼'}</span>
        </button>
        {showAdvanced && (
          <div>{lbl('✅ Facilități')}<MultiChips val={facilitati} set={setFacilitati} options={IMOB_FACILITATI} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // JOBURI FILTERS
  // ════════════════════════════════════════
  function renderJoburiFilters() {
    return (
      <>
        <div>{lbl('💼 Domeniu')}<Sel val={jobDomeniu} set={setJobDomeniu} options={JOB_DOMENII} /></div>
        {(activeSub === 'it' || activeSub === '') && (
          <div>
            {lbl('💻 Tehnologii/Stack')}
            <MultiChips val={itStack} set={setItStack} options={JOB_IT_STACK} />
          </div>
        )}
        <div>{lbl('📄 Tip contract')}<Chips val={tipContract} set={setTipContract} options={JOB_TIP_CONTRACT} /></div>
        <div>{lbl('🏢 Regim muncă')}<Chips val={regimMunca} set={setRegimMunca} options={JOB_REGIM_MUNCA} /></div>
        <div>{lbl('📊 Nivel experiență')}<Sel val={nivelExperienta} set={setNivelExperienta} options={JOB_NIVEL_EXPERIENTA} /></div>
        <div>{lbl('🎓 Studii')}<Sel val={nivelStudii} set={setNivelStudii} options={JOB_NIVEL_STUDII} /></div>
        <div>{lbl('💰 Salariu net (RON)')}<Row from={salariuFrom} to={salariuTo} setFrom={setSalariuFrom} setTo={setSalariuTo} ph={['Min RON', 'Max RON']} /></div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1">
          <span>Beneficii</span><span>{showAdvanced ? '▲' : '▼'}</span>
        </button>
        {showAdvanced && (
          <div><MultiChips val={beneficii} set={setBeneficii} options={JOB_BENEFICII} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // SERVICII FILTERS
  // ════════════════════════════════════════
  function renderServiciiFilters() {
    return (
      <>
        <div>{lbl('🔧 Categorie serviciu')}<Sel val={serviciiCategorie} set={setServiciiCategorie} options={SERVICII_CATEGORII} /></div>
        <div>{lbl('📅 Disponibilitate')}<Chips val={disponibilitate} set={setDisponibilitate} options={SERVICII_DISPONIBILITATE} /></div>
        <div>{lbl('📍 Zonă acoperire')}<Chips val={zona} set={setZona} options={SERVICII_ZONA} /></div>
        <div>{lbl('⭐ Experiență')}<Chips val={experienta} set={setExperienta} options={SERVICII_EXPERIENTA} /></div>
      </>
    )
  }

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  function renderFilters() {
    switch (category) {
      case 'auto': return renderAutoFilters()
      case 'imobiliare': return renderImobiliareFilters()
      case 'joburi': return renderJoburiFilters()
      case 'servicii': return renderServiciiFilters()
      default: return null
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
          <CityField />
          <PriceField currency={category === 'joburi' ? 'RON' : category === 'imobiliare' ? 'EUR' : 'EUR'} />
          {renderFilters()}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => router.push(`/marketplace/${category}?${buildParams().toString()}`)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              Aplică filtre
            </button>
            <button
              onClick={() => router.push(`/marketplace/${category}${activeSub ? `?sub=${activeSub}` : ''}`)}
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
