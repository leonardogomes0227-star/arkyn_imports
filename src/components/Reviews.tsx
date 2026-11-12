import type { Review } from '../lib/reviews'
import { Stars } from './Stars'

export default function Reviews({ items, title, kicker = 'Quem compra na Arkyn' }: { items: Review[]; title: string; kicker?: string }) {
  if (!items.length) return null
  const avg = items.reduce((s, r) => s + r.stars, 0) / items.length
  return (
    <section className="ak-reviews">
      <div className="ak-reviews-h">
        <div>
          <p className="ax-eyebrow">{kicker}</p>
          <h2>{title}</h2>
        </div>
        <p className="ak-reviews-avg"><Stars value={avg} /><b>{avg.toFixed(1).replace('.', ',')}</b><small>de média</small></p>
      </div>
      <div className="ak-reviews-grid">
        {items.map(r => (
          <blockquote key={r.id} className="ak-review">
            <Stars value={r.stars} />
            <p>{r.text}</p>
            <footer><b>{r.name}</b><span>{r.city}</span></footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
