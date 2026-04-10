'use client'

import { useState } from 'react'

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const fullUrl = `${window.location.origin}${url}`

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      // clipboard API not available — try legacy
      const el = document.createElement('input')
      el.value = fullUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="absolute bottom-2 right-2"
      onClick={handleShare}
      style={{ zIndex: 3 }}
    >
      <div
        style={{
          height: '28px',
          borderRadius: '14px',
          background: copied ? 'rgba(34,197,94,0.85)' : 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          border: `1.5px solid ${copied ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '0 8px',
          gap: '4px',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        title="Distribuie"
      >
        {copied ? '✓ Copiat' : '↗'}
      </div>
    </div>
  )
}
