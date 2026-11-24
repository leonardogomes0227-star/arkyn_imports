import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SizedImg from '../components/SizedImg'
import { useToast } from '../components/Toast'
import { clearCompare, toggleCompare } from '../lib/compare'
import { cutoutFor } from '../lib/cutouts'
import { groupNotes } from '../lib/noteGroups'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

// Consultoria olfativa em 6 etapas: o avião da marca anda pela linha de progresso a cada resposta
// e o resultado sai em formato de bilhete. A pontuação usa só dados reais do catálogo (família, momento, notas, preço).

type Who = 'eu' | 'presente'
type Gender = 'masculino' | 'feminino' | 'any'
type Answers = { who?: Who; gender?: Gender; moments: string[]; families: string[]; love: string[]; avoid: string[]; power?: 1 | 2 | 3; budget?: number }

const STEPS = 6
const FAMILIES: [string, string, string][] = [
  ['doce', 'Doce', '#6b1d36'], ['amadeirado', 'Amadeirado', '#5a3b1c'], ['fresco', 'Fresco', '#1d5a52'], ['floral', 'Floral', '#6b2a5a'], ['especiado', 'Especiado', '#7a3b12'],
]
const MOMENTS: [string, string, string, ReactNode][] = [
  ['dia', 'Dia a dia', 'Trabalho, faculdade, rotina', <svg key="s" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>],
  ['noite', 'Noite', 'Encontro, festa, jantar', <svg key="m" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>],
  ['fresco', 'Calor', 'Dias quentes, praia, verão', <svg key="w" viewBox="0 0 24 24"><path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" /></svg>],
  ['intenso', 'Ocasião especial', 'Quando você quer ser lembrado', <svg key="t" viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" /></svg>],
]
const POWER: [1 | 2 | 3, string, string][] = [[1, 'Discreto', 'Fica perto de você'], [2, 'Equilibrado', 'Sente quem chega perto'], [3, 'Marcante', 'Perguntam qual é o seu perfume']]
const MOMENT_LABEL: Record<string, string> = { dia: 'Dia a dia', noite: 'Noite', fresco: 'Calor', intenso: 'Ocasião especial' }
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const and = (l: string[]) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}` : l[0] ?? '')
const powerOf = (p: Product): 1 | 2 | 3 => { const t = p.tags ?? []; return t.includes('intenso') ? 3 : t.includes('fresco') || (t.includes('dia') && !t.includes('noite')) ? 1 : 2 }

function score(p: Product, a: Answers) {
  const t = p.tags ?? [], notes = (p.notes ?? []).map(n => n.toLowerCase())
  const why: string[] = []
  let s = 0
  const fam = a.families.filter(f => t.includes(f))
  if (fam.length) { s += 3 * fam.length; why.push(`Família ${fam.join(' e ')}`) }
  const mom = a.moments.filter(m => t.includes(m))
  if (mom.length) { s += 1.5 * mom.length; why.push(`Para ${and(mom.map(m => MOMENT_LABEL[m].toLowerCase()))}`) }
  const loved = (p.notes ?? []).filter(n => a.love.includes(n))
  if (loved.length) { s += 2 * loved.length; why.push(`Tem ${and(loved.map(n => n.toLowerCase()))}`) }
  if (a.power) { const d = Math.abs(powerOf(p) - a.power); if (d === 0) { s += 1; why.push(POWER[a.power - 1][1]) } else if (d === 1) s += 0.5 }
  const possible = 3 * a.families.length + 1.5 * a.moments.length + 2 * a.love.length + (a.power ? 1 : 0)
  const avoided = a.avoid.some(n => notes.includes(n.toLowerCase()))
  return { p, why, s, pct: possible ? Math.round((100 * s) / possible) : 0, avoided }
}

export default function Quiz() {
  usePageMeta({ title: 'Consultoria olfativa | Arkyn Imports', description: 'Seis etapas para descobrir os perfumes que combinam com você: momento, família, notas, intensidade e orçamento.' })
  const { products, settings, add, setOpen } = useStore()
  const { toast } = useToast()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const start = sp.get('p')
  const [step, setStep] = useState(start ? 1 : 0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [a, setA] = useState<Answers>({ moments: [], families: [], love: [], avoid: [], who: start === 'present' ? 'presente' : start ? 'eu' : undefined, gender: start === 'masculino' || start === 'feminino' ? start : undefined })
  const [thinking, setThinking] = useState(false)

  const pool = useMemo(() => products.filter(p => (p.category === 'masculino' || p.category === 'feminino') && p.stock > 0), [products])
  const prices = pool.map(p => p.price)
  const minP = Math.floor((Math.min(...prices, 100)) / 10) * 10, maxP = Math.ceil((Math.max(...prices, 400)) / 10) * 10
  const notes = useMemo(() => {
    const f = new Map<string, number>()
    pool.forEach(p => p.notes?.forEach(n => f.set(n, (f.get(n) ?? 0) + 1)))
    return [...f.entries()].sort((x, y) => y[1] - x[1]).slice(0, 24).map(([n]) => n)
  }, [pool])
  const budget = a.budget ?? maxP

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const set = (patch: Partial<Answers>) => setA(x => ({ ...x, ...patch }))
  const toggle = (k: 'moments' | 'families', v: string, max = 9) => setA(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(y => y !== v) : x[k].length >= max ? [...x[k].slice(1), v] : [...x[k], v] }))
  const [mode, setMode] = useState<'love' | 'avoid'>('love')
  const markNote = (n: string) => setA(x => {
    const other = mode === 'love' ? 'avoid' : 'love'
    if (x[mode].includes(n)) return { ...x, [mode]: x[mode].filter(y => y !== n) }
    return { ...x, [mode]: [...x[mode], n], [other]: x[other].filter(y => y !== n) }
  })
  const finish = () => { setThinking(true); go(7); window.setTimeout(() => setThinking(false), 1500) }

  const results = useMemo(() => {
    if (step < 7) return []
    const byGender = (p: Product) => !a.gender || a.gender === 'any' || p.gender === a.gender || p.gender === 'unissex'
    let list = pool.filter(byGender).map(p => score(p, a))
    const strict = list.filter(r => !r.avoided && r.p.price <= budget)
    list = strict.length >= 3 ? strict : list.filter(r => !r.avoided).length >= 3 ? list.filter(r => !r.avoided) : list
    return list.sort((x, y) => y.s - x.s || x.p.price - y.p.price).slice(0, 3)
  }, [step, a, pool, budget])

  const passenger = a.who === 'presente' ? 'Presente' : 'Você'
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Fiz a consultoria olfativa da Arkyn e me indicaram:\n${results.map(r => `• ${r.p.brand} ${r.p.name} (${r.pct}% · ${brl(r.p.price)})`).join('\n')}\nPode me ajudar a escolher?`)}`
  const compareAll = () => { clearCompare(); results.forEach(r => toggleCompare(r.p.id)); nav('/comparar') }
  const buy = (p: Product) => { add(p.id, false); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }
  const countIn = pool.filter(p => p.price <= budget).length

  const head = (n: number, title: string, sub: string) => (
    <header className="qz-q"><small>Etapa {n} de {STEPS}</small><h1>{title}</h1><p>{sub}</p></header>
  )
  const nextBtn = (n: number, label = 'Continuar', ok = true) => (
    <div className="qz-nav">
      <button type="button" className="qz-back" onClick={() => go(n - 2 < 0 ? 0 : n - 1)}>← Voltar</button>
      <button type="button" className="hx-btn" disabled={!ok} onClick={() => (n === STEPS ? finish() : go(n + 1))}>{label}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
    </div>
  )

  return (
    <section className="qz">
      {step > 0 && step < 7 && (
        <div className="qz-route" aria-label={`Etapa ${step} de ${STEPS}`}>
          <svg viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M8 30 C 150 4, 300 36, 450 14 S 592 18, 592 18" className="qz-r0" />
            <path d="M8 30 C 150 4, 300 36, 450 14 S 592 18, 592 18" className="qz-r1" pathLength={1} style={{ strokeDashoffset: 1 - (step - 1) / (STEPS - 1) }} />
          </svg>
          <img src="/intro/aviao.webp" alt="" aria-hidden="true" style={{ '--x': `${((step - 1) / (STEPS - 1)) * 100}%` } as CSSProperties} />
          <ol>{Array.from({ length: STEPS }, (_, i) => <li key={i} className={i + 1 < step ? 'done' : i + 1 === step ? 'on' : ''} />)}</ol>
        </div>
      )}

      <div key={step} className={`qz-step ${dir > 0 ? 'fwd' : 'back'}`}>
        {step === 0 && (
          <div className="qz-intro">
            <small className="gh-eyebrow">Consultoria olfativa Arkyn</small>
            <h1>Descubra o perfume que é a sua cara.</h1>
            <p>Seis etapas rápidas: para quem é, quando vai usar, a família que te atrai, as notas que você ama e as que evita, a intensidade e quanto quer investir. No fim você recebe os perfumes do catálogo que mais combinam com você, e o porquê.</p>
            <ul><li><b>6</b> etapas</li><li><b>1</b> minuto</li><li><b>{pool.length}</b> perfumes analisados</li></ul>
            <button type="button" className="hx-btn" onClick={() => go(1)}>Começar<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
        )}

        {step === 1 && (<>
          {head(1, 'Para quem é?', 'Escolha as duas respostas e seguimos.')}
          <div className="qz-grid two">
            {([['eu', 'Para mim', 'Quero achar o meu perfume'], ['presente', 'Para presentear', 'Vou dar de presente']] as [Who, string, string][]).map(([v, t, d]) => (
              <button key={v} type="button" className={a.who === v ? 'qz-opt on' : 'qz-opt'} aria-pressed={a.who === v} onClick={() => set({ who: v })}><b>{t}</b><span>{d}</span></button>
            ))}
          </div>
          <div className="qz-chips">
            {([['masculino', 'Masculino'], ['feminino', 'Feminino'], ['any', 'Tanto faz']] as [Gender, string][]).map(([v, t]) => (
              <button key={v} type="button" className={a.gender === v ? 'qz-chip on' : 'qz-chip'} aria-pressed={a.gender === v} onClick={() => set({ gender: v })}>{t}</button>
            ))}
          </div>
          {nextBtn(1, 'Continuar', !!a.who && !!a.gender)}
        </>)}

        {step === 2 && (<>
          {head(2, 'Quando vai usar?', 'Pode escolher mais de um.')}
          <div className="qz-grid two">
            {MOMENTS.map(([v, t, d, icon]) => (
              <button key={v} type="button" className={a.moments.includes(v) ? 'qz-opt ic on' : 'qz-opt ic'} aria-pressed={a.moments.includes(v)} onClick={() => toggle('moments', v)}>{icon}<b>{t}</b><span>{d}</span></button>
            ))}
          </div>
          {nextBtn(2, 'Continuar', a.moments.length > 0)}
        </>)}

        {step === 3 && (<>
          {head(3, 'Que família te atrai?', 'Escolha até duas. Embaixo de cada uma, as notas que mais aparecem nela no catálogo.')}
          <div className="qz-fams">
            {FAMILIES.map(([v, t, c]) => {
              const sample = [...new Set(pool.filter(p => p.tags?.includes(v)).flatMap(p => p.notes ?? []))].slice(0, 3)
              const on = a.families.includes(v)
              return (
                <button key={v} type="button" className={on ? 'qz-fam on' : 'qz-fam'} aria-pressed={on} style={{ '--fam': c } as CSSProperties} onClick={() => toggle('families', v, 2)} disabled={!sample.length}>
                  <b>{t}</b><span>{sample.length ? sample.join(' · ') : 'Sem perfumes no momento'}</span><i aria-hidden="true">{on ? '✓' : '+'}</i>
                </button>
              )
            })}
          </div>
          {nextBtn(3, 'Continuar', a.families.length > 0)}
        </>)}

        {step === 4 && (<>
          {head(4, 'Notas que você ama e que evita', 'Escolha o que marcar e toque nas notas. Pode pular.')}
          <div className="qz-mode" role="radiogroup" aria-label="Marcar notas como">
            <button type="button" role="radio" aria-checked={mode === 'love'} className={mode === 'love' ? 'on love' : 'love'} onClick={() => setMode('love')}><i aria-hidden="true">♥</i>Amo <b>{a.love.length}</b></button>
            <button type="button" role="radio" aria-checked={mode === 'avoid'} className={mode === 'avoid' ? 'on avoid' : 'avoid'} onClick={() => setMode('avoid')}><i aria-hidden="true">✕</i>Evito <b>{a.avoid.length}</b></button>
          </div>
          <div className="qz-groups">
            {groupNotes(notes).map(g => (
              <section key={g.id} className="qz-group" style={{ '--g': g.color } as CSSProperties}>
                <h3>{g.label}</h3>
                <div className="qz-notes">
                  {g.notes.map(n => {
                    const st = a.love.includes(n) ? 'love' : a.avoid.includes(n) ? 'avoid' : ''
                    return (
                      <button key={n} type="button" className={`qz-note ${st}`} aria-pressed={!!st} onClick={() => markNote(n)} aria-label={`${n}${st === 'love' ? ', amo' : st === 'avoid' ? ', evito' : ''}`}>
                        <span className="qz-tick" aria-hidden="true">{st === 'love' ? '♥' : st === 'avoid' ? '✕' : '+'}</span>{n}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
          {nextBtn(4, a.love.length || a.avoid.length ? 'Continuar' : 'Pular esta etapa')}
        </>)}

        {step === 5 && (<>
          {head(5, 'Quanto ele deve aparecer?', 'A intensidade do rastro que fica por onde você passa.')}
          <div className="qz-power">
            {POWER.map(([v, t, d]) => (
              <button key={v} type="button" className={a.power === v ? 'qz-pw on' : 'qz-pw'} aria-pressed={a.power === v} onClick={() => set({ power: v })}>
                <span className="qz-waves" aria-hidden="true">{Array.from({ length: v * 2 + 1 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>
                <b>{t}</b><small>{d}</small>
              </button>
            ))}
          </div>
          {nextBtn(5, 'Continuar', !!a.power)}
        </>)}

        {step === 6 && (<>
          {head(6, 'Quanto quer investir?', 'Arraste até o valor máximo.')}
          <div className="qz-budget">
            <output>{brl(budget)}</output>
            <input type="range" min={minP} max={maxP} step={10} value={budget} onChange={e => set({ budget: Number(e.target.value) })} aria-label="Valor máximo" style={{ '--v': `${((budget - minP) / (maxP - minP || 1)) * 100}%` } as CSSProperties} />
            <div className="qz-budget-ends"><span>{brl(minP)}</span><span>{brl(maxP)}</span></div>
            <p><b>{countIn}</b> {countIn === 1 ? 'perfume' : 'perfumes'} até esse valor</p>
          </div>
          {nextBtn(6, 'Ver meu resultado')}
        </>)}

        {step === 7 && thinking && (
          <div className="qz-thinking" role="status"><img src="/intro/aviao.webp" alt="" /><p>Escolhendo os seus perfumes…</p></div>
        )}

        {step === 7 && !thinking && (
          <div className="qz-result">
            <small className="gh-eyebrow">Sua seleção</small>
            <h1>{results.length ? 'Estes são os perfumes que mais combinam com você.' : 'Não achamos uma combinação no catálogo agora.'}</h1>
            {results.map((r, i) => {
              const src = cutoutFor(r.p) ?? r.p.image
              const fams = (r.p.tags ?? []).filter(t => FAMILIES.some(f => f[0] === t)).map(cap).join(' · ') || '—'
              const moms = (r.p.tags ?? []).filter(t => t === 'dia' || t === 'noite').map(t => MOMENT_LABEL[t]).join(' · ') || '—'
              return (
                <article key={r.p.id} className={i === 0 ? 'qz-pass first' : 'qz-pass'} style={{ '--d': `${i * 140}ms` } as CSSProperties}>
                  <Link to={`/produto/${r.p.id}`} className="qz-pass-img">{src ? <SizedImg src={src} size={480} width={420} height={420} alt={`${r.p.brand} ${r.p.name}`} /> : null}</Link>
                  <div className="qz-pass-body">
                    <div className="qz-pass-top"><span>Arkyn · {i === 0 ? 'Primeira opção' : `Opção ${i + 1}`}</span><b className="qz-pct" style={{ '--p': `${Math.min(100, r.pct)}%` } as CSSProperties}>{Math.min(100, r.pct)}%<small>combina</small></b></div>
                    <small className="qz-brand">{r.p.brand}</small>
                    <h2><Link to={`/produto/${r.p.id}`}>{r.p.name}</Link></h2>
                    <dl>
                      <div><dt>Para</dt><dd>{passenger}</dd></div>
                      <div><dt>Família</dt><dd>{fams}</dd></div>
                      <div><dt>Momento</dt><dd>{moms}</dd></div>
                      <div><dt>Rastro</dt><dd>{POWER[powerOf(r.p) - 1][1]}</dd></div>
                    </dl>
                    {!!r.why.length && <ul className="qz-why">{r.why.map(w => <li key={w}>{w}</li>)}</ul>}
                    <div className="qz-pass-buy">
                      <span className="hx-price">{brl(r.p.price)}</span>
                      <button type="button" className="hx-btn" onClick={() => buy(r.p)}>Adicionar à sacola</button>
                      <Link to={`/produto/${r.p.id}`} className="hx-btn hx-btn--ghost">Ver perfume</Link>
                    </div>
                  </div>
                </article>
              )
            })}
            <div className="qz-final">
              {results.length > 1 && <button type="button" className="hx-btn hx-btn--ghost" onClick={compareAll}>Comparar os {results.length}</button>}
              <a className="hx-btn hx-btn--ghost" href={wa} target="_blank" rel="noreferrer">Enviar no WhatsApp</a>
              <button type="button" className="hx-btn hx-btn--ghost" onClick={() => { setA({ moments: [], families: [], love: [], avoid: [] }); go(1) }}>Refazer</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
