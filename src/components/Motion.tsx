import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Animações de entrada para PC e celular: cada bloco ganha a classe "mv-in" quando aparece na tela,
// com atraso em cascata entre irmãos. Um único observador, só transform e opacity (leve no celular).
const SEL = [
  '.card', '.hm-br-c', '.hm-info > *', '.sx-p', '.hm-col', '.hm-head', '.sx-h', '.sx-tabs',
  '.pdp-info > *', '.pdp-gallery', '.np-grid li', '.np-tiers > li', '.cmp-table tr', '.qz-opt', '.qz-fam',
  '.ft', '.ax-foot-cta', '.crumbs', '.page-title', '.toolbar',
].join(',')

export default function Motion() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        el.classList.add('mv-in')
        io.unobserve(el)
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    const seen = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll<HTMLElement>(SEL).forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(SEL)) : []
        el.style.setProperty('--mv', String(Math.min(8, Math.max(0, sibs.indexOf(el)))))
        el.classList.add('mv')
        // o que já está na tela ao abrir entra logo, sem esperar rolar
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(() => el.classList.add('mv-in'))
        else io.observe(el)
      })
    }
    scan()
    const mo = new MutationObserver(() => scan())
    mo.observe(document.getElementById('conteudo') ?? document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [pathname, search])
  return null
}
