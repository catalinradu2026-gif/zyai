import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'zyAI - Platforma Națională de Anunțuri România'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effects */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: '#3b82f6', opacity: 0.08, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 500, height: 500, borderRadius: '50%', background: '#8b5cf6', opacity: 0.1, display: 'flex' }} />

        {/* Logo badge + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '60px', fontWeight: 900, color: 'white', position: 'relative',
          }}>
            Z
            <div style={{
              position: 'absolute', top: -8, right: -8,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'white',
            }}>AI</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '52px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>zyAI.ro</span>
            <span style={{ fontSize: '18px', color: '#94a3b8', marginTop: '-4px' }}>Platforma Națională de Anunțuri</span>
          </div>
        </div>

        {/* Main tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
          <span style={{ fontSize: '44px', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
            Spune ce vrei.
          </span>
          <span style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', backgroundClip: 'text', color: 'transparent' }}>
            zyAI găsește pentru tine.
          </span>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {[['🚗', 'Auto'], ['🏠', 'Imobiliare'], ['💼', 'Joburi'], ['🔧', 'Servicii']].map(([icon, name]) => (
            <div key={name} style={{
              padding: '10px 24px', borderRadius: '999px',
              background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)',
              color: 'white', fontSize: '20px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {icon} {name}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'flex' }} />
            <span style={{ color: '#94a3b8', fontSize: '18px' }}>Postează gratuit • 100% Românesc • Powered by AI</span>
          </div>
          <div style={{
            padding: '10px 28px', borderRadius: '12px',
            background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            color: 'white', fontSize: '20px', fontWeight: 700,
            display: 'flex',
          }}>
            ⚡ Intră acum →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
