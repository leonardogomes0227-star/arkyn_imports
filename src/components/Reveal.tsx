import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/** Entrada suave ao rolar. Sem IntersectionObserver (ou com movimento reduzido) o conteúdo aparece direto. */
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null)
  const [on, setOn] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || on) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    io.observe(el); return () => io.disconnect()
  }, [on])
  const T = Tag as 'div'
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={`rv${on ? ' in' : ''} ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>{children}</T>
}
