import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { cutoutFor } from '../lib/cutouts'
import BottleStage, { stageNotes } from './BottleStage'

export default function Hero() {
  const { products } = useStore()
  const live = products.filter(p => p.stock > 0 && p.active !== false && cutoutFor(p) && stageNotes(p).length >= 2)
  const feat = live.find(p => p.id === 'lattafa-asad-elixir-100ml') ?? live.find(p => p.featured) ?? live[0]
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].slice(0, 3)
  return (
    <section className="hx" aria-label="Arkyn Imports">
      <div className="hx-l">
        <h1>Perfumes árabes <em>e importados</em></h1>
        <p>{brands.length ? `${brands.join(', ')} e mais. ` : ''}Enviamos para todo o Brasil. Em Coxim, retirada grátis na loja.</p>
        <div className="hx-cta">
          <Link to="/catalogo" className="hx-b">Ver os perfumes</Link>
          <Link to="/quiz" className="hx-b hx-b--o">Qual é o seu cheiro?</Link>
        </div>
      </div>
      <div className="hx-r">{feat && <BottleStage p={feat} />}</div>
    </section>
  )
}
