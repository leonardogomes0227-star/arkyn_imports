import { useSyncExternalStore } from 'react'

// Lista de perfumes para comparar (até 3), guardada no navegador. Sem tocar na sacola nem no checkout.
export const MAX_COMPARE = 3
const KEY = 'compare'
let ids: string[] = (() => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, MAX_COMPARE) : [] } catch { return [] } })()
const subs = new Set<() => void>()
const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* sem armazenamento: só não lembra */ } subs.forEach(f => f()) }

/** Liga/desliga um perfume. Devolve false quando a lista já está cheia. */
export function toggleCompare(id: string): boolean {
  if (ids.includes(id)) ids = ids.filter(x => x !== id)
  else if (ids.length >= MAX_COMPARE) return false
  else ids = [...ids, id]
  emit(); return true
}
export const clearCompare = () => { ids = []; emit() }
export const useCompare = () => useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb) }, () => ids)
