import { useEffect } from 'react'

interface Meta {
  title: string
  description: string
  path?: string // caminho canônico; padrão = página atual
  image?: string // caminho ou URL da imagem de compartilhamento
  noindex?: boolean
  type?: 'website' | 'product'
  jsonLd?: object | object[] | null
}

const upsert = (selector: string, make: () => HTMLElement, set: (el: HTMLElement) => void) => {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) { el = make(); document.head.appendChild(el) }
  set(el)
}
const meta = (attr: 'name' | 'property', key: string, content: string) =>
  upsert(`meta[${attr}="${key}"]`, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m }, el => el.setAttribute('content', content))

/** Título, descrição, canonical, Open Graph, robots e dados estruturados de cada página (a loja é uma SPA). */
export function usePageMeta(m: Meta) {
  const key = JSON.stringify(m)
  useEffect(() => {
    const origin = window.location.origin
    const url = origin + (m.path ?? window.location.pathname)
    const img = m.image ? (m.image.startsWith('http') ? m.image : origin + m.image) : `${origin}/og.jpg`
    document.title = m.title
    meta('name', 'description', m.description)
    meta('name', 'robots', m.noindex ? 'noindex,follow' : 'index,follow')
    meta('property', 'og:site_name', 'Arkyn Imports'); meta('property', 'og:locale', 'pt_BR')
    meta('property', 'og:type', m.type ?? 'website'); meta('property', 'og:title', m.title); meta('property', 'og:description', m.description)
    meta('property', 'og:url', url); meta('property', 'og:image', img)
    meta('name', 'twitter:card', 'summary_large_image'); meta('name', 'twitter:title', m.title); meta('name', 'twitter:description', m.description); meta('name', 'twitter:image', img)
    upsert('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }, el => el.setAttribute('href', url))
    const ld = document.getElementById('ld-json')
    if (m.jsonLd) {
      const s = ld ?? Object.assign(document.createElement('script'), { id: 'ld-json', type: 'application/ld+json' })
      s.textContent = JSON.stringify(m.jsonLd)
      if (!ld) document.head.appendChild(s)
    } else ld?.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
