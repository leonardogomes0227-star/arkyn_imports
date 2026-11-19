const K = 'recent'
export const getRecent = (): string[] => { try { const v = JSON.parse(localStorage.getItem(K) || '[]'); return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [] } catch { return [] } }
export const pushRecent = (id: string) => { try { localStorage.setItem(K, JSON.stringify([id, ...getRecent().filter(x => x !== id)].slice(0, 8))) } catch { /* ignore */ } }
