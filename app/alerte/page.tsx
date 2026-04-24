import { createSupabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ unsubscribe?: string }> }

export default async function AlertePage({ searchParams }: Props) {
  const { unsubscribe } = await searchParams

  let status: 'success' | 'notfound' | 'error' | 'home' = 'home'

  if (unsubscribe) {
    try {
      const admin = createSupabaseAdmin()
      const { data, error } = await admin
        .from('buyer_alerts')
        .update({ is_active: false })
        .eq('id', unsubscribe)
        .select('id')
        .single()

      if (error || !data) status = 'notfound'
      else status = 'success'
    } catch {
      status = 'error'
    }
  }

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '120px 16px 48px', textAlign: 'center' }}>
      {status === 'success' && (
        <div className="rounded-2xl p-8 space-y-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="text-5xl">✅</p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Alertă dezactivată</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nu vei mai primi mesaje WhatsApp pentru această alertă.
          </p>
          <Link href="/" className="inline-block mt-2 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
            ← Înapoi la zyAI
          </Link>
        </div>
      )}

      {status === 'notfound' && (
        <div className="rounded-2xl p-8 space-y-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <p className="text-5xl">⚠️</p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Alertă inexistentă</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Această alertă nu există sau a fost deja dezactivată.
          </p>
          <Link href="/" className="inline-block mt-2 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
            ← Înapoi la zyAI
          </Link>
        </div>
      )}

      {(status === 'home' || status === 'error') && (
        <div className="rounded-2xl p-8 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-5xl">🔔</p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Alerte zyAI</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Primești notificări WhatsApp când apar anunțuri noi care se potrivesc cu căutarea ta.
          </p>
          <Link href="/" className="inline-block mt-2 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
            ← Înapoi la zyAI
          </Link>
        </div>
      )}
    </main>
  )
}
