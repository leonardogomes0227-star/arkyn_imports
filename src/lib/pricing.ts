import type { Settings } from './types'

/** Desconto automático por quantidade ("leve 2, ganhe 10%"). Desligado se bundleMinQty ou bundlePercent forem 0. */
export function bundleDiscount(subtotal: number, qty: number, s: Pick<Settings, 'bundleMinQty' | 'bundlePercent'>): number {
  const min = s.bundleMinQty ?? 0, pct = s.bundlePercent ?? 0
  if (min < 2 || pct <= 0 || qty < min) return 0
  return Math.round(subtotal * (Math.min(pct, 50) / 100) * 100) / 100
}
