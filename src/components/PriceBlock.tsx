import { brl } from '../lib/store'
import { offPercent, pixPrice } from '../lib/pricing'

export default function PriceBlock({ price, oldPrice, installments, pixDiscount, large = false }: {
  price: number
  oldPrice?: number | null
  installments: number
  pixDiscount: number
  large?: boolean
}) {
  const sale = !!oldPrice && oldPrice > price
  const pct = offPercent(price, oldPrice)
  const pix = pixPrice(price, pixDiscount)
  const n = Math.max(1, installments || 1)
  return (
    <div className={large ? 'ak-price is-lg' : 'ak-price'}>
      {sale && <p className="ak-from"><s>{brl(oldPrice!)}</s>{pct > 0 && <span>-{pct}%</span>}</p>}
      <p className="ak-now">{brl(price)}</p>
      {pixDiscount > 0 && pix < price && <p className="ak-pix"><b>{brl(pix)}</b> no Pix</p>}
      {n > 1 && <p className="ak-inst">até {n}x de {brl(price / n)}</p>}
    </div>
  )
}
