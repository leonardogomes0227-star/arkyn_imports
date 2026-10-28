import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'

interface Q { title: string; opts: [string, string][] }
const QUESTIONS: Q[] = [
  { title: 'Para quem é o perfume?', opts: [['masculino', 'Masculino'], ['feminino', 'Feminino'], ['any', 'Tanto faz']] },
  { title: 'Para qual ocasião?', opts: [['dia', 'Dia a dia / trabalho'], ['noite', 'Noite / balada / encontro']] },
  { title: 'Que estilo de cheiro você prefere?', opts: [['doce', 'Doce e gostoso'], ['amadeirado', 'Amadeirado e especiado'], ['fresco', 'Fresco e leve'], ['floral', 'Floral']] },
  { title: 'Qual intensidade?', opts: [['suave', 'Suave, discreto'], ['intenso', 'Marcante, que deixa rastro']] },
  { title: 'Qual seu orçamento?', opts: [['250', 'Até R$ 250'], ['350', 'Até R$ 350'], ['0', 'Sem limite']] },
]

export default function Quiz() {
  const { products } = useStore()
  const [answers, setAnswers] = useState<string[]>([])
  const step = answers.length
  const done = step >= QUESTIONS.length

  const results = !done ? [] : products
    .filter(p => p.category === 'masculino' || p.category === 'feminino')
    .filter(p => answers[0] === 'any' || p.gender === answers[0])
    .map(p => {
      const t = p.tags ?? []
      let score = 0
      if (t.includes(answers[1])) score += 2
      if (t.includes(answers[2])) score += 3
      if (answers[3] === 'intenso' ? t.includes('intenso') : !t.includes('intenso')) score += 2
      const max = Number(answers[4])
      if (max && p.price > max) score -= 5
      if (p.image) score += 0.5
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <section className="section quiz">
      <h2>Qual é o seu cheiro?</h2>
      {!done ? (
        <>
          <p className="muted">Pergunta {step + 1} de {QUESTIONS.length}</p>
          <h3 className="q">{QUESTIONS[step].title}</h3>
          <div className="opts">
            {QUESTIONS[step].opts.map(([v, l]) => <button key={v} className="opt" onClick={() => setAnswers([...answers, v])}>{l}</button>)}
          </div>
          {step > 0 && <button className="link" onClick={() => setAnswers(answers.slice(0, -1))}>← Voltar</button>}
        </>
      ) : (
        <>
          <h3 className="q">Nossas indicações para você</h3>
          <div className="grid">{results.map(r => <ProductCard key={r.p.id} p={r.p} />)}</div>
          <p style={{ marginTop: 20 }}><button className="btn ghost" onClick={() => setAnswers([])}>REFAZER O QUIZ</button> <Link to="/catalogo" className="btn">VER CATÁLOGO</Link></p>
        </>
      )}
    </section>
  )
}
