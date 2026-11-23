import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Animações de entrada ao rolar: cada bloco ganha "in" quando aparece, com cascata entre irmãos.
// Só transform e opacity, leve no celular. Nada fica escondido se o navegador não avisar.
const SEL = '.nv-sec-head, .nv-cat, .nv-card, .nv-fam, .nv-duo-c, .nv-quiz, .nv-brands a, .nv-perks > div, .nv-foot-news'

export default function Reveal() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    const seen = new WeakSet<Element>()
    const scan = () => document.querySelectorAll<HTMLElement>(SEL).forEach(el => {
      if (seen.has(el)) return
      seen.add(el)
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(SEL)) : []
      el.style.setProperty('--d', String(Math.min(6, Math.max(0, sibs.indexOf(el)))))
      el.classList.add('rv')
      io.observe(el)
    })
    scan()
    const mo = new MutationObserver(scan); mo.observe(document.body, { childList: true, subtree: true })
    const safety = window.setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in') }), 1800)
    return () => { io.disconnect(); mo.disconnect(); window.clearTimeout(safety) }
  }, [pathname])
  return null
}
