import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cutoutFor } from '../../lib/cutouts'
import { flyToBag } from '../../lib/fly'
import { brl, useStore } from '../../lib/store'
import type { Product } from '../../lib/types'
import { useToast } from '../Toast'
import { famOf, flightOf, gateOf, shortName } from './flight'

// Começo do site: "check-in olfativo". Três toques e a impressora solta o cartão de embarque
// com o perfume da loja que mais combina. Antes de responder, o bilhete passa por todos os perfumes.
type Who = 'masculino' | 'feminino' | 'todos'
type When = 'dia' | 'noite' | 'ambos'
const FAMS: { id: string; name: string; img: string }[] = [
  { id: 'doce', name: 'Doce', img: 'baunilha' },
  { id: 'amadeirado', name: 'Amadeirado', img: 'cedro' },
  { id: 'floral', name: 'Floral', img: 'jasmim' },
  { id: 'especiado', name: 'Especiado', img: 'acafrao' },
  { id: 'fresco', name: 'Fresco', img: 'limao' },
]

function score(p: Product, who: Who, when: When, fam: string) {
  let s = 52
  if (who === 'todos') s += 12; else if (p.category === who) s += 24; else s -= 30
  const t = p.tags ?? []
  if (when === 'ambos') s += 6; else if (t.includes(when)) s += 12
  if (t.includes(fam)) s += 22
  if (p.featured) s += 2
  return Math.max(40, Math.min(98, s))
}

function Pass({ p, pct }: { p: Product; pct?: number }) {
  const notes = p.notes ?? []
  return (
    <div className="oc-pass">
      <div className="oc-pass-hd"><span>Voo {flightOf(p.id)} · Portão {gateOf(p)}</span><b>{pct ? `${pct}% combina` : 'Embarque'}</b></div>
      <div className="oc-pass-route">
        <span><b>DXB</b><small>Dubai</small></span>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="M2 26 C 30 2, 70 2, 98 20" /></svg>
        <span><b>Você</b><small>Todo o Brasil</small></span>
      </div>
      <div className="oc-pass-ph">
        {cutoutFor(p) && <img key={p.id} src={cutoutFor(p)} alt="" />}
        <span className="oc-stamp">{p.stock <= 3 ? <>Últimas<br />unidades</> : <>Pronta<br />entrega</>}</span>
      </div>
      <span className="oc-perf" aria-hidden="true" />
      <div className="oc-pass-nm"><b>{shortName(p.name)}</b><span>{p.brand}{famOf(p) && ` · ${famOf(p)}`}</span></div>
      <div className="oc-pass-f">
        <span><small>Saída</small><b>{notes[0] ?? '—'}</b></span>
        <span><small>Fundo</small><b>{notes[notes.length - 1] ?? '—'}</b></span>
        <span><small>Tarifa</small><b>{brl(p.price)}</b></span>
      </div>
    </div>
  )
}

