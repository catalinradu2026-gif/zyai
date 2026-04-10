'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SUBCATEGORIES } from '@/lib/constants/subcategories'

interface CategorySubsBarProps {
  category: string
}

export default function CategorySubsBar({ category }: CategorySubsBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSub = searchParams.get('sub') || ''

  const subs = SUBCATEGORIES[category]
  if (!subs || subs.length === 0) return null

  function handleSub(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeSub === slug) {
      params.delete('sub')
    } else {
      params.set('sub', slug)
    }
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  function handleAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('sub')
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        <button
          onClick={handleAll}
          className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          style={{
            backgroundColor: !activeSub ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
            border: !activeSub ? '1px solid rgba(139,92,246,0.6)' : '1px solid var(--border-subtle)',
            boxShadow: !activeSub ? '0 0 16px rgba(139,92,246,0.25)' : 'none',
            minWidth: '72px',
          }}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🔍</span>
          <span className="text-xs font-bold" style={{ color: !activeSub ? '#A78BFA' : 'var(--text-primary)' }}>Toate</span>
        </button>

        {subs.map((sub) => {
          const isActive = activeSub === sub.slug
          return (
            <button
              key={sub.slug}
              onClick={() => handleSub(sub.slug)}
              className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
                border: isActive ? '1px solid rgba(139,92,246,0.6)' : '1px solid var(--border-subtle)',
                boxShadow: isActive ? '0 0 16px rgba(139,92,246,0.25)' : 'none',
                minWidth: '72px',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.2)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.boxShadow = 'none' }}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{sub.icon}</span>
              <span className="text-xs font-bold" style={{ color: isActive ? '#A78BFA' : 'var(--text-primary)' }}>{sub.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
