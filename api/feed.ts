import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadCatalog } from './shipping.js'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Feed de produtos (Google Merchant Center / Catálogo do Instagram e Facebook): https://seu-site/feed.xml
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { products } = await loadCatalog()
  const site = process.env.SITE_URL || `https://${req.headers.host}`
  const abs = (u: string) => (u.startsWith('http') ? u : site + u)
  const items = products.filter(p => p.active !== false && p.image).map(p => `    <item>
      <g:id>${esc(p.id)}</g:id>
      <title>${esc(`${p.brand} ${p.name}`)}</title>
      <description>${esc(p.description || `${p.brand} ${p.name}`)}</description>
      <link>${site}/produto/${encodeURIComponent(p.id)}</link>
      <g:image_link>${esc(abs(p.image!))}</g:image_link>
      <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${p.old_price && p.old_price > p.price ? p.old_price.toFixed(2) : p.price.toFixed(2)} BRL</g:price>${p.old_price && p.old_price > p.price ? `\n      <g:sale_price>${p.price.toFixed(2)} BRL</g:sale_price>` : ''}
      <g:brand>${esc(p.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`).join('\n')
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400')
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>Arkyn Imports</title>\n    <link>${site}</link>\n    <description>Perfumes árabes e importados</description>\n${items}\n  </channel>\n</rss>\n`)
}
