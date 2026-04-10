'use client'

import { useCompare, type CompareItem } from './CompareContext'

export default function CompareButton({ item }: { item: CompareItem }) {
  const { add, remove, has, count } = useCompare()
  const selected = has(item.id)
  const full = count >= 3 && !selected

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (selected) remove(item.id)
    else if (!full) add(item)
  }

  return (
    <button
      onClick={handleClick}
      disabled={full}
      title={full ? 'Maxim 3 produse' : selected ? 'Elimină din comparare' : 'Adaugă la comparare'}
      style={{
        padding: '4px 10px',
        borderRadius: '20px',
        border: selected
          ? '1.5px solid rgba(139,92,246,0.7)'
          : '1.5px solid rgba(255,255,255,0.15)',
        background: selected
          ? 'rgba(139,92,246,0.2)'
          : 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        color: selected ? '#A78BFA' : 'rgba(255,255,255,0.6)',
        fontSize: '11px',
        fontWeight: 600,
        cursor: full ? 'not-allowed' : 'pointer',
        opacity: full ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '13px' }}>{selected ? '✓' : '⚖️'}</span>
      <span>{selected ? 'Selectat' : 'Compară'}</span>
    </button>
  )
}
