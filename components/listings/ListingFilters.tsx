'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'
import { AUTO_BRANDS, AUTO_MODELS, CAROSERIE_TYPES, YEARS } from '@/lib/constants/subcategories'
import { useState } from 'react'

interface ListingFiltersProps {
  category: string
}

export default function ListingFilters({ category }: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [query, setQuery] = useState(searchParams.get('q') || '')
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

  const isAuto = category === 'auto'
  const availableModels = brand && AUTO_MODELS[brand] ? AUTO_MODELS[brand] : []

  function handleFilter() {
    const params = new URLSearchParams()
    if (searchParams.get('sub')) params.set('sub', searchParams.get('sub')!)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (query) params.set('q', query)
    if (isAuto) {
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
    }
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  function handleReset() {
    setCity(''); setMinPrice(''); setMaxPrice(''); setQuery('')
    setBrand(''); setModel(''); setFuel(''); setYearFrom(''); setYearTo('')
    setCaroserie(''); setKmFrom(''); setKmTo(''); setSeller(''); setLeasing('')
    const params = new URLSearchParams()
    if (searchParams.get('sub')) params.set('sub', searchParams.get('sub')!)
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        <span>🔍 FILTRE</span>
        <span>{showFilters ? '▲' : '▼'}</span>
      </button>

      {showFilters && (
        <div className="p-4 space-y-4" style={{color: '#000000'}}>

          {/* Oras */}
          <div>
            <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
              📍 Oraș
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{color: '#000000', backgroundColor: '#ffffff', width: '100%'}}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toate orașele</option>
              {ROMANIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* AUTO-SPECIFIC FILTERS */}
          {isAuto && (
            <>
              {/* Marca */}
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  🚗 Marcă
                </label>
                <select
                  value={brand}
                  onChange={(e) => { setBrand(e.target.value); setModel('') }}
                  style={{color: '#000000', backgroundColor: '#ffffff', width: '100%'}}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toate mărcile</option>
                  {AUTO_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  📋 Model
                </label>
                {availableModels.length > 0 ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{color: '#000000', backgroundColor: '#ffffff', width: '100%'}}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toate modelele</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={brand ? 'Scrie modelul...' : 'Alege mai întâi marca'}
                    disabled={!brand}
                    style={{color: '#000000', backgroundColor: '#ffffff', width: '100%'}}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                )}
              </div>

              {/* Combustibil */}
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  ⛽ Combustibil
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'benzina', label: '⛽ Benzină' },
                    { val: 'diesel', label: '🛢️ Diesel' },
                    { val: 'hybrid', label: '🔋 Hybrid' },
                    { val: 'electric', label: '⚡ Electrică' },
                  ].map((f) => (
                    <button
                      key={f.val}
                      onClick={() => setFuel(fuel === f.val ? '' : f.val)}
                      className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                        fuel === f.val
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* An fabricatie */}
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  📅 An fabricație
                </label>
                <div className="flex gap-2">
                  <select
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">De la</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Până la</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Cautare detaliata */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-sm text-blue-600 font-semibold flex items-center justify-between py-1 hover:text-blue-800 transition"
              >
                <span>Căutare detaliată</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  {/* Tip caroserie */}
                  <div>
                    <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                      🚙 Tip caroserie
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {CAROSERIE_TYPES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCaroserie(caroserie === c ? '' : c)}
                          className={`px-2 py-1 rounded-lg border text-xs font-medium transition ${
                            caroserie === c
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* KM */}
                  <div>
                    <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                      🛣️ Kilometri
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={kmFrom}
                        onChange={(e) => setKmFrom(e.target.value)}
                        placeholder="De la"
                        style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                        className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={kmTo}
                        onChange={(e) => setKmTo(e.target.value)}
                        placeholder="Până la"
                        style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                        className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Pret */}
                  <div>
                    <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                      💰 Preț (€)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="De la"
                        style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                        className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Până la"
                        style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                        className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detalii vanzator */}
              <div className="border-t border-gray-200 pt-4">
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '8px'}}>
                  👤 Detalii vânzător
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 'privat', label: '👤 Privat' },
                    { val: 'firma', label: '🏢 Firmă' },
                    { val: 'dealer', label: '🤝 Dealer' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setSeller(seller === s.val ? '' : s.val)}
                      className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                        seller === s.val
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Leasing */}
                <div className="mt-2">
                  <button
                    onClick={() => setLeasing(leasing ? '' : 'da')}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                      leasing
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    💳 Predare leasing
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Cautare generala (non-auto) */}
          {!isAuto && (
            <>
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  🔍 Caută
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Caută..."
                  style={{color: '#000000', backgroundColor: '#ffffff', width: '100%'}}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label style={{color: '#000000', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  💰 Preț (RON)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    style={{color: '#000000', backgroundColor: '#ffffff', flex: 1}}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Butoane actiune */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleFilter}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              Aplică filtre
            </button>
            <button
              onClick={handleReset}
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
