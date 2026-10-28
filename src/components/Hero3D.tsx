import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function labelTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#fbf6ec'; g.fillRect(0, 0, 512, 512)
  g.strokeStyle = '#b8923a'; g.lineWidth = 6; g.strokeRect(14, 14, 484, 484)
  g.fillStyle = '#111'; g.textAlign = 'center'
  g.font = '500 96px Georgia, serif'; g.fillText('ARKYN', 256, 240)
  g.font = '28px Georgia, serif'; g.fillStyle = '#555'
  g.fillText('I M P O R T S', 256, 300)
  g.fillRect(196, 330, 120, 2)
  g.font = '22px Georgia, serif'; g.fillText('EAU DE PARFUM', 256, 380)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function Bottle() {
  const group = useRef<THREE.Group>(null!)
  const label = useMemo(labelTexture, [])
  useFrame((s, dt) => {
    const g = group.current
    g.rotation.y += dt * 0.35
    const tx = s.pointer.y * -0.25, tz = s.pointer.x * 0.12
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, dt)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, tz, 4, dt)
  })
  return (
    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.5}>
      <group ref={group} position={[0, -0.2, 0]}>
        {/* vidro */}
        <RoundedBox args={[1.5, 1.9, 0.9]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="#f3c06a" transparent opacity={0.55} roughness={0.05} metalness={0.1} clearcoat={1} envMapIntensity={1.4} />
        </RoundedBox>
        {/* líquido */}
        <RoundedBox args={[1.32, 1.55, 0.72]} radius={0.08} smoothness={4} position={[0, -0.12, 0]}>
          <meshStandardMaterial color="#c98a2b" roughness={0.25} metalness={0.2} />
        </RoundedBox>
        {/* rótulo (frente e verso) */}
        <mesh position={[0, -0.05, 0.456]}><planeGeometry args={[0.95, 0.95]} /><meshStandardMaterial map={label} roughness={0.6} /></mesh>
        <mesh position={[0, -0.05, -0.456]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.95, 0.95]} /><meshStandardMaterial map={label} roughness={0.6} /></mesh>
        {/* pescoço dourado */}
        <mesh position={[0, 1.08, 0]}><cylinderGeometry args={[0.22, 0.26, 0.28, 32]} /><meshStandardMaterial color="#c9a24a" metalness={1} roughness={0.2} /></mesh>
        {/* tampa */}
        <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.06} smoothness={3} position={[0, 1.58, 0]}>
          <meshStandardMaterial color="#0d0d0d" metalness={0.6} roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 1.24, 0]}><cylinderGeometry args={[0.3, 0.3, 0.08, 32]} /><meshStandardMaterial color="#d4af37" metalness={1} roughness={0.15} /></mesh>
      </group>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.3, 7], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-4, 0, 2]} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={2} position={[4, 0, -2]} scale={[2, 6, 1]} />
      </Environment>
      <Bottle />
    </Canvas>
  )
}
