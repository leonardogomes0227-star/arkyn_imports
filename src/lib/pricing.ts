/** Preço no Pix e percentual de desconto “de/por”. O percentual vem de `settings.pixDiscount`. */
export function pixPrice(price: number, discountPercent = 0) {
  const off = Math.min(30, Math.max(0, discountPercent)) / 100
  return Math.round(price * (1 - off) * 100) / 100
}

export function offPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}
