'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function SetupMessagesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function setupDatabase() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Setup failed')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🗄️ Database Setup</h1>
            <p className="text-gray-600">Crează tabelul pentru mesaje</p>
          </div>

          {result ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">✅ Setup Completat!</h2>
              <div className="space-y-2 text-green-700">
                <p><strong>Messages Table:</strong> {result.messagesTable}</p>
                <p><strong>Indexes:</strong> {result.indexes}</p>
                <p><strong>Metadata Column:</strong> {result.metadata}</p>
              </div>
              <div className="mt-6 space-y-2">
                <a
                  href="/cont/mesaje"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-center"
                >
                  → Mergi la Mesaje
                </a>
                <a
                  href="/"
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition text-center"
                >
                  ← Home
                </a>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-red-700 mb-4">❌ Eroare</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <Button onClick={setupDatabase} variant="primary" fullWidth isLoading={loading}>
                🔄 Încearcă din nou
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-900 text-sm">
                  <strong>⚠️ Observație:</strong> Dacă ești pe Vercel, nu vei putea rula SQL din browser din cauza restricțiilor.
                  În acest caz, deschide <strong>Supabase SQL Editor</strong> și rulează SQL-ul direct.
                </p>
              </div>

              <Button
                onClick={setupDatabase}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                {loading ? '⏳ Se execută SQL...' : '🚀 Crează Messages Table'}
              </Button>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">📋 SQL care se execută:</h3>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto text-gray-700">
{`CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  receiver_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`}
                </pre>
              </div>

              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="font-bold text-gray-900 cursor-pointer">
                  📖 Instrucțiuni manuale (Supabase UI)
                </summary>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Deschide <a href="https://app.supabase.com" target="_blank" rel="noopener" className="text-blue-600 underline">Supabase Dashboard</a></li>
                    <li>Select projectul (ID: vqrayicxvxltbymvgbzh)</li>
                    <li>Mergi la <strong>SQL Editor</strong></li>
                    <li>Click <strong>New Query</strong></li>
                    <li>Copie SQL-ul de mai sus</li>
                    <li>Apasă <strong>Run</strong></li>
                  </ol>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
