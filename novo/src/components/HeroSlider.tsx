import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IChevron } from './Icons'

export interface Slide { img: string; eyebrow: string; title: string; text: string; cta: string; to: string; tone?: 'light' | 'dark' }

const DUR = 6500

/** Banner principal com troca automática, barra de progresso, setas e arrastar com o dedo. */
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const start = useRef(0)
  const n = slides.length
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n])
  useEffect(() => {
    if (paused || n < 2) return
    const t = window.setTimeout(() => go(i + 1), DUR)
    return () => window.clearTimeout(t)
  }, [i, paused, go, n])
  return (
    <section className={paused ? 'nv-hero paused' : 'nv-hero'} aria-roledescription="carrossel" aria-label="Destaques"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { start.current = e.touches[0].clientX }}
      onTouchEnd={e => { const d = e.changedTouches[0].clientX - start.current; if (Math.abs(d) > 45) go(i + (d < 0 ? 1 : -1)) }}>
      {slides.map((s, k) => (
        <div key={s.img} className={`nv-slide ${k === i ? 'on' : ''} ${s.tone === 'dark' ? 'dark' : ''}`} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${n}`}>
          <picture>
            <source media="(max-width:760px)" srcSet={`/banners/${s.img}-mobile-720.webp 720w, /banners/${s.img}-mobile.webp 1080w`} sizes="100vw" />
            <img src={`/banners/${s.img}-desktop-1440.webp`} srcSet={`/banners/${s.img}-desktop-1440.webp 1440w, /banners/${s.img}-desktop.webp 2400w`} sizes="100vw" alt="" width="2400" height="900" loading={k === 0 ? 'eager' : 'lazy'} />
          </picture>
          <div className="nv-slide-txt">
            <small>{s.eyebrow}</small>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link to={s.to} className="nv-btn nv-btn-light" tabIndex={k === i ? 0 : -1}>{s.cta}</Link>
          </div>
        </div>
      ))}
      {n > 1 && <>
        <button type="button" className="nv-hero-arr l" aria-label="Banner anterior" onClick={() => go(i - 1)}><IChevron dir="left" /></button>
        <button type="button" className="nv-hero-arr r" aria-label="Próximo banner" onClick={() => go(i + 1)}><IChevron /></button>
        <div className="nv-hero-dots">
          {slides.map((s, k) => <button key={s.img} type="button" aria-label={`Ir para o banner ${k + 1}`} aria-current={k === i} className={k === i ? 'on' : ''} onClick={() => go(k)}><i style={{ animationDuration: `${DUR}ms` }} /></button>)}
        </div>
      </>}
    </section>
  )
}
