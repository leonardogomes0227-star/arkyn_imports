import { useStore } from '../lib/store'

/** Faixa branca com as marcas da loja (só marcas que têm produto). */
export default function BrandBand() {
  const { products } = useStore()
  const brands = [...new Set(products.filter(p => p.active !== false).map(p => p.brand))]
  if (brands.length < 3) return null
  const row = [...brands, ...brands]
  return <div className="bband" aria-label="Marcas da loja"><div className="bband-t">{[0, 1].map(k => <p key={k} aria-hidden={k === 1 || undefined}>{row.map((b, i) => <span key={i}>{b}<i>✦</i></span>)}</p>)}</div></div>
}
