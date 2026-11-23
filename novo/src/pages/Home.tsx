import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import { ICard, IShield, IStore, ITruck } from '../components/Icons'
import { Rail } from '../components/ProductCard'
import { cutoutFor } from '../lib/cutouts'
import { CAT_LABEL, useStore, waLink } from '../lib/store'

const FAMILIES: { id: string; name: string; note: string; img: string }[] = [
  { id: 'doce', name: 'Doces', note: 'Baunilha, caramelo', img: 'baunilha' },
  { id: 'amadeirado', name: 'Amadeirados', note: 'Cedro, tabaco', img: 'cedro' },
  { id: 'floral', name: 'Florais', note: 'Jasmim, flor de laranjeira', img: 'jasmim' },
  { id: 'especiado', name: 'Especiados', note: 'Canela, açafrão', img: 'canela' },
  { id: 'fresco', name: 'Frescos', note: 'Limão, bergamota', img: 'limao' },
]

const CAT_TILES: { cat: string; img: string; bg: string }[] = [
  { cat: 'masculino', img: 'maison-alhambra-victorioso-nero-100ml', bg: 'radial-gradient(80% 70% at 50% 35%,rgba(199,244,1,.14),transparent 70%),#141416' },
  { cat: 'feminino', img: 'maison-alhambra-pink-eclipse-100ml', bg: 'radial-gradient(80% 70% at 50% 35%,rgba(255,130,175,.18),transparent 70%),#161014' },
  { cat: 'splash', img: 'lattafa-body-splash-mayar', bg: 'radial-gradient(80% 70% at 50% 35%,rgba(230,190,110,.18),transparent 70%),#15120d' },
  { cat: 'skincare', img: 'celimax-the-vita-a-retinal-shot-15ml', bg: 'radial-gradient(80% 70% at 50% 35%,rgba(140,200,235,.16),transparent 70%),#0f1316' },
]

