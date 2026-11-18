import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ---------- barra de progresso da rolagem (topo da tela) ---------- */
export function ScrollBar() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.current?.style.setProperty('--p', h > 0 ? String(Math.min(1, window.scrollY / h)) : '0')
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div className="nt-progress" ref={bar} aria-hidden="true" />
}

/* ---------- contagem regressiva até o Natal ---------- */
function target(now: Date) {
  const y = now.getFullYear()
  const t = new Date(y, 11, 25, 0, 0, 0)
  const end = new Date(y, 11, 26, 0, 0, 0)
  if (now >= end) return { t: new Date(y + 1, 11, 25, 0, 0, 0), merry: false }
  return { t, merry: now >= t }
}
function useCountdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id) }, [])
  const { t, merry } = target(now)
  const ms = Math.max(0, t.getTime() - now.getTime())
  const s = Math.floor(ms / 1000)
  return { merry, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}
function Tile({ n, label, pad = 2 }: { n: number; label: string; pad?: number }) {
  return (
    <div className="nt-tile">
      <b key={n}>{String(n).padStart(pad, '0')}</b>
      <small>{label}</small>
    </div>
  )
}
export function ChristmasBand({ whatsapp }: { whatsapp: string }) {
  const { merry, d, h, m, s } = useCountdown()
  return (
    <section className="nt-band" aria-label="Contagem regressiva para o Natal">
      <div className="nt-band-in">
        <div className="nt-band-txt">
          <p className="nt-kicker">Natal Arkyn</p>
          <h2>{merry ? 'Feliz Natal!' : <>Faltam <em>{d} {d === 1 ? 'dia' : 'dias'}</em> para o Natal</>}</h2>
          <span>{merry ? 'Obrigado por escolher a Arkyn. Boas festas!' : 'Escolha o presente com calma. Retirada em Coxim sem custo de frete.'}</span>
        </div>
        {!merry && (
          <div className="nt-tiles" role="timer" aria-live="off">
            <Tile n={d} label="dias" pad={2} /><i>:</i><Tile n={h} label="horas" /><i>:</i><Tile n={m} label="min" /><i>:</i><Tile n={s} label="seg" />
          </div>
        )}
        <div className="nt-band-cta">
          <Link to="/catalogo" className="nt-btn">Escolher presentes</Link>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero ajuda para escolher um perfume de presente de Natal.')}`} target="_blank" rel="noreferrer" className="nt-btn nt-btn--ghost">Ajuda no WhatsApp</a>
        </div>
      </div>
    </section>
  )
}
