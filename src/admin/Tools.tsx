import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { copy, downloadCsv, money, useAllProducts } from './shared'
import type { Product } from '../lib/types'

const SECTIONS: [Product['category'], string][] = [['masculino', '🖤 PERFUMES MASCULINOS'], ['feminino', '🌸 PERFUMES FEMININOS'], ['splash', '💎 SPLASH & MINIATURAS'], ['skincare', '🧴 SKINCARE']]
const LINE = '━━━━━━━━━━━━━━━━━━'

export default function Tools() {
  const { items, reload } = useAllProducts()
  const [msg, setMsg] = useState('')
  return (
    <>
      {msg && <p className="muted">{msg}</p>}
      <Catalog items={items} setMsg={setMsg} />
      <Reprice items={items} reload={reload} setMsg={setMsg} />
      <Restock items={items} setMsg={setMsg} />
    </>
  )
}

function Catalog({ items, setMsg }: { items: Product[]; setMsg: (s: string) => void }) {
  const [onlyStock, setOnlyStock] = useState(true)
  const [header, setHeader] = useState('✨ ARKYN IMPORTS ✨\nCATÁLOGO DE PERFUMES & IMPORTADOS\n\n📍 Coxim – MS\n💳 Aceitamos Pix e cartão de crédito.')
  const [footer, setFooter] = useState('✨ Sua próxima fragrância favorita está aqui.')
  const text = useMemo(() => {
    const body = SECTIONS.map(([cat, title]) => {
      const list = items.filter(p => p.category === cat && p.active !== false && (!onlyStock || p.stock > 0)).sort((a, b) => a.brand.localeCompare(b.brand))
      if (!list.length) return ''
      return `${LINE}\n${title}\n${LINE}\n\n` + list.map(p => `• ${p.brand} ${p.name}\n💰 ${money(p.price)}`).join('\n\n')
    }).filter(Boolean).join('\n\n')
    return `${header}\n\n${body}\n\n${LINE}\n\n${footer}`
  }, [items, onlyStock, header, footer])
  return (
    <div className="adm-card">
      <b>Catálogo para WhatsApp</b>
      <p className="muted">Gera o texto do catálogo com preços atuais, pronto para colar no WhatsApp, status ou grupo de clientes.</p>
      <label className="chk"><input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} /> Só produtos em estoque</label>
      <label className="lbl">Cabeçalho<textarea rows={4} value={header} onChange={e => setHeader(e.target.value)} /></label>
      <textarea rows={12} readOnly value={text} style={{ width: '100%' }} />
      <label className="lbl">Rodapé<input value={footer} onChange={e => setFooter(e.target.value)} /></label>
      <div className="adm-row" style={{ marginTop: 10 }}>
        <button className="btn" onClick={async () => setMsg((await copy(text)) ? 'Catálogo copiado! Cole no WhatsApp.' : 'Não consegui copiar; selecione o texto e copie.')}>COPIAR CATÁLOGO</button>
        <a className="btn ghost" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>ABRIR NO WHATSAPP</a>
      </div>
    </div>
  )
}

