'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { FacetGroup } from '@/lib/queries/facets'

// Mapare yearRange → query params
const YEAR_RANGE_PARAMS: Record<string, { yearFrom?: string; yearTo?: string }> = {
  'Înainte de 2010': { yearTo: '2009' },
  '2010–2015': { yearFrom: '2010', yearTo: '2015' },
  '2016–2019': { yearFrom: '2016', yearTo: '2019' },
  '2020+': { yearFrom: '2020' },
}

export default function MarketplaceFacets({ groups }: { groups: FacetGroup[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (groups.length === 0) return null

  function isActive(key: string, value: string): boolean {
    if (key === 'yearRange') {
      const p = YEAR_RANGE_PARAMS[value]
      if (!p) return false
      return (
        (p.yearFrom ? searchParams.get('yearFrom') === p.yearFrom : !searchParams.get('yearFrom')) &&
        (p.yearTo ? searchParams.get('yearTo') === p.yearTo : !searchParams.get('yearTo'))
      )
    }
    return searchParams.get(key) === value
  }

  function toggle(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (key === 'yearRange') {
      const params = YEAR_RANGE_PARAMS[value]
      if (isActive(key, value)) {
        p.delete('yearFrom')
        p.delete('yearTo')
      } else {
        if (params?.yearFrom) p.set('yearFrom', params.yearFrom)
        else p.delete('yearFrom')
        if (params?.yearTo) p.set('yearTo', params.yearTo)
        else p.delete('yearTo')
      }
    } else {
      if (isActive(key, value)) p.delete(key)
      else p.set(key, value)
    }
    p.delete('pagina')
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {groups.map((group) => (
        <div key={group.key} style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {group.facets.map(({ value, count }) => {
              const active = isActive(group.key, value)
              return (
                <button
                  key={value}
                  onClick={() => toggle(group.key, value)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: active ? '1.5px solid #8B5CF6' : '1px solid var(--border-subtle)',
                    background: active ? 'rgba(139,92,246,0.18)' : 'var(--bg-input)',
                    color: active ? '#a78bfa' : 'var(--text-secondary)',
                    boxShadow: active ? '0 0 0 2px rgba(139,92,246,0.15)' : 'none',
                  }}
                >
                  {value}
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '999px',
                    background: active ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#c4b5fd' : 'var(--text-secondary)',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
