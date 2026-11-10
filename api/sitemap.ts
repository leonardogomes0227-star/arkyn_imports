import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SEED_PRODUCTS } from '../src/lib/seed'
import type { Product } from '../src/lib/types'

const SB = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Lista as páginas públicas e os produtos ativos do catálogo (do banco, ou os de exemplo se não houver banco).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  let products: Product[] = SEED_PRODUCTS
  if (SB && SK) {
    try {
      const r = await fetch(`${SB}/rest/v1/products?select=id,active`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } })
      const d = await r.json()
      if (Array.isArray(d) && d.length) products = d as Product[]
    } catch { /* usa os de exemplo */ }
  }
  const site = process.env.SITE_URL || `https://${req.headers.host}`
  const urls = ['/', '/catalogo', '/quiz', ...products.filter(p => p.active !== false).map(p => `/produto/${encodeURIComponent(p.id)}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site}${u}</loc></url>`).join('\n')}\n</urlset>\n`
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
