import { getListing } from '@/lib/queries/listings'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  searchParams: Promise<{ ids?: string }>
}

export const metadata = { title: 'Comparare produse - zyAI' }

const N = '—'

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams
  const rawIds = sp.ids || ''
  const ids = rawIds.split(',').filter(Boolean).slice(0, 3)

  if (ids.length < 2) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center px-4">
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Selectează cel puțin 2 produse</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Mergi la o categorie și apasă "Compară" pe produsele dorite.</p>
          <Link href="/marketplace/electronice" className="px-6 py-3 rounded-xl font-bold text-white inline-block"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
            Caută produse
          </Link>
        </div>
      </main>
    )
  }

  const results = await Promise.all(ids.map(id => getListing(id).catch(() => ({ data: null, error: 'err' }))))
  const listings = results.map(r => r.data).filter(Boolean) as any[]

  if (listings.length < 2) notFound()

  const CATEGORY_NAMES: Record<number, string> = {
    1: 'Joburi', 2: 'Imobiliare', 3: 'Auto', 4: 'Servicii',
    5: 'Electronice', 6: 'Modă', 7: 'Casă & Grădină', 8: 'Sport',
    9: 'Animale', 10: 'Mamă & Copil',
  }

  function getPrice(l: any) {
    if (l.price && l.price_type !== 'gratuit')
      return `${l.price.toLocaleString('ro-RO')} ${l.currency}`
    if (l.price_type === 'negociabil') return 'Negociabil'
    return 'Gratuit'
  }

  function getMeta(l: any) {
    return (l.metadata || {}) as Record<string, any>
  }

  const rows = [
    { label: 'Preț', key: (l: any) => getPrice(l) },
    { label: 'Locație', key: (l: any) => l.city || N },
    { label: 'Categorie', key: (l: any) => CATEGORY_NAMES[l.category_id] || N },
    { label: 'Stare', key: (l: any) => getMeta(l).condition || N },
    { label: 'Marcă', key: (l: any) => getMeta(l).brand || N },
    { label: 'Model', key: (l: any) => getMeta(l).model || N },
    { label: 'An', key: (l: any) => getMeta(l).year || N },
    { label: 'Km', key: (l: any) => getMeta(l).mileage ? `${Number(getMeta(l).mileage).toLocaleString('ro-RO')} km` : N },
    { label: 'Combustibil', key: (l: any) => getMeta(l).fuelType || N },
    { label: 'Cutie viteze', key: (l: any) => getMeta(l).gearbox || N },
    { label: 'Putere', key: (l: any) => getMeta(l).power ? `${getMeta(l).power} CP` : N },
  ]

  const visibleRows = rows.filter(row => listings.some(l => row.key(l) !== N))

  const colBg = ['rgba(139,92,246,0.08)', 'rgba(59,130,246,0.08)', 'rgba(34,197,94,0.08)']
  const colBorder = ['rgba(139,92,246,0.3)', 'rgba(59,130,246,0.3)', 'rgba(34,197,94,0.3)']

  return (
    <main className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⚖️ Comparare produse</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {listings.length} produse comparate
            </p>
          </div>
          <Link href="javascript:history.back()" className="text-sm px-4 py-2 rounded-xl transition"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
            ← Înapoi
          </Link>
        </div>

        {/* Product columns header */}
        <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${listings.length}, 1fr)`, gap: '8px', marginBottom: '8px' }}>
          <div />
          {listings.map((l, i) => (
            <div key={l.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${colBorder[i]}`, background: colBg[i] }}>
              {/* Image */}
              <div style={{ position: 'relative', height: '160px', background: 'rgba(0,0,0,0.3)' }}>
                {l.images?.[0] ? (
                  <Image src={l.images[0]} alt={l.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span style={{ fontSize: '40px', opacity: 0.4 }}>📷</span>
                  </div>
                )}
              </div>
              {/* Title + price */}
              <div className="p-3">
                <p className="font-bold text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>{l.title}</p>
                <p className="text-lg font-black price-text">{getPrice(l)}</p>
                <Link
                  href={`/anunt/${l.id}`}
                  className="mt-2 block text-center py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                  style={{ background: `linear-gradient(135deg,${i === 0 ? '#8B5CF6,#6D28D9' : i === 1 ? '#3B82F6,#1D4ED8' : '#22c55e,#16a34a'})`, color: '#fff' }}>
                  Vezi anunț →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {/* Description row */}
          <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${listings.length}, 1fr)`, borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="p-3 flex items-start" style={{ background: 'var(--bg-card-hover)' }}>
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Descriere</span>
            </div>
            {listings.map((l, i) => (
              <div key={l.id} className="p-3" style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-hover)', borderLeft: '1px solid var(--border-subtle)' }}>
                <p className="text-xs line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{l.description || N}</p>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {visibleRows.map((row, ri) => {
            const vals = listings.map(l => row.key(l))
            const allSame = vals.every(v => v === vals[0])
            return (
              <div
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `140px repeat(${listings.length}, 1fr)`,
                  borderBottom: ri < visibleRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div className="p-3 flex items-center" style={{ background: 'var(--bg-card-hover)' }}>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                </div>
                {listings.map((l, i) => {
                  const val = row.key(l)
                  const isBest = !allSame && row.label === 'Preț' && l.price === Math.min(...listings.map(x => x.price || Infinity))
                  return (
                    <div
                      key={l.id}
                      className="p-3 flex items-center"
                      style={{
                        background: isBest ? 'rgba(34,197,94,0.08)' : i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-hover)',
                        borderLeft: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isBest ? '#4ADE80' : val === N ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                      >
                        {isBest ? '✓ ' : ''}{val}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}
