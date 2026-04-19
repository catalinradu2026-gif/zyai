const PAGE_ID = process.env.FACEBOOK_PAGE_ID
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zyai.ro'

export async function postListingToFacebook(listing: {
  id: string
  title: string
  price?: number | null
  currency?: string | null
  city?: string | null
  description?: string | null
  images?: string[]
}) {
  if (!PAGE_ID || !PAGE_TOKEN) return

  const url = `${SITE_URL}/anunt/${listing.id}`
  const priceText = listing.price
    ? `💰 ${listing.price.toLocaleString('ro-RO')} ${listing.currency || 'RON'}`
    : '💰 Preț negociabil'
  const desc = (listing.description || '').substring(0, 150).trim()

  const message = `🆕 Anunț nou pe zyAI Marketplace!\n\n` +
    `📌 ${listing.title}\n` +
    `${priceText}\n` +
    `📍 ${listing.city || 'România'}\n\n` +
    `${desc}${desc.length >= 150 ? '...' : ''}\n\n` +
    `👉 Vezi anunțul complet: ${url}`

  try {
    const body: Record<string, string> = {
      message,
      link: url,
      access_token: PAGE_TOKEN,
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Facebook post error:', err?.error?.message || res.status)
    }
  } catch (e) {
    console.error('Facebook post failed:', e)
  }
}
