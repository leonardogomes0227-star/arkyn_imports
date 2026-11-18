import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

// Abertura da home: o globo da logo girando, a rota verde chega ao Brasil e se espalha pelas capitais.
// Canvas 2D, sem biblioteca. Pontos de terra vêm de src/lib/globeDots (carregado sob demanda).
const D2R = Math.PI / 180
const BASE_HEADING = -38 * D2R            // direção do avião no arquivo de imagem
const ORIGIN = { lat: 25.2, lon: 55.3 }   // Oriente (sem rótulo)
const COXIM = { lat: -18.5, lon: -54.74 } // Coxim – MS: ponto de partida no Brasil
const CITIES: [number, number][] = [[-23.55, -46.63], [-22.91, -43.17], [-15.79, -47.88], [-19.92, -43.94], [-12.97, -38.5], [-8.05, -34.88], [-3.73, -38.52], [-3.12, -60.02], [-30.03, -51.23], [-25.43, -49.27], [-1.46, -48.5], [-20.32, -40.34]]

type V3 = [number, number, number]
const vec = (lat: number, lon: number): V3 => [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export default function GlobeHero() {
  const { products } = useStore()
  const box = useRef<HTMLElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = box.current, canvas = cv.current
    if (!el || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const plane = new Image(); plane.src = '/intro/aviao.webp'
    let land: Float32Array | null = null
    let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0
    let drag = { lon: 0, lat: 0, vlon: 0, vlat: 0, down: false, x: 0, y: 0 }
    let visible = true, raf = 0, t0 = performance.now()

    const A = vec(ORIGIN.lat, ORIGIN.lon), B = vec(COXIM.lat, COXIM.lon)
    const omega = Math.acos(clamp(dot(A, B), -1, 1)), so = Math.sin(omega)
    const arcPoint = (t: number, lift: number): V3 => {
      const k1 = Math.sin((1 - t) * omega) / so, k2 = Math.sin(t * omega) / so
      const s = 1 + lift * Math.sin(Math.PI * t)
      return [(k1 * A[0] + k2 * B[0]) * s, (k1 * A[1] + k2 * B[1]) * s, (k1 * A[2] + k2 * B[2]) * s]
    }

    const slerp = (P0: V3, P1: V3, t: number, lift: number): V3 => {
      const om = Math.acos(clamp(dot(P0, P1), -1, 1)), si = Math.sin(om) || 1
      const k1 = Math.sin((1 - t) * om) / si, k2 = Math.sin(t * om) / si, h = 1 + lift * Math.sin(Math.PI * t)
      return [(k1 * P0[0] + k2 * P1[0]) * h, (k1 * P0[1] + k2 * P1[1]) * h, (k1 * P0[2] + k2 * P1[2]) * h]
    }
    const cityV = CITIES.map(([la, lo]) => vec(la, lo))

    import('../lib/globeDots').then(m => {
      const n = m.LAND.length / 2, f = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) { const v = vec(m.LAND[2 * i] / 10, m.LAND[2 * i + 1] / 10); f[3 * i] = v[0]; f[3 * i + 1] = v[1]; f[3 * i + 2] = v[2] }
      land = f; if (reduced) frame(performance.now())
    })

    const resize = () => {
      const r = el.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, r.width < 700 ? 1.5 : 1.25); W = r.width; H = r.height
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      if (W > 1000) { R = Math.min(H * 0.39, W * 0.27); cx = W * 0.7; cy = H * 0.5 }
      else { R = Math.min(W * 0.36, H * 0.22); cx = W * 0.5; cy = H * 0.24 }
      if (reduced) frame(performance.now())
    }

    // gira em torno do ponto de vista: lon0 oscila para a rota ficar sempre à vista
    const view = (time: number) => {
      const sway = reduced ? 0 : Math.sin(time * 0.00011) * 24
      return { lon0: (-24 + sway * 0.6 + drag.lon) * D2R, lat0: clamp(16 + drag.lat, -40, 55) * D2R }
    }
    const rot = (v: V3, lon0: number, lat0: number): V3 => {
      const c = Math.cos(lon0), s = Math.sin(lon0)
      const x1 = v[0] * c - v[2] * s, z1 = v[0] * s + v[2] * c
      const cl = Math.cos(lat0), sl = Math.sin(lat0)
      return [x1, v[1] * cl - z1 * sl, v[1] * sl + z1 * cl]
    }
    const P = (r: V3): [number, number] => [cx + r[0] * R, cy - r[1] * R]
    const hidden = (r: V3) => r[2] < 0 && r[0] * r[0] + r[1] * r[1] < 1

    let scrolling = 0, skip = 0
    const onScroll = () => { scrolling = performance.now() }
    window.addEventListener('scroll', onScroll, { passive: true })
    const frame = (now: number) => {
      raf = 0
      // enquanto a pessoa rola, o globo espera (a rolagem fica com o processador); no celular desenha a 30 quadros
      if (!reduced && (now - scrolling < 140 || (skip = (skip + 1) % 2) === 1)) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); return }
      const time = now - t0
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (!drag.down) { drag.lon += drag.vlon; drag.lat += drag.vlat; drag.vlon *= 0.94; drag.vlat *= 0.94; drag.lon *= 0.992; drag.lat *= 0.992 }
      const { lon0, lat0 } = view(time)

      // halo da atmosfera e corpo da esfera
      let g = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.28)
      g.addColorStop(0, 'rgba(199,244,1,.16)'); g.addColorStop(1, 'rgba(199,244,1,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, 7); ctx.fill()
      g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
      g.addColorStop(0, '#26262a'); g.addColorStop(0.6, '#0e0e10'); g.addColorStop(1, '#030304')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(198,198,198,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke()

      // paralelos e meridianos bem sutis
      ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,.06)'
      const line = (pts: V3[]) => {
        ctx.beginPath(); let pen = false
        for (const p of pts) { const r = rot(p, lon0, lat0); if (r[2] > 0) { const [x, y] = P(r); if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true } } else pen = false }
        ctx.stroke()
      }
      for (let la = -60; la <= 60; la += 30) { const pts: V3[] = []; for (let lo = -180; lo <= 180; lo += 6) pts.push(vec(la, lo)); line(pts) }
      for (let lo = -180; lo < 180; lo += 30) { const pts: V3[] = []; for (let la = -90; la <= 90; la += 6) pts.push(vec(la, lo)); line(pts) }

      // continentes em pontos
      if (land) {
        const cl = Math.cos(lon0), sl = Math.sin(lon0), cp = Math.cos(lat0), sp = Math.sin(lat0)
        const base = Math.max(1, R / 230)
        // pontos agrupados em 4 faixas de brilho: 4 desenhos por quadro em vez de milhares
        const B = 4, paths = Array.from({ length: B }, () => new Path2D())
        for (let i = 0; i < land.length; i += 3) {
          const X = land[i], Y = land[i + 1], Z = land[i + 2]
          const x1 = X * cl - Z * sl, z1 = X * sl + Z * cl
          const z = Y * sp + z1 * cp
          if (z <= 0.02) continue
          const y = Y * cp - z1 * sp
          const s = base * (0.7 + 0.8 * z)
          paths[Math.min(B - 1, (z * B) | 0)].rect(cx + x1 * R - s / 2, cy - y * R - s / 2, s, s)
        }
        ctx.fillStyle = '#a9a9ae'
        for (let k = 0; k < B; k++) { ctx.globalAlpha = 0.2 + 0.8 * Math.pow((k + 0.5) / B, 0.7); ctx.fill(paths[k]) }
        ctx.globalAlpha = 1
      }

      // ciclo da rota: desenha, segura, apaga
      const CYCLE = 8200, c = reduced ? 4300 : time % CYCLE
      const head = reduced ? 1 : ease(clamp(c / 4300))
      const fade = reduced ? 1 : 1 - clamp((c - 6600) / 1100)
      const N = 110, upto = Math.round(N * head)
      const pts: ([number, number] | null)[] = []
      for (let i = 0; i <= N; i++) { const r = rot(arcPoint(i / N, 0.3), lon0, lat0); pts.push(hidden(r) ? null : P(r)) }
      ctx.lineCap = 'round'
      for (const [w, a, col, sh, lift] of [[8, 0.16, '199,244,1', 0, 0.3], [2.6, 0.95, '199,244,1', 0, 0.3], [1.1, 0.55, '222,255,120', 0, 0.3]] as const) {
        ctx.lineWidth = w * Math.max(1, R / 300); ctx.shadowBlur = 0; void sh
        for (let i = 1; i <= upto; i++) {
          const p0 = pts[i - 1], p1 = pts[i]; if (!p0 || !p1) continue
          const k = 0.25 + 0.75 * (i / N)
          ctx.strokeStyle = `rgba(${col},${a * k * fade})`
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke()
        }
        void lift
      }
      ctx.shadowBlur = 0

      // ao pousar, a rota se espalha do centro-oeste para as capitais do país
      const spread = reduced ? 1 : ease(clamp((c - 4100) / 1300))
      if (spread > 0) {
        ctx.lineWidth = 1.4 * Math.max(1, R / 300); ctx.shadowBlur = 0
        cityV.forEach((v, ci) => {
          const g = clamp(spread * 1.25 - ci * 0.025), M = 22, up = Math.round(M * g)
          let prev: [number, number] | null = null
          for (let i = 0; i <= up; i++) {
            const r = rot(slerp(B, v, i / M, 0.035), lon0, lat0); const pt = hidden(r) || r[2] < 0 ? null : P(r)
            if (prev && pt) { ctx.strokeStyle = `rgba(199,244,1,${0.75 * fade})`; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke() }
            prev = pt
          }
          if (g >= 1) { const r = rot(v, lon0, lat0); if (r[2] > 0.05) { const [x, y] = P(r); ctx.fillStyle = `rgba(222,255,120,${fade})`; ctx.beginPath(); ctx.arc(x, y, Math.max(2, R / 150), 0, 7); ctx.fill() } }
        })
        ctx.shadowBlur = 0
      }

      // marcadores: origem (sem rótulo) e Brasil
      const mark = (v: V3, label: string | null, pulse: number) => {
        const r = rot(v, lon0, lat0); if (r[2] <= 0.05) return
        const [x, y] = P(r)
        ctx.fillStyle = '#C7F401'; ctx.beginPath(); ctx.arc(x, y, Math.max(3, R / 95), 0, 7); ctx.fill()
        if (pulse > 0) { ctx.strokeStyle = `rgba(199,244,1,${0.7 * (1 - pulse)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, Math.max(3, R / 95) + pulse * R / 9, 0, 7); ctx.stroke() }
        if (label) {
          ctx.font = `700 ${Math.max(11, R / 30)}px Manrope, system-ui, sans-serif`
          try { (ctx as unknown as { letterSpacing: string }).letterSpacing = '2px' } catch { /* navegador sem suporte */ }
          const tw = ctx.measureText(label).width, lx = x + 18, ly = y - 20
          ctx.strokeStyle = 'rgba(199,244,1,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(lx - 4, ly + 4); ctx.lineTo(lx + tw + 8, ly + 4); ctx.stroke()
          ctx.fillStyle = '#fff'; ctx.fillText(label, lx, ly)
        }
      }
      mark(A, null, reduced ? 0 : (time % 2600) / 2600)
      mark(B, 'BRASIL', head >= 1 && !reduced ? ((c - 4300) % 1800) / 1800 : 0)

      // avião na ponta da rota
      if (plane.complete && plane.naturalWidth && head > 0 && head < 1) {
        const t = head, e = 0.012
        const ra = rot(arcPoint(Math.max(0, t - e), 0.3), lon0, lat0), rb = rot(arcPoint(Math.min(1, t + e), 0.3), lon0, lat0), rp = rot(arcPoint(t, 0.3), lon0, lat0)
        if (!hidden(rp)) {
          const [x, y] = P(rp), [xa, ya] = P(ra), [xb, yb] = P(rb)
          const ang = Math.atan2(yb - ya, xb - xa) - BASE_HEADING
          const w = Math.max(54, R * 0.3), h = w * (plane.naturalHeight / plane.naturalWidth)
          ctx.save(); ctx.translate(x, y); ctx.rotate(ang)
          
          ctx.drawImage(plane, -w / 2, -h / 2, w, h); ctx.restore()
        }
      }
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(frame) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start() }, { threshold: 0.05 })
    io.observe(el)
    const vis = () => { if (!document.hidden) start() }
    document.addEventListener('visibilitychange', vis)
    const ro = new ResizeObserver(resize); ro.observe(el); resize(); start()

    const down = (e: PointerEvent) => { if (e.pointerType === 'touch' || e.target !== canvas) return; drag.down = true; el.classList.add('dragged'); drag.x = e.clientX; drag.y = e.clientY; drag.vlon = drag.vlat = 0; el.setPointerCapture?.(e.pointerId) }
    const move = (e: PointerEvent) => { if (!drag.down) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.lon -= dx * 0.28; drag.lat += dy * 0.2; drag.vlon = -dx * 0.05; drag.vlat = dy * 0.03 }
    const up = () => { drag.down = false }
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', vis); window.removeEventListener('scroll', onScroll); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [])

  const top = Object.entries(products.reduce<Record<string, number>>((m, p) => { if (p.category === 'masculino' || p.category === 'feminino') m[p.brand] = (m[p.brand] ?? 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0])
  return (
    <section ref={box} className="gh" aria-label="Arkyn Imports">
      <canvas ref={cv} className="gh-cv" aria-hidden="true" />
      <span className="gh-sparks" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>
      <div className="gh-copy">
        <p className="gh-eyebrow">Arkyn Imports · Envio para todo o Brasil</p>
        <h1 className="gh-title"><span>Perfumes árabes</span><span>e importados,</span><span>para todo o <em>Brasil.</em></span></h1>
        {top.length > 0 && <p className="gh-sub">{top.join(', ')} e outras marcas. Enviamos para todo o país, e em Coxim – MS você retira na loja sem frete.</p>}
        <div className="gh-cta">
          <Link to="/catalogo" className="hx-btn">Ver os perfumes<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
          <Link to="/quiz" className="hx-btn hx-btn--ghost">Qual é o seu cheiro?</Link>
        </div>
      </div>
      <span className="gh-hint" aria-hidden="true">Arraste para girar</span>
    </section>
  )
}