export default function CheckinHero() {
  const { products, add, setOpen } = useStore()
  const { toast } = useToast()
  const pool = useMemo(() => products.filter(p => p.stock > 0 && (p.category === 'masculino' || p.category === 'feminino') && cutoutFor(p)), [products])
  const fams = FAMS.filter(f => pool.some(p => p.tags?.includes(f.id)))
  const [step, setStep] = useState(0)
  const [who, setWho] = useState<Who | null>(null)
  const [when, setWhen] = useState<When | null>(null)
  const [fam, setFam] = useState<string | null>(null)
  const [printed, setPrinted] = useState(false)
  const [idle, setIdle] = useState(0)
  const out = useRef<HTMLDivElement>(null)
  const pic = useRef<HTMLDivElement>(null)

  // antes do check-in, o bilhete passa por todos os perfumes da loja
  useEffect(() => {
    if (printed || pool.length < 2) return
    const t = window.setInterval(() => setIdle(v => (v + 1) % pool.length), 2400)
    return () => window.clearInterval(t)
  }, [printed, pool.length])

  const ranked = useMemo(() => (who && when && fam ? pool.map(p => ({ p, s: score(p, who, when, fam) })).sort((a, b) => b.s - a.s) : []), [pool, who, when, fam])
  const top = ranked[0]
  const print = () => {
    setPrinted(true)
    window.setTimeout(() => { if (window.innerWidth < 980) out.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 120)
  }
  const redo = () => { setPrinted(false); setStep(0); setWho(null); setWhen(null); setFam(null) }
  const buy = (p: Product) => { add(p.id, false); flyToBag(pic.current?.querySelector('img') ?? null); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }
  const pick = <T,>(set: (v: T) => void, v: T, next: number) => { set(v); window.setTimeout(() => setStep(next), 260) }

  const Q = [
    { t: 'Para quem é o perfume?', k: 'Para quem' },
    { t: 'Quando você vai usar?', k: 'Quando' },
    { t: 'Qual cheiro te ganha?', k: 'Cheiro' },
  ]
  const done = step === 2 && !!fam

  return (
    <section className="oc" aria-labelledby="oc-t">
      <div className="oc-left">
        <p className="oc-kick">Check-in olfativo · {pool.length} perfumes a bordo</p>
        <h1 id="oc-t">Para onde o seu perfume vai <em>te levar?</em></h1>
        <p className="oc-sub">Três toques e a gente imprime o seu cartão de embarque com o perfume que combina com você.</p>

        <div className="oc-route" aria-hidden="true">
          <svg viewBox="0 0 350 34" preserveAspectRatio="none"><path d="M6 18 C 90 4, 180 32, 344 12" /></svg>
          {[0, 1, 2].map(i => <i key={i} className={`oc-stop s${i}${i < step || printed ? ' done' : ''}${i === step && !printed ? ' on' : ''}`} />)}
          <img className="oc-plane" src="/intro/aviao.webp" alt="" style={{ '--x': printed ? 1 : step / 2 } as CSSProperties} />
          {Q.map((q, i) => <span key={q.k} className={`oc-stop-l s${i}`}>{q.k}</span>)}
        </div>

        <div className="oc-card">
          {!printed ? (
            <div key={step} className="oc-q">
              <small>Etapa {step + 1} de 3</small>
              <h2>{Q[step].t}</h2>
              {step === 0 && (
                <div className="oc-opts">
                  {([['masculino', 'Para ele'], ['feminino', 'Para ela'], ['todos', 'Tanto faz']] as [Who, string][]).map(([v, l]) => (
                    <button key={v} type="button" className={who === v ? 'oc-o on' : 'oc-o'} aria-pressed={who === v} onClick={() => pick(setWho, v, 1)}>{l}</button>
                  ))}
                </div>
              )}
              {step === 1 && (
                <div className="oc-opts">
                  {([['dia', 'De dia'], ['noite', 'À noite'], ['ambos', 'Os dois']] as [When, string][]).map(([v, l]) => (
                    <button key={v} type="button" className={when === v ? 'oc-o on' : 'oc-o'} aria-pressed={when === v} onClick={() => pick(setWhen, v, 2)}>{l}</button>
                  ))}
                </div>
              )}
              {step === 2 && (
                <div className="oc-opts oc-opts-img">
                  {fams.map(f => (
                    <button key={f.id} type="button" className={fam === f.id ? 'oc-o on' : 'oc-o'} aria-pressed={fam === f.id} onClick={() => setFam(f.id)}>
                      <img src={`/notas/${f.img}.webp`} alt="" />{f.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="oc-nav">
                {step > 0 ? <button type="button" className="oc-back" onClick={() => setStep(step - 1)}>← Voltar</button> : <span />}
                {step === 2 && <button type="button" className="oc-go" disabled={!done} onClick={print}>Imprimir bilhete <span aria-hidden="true">→</span></button>}
              </div>
            </div>
          ) : (
            <div className="oc-q oc-done">
              <small>Check-in feito</small>
              <h2>Encontramos o seu voo.</h2>
              <p>{who === 'todos' ? 'Para qualquer pessoa' : who === 'masculino' ? 'Para ele' : 'Para ela'} · {when === 'ambos' ? 'dia e noite' : when === 'dia' ? 'de dia' : 'à noite'} · {fams.find(f => f.id === fam)?.name.toLowerCase()}</p>
              <div className="oc-nav"><button type="button" className="oc-back" onClick={redo}>↺ Refazer o check-in</button><a href="#partidas" className="oc-back">Ver todos os voos ↓</a></div>
            </div>
          )}
        </div>
      </div>

      <div className="oc-right" ref={out}>
        <div className="oc-slot" aria-hidden="true" />
        {printed && top ? (
          <div className="oc-print" key={top.p.id}>
            <div ref={pic}><Pass p={top.p} pct={top.s} /></div>
            <div className="oc-act">
              <button type="button" className="oc-buy" onClick={() => buy(top.p)}>Embarcar</button>
              <Link to={`/produto/${top.p.id}`} className="oc-see">Ver perfume</Link>
            </div>
            <p className="oc-alt-t">Outros voos para você</p>
            <div className="oc-alts">
              {ranked.slice(1, 3).map(({ p, s }) => (
                <Link key={p.id} to={`/produto/${p.id}`} className="oc-mini">
                  {cutoutFor(p) && <img src={cutoutFor(p)} alt="" />}
                  <span><b>{shortName(p.name)}</b><small>{s}% · {brl(p.price)}</small></span>
                </Link>
              ))}
            </div>
          </div>
        ) : pool.length > 0 && (
          <div className="oc-idle" aria-live="off">
            <div className="oc-print" key={pool[idle].id}><Pass p={pool[idle]} /></div>
            <p className="oc-idle-t">Faça o check-in para imprimir o seu bilhete</p>
          </div>
        )}
      </div>
    </section>
  )
}
