'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ROMANIAN_CITIES, ROMANIAN_COUNTIES } from '@/lib/constants/cities'
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
import { useState } from 'react'

interface ListingFiltersProps { category: string }

// ─── helpers ────────────────────────────────────────────────────
const lbl = (text: string) => (
  <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</label>
)
const ss = { color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)', width: '100%', border: '1px solid var(--border-subtle)' }
const is = { color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)', width: '100%', border: '1px solid var(--border-subtle)' }
const sc = 'px-3 py-2 rounded-lg text-sm focus:outline-none'
const ic = 'px-3 py-2 rounded-lg text-sm focus:outline-none'

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
      style={active
        ? { background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.7)', color: '#A78BFA' }
        : { background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
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
  const [county, setCounty] = useState(searchParams.get('county') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // Helper: preia valoarea din URL sau fallback la default
  const sp = (k: string, d = '') => searchParams.get(k) || d
  const spArr = (k: string): string[] => {
    const v = searchParams.get(k)
    return v ? v.split(',').filter(Boolean) : []
  }

  // AUTO - autoturisme (multi-brand)
  const [brands, setBrands] = useState<string[]>(spArr('brands'))
  const [brand, setBrand] = useState(sp('brand'))
  const [model, setModel] = useState(sp('model'))
  const [fuel, setFuel] = useState(sp('fuel'))
  const [yearFrom, setYearFrom] = useState(sp('yearFrom'))
  const [yearTo, setYearTo] = useState(sp('yearTo'))
  const [caroserie, setCaroserie] = useState(sp('caroserie'))
  const [kmFrom, setKmFrom] = useState(sp('kmFrom'))
  const [kmTo, setKmTo] = useState(sp('kmTo'))
  const [seller, setSeller] = useState(sp('seller'))
  const [leasing, setLeasing] = useState(sp('leasing') === 'da')
  const [cilindreeFrom, setCilindreeFrom] = useState(sp('cilindreeFrom'))
  const [cilindreeTo, setCilindreeTo] = useState(sp('cilindreeTo'))
  const [putereFrom, setPutereFrom] = useState(sp('putereFrom'))
  const [putereTo, setPutereTo] = useState(sp('putereTo'))
  // AUTO - autoutilitare
  const [massFrom, setMassFrom] = useState(sp('massFrom'))
  const [massTo, setMassTo] = useState(sp('massTo'))
  const [volume, setVolume] = useState(sp('volume'))
  const [seats, setSeats] = useState(sp('seats'))
  // AUTO - piese
  const [pieseCategory, setPieseCategory] = useState(sp('pieseCategory'))
  const [stare, setStare] = useState(sp('stare'))
  // AUTO - agricole
  const [agricolType, setAgricolType] = useState(sp('agricolType'))
  const [agricolBrand, setAgricolBrand] = useState(sp('agricolBrand'))
  const [hpFrom, setHpFrom] = useState(sp('hpFrom'))
  const [hpTo, setHpTo] = useState(sp('hpTo'))
  const [oreFrom, setOreFrom] = useState(sp('oreFrom'))
  const [oreTo, setOreTo] = useState(sp('oreTo'))
  // AUTO - remorci
  const [remorcaType, setRemorcaType] = useState(sp('remorcaType'))
  const [capacitate, setCapacitate] = useState(sp('capacitate'))
  // AUTO - camioane
  const [truckBrand, setTruckBrand] = useState(sp('truckBrand'))
  const [truckModel, setTruckModel] = useState(sp('truckModel'))
  const [truckBody, setTruckBody] = useState(sp('truckBody'))
  const [toneFrom, setToneFrom] = useState(sp('toneFrom'))
  const [toneTo, setToneTo] = useState(sp('toneTo'))
  const [osii, setOsii] = useState(sp('osii'))
  // AUTO - constructii utilaje
  const [utilajType, setUtilajType] = useState(sp('utilajType'))
  const [utilajBrand, setUtilajBrand] = useState(sp('utilajBrand'))
  // MOTO
  const [motoBrand, setMotoBrand] = useState(sp('motoBrand'))
  const [motoType, setMotoType] = useState(sp('motoType'))
  const [motoCC, setMotoCC] = useState(sp('motoCC'))

  // IMOBILIARE
  const [tipTranzactie, setTipTranzactie] = useState(sp('tipTranzactie'))
  const [tipApartament, setTipApartament] = useState(sp('tipApartament'))
  const [suprafataFrom, setSuprafataFrom] = useState(sp('suprafataFrom'))
  const [suprafataTo, setSuprafataTo] = useState(sp('suprafataTo'))
  const [etaj, setEtaj] = useState(sp('etaj'))
  const [compartimentare, setCompartimentare] = useState(sp('compartimentare'))
  const [stareImob, setStareImob] = useState(sp('stareImob'))
  const [anConstructie, setAnConstructie] = useState(sp('anConstructie'))
  const [tipCasa, setTipCasa] = useState(sp('tipCasa'))
  const [terenFrom, setTerenFrom] = useState(sp('terenFrom'))
  const [terenTo, setTerenTo] = useState(sp('terenTo'))
  const [nrCamere, setNrCamere] = useState(sp('nrCamere'))
  const [tipTeren, setTipTeren] = useState(sp('tipTeren'))
  const [tipSpatiu, setTipSpatiu] = useState(sp('tipSpatiu'))
  const [facilitati, setFacilitati] = useState<string[]>(spArr('facilitati'))

  // JOBURI
  const [jobDomeniu, setJobDomeniu] = useState(sp('jobDomeniu'))
  const [tipContract, setTipContract] = useState(sp('tipContract'))
  const [nivelExperienta, setNivelExperienta] = useState(sp('nivelExperienta'))
  const [regimMunca, setRegimMunca] = useState(sp('regimMunca'))
  const [nivelStudii, setNivelStudii] = useState(sp('nivelStudii'))
  const [salariuFrom, setSalariuFrom] = useState(sp('salariuFrom'))
  const [salariuTo, setSalariuTo] = useState(sp('salariuTo'))
  const [beneficii, setBeneficii] = useState<string[]>(spArr('beneficii'))
  const [itStack, setItStack] = useState<string[]>(spArr('itStack'))

  // SERVICII
  const [serviciiCategorie, setServiciiCategorie] = useState(sp('serviciiCategorie'))
  const [disponibilitate, setDisponibilitate] = useState(sp('disponibilitate'))
  const [zona, setZona] = useState(sp('zona'))
  const [experienta, setExperienta] = useState(sp('experienta'))

  // ELECTRONICE
  const [electroStare, setElectroStare] = useState(sp('electroStare'))
  const [telefonBrand, setTelefonBrand] = useState(sp('telefonBrand'))
  const [telefonStoraj, setTelefonStoraj] = useState(sp('telefonStoraj'))
  const [telefonRam, setTelefonRam] = useState(sp('telefonRam'))
  const [laptopBrand, setLaptopBrand] = useState(sp('laptopBrand'))
  const [laptopRam, setLaptopRam] = useState(sp('laptopRam'))
  const [laptopStoraj, setLaptopStoraj] = useState(sp('laptopStoraj'))
  const [laptopDiag, setLaptopDiag] = useState(sp('laptopDiag'))
  const [laptopOs, setLaptopOs] = useState(sp('laptopOs'))
  const [laptopProcesor, setLaptopProcesor] = useState(sp('laptopProcesor'))
  const [tvDiag, setTvDiag] = useState(sp('tvDiag'))
  const [tvRez, setTvRez] = useState(sp('tvRez'))
  const [tvTip, setTvTip] = useState(sp('tvTip'))
  const [audioTip, setAudioTip] = useState(sp('audioTip'))
  const [gamingPlatforma, setGamingPlatforma] = useState(sp('gamingPlatforma'))
  const [gamingTip, setGamingTip] = useState(sp('gamingTip'))
  const [fotoTip, setFotoTip] = useState(sp('fotoTip'))
  const [fotoBrand, setFotoBrand] = useState(sp('fotoBrand'))
  const [tabletaStoraj, setTabletaStoraj] = useState(sp('tabletaStoraj'))
  const [tabletaConect, setTabletaConect] = useState(sp('tabletaConect'))

  // MODĂ
  const [modaStare, setModaStare] = useState(sp('modaStare'))
  const [modaGen, setModaGen] = useState(sp('modaGen'))
  const [modaMarimiAdulti, setModaMarimiAdulti] = useState(sp('modaMarimiAdulti'))
  const [modaMarimiPantofi, setModaMarimiPantofi] = useState(sp('modaMarimiPantofi'))
  const [modaMarimiCopii, setModaMarimiCopii] = useState(sp('modaMarimiCopii'))
  const [modaMaterial, setModaMaterial] = useState(sp('modaMaterial'))
  const [bijuteriiTip, setBijuteriiTip] = useState(sp('bijuteriiTip'))
  const [bijuteriiMaterial, setBijuteriiMaterial] = useState(sp('bijuteriiMaterial'))
  const [gentiTip, setGentiTip] = useState(sp('gentiTip'))

  // CASĂ & GRĂDINĂ
  const [casaStare, setCasaStare] = useState(sp('casaStare'))
  const [mobilaTip, setMobilaTip] = useState(sp('mobilaTip'))
  const [mobilaMaterial, setMobilaMaterial] = useState(sp('mobilaMaterial'))
  const [electrocasniceTip, setElectrocasniceTip] = useState(sp('electrocasniceTip'))
  const [electrocasniceBrand, setElectrocasniceBrand] = useState(sp('electrocasniceBrand'))
  const [gradinaTip, setGradinaTip] = useState(sp('gradinaTip'))
  const [decorareTip, setDecoriareTip] = useState(sp('decorareTip'))
  const [iluminatTip, setIluminatTip] = useState(sp('iluminatTip'))
  const [bricolajTip, setBricolajTip] = useState(sp('bricolajTip'))

  // SPORT
  const [sportStare, setSportStare] = useState(sp('sportStare'))
  const [sportTip, setSportTip] = useState(sp('sportTip'))
  const [bicicletaTip, setBicicletaTip] = useState(sp('bicicletaTip'))
  const [bicicletaBrand, setBicicletaBrand] = useState(sp('bicicletaBrand'))
  const [bicicletaCadru, setBicicletaCadru] = useState(sp('bicicletaCadru'))
  const [fitnessTip, setFitnessTip] = useState(sp('fitnessTip'))
  const [outdoorTip, setOutdoorTip] = useState(sp('outdoorTip'))
  const [sporturiApaTip, setSporturiApaTip] = useState(sp('sporturiApaTip'))
  const [sporturiIarnaTip, setSporturiIarnaTip] = useState(sp('sporturiIarnaTip'))

  // ANIMALE
  const [animaleVarsta, setAnimaleVarsta] = useState(sp('animaleVarsta'))
  const [animaleSex, setAnimaleSex] = useState(sp('animaleSex'))
  const [cainRasa, setCainRasa] = useState(sp('cainRasa'))
  const [pisicaRasa, setPisicaRasa] = useState(sp('pisicaRasa'))
  const [pedigree, setPedigree] = useState(sp('pedigree'))
  const [vaccinat, setVaccinat] = useState(sp('vaccinat'))
  const [accesoriiAnimaleTip, setAccesoriiAnimaleTip] = useState(sp('accesoriiAnimaleTip'))

  // MAMĂ & COPILUL
  const [mamaStare, setMamaStare] = useState(sp('mamaStare'))
  const [mamaVarstaCopil, setMamaVarstaCopil] = useState(sp('mamaVarstaCopil'))
  const [mamaGenCopil, setMamaGenCopil] = useState(sp('mamaGenCopil'))
  const [jucariiVarsta, setJucariiVarsta] = useState(sp('jucariiVarsta'))
  const [jucariiTip, setJucariiTip] = useState(sp('jucariiTip'))
  const [caruciTip, setCaruciTip] = useState(sp('caruciTip'))
  const [caruciiBrand, setCaruciiBrand] = useState(sp('caruciiBrand'))
  const [mobilierCopiiTip, setMobilierCopiiTip] = useState(sp('mobilierCopiiTip'))
  const [ingrijireTip, setIngrijireTip] = useState(sp('ingrijireTip'))

  const singleBrand = brands.length === 1 ? brands[0] : brand
  const availableModels = singleBrand && AUTO_MODELS[singleBrand] ? AUTO_MODELS[singleBrand] : []

  function buildParams() {
    const p = new URLSearchParams()
    if (activeSub) p.set('sub', activeSub)
    const currentSort = searchParams.get('sort')
    if (currentSort && currentSort !== 'newest') p.set('sort', currentSort)
    if (county) p.set('county', county)
    if (city) p.set('city', city)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    // auto
    if (brands.length) p.set('brands', brands.join(','))
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
    if (cilindreeFrom) p.set('cilindreeFrom', cilindreeFrom)
    if (cilindreeTo) p.set('cilindreeTo', cilindreeTo)
    if (putereFrom) p.set('putereFrom', putereFrom)
    if (putereTo) p.set('putereTo', putereTo)
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
    // electronice
    if (electroStare) p.set('electroStare', electroStare)
    if (telefonBrand) p.set('telefonBrand', telefonBrand)
    if (telefonStoraj) p.set('telefonStoraj', telefonStoraj)
    if (telefonRam) p.set('telefonRam', telefonRam)
    if (laptopBrand) p.set('laptopBrand', laptopBrand)
    if (laptopRam) p.set('laptopRam', laptopRam)
    if (laptopStoraj) p.set('laptopStoraj', laptopStoraj)
    if (laptopDiag) p.set('laptopDiag', laptopDiag)
    if (laptopOs) p.set('laptopOs', laptopOs)
    if (laptopProcesor) p.set('laptopProcesor', laptopProcesor)
    if (tvDiag) p.set('tvDiag', tvDiag)
    if (tvRez) p.set('tvRez', tvRez)
    if (tvTip) p.set('tvTip', tvTip)
    if (audioTip) p.set('audioTip', audioTip)
    if (gamingPlatforma) p.set('gamingPlatforma', gamingPlatforma)
    if (gamingTip) p.set('gamingTip', gamingTip)
    if (fotoTip) p.set('fotoTip', fotoTip)
    if (fotoBrand) p.set('fotoBrand', fotoBrand)
    if (tabletaStoraj) p.set('tabletaStoraj', tabletaStoraj)
    if (tabletaConect) p.set('tabletaConect', tabletaConect)
    // modă
    if (modaStare) p.set('modaStare', modaStare)
    if (modaGen) p.set('modaGen', modaGen)
    if (modaMarimiAdulti) p.set('modaMarimiAdulti', modaMarimiAdulti)
    if (modaMarimiPantofi) p.set('modaMarimiPantofi', modaMarimiPantofi)
    if (modaMarimiCopii) p.set('modaMarimiCopii', modaMarimiCopii)
    if (modaMaterial) p.set('modaMaterial', modaMaterial)
    if (bijuteriiTip) p.set('bijuteriiTip', bijuteriiTip)
    if (bijuteriiMaterial) p.set('bijuteriiMaterial', bijuteriiMaterial)
    if (gentiTip) p.set('gentiTip', gentiTip)
    // casă & grădină
    if (casaStare) p.set('casaStare', casaStare)
    if (mobilaTip) p.set('mobilaTip', mobilaTip)
    if (mobilaMaterial) p.set('mobilaMaterial', mobilaMaterial)
    if (electrocasniceTip) p.set('electrocasniceTip', electrocasniceTip)
    if (electrocasniceBrand) p.set('electrocasniceBrand', electrocasniceBrand)
    if (gradinaTip) p.set('gradinaTip', gradinaTip)
    if (decorareTip) p.set('decorareTip', decorareTip)
    if (iluminatTip) p.set('iluminatTip', iluminatTip)
    if (bricolajTip) p.set('bricolajTip', bricolajTip)
    // sport
    if (sportStare) p.set('sportStare', sportStare)
    if (sportTip) p.set('sportTip', sportTip)
    if (bicicletaTip) p.set('bicicletaTip', bicicletaTip)
    if (bicicletaBrand) p.set('bicicletaBrand', bicicletaBrand)
    if (bicicletaCadru) p.set('bicicletaCadru', bicicletaCadru)
    if (fitnessTip) p.set('fitnessTip', fitnessTip)
    if (outdoorTip) p.set('outdoorTip', outdoorTip)
    if (sporturiApaTip) p.set('sporturiApaTip', sporturiApaTip)
    if (sporturiIarnaTip) p.set('sporturiIarnaTip', sporturiIarnaTip)
    // animale
    if (animaleVarsta) p.set('animaleVarsta', animaleVarsta)
    if (animaleSex) p.set('animaleSex', animaleSex)
    if (cainRasa) p.set('cainRasa', cainRasa)
    if (pisicaRasa) p.set('pisicaRasa', pisicaRasa)
    if (pedigree) p.set('pedigree', pedigree)
    if (vaccinat) p.set('vaccinat', vaccinat)
    if (accesoriiAnimaleTip) p.set('accesoriiAnimaleTip', accesoriiAnimaleTip)
    // mamă & copilul
    if (mamaStare) p.set('mamaStare', mamaStare)
    if (mamaVarstaCopil) p.set('mamaVarstaCopil', mamaVarstaCopil)
    if (mamaGenCopil) p.set('mamaGenCopil', mamaGenCopil)
    if (jucariiVarsta) p.set('jucariiVarsta', jucariiVarsta)
    if (jucariiTip) p.set('jucariiTip', jucariiTip)
    if (caruciTip) p.set('caruciTip', caruciTip)
    if (caruciiBrand) p.set('caruciiBrand', caruciiBrand)
    if (mobilierCopiiTip) p.set('mobilierCopiiTip', mobilierCopiiTip)
    if (ingrijireTip) p.set('ingrijireTip', ingrijireTip)
    return p
  }

  const LocationField = () => (
    <div className="space-y-2">
      <div>
        {lbl('🗺️ Județ')}
        <select value={county} onChange={e => { setCounty(e.target.value); setCity('') }} style={ss} className={sc}>
          <option value="">Toate județele</option>
          {ROMANIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        {lbl('📍 Oraș')}
        <Sel val={city} set={setCity} options={ROMANIAN_CITIES} placeholder="Toate orașele" />
      </div>
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

  const AutoBaseFields = ({ brandOptions = AUTO_BRANDS, multiSelect = false }: { brandOptions?: string[]; multiSelect?: boolean }) => (
    <>
      <div>
        {lbl('🚗 Marcă')}
        {multiSelect ? (
          <div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {brandOptions.map(b => (
                <Chip key={b} active={brands.includes(b)} onClick={() => setBrands(brands.includes(b) ? brands.filter(x => x !== b) : [...brands, b])}>{b}</Chip>
              ))}
            </div>
            {brands.length > 0 && (
              <button onClick={() => setBrands([])} className="mt-1 text-xs" style={{ color: '#8B5CF6' }}>✕ Șterge selecția ({brands.length})</button>
            )}
          </div>
        ) : (
          <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }} style={ss} className={sc}>
            <option value="">Toate mărcile</option>
            {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
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
          <AutoBaseFields brandOptions={UTILITY_BRANDS} />
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
          <AutoBaseFields multiSelect={true} />
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1">
            <span>Căutare detaliată</span><span>{showAdvanced ? '▲' : '▼'}</span>
          </button>
          {showAdvanced && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div>{lbl('🚙 Caroserie')}<Chips val={caroserie} set={setCaroserie} options={CAROSERIE_TYPES} /></div>
              <div>{lbl('🛣️ Kilometri')}<Row from={kmFrom} to={kmTo} setFrom={setKmFrom} setTo={setKmTo} /></div>
              <div>{lbl('🔧 Cilindree (cm³)')}<Row from={cilindreeFrom} to={cilindreeTo} setFrom={setCilindreeFrom} setTo={setCilindreeTo} ph={['Min cm³', 'Max cm³']} /></div>
              <div>{lbl('⚡ Putere (CP)')}<Row from={putereFrom} to={putereTo} setFrom={setPutereFrom} setTo={setPutereTo} ph={['Min CP', 'Max CP']} /></div>
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
  // ELECTRONICE FILTERS
  // ════════════════════════════════════════
  function renderElectronicoFilters() {
    return (
      <>
        <div>{lbl('✅ Stare')}<Sel val={electroStare} set={setElectroStare} options={ELECTRO_STARE} /></div>
        {(activeSub === 'telefoane' || activeSub === '') && (
          <>
            <div>{lbl('📱 Marcă')}<Sel val={telefonBrand} set={setTelefonBrand} options={TELEFON_BRANDS} /></div>
            <div>{lbl('💾 Stocare')}<Chips val={telefonStoraj} set={setTelefonStoraj} options={TELEFON_STOCARE} /></div>
            <div>{lbl('🧠 RAM')}<Chips val={telefonRam} set={setTelefonRam} options={TELEFON_RAM} /></div>
          </>
        )}
        {activeSub === 'laptopuri' && (
          <>
            <div>{lbl('💻 Marcă')}<Sel val={laptopBrand} set={setLaptopBrand} options={LAPTOP_BRANDS} /></div>
            <div>{lbl('⚙️ Procesor')}<Sel val={laptopProcesor} set={setLaptopProcesor} options={LAPTOP_PROCESOR} /></div>
            <div>{lbl('🧠 RAM')}<Chips val={laptopRam} set={setLaptopRam} options={LAPTOP_RAM} /></div>
            <div>{lbl('💾 Stocare')}<Chips val={laptopStoraj} set={setLaptopStoraj} options={LAPTOP_STOCARE} /></div>
            <div>{lbl('🖥️ Diagonală')}<Chips val={laptopDiag} set={setLaptopDiag} options={LAPTOP_DIAGONALA} /></div>
            <div>{lbl('💿 Sistem operare')}<Sel val={laptopOs} set={setLaptopOs} options={LAPTOP_OS} /></div>
          </>
        )}
        {(activeSub === 'tv' || activeSub === 'tv-audio') && (
          <>
            <div>{lbl('📺 Tip afișaj')}<Chips val={tvTip} set={setTvTip} options={TV_TIP} /></div>
            <div>{lbl('📐 Diagonală')}<Chips val={tvDiag} set={setTvDiag} options={TV_DIAGONALA} /></div>
            <div>{lbl('🔍 Rezoluție')}<Chips val={tvRez} set={setTvRez} options={TV_REZOLUTIE} /></div>
            <div>{lbl('🔊 Audio')}<Sel val={audioTip} set={setAudioTip} options={AUDIO_TIP} /></div>
          </>
        )}
        {activeSub === 'gaming' && (
          <>
            <div>{lbl('🎮 Platformă')}<Chips val={gamingPlatforma} set={setGamingPlatforma} options={GAMING_PLATFORMA} /></div>
            <div>{lbl('🕹️ Tip produs')}<Chips val={gamingTip} set={setGamingTip} options={GAMING_TIP} /></div>
          </>
        )}
        {activeSub === 'foto-video' && (
          <>
            <div>{lbl('📷 Tip')}<Sel val={fotoTip} set={setFotoTip} options={FOTO_TIP} /></div>
            <div>{lbl('🏷️ Marcă')}<Sel val={fotoBrand} set={setFotoBrand} options={FOTO_BRANDS} /></div>
          </>
        )}
        {activeSub === 'tablete' && (
          <>
            <div>{lbl('💾 Stocare')}<Chips val={tabletaStoraj} set={setTabletaStoraj} options={TABLETA_STOCARE} /></div>
            <div>{lbl('📡 Conectivitate')}<Chips val={tabletaConect} set={setTabletaConect} options={TABLETA_CONECTIVITATE} /></div>
          </>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // MODĂ FILTERS
  // ════════════════════════════════════════
  function renderModaFilters() {
    return (
      <>
        <div>{lbl('✅ Stare')}<Sel val={modaStare} set={setModaStare} options={MODA_STARE} /></div>
        <div>{lbl('👤 Gen')}<Chips val={modaGen} set={setModaGen} options={MODA_GEN} /></div>
        {(activeSub === 'haine-femei' || activeSub === 'haine-barbati' || activeSub === '') && (
          <>
            <div>{lbl('📏 Mărime')}<Chips val={modaMarimiAdulti} set={setModaMarimiAdulti} options={MODA_MARIMI_ADULTI} /></div>
            <div>{lbl('🧶 Material')}<Sel val={modaMaterial} set={setModaMaterial} options={MODA_MATERIAL} /></div>
          </>
        )}
        {(activeSub === 'incaltaminte' || activeSub === 'incaltaminte-femei' || activeSub === 'incaltaminte-barbati') && (
          <div>{lbl('👟 Pointure')}<Chips val={modaMarimiPantofi} set={setModaMarimiPantofi} options={MODA_MARIMI_PANTOFI} /></div>
        )}
        {(activeSub === 'haine-copii' || activeSub === 'incaltaminte-copii') && (
          <div>{lbl('🧒 Vârstă / Talie')}<Chips val={modaMarimiCopii} set={setModaMarimiCopii} options={MODA_MARIMI_COPII} /></div>
        )}
        {activeSub === 'bijuterii' && (
          <>
            <div>{lbl('💍 Tip bijuterie')}<Sel val={bijuteriiTip} set={setBijuteriiTip} options={BIJUTERII_TIP} /></div>
            <div>{lbl('⚗️ Material')}<Chips val={bijuteriiMaterial} set={setBijuteriiMaterial} options={BIJUTERII_MATERIAL} /></div>
          </>
        )}
        {activeSub === 'genti-accesorii' && (
          <div>{lbl('👜 Tip geantă')}<Sel val={gentiTip} set={setGentiTip} options={GENTI_TIP} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // CASĂ & GRĂDINĂ FILTERS
  // ════════════════════════════════════════
  function renderCasaGradinaFilters() {
    return (
      <>
        <div>{lbl('✅ Stare')}<Sel val={casaStare} set={setCasaStare} options={CASA_STARE} /></div>
        {(activeSub === 'mobila' || activeSub === '') && (
          <>
            <div>{lbl('🛋️ Tip mobilă')}<Sel val={mobilaTip} set={setMobilaTip} options={MOBILA_TIP} /></div>
            <div>{lbl('🪵 Material')}<Sel val={mobilaMaterial} set={setMobilaMaterial} options={MOBILA_MATERIAL} /></div>
          </>
        )}
        {activeSub === 'electrocasnice' && (
          <>
            <div>{lbl('🏠 Tip electrocasnic')}<Sel val={electrocasniceTip} set={setElectrocasniceTip} options={ELECTROCASNICE_TIP} /></div>
            <div>{lbl('🏭 Marcă')}<Sel val={electrocasniceBrand} set={setElectrocasniceBrand} options={ELECTROCASNICE_BRANDS} /></div>
          </>
        )}
        {activeSub === 'gradina' && (
          <div>{lbl('🌿 Tip produs')}<Sel val={gradinaTip} set={setGradinaTip} options={GRADINA_TIP} /></div>
        )}
        {activeSub === 'decorare' && (
          <div>{lbl('🖼️ Tip decorare')}<Sel val={decorareTip} set={setDecoriareTip} options={DECORARE_TIP} /></div>
        )}
        {activeSub === 'iluminat' && (
          <div>{lbl('💡 Tip iluminat')}<Sel val={iluminatTip} set={setIluminatTip} options={ILUMINAT_TIP} /></div>
        )}
        {activeSub === 'bricolaj' && (
          <div>{lbl('🔨 Tip bricolaj')}<Sel val={bricolajTip} set={setBricolajTip} options={BRICOLAJ_TIP} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // SPORT FILTERS
  // ════════════════════════════════════════
  function renderSportFilters() {
    return (
      <>
        <div>{lbl('✅ Stare')}<Chips val={sportStare} set={setSportStare} options={SPORT_STARE} /></div>
        {(activeSub === 'echipament-sport' || activeSub === '') && (
          <div>{lbl('⚽ Sport')}<Sel val={sportTip} set={setSportTip} options={SPORT_TIP} /></div>
        )}
        {activeSub === 'biciclete' && (
          <>
            <div>{lbl('🚲 Tip bicicletă')}<Chips val={bicicletaTip} set={setBicicletaTip} options={BICICLETA_TIP} /></div>
            <div>{lbl('🏭 Marcă')}<Sel val={bicicletaBrand} set={setBicicletaBrand} options={BICICLETA_BRANDS} /></div>
            <div>{lbl('📐 Mărime cadru')}<Chips val={bicicletaCadru} set={setBicicletaCadru} options={BICICLETA_CADRU} /></div>
          </>
        )}
        {activeSub === 'fitness' && (
          <div>{lbl('💪 Tip echipament')}<Sel val={fitnessTip} set={setFitnessTip} options={FITNESS_TIP} /></div>
        )}
        {activeSub === 'outdoor' && (
          <div>{lbl('🏕️ Tip produs')}<Sel val={outdoorTip} set={setOutdoorTip} options={OUTDOOR_TIP} /></div>
        )}
        {activeSub === 'sporturi-apa' && (
          <div>{lbl('🏄 Tip sport acvatic')}<Sel val={sporturiApaTip} set={setSporturiApaTip} options={SPORTURI_APA_TIP} /></div>
        )}
        {activeSub === 'sporturi-iarna' && (
          <div>{lbl('⛷️ Tip sport de iarnă')}<Sel val={sporturiIarnaTip} set={setSporturiIarnaTip} options={SPORTURI_IARNA_TIP} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // ANIMALE FILTERS
  // ════════════════════════════════════════
  function renderAnimaleFilters() {
    return (
      <>
        {(activeSub === 'caini' || activeSub === 'pisici' || activeSub === '') && (
          <>
            <div>{lbl('🐾 Vârstă')}<Sel val={animaleVarsta} set={setAnimaleVarsta} options={ANIMALE_VARSTA} /></div>
            <div>{lbl('♂️ Sex')}<Chips val={animaleSex} set={setAnimaleSex} options={ANIMALE_SEX} /></div>
            <div>{lbl('📋 Pedigree / Act')}<Chips val={pedigree} set={setPedigree} options={['Cu pedigree', 'Fără pedigree']} /></div>
            <div>{lbl('💉 Vaccinat')}<Chips val={vaccinat} set={setVaccinat} options={['Vaccinat', 'Nevaccinat']} /></div>
          </>
        )}
        {activeSub === 'caini' && (
          <div>{lbl('🐕 Rasă')}<Sel val={cainRasa} set={setCainRasa} options={CAINI_RASE} /></div>
        )}
        {activeSub === 'pisici' && (
          <div>{lbl('🐈 Rasă')}<Sel val={pisicaRasa} set={setPisicaRasa} options={PISICI_RASE} /></div>
        )}
        {activeSub === 'accesorii-animale' && (
          <div>{lbl('🦴 Tip accesoriu')}<Sel val={accesoriiAnimaleTip} set={setAccesoriiAnimaleTip} options={ACCESORII_ANIMALE_TIP} /></div>
        )}
      </>
    )
  }

  // ════════════════════════════════════════
  // MAMĂ & COPILUL FILTERS
  // ════════════════════════════════════════
  function renderMamaCopilulFilters() {
    return (
      <>
        <div>{lbl('✅ Stare')}<Sel val={mamaStare} set={setMamaStare} options={MAMA_STARE} /></div>
        {(activeSub === 'haine-copii' || activeSub === '') && (
          <>
            <div>{lbl('👶 Vârstă copil')}<Chips val={mamaVarstaCopil} set={setMamaVarstaCopil} options={MAMA_VARSTA_COPIL} /></div>
            <div>{lbl('👤 Gen')}<Chips val={mamaGenCopil} set={setMamaGenCopil} options={MAMA_GEN_COPIL} /></div>
          </>
        )}
        {activeSub === 'jucarii' && (
          <>
            <div>{lbl('🎯 Vârstă recomandată')}<Chips val={jucariiVarsta} set={setJucariiVarsta} options={JUCARII_VARSTA} /></div>
            <div>{lbl('🧸 Tip jucărie')}<Sel val={jucariiTip} set={setJucariiTip} options={JUCARII_TIP} /></div>
          </>
        )}
        {(activeSub === 'carucior' || activeSub === 'carucioare' || activeSub === 'scaune-auto') && (
          <>
            <div>{lbl('🍼 Tip')}<Sel val={caruciTip} set={setCaruciTip} options={CARUCIOR_TIP} /></div>
            <div>{lbl('🏭 Marcă')}<Sel val={caruciiBrand} set={setCaruciiBrand} options={CARUCIOR_BRANDS} /></div>
          </>
        )}
        {activeSub === 'mobilier-copii' && (
          <div>{lbl('🛏️ Tip mobilier')}<Sel val={mobilierCopiiTip} set={setMobilierCopiiTip} options={MOBILIER_COPII_TIP} /></div>
        )}
        {(activeSub === 'ingrijire-bebelusi' || activeSub === 'ingrijire') && (
          <div>{lbl('👶 Tip produs')}<Sel val={ingrijireTip} set={setIngrijireTip} options={INGRIJIRE_TIP} /></div>
        )}
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
      case 'electronice': return renderElectronicoFilters()
      case 'moda': return renderModaFilters()
      case 'casa-gradina': return renderCasaGradinaFilters()
      case 'sport': return renderSportFilters()
      case 'animale': return renderAnimaleFilters()
      case 'mama-copilul': return renderMamaCopilulFilters()
      default: return null
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm transition"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff' }}
      >
        <span>🔍 FILTRE</span>
        <span>{showFilters ? '▲' : '▼'}</span>
      </button>

      {showFilters && (
        <div className="p-4 space-y-4">
          <LocationField />
          <PriceField currency={category === 'joburi' ? 'RON' : 'EUR'} />
          {renderFilters()}

          <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => router.push(`/marketplace/${category}?${buildParams().toString()}`)}
              className="flex-1 py-2 px-4 text-white rounded-lg transition font-semibold text-sm hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}
            >
              Aplică filtre
            </button>
            <button
              onClick={() => { setBrands([]); setCounty(''); router.push(`/marketplace/${category}${activeSub ? `?sub=${activeSub}` : ''}`) }}
              className="px-3 py-2 rounded-lg transition text-sm"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)' }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
