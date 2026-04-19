'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { updateProfile, updateEmail, updatePassword, signOut } from '@/lib/actions/auth'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', phone: '', city: '' })
  const [currentEmail, setCurrentEmail] = useState('')
  const [message, setMessage] = useState('')

  const [emailForm, setEmailForm] = useState({ newEmail: '' })
  const [emailMsg, setEmailMsg] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentEmail(user.email || '')
      setEmailForm({ newEmail: user.email || '' })

      const { data } = await supabase.from('profiles').select('full_name, phone, city').eq('id', user.id).single()
      if (data) setFormData({ fullName: data.full_name || '', phone: data.phone || '', city: data.city || '' })
    }
    loadProfile()
  }, [])

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMessage('')
    const result = await updateProfile({ full_name: formData.fullName, phone: formData.phone, city: formData.city })
    setMessage(result.error ? '❌ ' + result.error : '✓ Profil actualizat!')
    setLoading(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!emailForm.newEmail || emailForm.newEmail === currentEmail) { setEmailMsg('❌ Introdu un email nou diferit'); return }
    setEmailLoading(true); setEmailMsg('')
    const result = await updateEmail(emailForm.newEmail)
    if (result.error) { setEmailMsg('❌ ' + result.error) }
    else { setEmailMsg('✓ Email schimbat! Folosește noul email la login.'); setCurrentEmail(emailForm.newEmail) }
    setEmailLoading(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!pwForm.current) { setPwMsg('❌ Introdu parola curentă'); return }
    if (pwForm.newPw.length < 6) { setPwMsg('❌ Parola nouă trebuie să aibă minim 6 caractere'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg('❌ Parolele noi nu coincid'); return }
    setPwLoading(true); setPwMsg('')
    const result = await updatePassword(pwForm.current, pwForm.newPw)
    if (result.error) { setPwMsg('❌ ' + result.error) }
    else { setPwMsg('✓ Parolă schimbată cu succes!'); setPwForm({ current: '', newPw: '', confirm: '' }) }
    setPwLoading(false)
  }

  const inputStyle = {
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)', borderRadius: '8px',
    padding: '8px 16px', width: '100%', fontSize: '16px',
  }

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Profil */}
      <div className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>👤 Profilul meu</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nume complet</label>
            <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nume..." style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Telefon</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="0760..." style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Oraș</label>
            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="București..." style={inputStyle} />
          </div>
          {message && <div className={`p-3 rounded-lg text-sm ${message.startsWith('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{message}</div>}
          <button type="submit" disabled={loading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {loading ? 'Se salvează...' : '✓ Salvează'}
          </button>
        </form>
      </div>

      {/* Schimbare email */}
      <div className="rounded-lg p-6" style={cardStyle}>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>📧 Schimbă emailul de login</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Anunțurile tale rămân neschimbate — doar emailul cu care te loghezi se modifică.
        </p>
        <form onSubmit={handleEmail} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email curent</label>
            <input type="text" value={currentEmail} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email nou</label>
            <input type="email" value={emailForm.newEmail} onChange={e => setEmailForm({ newEmail: e.target.value })} placeholder="email@nou.ro" style={inputStyle} />
          </div>
          {emailMsg && <div className={`p-3 rounded-lg text-sm ${emailMsg.startsWith('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{emailMsg}</div>}
          <button type="submit" disabled={emailLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {emailLoading ? 'Se schimbă...' : '✓ Schimbă emailul'}
          </button>
        </form>
      </div>

      {/* Schimbare parolă */}
      <div className="rounded-lg p-6" style={cardStyle}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🔑 Schimbă parola</h3>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Parola curentă</label>
            <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Parola actuală" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Parola nouă</label>
            <input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Minim 6 caractere" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Confirmă parola nouă</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repetă parola nouă" style={inputStyle} />
          </div>
          {pwMsg && <div className={`p-3 rounded-lg text-sm ${pwMsg.startsWith('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{pwMsg}</div>}
          <button type="submit" disabled={pwLoading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {pwLoading ? 'Se schimbă...' : '✓ Schimbă parola'}
          </button>
        </form>
      </div>

      {/* Deconectare */}
      <div className="rounded-lg p-6" style={cardStyle}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Securitate</h3>
        <form action={signOut}>
          <button type="submit" className="px-4 py-2 rounded-lg transition text-sm font-medium" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
            🚪 Deconectare
          </button>
        </form>
      </div>

    </div>
  )
}
