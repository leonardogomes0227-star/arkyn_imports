const PALETTES: [string, string, string][] = [
  ['#c98a2b', '#f0bf6a', '#b9772a'], // âmbar
  ['#1a1a1a', '#4a4a4a', '#0d0d0d'], // preto
  ['#e9a6b4', '#f7d3da', '#d98a9d'], // rosa
  ['#8a5a2b', '#c99660', '#6e431c'], // marrom
  ['#cfd8dc', '#f4f7f8', '#aebbc1'], // cristal
  ['#2f5d50', '#5f9c88', '#244a40'], // verde
]

export function paletteFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTES[h % PALETTES.length]
}

export default function Bottle({ id, brand, big = false }: { id: string; brand: string; big?: boolean }) {
  const [a, b, c] = paletteFor(id)
  const g = `g${id}`
  return (
    <svg viewBox="0 0 200 240" className={big ? 'bottle big' : 'bottle'} role="img" aria-label={brand}>
      <defs>
        <linearGradient id={g} x1="0" x2="1"><stop offset="0" stopColor={a} /><stop offset=".5" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
        <linearGradient id={`${g}c`} x1="0" x2="1"><stop offset="0" stopColor="#050505" /><stop offset=".45" stopColor="#333" /><stop offset="1" stopColor="#050505" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="222" rx="62" ry="8" fill="#000" opacity=".12" />
      <rect x="72" y="14" width="56" height="40" rx="4" fill={`url(#${g}c)`} />
      <rect x="86" y="54" width="28" height="12" fill="#c9a24a" />
      <rect x="52" y="66" width="96" height="150" rx="8" fill={`url(#${g})`} stroke="#fff" strokeOpacity=".5" />
      <rect x="60" y="74" width="7" height="134" rx="3.5" fill="#fff" opacity=".35" />
      <rect x="64" y="104" width="72" height="68" fill="#fbf6ec" stroke="#b8923a" strokeWidth=".8" />
      <text x="100" y="128" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" letterSpacing="2" fill="#111">ARKYN</text>
      <text x="100" y="140" textAnchor="middle" fontFamily="Georgia,serif" fontSize="4.5" letterSpacing="3" fill="#666">IMPORTS</text>
      <text x="100" y="160" textAnchor="middle" fontFamily="Georgia,serif" fontSize="5.5" letterSpacing="1" fill="#444">{brand.toUpperCase().slice(0, 18)}</text>
    </svg>
  )
}
