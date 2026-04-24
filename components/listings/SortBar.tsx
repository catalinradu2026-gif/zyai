'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Cele mai noi' },
  { value: 'cheapest', label: 'Mai ieftine' },
  { value: 'expensive', label: 'Mai scumpe' },
] as const

export default function SortBar({ count }: { count: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') || 'newest'

  function setSort(val: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('sort', val)
    p.delete('pagina')
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        {count} anunț{count !== 1 ? 'uri' : ''}
      </span>
      <div className="flex gap-1.5">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            style={current === opt.value
              ? { background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff', border: 'none' }
              : { background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