export default function Home() {
  const { products, settings } = useStore()
  const live = products.filter(p => p.stock > 0)
  const perf = live.filter(p => p.category === 'masculino' || p.category === 'feminino')
  const featured = [...perf.filter(p => p.featured), ...perf.filter(p => !p.featured)].slice(0, 10)
  const masc = live.filter(p => p.category === 'masculino')
  const fem = live.filter(p => p.category === 'feminino')
  const offers = live.filter(p => p.old_price && p.old_price > p.price)
  const brands = [...new Set(products.map(p => p.brand))].map(b => ({ b, n: products.filter(p => p.brand === b).length })).sort((a, z) => z.n - a.n)
  const fams = FAMILIES.filter(f => products.some(p => p.tags?.includes(f.id)))

  return (
    <>
      <HeroSlider slides={[
        { ids: ['lattafa-asad-elixir-100ml', 'maison-alhambra-victorioso-nero-100ml', 'maison-alhambra-salvo-elixir-60ml'], bg: '#0c0d0e', arch: '#1b1c1f', glow: 'rgba(199,244,1,.14)', accent: '#C7F401',
          eyebrow: 'Masculinos', title: 'Presença que fica no ambiente', text: 'Amadeirados e especiados das casas árabes mais desejadas.', cta: 'Comprar masculinos', to: '/perfumes?cat=masculino' },
        { ids: ['lattafa-yara-rose-100ml', 'maison-alhambra-pink-eclipse-100ml', 'lattafa-atheeri-100ml'], bg: '#120b10', arch: '#26141f', glow: 'rgba(255,120,170,.16)', accent: '#ff9cc0',
          eyebrow: 'Femininos', title: 'Doce, floral e inesquecível', text: 'Os femininos que estão em todo lugar, com envio para todo o Brasil.', cta: 'Comprar femininos', to: '/perfumes?cat=feminino' },
        { ids: ['lattafa-tharwah-gold-100ml', 'lattafa-fakhar-extrait-gold-100ml', 'al-wataniah-attar-al-wesal-gold-100ml'], bg: '#100d08', arch: '#231c10', glow: 'rgba(226,180,90,.18)', accent: '#e6c27a',
          eyebrow: 'Coleção ouro', title: 'O luxo da perfumaria árabe', text: 'Frascos dourados, notas de âmbar, baunilha e especiarias.', cta: 'Ver a coleção', to: '/perfumes?fam=doce' },
        { ids: ['lattafa-body-splash-noble-blush', 'lattafa-body-splash-mayar', 'lattafa-body-splash-yara-tous'], bg: '#0a0f12', arch: '#14212a', glow: 'rgba(120,190,230,.15)', accent: '#9fd6f0',
          eyebrow: 'Body Splash', title: 'Perfume leve para o dia todo', text: 'Linha Lattafa para usar sem medo, do banho à noite.', cta: 'Ver body splash', to: '/perfumes?cat=splash' },
      ]} />

      <section className="nv-perks" aria-label="Vantagens">
        <div><ITruck /><span><b>Envio para todo o Brasil</b><small>Frete calculado pelo CEP</small></span></div>
        <div><ICard /><span><b>{settings.installments > 1 ? `Até ${settings.installments}x sem juros` : 'Pix ou cartão'}</b><small>Pagamento pelo Mercado Pago</small></span></div>
        <div><IStore /><span><b>Retirada grátis</b><small>Na loja em Coxim – MS</small></span></div>
        <div><IShield /><span><b>Produtos originais</b><small>Compra segura</small></span></div>
      </section>

      <section className="nv-sec">
        <div className="nv-sec-head"><div><h2>Compre por categoria</h2></div></div>
        <div className="nv-cats">
          {CAT_TILES.filter(t => products.some(p => p.category === t.cat)).map(t => (
            <Link key={t.cat} to={`/perfumes?cat=${t.cat}`} className="nv-cat" style={{ background: t.bg }}>
              <img src={`/hero/${t.img}.webp?v=4`} alt="" loading="lazy" />
              <span><b>{CAT_LABEL[t.cat]}</b><small>{products.filter(p => p.category === t.cat).length} produtos</small></span>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Mais desejados" sub="Os perfumes que mais saem na loja" to="/perfumes" items={featured} />

      <section className="nv-sec">
        <div className="nv-sec-head"><div><h2>Encontre pelo cheiro</h2><p>Escolha a família olfativa que você mais gosta</p></div></div>
        <div className="nv-fams">
          {fams.map(f => (
            <Link key={f.id} to={`/perfumes?fam=${f.id}`} className="nv-fam">
              <span className="nv-fam-img"><img src={`/notas/${f.img}.webp`} alt="" loading="lazy" /></span>
              <b>{f.name}</b><small>{f.note}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="nv-duo">
        {([['Masculinos', masc.length, '/perfumes?cat=masculino', 'Intensos e amadeirados', ['french-avenue-vulcan-feu-100ml', 'lattafa-al-noble-wazeer-100ml'], 'radial-gradient(70% 90% at 80% 60%,rgba(199,244,1,.12),transparent 60%),#121214', 'light'],
           ['Femininos', fem.length, '/perfumes?cat=feminino', 'Doces, florais e frutados', ['lattafa-yara-rose-100ml', 'lattafa-atheeri-100ml'], 'radial-gradient(70% 90% at 80% 60%,rgba(255,140,180,.16),transparent 60%),#160d13', 'light']] as [string, number, string, string, string[], string, string][]).map(([t, c, to, d, ids, bg, ink]) => (
          <Link key={t} to={to} className={`nv-duo-c ink-${ink}`} style={{ background: bg }}>
            <span className="nv-duo-art" aria-hidden="true">{ids.map(id => cutoutFor({ id }) && <img key={id} src={cutoutFor({ id })} alt="" loading="lazy" />)}</span>
            <span className="nv-duo-txt"><small>{c} perfumes</small><b>{t}</b><em>{d}</em><i>Ver coleção →</i></span>
          </Link>
        ))}
      </section>

      <Rail title="Masculinos" to="/perfumes?cat=masculino" items={masc} />
      <Rail title="Femininos" to="/perfumes?cat=feminino" items={fem} />
      {offers.length > 0 && <Rail title="Ofertas" to="/perfumes?promo=1" items={offers} />}

      <section className="nv-quiz">
        <div className="nv-quiz-txt">
          <small>Consultoria olfativa</small>
          <h2>Não sabe qual escolher?</h2>
          <p>Responda 6 perguntas rápidas e receba os perfumes que mais combinam com você.</p>
          <div><Link to="/quiz" className="nv-btn nv-btn-lime">Descobrir meu perfume</Link><a href={waLink(settings.whatsapp, 'Olá! Quero ajuda para escolher um perfume.')} target="_blank" rel="noreferrer" className="nv-btn nv-btn-ghost">Falar com a loja</a></div>
        </div>
        <div className="nv-quiz-img" aria-hidden="true">
          {['lattafa-asad-elixir-100ml', 'maison-alhambra-pink-eclipse-100ml', 'lattafa-fakhar-extrait-gold-100ml'].map(id => cutoutFor({ id }) && <img key={id} src={cutoutFor({ id })} alt="" loading="lazy" />)}
        </div>
      </section>

      <section className="nv-sec">
        <div className="nv-sec-head"><div><h2>Marcas</h2><p>As casas de perfumaria que a Arkyn traz para você</p></div><Link to="/marcas" className="nv-more">Ver todas</Link></div>
        <div className="nv-brands">
          {brands.map(({ b, n }) => <Link key={b} to={`/perfumes?marca=${encodeURIComponent(b)}`}><b>{b}</b><small>{n} {n === 1 ? 'produto' : 'produtos'}</small></Link>)}
        </div>
      </section>
    </>
  )
}