function Reprice({ items, reload, setMsg }: { items: Product[]; reload: () => void; setMsg: (s: string) => void }) {
  const [scope, setScope] = useState('all')
  const [pct, setPct] = useState(10)
  const [round, setRound] = useState(true)
  const [promo, setPromo] = useState(true)
  const brands = [...new Set(items.map(p => p.brand))].sort()
  const targets = items.filter(p => scope === 'all' || p.category === scope || p.brand === scope)
  const newPrice = (p: Product) => { const v = p.price * (1 + pct / 100); return round ? Math.max(0.9, Math.floor(v) + 0.9) : Math.round(v * 100) / 100 }
  async function apply() {
    if (!targets.length || !pct) return
    if (!confirm(`Aplicar ${pct > 0 ? '+' : ''}${pct}% em ${targets.length} produto(s)?`)) return
    for (const p of targets) {
      const price = newPrice(p)
      const patch: Partial<Product> = { price }
      if (pct < 0 && promo) patch.old_price = p.price
      if (pct > 0) patch.old_price = null
      await supabase!.from('products').update(patch).eq('id', p.id)
    }
    reload(); setMsg(`Preços atualizados em ${targets.length} produto(s).`)
  }
  return (
    <div className="adm-card">
      <b>Reajuste de preços em massa</b>
      <p className="muted">Útil quando o dólar muda ou numa promoção. Veja a prévia antes de aplicar.</p>
      <div className="adm-grid">
        <label className="lbl">Aplicar em<select value={scope} onChange={e => setScope(e.target.value)}>
          <option value="all">Todos os produtos</option>
          <optgroup label="Categoria"><option value="masculino">Masculinos</option><option value="feminino">Femininos</option><option value="splash">Splash/Miniaturas</option><option value="skincare">Skincare</option></optgroup>
          <optgroup label="Marca">{brands.map(b => <option key={b}>{b}</option>)}</optgroup>
        </select></label>
        <label className="lbl">Porcentagem (use − para desconto)<input type="number" step="1" value={pct} onChange={e => setPct(Number(e.target.value))} /></label>
      </div>
      <label className="chk"><input type="checkbox" checked={round} onChange={e => setRound(e.target.checked)} /> Terminar em ,90</label>
      <label className="chk"><input type="checkbox" checked={promo} onChange={e => setPromo(e.target.checked)} /> Em desconto, mostrar o preço antigo riscado (promoção)</label>
      {targets.slice(0, 5).map(p => <div className="adm-row" key={p.id} style={{ marginBottom: 2 }}><span>{p.brand} {p.name}</span><span className="muted">{money(p.price)} → <b>{money(newPrice(p))}</b></span></div>)}
      {targets.length > 5 && <p className="muted">… e mais {targets.length - 5} produto(s)</p>}
      <button className="btn" onClick={apply} disabled={!targets.length || !pct}>APLICAR EM {targets.length} PRODUTO(S)</button>
    </div>
  )
}

function Restock({ items, setMsg }: { items: Product[]; setMsg: (s: string) => void }) {
  const [limit, setLimit] = useState(3)
  const [target, setTarget] = useState(6)
  const low = items.filter(p => p.stock <= limit && p.active !== false).sort((a, b) => a.stock - b.stock)
  const text = `Lista de reposição - Arkyn Imports\n\n` + low.map(p => `• ${p.brand} ${p.name}: tenho ${p.stock}, comprar ${Math.max(0, target - p.stock)}`).join('\n')
  return (
    <div className="adm-card">
      <b>Lista de reposição</b>
      <p className="muted">Produtos acabando ou esgotados, com a quantidade sugerida para comprar do fornecedor.</p>
      <div className="adm-grid">
        <label className="lbl">Estoque igual ou menor que<input type="number" min="0" value={limit} onChange={e => setLimit(Number(e.target.value))} /></label>
        <label className="lbl">Quero repor até<input type="number" min="1" value={target} onChange={e => setTarget(Number(e.target.value))} /></label>
      </div>
      {!low.length && <p className="muted">Nada para repor com esse critério.</p>}
      {low.map(p => <div className="adm-row" key={p.id} style={{ marginBottom: 2 }}><span>{p.brand} {p.name}</span><span><b style={{ color: p.stock <= 0 ? '#b3261e' : '#a15c00' }}>{p.stock}</b> · comprar <b>{Math.max(0, target - p.stock)}</b></span></div>)}
      {!!low.length && <div className="adm-row" style={{ marginTop: 10 }}>
        <button className="btn" onClick={async () => setMsg((await copy(text)) ? 'Lista copiada!' : 'Não consegui copiar.')}>COPIAR LISTA</button>
        <button className="btn ghost" onClick={() => downloadCsv('reposicao.csv', [['Marca', 'Produto', 'Estoque', 'Comprar'], ...low.map(p => [p.brand, p.name, p.stock, Math.max(0, target - p.stock)])])}>EXPORTAR CSV</button>
      </div>}
    </div>
  )
}
