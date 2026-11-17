import { useEffect, useRef } from 'react'

// Detalhes de interação do site inteiro, leves e só no desktop com mouse:
//  - anel que acompanha o cursor e cresce sobre links e botões
//  - botões principais "puxam" para o cursor (magnético)
//  - luz que segue o cursor dentro dos painéis
const BTN = '.hx-btn, .btn, .pdp-cta, .card-add, .ch-btn, .btn-gold, .ax-menu-wa, .ax-suggest button'

export default function Feel() {
  const ring = useRef<HTMLDivElement>(null)
  // ondulação no clique (toque também) a partir do ponto exato do dedo ou do mouse
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const down = (e: PointerEvent) => {
      const b = (e.target as HTMLElement).closest?.(BTN) as HTMLElement | null
      if (!b || (b as HTMLButtonElement).disabled) return
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2
      const i = document.createElement('span')
      i.className = 'rip'; i.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      b.appendChild(i); i.addEventListener('animationend', () => i.remove(), { once: true })
    }
    document.addEventListener('pointerdown', down, { passive: true })
    return () => document.removeEventListener('pointerdown', down)
  }, [])
  // a faixa de marcas "inclina" conforme a velocidade da rolagem e volta ao normal
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = window.scrollY, v = 0, raf = 0
    const tick = () => {
      v *= 0.88
      const mq = document.querySelector<HTMLElement>('.hm-mq')
      if (mq) mq.style.setProperty('--mq-skew', `${Math.max(-7, Math.min(7, v)).toFixed(2)}deg`)
      raf = Math.abs(v) > 0.05 ? requestAnimationFrame(tick) : 0
    }
    const on = () => { const y = window.scrollY; v += (y - last) * 0.06; last = y; if (!raf) raf = requestAnimationFrame(tick) }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ring.current!
    let x = -100, y = -100, rx = x, ry = y, raf = 0, big = false
    const MAG = '.hx-btn, .pdp-cta, .btn:not(.ghost):not(.light), .gh-cta a'
    const SPOT = '.hm-col, .hm-fam-c, .hm-pyr-txt li'
    const HOT = 'a, button, [role="tab"], summary, label, input, select'
    let mag: HTMLElement | null = null
    const tick = () => { rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; el.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) scale(${big ? 1.9 : 1})`; raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0 }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX; y = e.clientY; el.style.opacity = '1'
      const t = e.target as HTMLElement
      big = !!t.closest?.(HOT)
      const m = t.closest?.(MAG) as HTMLElement | null
      if (mag && mag !== m) { mag.style.setProperty('--tx', '0px'); mag.style.setProperty('--ty', '0px') }
      mag = m
      const bt = t.closest?.(BTN) as HTMLElement | null
      if (bt) { const r = bt.getBoundingClientRect(); bt.style.setProperty('--bx', `${x - r.left}px`); bt.style.setProperty('--by', `${y - r.top}px`) }
      if (m) { const r = m.getBoundingClientRect(); m.style.setProperty('--tx', `${((x - (r.left + r.width / 2)) / r.width) * 10}px`); m.style.setProperty('--ty', `${((y - (r.top + r.height / 2)) / r.height) * 8}px`) }
      const s = t.closest?.(SPOT) as HTMLElement | null
      if (s) { const r = s.getBoundingClientRect(); s.style.setProperty('--px', `${x - r.left}px`); s.style.setProperty('--py', `${y - r.top}px`) }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const out = () => { el.style.opacity = '0'; mag?.style.setProperty('--tx', '0px'); mag?.style.setProperty('--ty', '0px') }
    const down = () => el.classList.add('press'), up = () => el.classList.remove('press')
    document.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', out)
    document.addEventListener('pointerdown', down); document.addEventListener('pointerup', up)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', out); document.removeEventListener('pointerdown', down); document.removeEventListener('pointerup', up) }
  }, [])
  return <div ref={ring} className="feel-ring" aria-hidden="true" />
}
