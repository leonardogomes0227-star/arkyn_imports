// Ao adicionar à sacola, a foto do perfume voa até o ícone da sacola (animação nativa, sem biblioteca).
export function flyToBag(from: HTMLElement | null) {
  const bag = document.querySelector<HTMLElement>('.ax-bag')
  if (!from || !bag || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const a = from.getBoundingClientRect(), b = bag.getBoundingClientRect()
  if (!a.width || !b.width) return
  const clone = from.cloneNode(true) as HTMLElement
  clone.removeAttribute('srcset'); clone.removeAttribute('loading'); clone.removeAttribute('class')
  Object.assign(clone.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', padding: '0', zIndex: '300', pointerEvents: 'none', objectFit: 'contain', maskImage: 'none', webkitMaskImage: 'none', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,.6))' })
  document.body.appendChild(clone)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const run = clone.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.55}px,${dy * 0.3 - 70}px) scale(.5)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px,${dy}px) scale(.06)`, opacity: 0.15 },
  ], { duration: 760, easing: 'cubic-bezier(.5,0,.2,1)' })
  run.onfinish = () => { clone.remove(); bag.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' }) }
}
