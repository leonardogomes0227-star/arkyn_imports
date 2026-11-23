import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Animações de entrada para PC e celular: cada bloco ganha a classe "mv-in" quando aparece na tela,
// com atraso em cascata entre irmãos. Um único observador, só transform e opacity (leve no celular).
const SEL = [
  '.card', '.hm-br-c', '.hm-info > *', '.sx-p', '.hm-col', '.hm-head', '.sx-h', '.sx-tabs',
  '.pdp-info > *', '.pdp-gallery', '.np-grid li', '.np:not(.np--mini) .np-row', '.cmp-table tr', '.qz-opt', '.qz-fam',
  '.crumbs', '.page-title', '.toolbar', '.eb-flap', '.eb-row',
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
    // segurança: nada fica escondido se o navegador não avisar (fim da página, aba em segundo plano)
    const reveal = () => document.querySelectorAll<HTMLElement>('.mv:not(.mv-in)').forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight + 40) el.classList.add('mv-in') })
    let raf = 0, idle = 0; const onScroll = () => { window.clearTimeout(idle); idle = window.setTimeout(reveal, 220) }
    window.addEventListener('scroll', onScroll, { passive: true }); const t = window.setTimeout(reveal, 1500)
    const mo = new MutationObserver(() => scan())
    mo.observe(document.getElementById('conteudo') ?? document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect(); window.removeEventListener('scroll', onScroll); window.clearTimeout(t); window.clearTimeout(idle); cancelAnimationFrame(raf) }
  }, [pathname, search])
  return null
}
