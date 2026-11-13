import { useEffect, useState, type CSSProperties } from 'react'

const KEY = 'arkyn-intro-visto'
const NAME = 'ARKYN IMPORTS'

function seen() {
  try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
}
function markSeen() {
  try { sessionStorage.setItem(KEY, '1') } catch { /* navegação privada: só não lembra */ }
}

/** Abertura do site: aro dourado se desenha, logo de Natal aparece, nome entra letra a letra e a cortina abre.
 *  Mostra uma vez por visita (sessão). Toque, clique ou tecla pulam. */
export default function Intro() {
  const [phase, setPhase] = useState<'on' | 'out' | 'done'>(() => (seen() ? 'done' : 'on'))

  useEffect(() => {
    if (phase !== 'on') return
    markSeen()
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const t1 = window.setTimeout(() => setPhase('out'), reduced ? 700 : 2700)
    const skip = () => setPhase('out')
    window.addEventListener('keydown', skip)
    return () => { window.clearTimeout(t1); window.removeEventListener('keydown', skip); document.documentElement.style.overflow = prev }
  }, [phase])

  useEffect(() => {
    if (phase !== 'out') return
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setPhase('done'), 1100)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null
  const year = new Date().getFullYear()
  return (
    <div className={phase === 'out' ? 'lx-intro out' : 'lx-intro'} role="presentation" onClick={() => setPhase('out')}>
      <span className="lx-intro-half top" aria-hidden="true" />
      <span className="lx-intro-half bottom" aria-hidden="true" />
      <div className="lx-intro-in" aria-hidden="true">
        <div className="lx-intro-badge">
          <svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="106" pathLength={1} /></svg>
          <img src="/logo-natal-sm.webp" width="512" height="512" alt="" />
        </div>
        <p className="lx-intro-name">{NAME.split('').map((c, i) => <span key={i} style={{ '--i': i } as CSSProperties}>{c === ' ' ? ' ' : c}</span>)}</p>
        <p className="lx-intro-sub"><i />Natal {year}<i /></p>
      </div>
      <button type="button" className="lx-intro-skip" onClick={e => { e.stopPropagation(); setPhase('out') }}>Pular</button>
    </div>
  )
}
