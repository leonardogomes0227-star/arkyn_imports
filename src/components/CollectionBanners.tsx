import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

const SLIDES = [
  { key: 'ele', eyebrow: 'Para ele', title: 'Masculinos', text: 'Amadeirados e especiados, do dia a dia à noite.', to: '/catalogo?cat=masculino', cat: 'masculino' },
  { key: 'ela', eyebrow: 'Para ela', title: 'Femininos', text: 'Doces e florais, do dia à noite.', to: '/catalogo?cat=feminino', cat: 'feminino' },
  { key: 'splash', eyebrow: 'Leve e fresco', title: 'Body Splash', text: 'Perfume leve para usar todos os dias.', to: '/catalogo?cat=splash', cat: 'splash' },
] as const

/** Vitrine de coleções com as imagens de campanha: arrasta no celular, setas e pontos no computador, passa sozinha. */
export default function CollectionBanners() {
  const { products } = useStore()
  const box = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const slides = SLIDES.filter(s => products.some(p => p.category === s.cat))

  const go = (n: number) => {
    const el = box.current; if (!el || !slides.length) return
    const k = (n + slides.length) % slides.length
    el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }); setI(k)
  }
  useEffect(() => {
    const el = box.current; if (!el) return
    const on = () => setI(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', on, { passive: true }); return () => el.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (hold || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => go(i + 1), 6500); return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, hold, slides.length])

  if (!slides.length) return null
  return (
    <section className="cb" aria-roledescription="carrossel" aria-label="Coleções" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onTouchStart={() => setHold(true)}>
      <div className="cb-track" ref={box}>
        {slides.map((s, k) => (
          <Link key={s.key} to={s.to} className="cb-slide" aria-label={`${s.title}: ver coleção`} tabIndex={k === i ? 0 : -1}>
            <picture>
              <source media="(max-width:700px)" srcSet={`/banners/${s.key}-mobile-720.webp 720w, /banners/${s.key}-mobile.webp 1080w`} sizes="100vw" />
              <img src={`/banners/${s.key}-desktop-1440.webp`} srcSet={`/banners/${s.key}-desktop-1440.webp 1440w, /banners/${s.key}-desktop.webp 2400w`} sizes="100vw" width="1440" height="540" alt="" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" />
            </picture>
            <span className="cb-txt">
              <small>{s.eyebrow}</small><b>{s.title}</b><em>{s.text}</em>
              <i className="cb-btn">{products.filter(p => p.category === s.cat).length} perfumes <span aria-hidden="true">→</span></i>
            </span>
          </Link>
        ))}
      </div>
      {slides.length > 1 && <>
        <button type="button" className="cb-nav cb-prev" aria-label="Anterior" onClick={() => go(i - 1)}>‹</button>
        <button type="button" className="cb-nav cb-next" aria-label="Próximo" onClick={() => go(i + 1)}>›</button>
        <div className="cb-dots">{slides.map((s, k) => <button type="button" key={s.key} aria-label={`Ir para ${s.title}`} aria-current={k === i} className={k === i ? 'on' : ''} onClick={() => go(k)} />)}</div>
      </>}
    </section>
  )
}
