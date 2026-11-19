import type { VercelRequest } from '@vercel/node'

// Limite simples por IP (na memória da função: segura o grosso das tentativas em massa, não é à prova de tudo).
const hits = new Map<string, number[]>()
export function tooMany(req: VercelRequest, scope: string, max = 15, windowMs = 10 * 60 * 1000): boolean {
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'ip'
  const k = `${scope}:${ip}`, now = Date.now()
  const arr = (hits.get(k) ?? []).filter(t => now - t < windowMs)
  arr.push(now); hits.set(k, arr)
  if (hits.size > 5000) for (const [key, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(key)
  return arr.length > max
}
