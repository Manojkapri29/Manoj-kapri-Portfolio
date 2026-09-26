import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { intro } from '../data/content';
import { introScroll } from './introScroll';

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Interpolated orb state for the current scroll position inside the intro. */
function sampleOrb(progress: number, out: { x: number; y: number; s: number; color: THREE.Color }, tmp: THREE.Color) {
  const f = Math.min(Math.max(progress, 0), 1) * (intro.length - 1);
  const i = Math.min(Math.floor(f), intro.length - 2);
  const t = smooth(f - i);
  const a = intro[i].orb;
  const b = intro[i + 1].orb;
  out.x = THREE.MathUtils.lerp(a.x, b.x, t);
  out.y = THREE.MathUtils.lerp(a.y, b.y, t);
  out.s = THREE.MathUtils.lerp(a.scale, b.scale, t);
  out.color.set(a.color).lerp(tmp.set(b.color), t);
}

function Orb() {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const core = useRef<any>(null);
  const light = useRef<THREE.PointLight>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const state = useMemo(() => ({ x: 0, y: 0, s: 1, color: new THREE.Color(intro[0].orb.color) }), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const color = useMemo(() => new THREE.Color(intro[0].orb.color), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((s, dt) => {
    sampleOrb(introScroll.progress, state, tmp);
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 4);
    // Keep the orb comfortably on screen whatever the aspect ratio.
    const base = Math.min(viewport.width, viewport.height) * 0.23;
    g.position.x = THREE.MathUtils.lerp(g.position.x, state.x * viewport.width * 0.5, k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, state.y * viewport.height * 0.5, k);
    const sc = THREE.MathUtils.lerp(g.scale.x, base * state.s, k);
    g.scale.setScalar(sc);
    g.rotation.y += dt * 0.15;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.25, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -pointer.current.x * 0.2, 0.05);
    // Gentle breathing
    g.position.y += Math.sin(s.clock.elapsedTime * 0.8) * 0.02;

    color.lerp(state.color, k);
    if (core.current) {
      core.current.color.copy(color);
      core.current.emissive.copy(color);
    }
    if (light.current) light.current.color.copy(color);
  });

  return (
    <group ref={group}>
      {/* Glowing inner core */}
      <mesh>
        <icosahedronGeometry args={[0.78, 48]} />
        <MeshDistortMaterial ref={core} distort={0.42} speed={2.2} roughness={0.22} metalness={0.05} emissiveIntensity={0.55} />
      </mesh>
      {/* Glassy outer shell */}
      <mesh>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color="#dfe6ff"
          distort={0.3}
          speed={1.4}
          roughness={0.05}
          metalness={0.2}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      <pointLight ref={light} intensity={6} distance={6} />
    </group>
  );
}

function Ready({ onReady }: { onReady?: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    n.current += 1;
    if (n.current === 3) onReady?.();
  });
  return null;
}

export default function OrbScene({ onReady }: { onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView && tabVisible ? 'always' : 'never'}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fa4ff" />
        <Orb />
        <Ready onReady={onReady} />
      </Canvas>
    </div>
  );
}
