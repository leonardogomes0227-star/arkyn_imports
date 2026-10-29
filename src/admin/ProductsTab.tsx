import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { SEED_PRODUCTS } from '../lib/seed'
import { brl } from '../lib/store'
import type { Category, Gender, Product } from '../lib/types'
import { downloadCsv, list, LOW_STOCK, slug, useAllProducts } from './shared'

const EMPTY: Product = { id: '', name: '', brand: '', price: 0, stock: 0, category: 'masculino', gender: 'masculino', family: '', notes: [], tags: [], image: '', active: true, featured: false, old_price: null, description: '', cost: null }
const CATS: [Category, string][] = [['masculino', 'Masculino'], ['feminino', 'Feminino'], ['splash', 'Splash/Miniatura'], ['skincare', 'Skincare']]

export default function ProductsTab({ stockMode = false }: { stockMode?: boolean }) {
  const { items, setItems, reload } = useAllProducts()
  const [edit, setEdit] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [show, setShow] = useState('')

  const shown = useMemo(() => items
    .filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()) && (!cat || p.category === cat)
      && (!show || (show === 'hidden' ? p.active === false : show === 'out' ? p.stock <= 0 : show === 'low' ? p.stock > 0 && p.stock <= LOW_STOCK : show === 'featured' ? !!p.featured : true)))
    .sort((a, b) => stockMode ? a.stock - b.stock : 0), [items, q, cat, show, stockMode])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!edit) return
    const row = { ...edit, id: isNew ? slug(`${edit.brand} ${edit.name}`) : edit.id, old_price: edit.old_price || null, cost: edit.cost || null }
    const { error } = await supabase!.from('products').upsert(row)
    if (error) return setMsg(error.message + ' — se falar de coluna, rode supabase/painel-completo.sql')
    setEdit(null); setMsg(''); reload()
  }
  async function remove(id: string) { if (confirm('Excluir este produto?')) { await supabase!.from('products').delete().eq('id', id); reload() } }
  async function upload(file: File) {
    const name = `${Date.now()}-${slug(file.name.replace(/\.[^.]+$/, ''))}.${file.name.split('.').pop()}`
    const { error } = await supabase!.storage.from('produtos').upload(name, file)
    if (error) return setMsg(error.message)
    setEdit(x => x && { ...x, image: supabase!.storage.from('produtos').getPublicUrl(name).data.publicUrl })
  }
  async function importSeed() {
    if (!confirm(`Importar ${SEED_PRODUCTS.length} produtos de exemplo?`)) return
    const { error } = await supabase!.from('products').upsert(SEED_PRODUCTS.map(p => ({ ...p, active: true, featured: false })))
    setMsg(error ? error.message : 'Produtos importados.'); reload()
  }
  async function quick(p: Product, patch: Partial<Product>) {
    const { error } = await supabase!.from('products').update(patch).eq('id', p.id)
    if (error) return setMsg(error.message)
    setItems(xs => xs.map(x => x.id === p.id ? { ...x, ...patch } : x))
  }
  function duplicate(p: Product) {
    setEdit({ ...p, name: `${p.name} (cópia)`, featured: false }); setIsNew(true)
  }

  if (edit) {
    const off = edit.old_price && edit.old_price > edit.price ? Math.round((1 - edit.price / edit.old_price) * 100) : 0
    return (
      <form className="adm-form" onSubmit={save}>
        <h3>{isNew ? 'Novo produto' : 'Editar produto'}</h3>
        <div className="adm-grid">
          <label>Marca<input value={edit.brand} onChange={e => setEdit({ ...edit, brand: e.target.value })} required /></label>
          <label>Nome<input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} required /></label>
          <label>Preço (R$)<input type="number" step="0.01" min="0" value={edit.price} onChange={e => setEdit({ ...edit, price: Number(e.target.value) })} required /></label>
          <label>Preço antigo (promoção){off > 0 && <b> · {off}% off</b>}<input type="number" step="0.01" min="0" value={edit.old_price ?? ''} onChange={e => setEdit({ ...edit, old_price: e.target.value ? Number(e.target.value) : null })} /></label>
          <label>Custo de compra (R$){edit.cost ? <b> · margem {Math.round((1 - edit.cost / (edit.price || 1)) * 100)}%</b> : null}<input type="number" step="0.01" min="0" value={edit.cost ?? ''} onChange={e => setEdit({ ...edit, cost: e.target.value ? Number(e.target.value) : null })} /></label>
          <label>Estoque<input type="number" min="0" value={edit.stock} onChange={e => setEdit({ ...edit, stock: Number(e.target.value) })} required /></label>
          <label>Categoria<select value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value as Category })}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>Gênero<select value={edit.gender} onChange={e => setEdit({ ...edit, gender: e.target.value as Gender })}><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="unissex">Unissex</option></select></label>
          <label>Família olfativa<input value={edit.family ?? ''} onChange={e => setEdit({ ...edit, family: e.target.value })} /></label>
        </div>
        <label>Descrição<textarea rows={3} value={edit.description ?? ''} onChange={e => setEdit({ ...edit, description: e.target.value })} /></label>
        <label>Notas (separadas por vírgula)<input value={(edit.notes ?? []).join(', ')} onChange={e => setEdit({ ...edit, notes: list(e.target.value) })} /></label>
        <label>Perfil para filtros e quiz (doce, amadeirado, fresco, floral, especiado, intenso, dia, noite)<input value={(edit.tags ?? []).join(', ')} onChange={e => setEdit({ ...edit, tags: list(e.target.value) })} /></label>
        <label>Foto<input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
        {edit.image && <img className="adm-thumb big" src={edit.image} alt="" />}
        <label className="chk"><input type="checkbox" checked={edit.active !== false} onChange={e => setEdit({ ...edit, active: e.target.checked })} /> Visível na loja</label>
        <label className="chk"><input type="checkbox" checked={!!edit.featured} onChange={e => setEdit({ ...edit, featured: e.target.checked })} /> Destaque na Home</label>
        {msg && <p className="err">{msg}</p>}
        <div className="adm-row"><button className="btn">SALVAR</button><button type="button" className="btn ghost" onClick={() => { setEdit(null); setMsg('') }}>CANCELAR</button></div>
      </form>
    )
  }

  return (
    <>
      <div className="adm-row">
        <div className="adm-row" style={{ marginBottom: 0 }}>
          <input placeholder="Buscar produto ou marca" value={q} onChange={e => setQ(e.target.value)} />
          <select value={cat} onChange={e => setCat(e.target.value)}><option value="">Todas categorias</option>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select value={show} onChange={e => setShow(e.target.value)}><option value="">Todos</option><option value="out">Esgotados</option><option value="low">Estoque baixo</option><option value="hidden">Ocultos</option><option value="featured">Destaques</option></select>
        </div>
        <span>
          {!stockMode && <button className="btn" onClick={() => { setEdit({ ...EMPTY }); setIsNew(true) }}>+ NOVO PRODUTO</button>}{' '}
          <button className="btn ghost" onClick={() => downloadCsv(stockMode ? 'estoque.csv' : 'produtos.csv', [['Marca', 'Nome', 'Categoria', 'Preço', 'Preço antigo', 'Estoque', 'Visível'], ...shown.map(p => [p.brand, p.name, p.category, p.price, p.old_price, p.stock, p.active === false ? 'não' : 'sim'])])}>EXPORTAR CSV</button>
        </span>
      </div>
      {!items.length && <button className="btn ghost" onClick={importSeed}>IMPORTAR PRODUTOS DE EXEMPLO</button>}
      {msg && <p className="muted">{msg}</p>}
      <p className="muted">{shown.length} produto(s) · {items.filter(p => p.stock <= 0).length} esgotado(s) · {items.filter(p => p.stock > 0 && p.stock <= LOW_STOCK).length} com estoque baixo</p>
      <div className="adm-table">
        {shown.map(p => (
          <div className={p.active === false ? 'adm-line off' : 'adm-line'} key={p.id}>
            {p.image ? <img className="adm-thumb" src={p.image} alt="" /> : <div className="adm-thumb" />}
            <div className="grow"><small>{p.brand}{p.featured ? ' · ★ destaque' : ''}{p.active === false ? ' · oculto' : ''}</small><div>{p.name}</div>{p.old_price ? <small>{brl(p.old_price)} → {brl(p.price)} </small> : null}{p.cost ? <small style={{ color: '#2d6a4f' }}>margem {Math.round((1 - p.cost / (p.price || 1)) * 100)}%</small> : null}</div>
            {!stockMode && <label>R$<input type="number" step="0.01" defaultValue={p.price} onBlur={e => Number(e.target.value) !== p.price && quick(p, { price: Number(e.target.value) })} /></label>}
            <label>Estoque<input type="number" min="0" defaultValue={p.stock} style={p.stock <= LOW_STOCK ? { borderColor: p.stock <= 0 ? '#b3261e' : '#a15c00' } : undefined} onBlur={e => Number(e.target.value) !== p.stock && quick(p, { stock: Number(e.target.value) })} /></label>
            {!stockMode && <>
              <button className="link" onClick={() => quick(p, { active: p.active === false })}>{p.active === false ? 'Mostrar' : 'Ocultar'}</button>
              <button className="link" onClick={() => quick(p, { featured: !p.featured })}>{p.featured ? 'Tirar destaque' : 'Destacar'}</button>
              <button className="link" onClick={() => { setEdit(p); setIsNew(false) }}>Editar</button>
              <button className="link" onClick={() => duplicate(p)}>Duplicar</button>
              <button className="link" onClick={() => remove(p.id)}>Excluir</button>
            </>}
          </div>
        ))}
      </div>
    </>
  )
}
