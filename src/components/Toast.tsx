import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

interface ToastItem { id: number; text: string; action?: { label: string; run: () => void } }
const Ctx = createContext<{ toast: (text: string, action?: ToastItem['action']) => void }>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)
  const toast = useCallback((text: string, action?: ToastItem['action']) => {
    const id = ++seq.current
    setItems(a => [...a.slice(-2), { id, text, action }])
    window.setTimeout(() => setItems(a => a.filter(t => t.id !== id)), 3600)
  }, [])
  const value = useMemo(() => ({ toast }), [toast])
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="ax-toasts" role="status" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className="ax-toast">
            <span>{t.text}</span>
            {t.action && <button type="button" onClick={() => { t.action!.run(); setItems(a => a.filter(x => x.id !== t.id)) }}>{t.action.label}</button>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
