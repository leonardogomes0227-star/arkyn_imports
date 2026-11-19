// Google Analytics 4 e Meta Pixel. Só ligam se os IDs estiverem na Vercel (VITE_GA_ID e VITE_META_PIXEL_ID); sem eles, nada é carregado.
const env = import.meta.env as Record<string, string | undefined>
const GA = env.VITE_GA_ID
const PX = env.VITE_META_PIXEL_ID

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; _fbq?: unknown }
const w = window as W

export function initAnalytics() {
  if (GA && !w.gtag) {
    w.dataLayer = w.dataLayer || []
    w.gtag = function () { w.dataLayer!.push(arguments) }
    w.gtag('js', new Date()); w.gtag('config', GA, { send_page_view: false })
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA)}`; document.head.appendChild(s)
  }
  if (PX && !w.fbq) {
    const f = function (...a: unknown[]) { (f as unknown as { q: unknown[] }).q.push(a) }
    ;(f as unknown as { q: unknown[] }).q = []
    w.fbq = f; w._fbq = f
    const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(s)
    w.fbq('init', PX)
  }
}

export interface Item { id: string; name: string; brand?: string; price: number; qty?: number }
const gaItems = (items: Item[]) => items.map(i => ({ item_id: i.id, item_name: i.name, item_brand: i.brand, price: i.price, quantity: i.qty ?? 1 }))
const sum = (items: Item[]) => items.reduce((s, i) => s + i.price * (i.qty ?? 1), 0)

export const track = {
  page: () => { w.gtag?.('event', 'page_view'); w.fbq?.('track', 'PageView') },
  viewItem: (i: Item) => { w.gtag?.('event', 'view_item', { currency: 'BRL', value: i.price, items: gaItems([i]) }); w.fbq?.('track', 'ViewContent', { content_ids: [i.id], content_type: 'product', value: i.price, currency: 'BRL' }) },
  addToCart: (i: Item) => { w.gtag?.('event', 'add_to_cart', { currency: 'BRL', value: i.price * (i.qty ?? 1), items: gaItems([i]) }); w.fbq?.('track', 'AddToCart', { content_ids: [i.id], content_type: 'product', value: i.price * (i.qty ?? 1), currency: 'BRL' }) },
  beginCheckout: (items: Item[]) => { w.gtag?.('event', 'begin_checkout', { currency: 'BRL', value: sum(items), items: gaItems(items) }); w.fbq?.('track', 'InitiateCheckout', { value: sum(items), currency: 'BRL', num_items: items.length }) },
  purchase: (id: string, value: number) => {
    const k = `purchase-${id}`
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1') } catch { /* ignore */ }
    w.gtag?.('event', 'purchase', { transaction_id: id, currency: 'BRL', value }); w.fbq?.('track', 'Purchase', { value, currency: 'BRL' })
  },
}
