'use client'

import { useCompare } from './CompareContext'
import Image from 'next/image'

export default function CompareBar() {
  const { items, remove, clear, count } = useCompare()

  if (count === 0) return null

  const slots = [0, 1, 2]

  function goCompare() {
    const ids = items.map(i => i.id).join(',')
    window.location.href = `/compara?ids=${ids}`
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: 'rgba(8,11,20,0.97)',
        borderTop: '1px solid rgba(139,92,246,0.4)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -4px 30px rgba(139,92,246,0.2)',
        padding: '10px 12px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Row 1: label + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ color: '#A78BFA', fontWeight: 700, fontSize: '13px', margin: 0 }}>
            ⚖️ Comparare <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{count}/3</span>
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={clear}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Golește
            </button>
            <button
              onClick={goCompare}
              disabled={count < 2}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: count >= 2 ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: count >= 2 ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: count >= 2 ? 'pointer' : 'default',
                boxShadow: count >= 2 ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
              }}
            >
              ⚖️ Compară {count >= 2 ? `(${count})` : ''}
            </button>
          </div>
        </div>

        {/* Row 2: slots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {slots.map(i => {
            const item = items[i]
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  border: item
                    ? '1px solid rgba(139,92,246,0.5)'
                    : '1px dashed rgba(255,255,255,0.15)',
                  background: item ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 8px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {item ? (
                  <>
                    {item.image && (
                      <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                        <Image src={item.image} alt={item.title} fill sizes="28px" style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <p style={{ color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </p>
                    <button
                      onClick={() => remove(item.id)}
                      style={{
                        flexShrink: 0,
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.3)',
                        border: 'none',
                        color: '#fca5a5',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: '0 auto' }}>
                    + Adaugă
                  </p>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
