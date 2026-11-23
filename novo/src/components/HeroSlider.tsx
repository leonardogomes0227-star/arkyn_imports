import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cutoutOf } from '../lib/cutouts'
import { IChevron } from './Icons'

/** Banner desenhado no próprio site: cor lisa, arco atrás dos frascos recortados, reflexo e texto. */
export interface Slide {
  ids: string[]            // frascos (recortes), o do meio é o principal
  bg: string; arch: string; glow: string; accent: string
  eyebrow: string; title: string; text: string; cta: string; to: string
}

const DUR = 6500

function Art({ s, eager }: { s: Slide; eager: boolean }) {
  const ids = s.ids.filter(id => cutoutOf(id))
  return (
    <div className="nv-art" aria-hidden="true">
      <span className="nv-arch" />
      <span className="nv-floor" />
      <div className={`nv-bottles n${ids.length}`}>
        {ids.map((id, k) => (
          <span key={id} className="nv-bottle" style={{ '--k': k } as CSSProperties}>
            <img src={cutoutOf(id)} alt="" loading={eager ? 'eager' : 'lazy'} />
            <img className="nv-refl" src={cutoutOf(id)} alt="" loading="lazy" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const start = useRef(0)
  const box = useRef<HTMLElement>(null)
  const [size, setSize] = useState({ w: 1000, h: 500 })
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  const n = slides.length
  // rota do avião em proporção do banner (de baixo à esquerda até o alto à direita)
  const { w, h } = size
  const artH = w < 860 ? Math.min(h, w * 0.95) : h // no celular o voo fica só na área da arte, sem cruzar o texto
  const P = (x: number, y: number) => `${Math.round(x * w)} ${Math.round(y * artH)}`
  const route = `M${P(-0.04, 0.94)} C ${P(0.22, 0.86)}, ${P(0.42, 0.6)}, ${P(0.6, 0.44)} S ${P(0.88, 0.16)}, ${P(1.06, 0.08)}`
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n])
  useEffect(() => {
    if (paused || n < 2) return
    const t = window.setTimeout(() => go(i + 1), DUR)
    return () => window.clearTimeout(t)
  }, [i, paused, go, n])
  return (
    <section ref={box} className={paused ? 'nv-hero paused' : 'nv-hero'} aria-roledescription="carrossel" aria-label="Destaques"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { start.current = e.touches[0].clientX }}
      onTouchEnd={e => { const d = e.changedTouches[0].clientX - start.current; if (Math.abs(d) > 45) go(i + (d < 0 ? 1 : -1)) }}>
      {slides.map((s, k) => (
        <div key={s.title} className={`nv-slide ${k === i ? 'on' : ''}`} style={{ '--bg': s.bg, '--arch': s.arch, '--glow': s.glow, '--accent': s.accent } as CSSProperties}
          aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${n}`}>
          <Art s={s} eager={k === 0} />
          <div className="nv-slide-txt">
            <small>{s.eyebrow}</small>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link to={s.to} className="nv-btn nv-slide-btn" tabIndex={k === i ? 0 : -1}>{s.cta}</Link>
          </div>
        </div>
      ))}
      <svg key={i} className="nv-flight" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path id={`nv-route-${i}`} d={route} pathLength={1400} />
        <image href="/intro/aviao.webp" width={w < 600 ? 52 : 74} height={w < 600 ? 41 : 58} x={w < 600 ? -26 : -37} y={w < 600 ? -20 : -29} preserveAspectRatio="xMidYMid meet">
          <animateMotion dur="2.4s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .2 1"><mpath href={`#nv-route-${i}`} /></animateMotion>
        </image>
      </svg>
      {n > 1 && <>
        <button type="button" className="nv-hero-arr l" aria-label="Banner anterior" onClick={() => go(i - 1)}><IChevron dir="left" /></button>
        <button type="button" className="nv-hero-arr r" aria-label="Próximo banner" onClick={() => go(i + 1)}><IChevron /></button>
        <div className="nv-hero-dots">
          {slides.map((s, k) => <button key={s.title} type="button" aria-label={`Ir para o banner ${k + 1}`} aria-current={k === i} className={k === i ? 'on' : ''} onClick={() => go(k)}><i style={{ animationDuration: `${DUR}ms` }} /></button>)}
        </div>
      </>}
    </section>
  )
}
