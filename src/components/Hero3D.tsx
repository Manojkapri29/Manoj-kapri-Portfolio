import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { heroBars } from './heroBars';

const COLS = 16;
const ROWS = 9;
const GAP = 1;
const BAR_ROW = 5; // row (from the back) the bars rise out of
const FIRST_BAR_COL = 3;
const MAX_H = 3;
const RISE = 1.1; // seconds per bar
const STAGGER = 0.09;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const cellX = (c: number) => (c - (COLS - 1) / 2) * GAP;
const cellZ = (r: number) => (r - (ROWS - 1) / 2) * GAP;

function useIsLight() {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'));
  useEffect(() => {
    const mo = new MutationObserver(() => setLight(document.documentElement.classList.contains('light')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return light;
}

/** Flat sheet of cells, drawn as one instanced mesh. */
function CellGrid({ light }: { light: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        m.setPosition(cellX(c), 0, cellZ(r));
        ref.current!.setMatrixAt(i++, m);
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COLS * ROWS]}>
      <boxGeometry args={[GAP * 0.94, 0.03, GAP * 0.94]} />
      <meshStandardMaterial color={light ? '#f3f6f3' : '#1f2e26'} emissive={light ? '#ffffff' : '#000000'} emissiveIntensity={light ? 0.45 : 0} roughness={0.85} transparent opacity={light ? 0.8 : 0.9} />
    </instancedMesh>
  );
}

function Bars({ start }: { start: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  // One geometry per bar, shifted so it scales up from the floor.
  const geos = useMemo(
    () => heroBars.map((v) => new THREE.BoxGeometry(GAP * 0.78, v * MAX_H, GAP * 0.78).translate(0, (v * MAX_H) / 2, 0)),
    [],
  );
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start;
    heroBars.forEach((_, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const rise = easeOutCubic((t - i * STAGGER) / RISE);
      // After rising, bars gently "breathe".
      const breathe = rise >= 1 ? 1 + Math.sin(t * 1.3 + i * 0.7) * 0.022 : 1;
      mesh.scale.y = Math.max(0.001, rise * breathe);
    });
  });
  return (
    <group>
      {geos.map((geo, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          geometry={geo}
          position={[cellX(FIRST_BAR_COL + i), 0, cellZ(BAR_ROW)]}
          scale={[1, 0.001, 1]}
        >
          <meshStandardMaterial color="#138a49" emissive="#0b5a2f" emissiveIntensity={0.45} roughness={0.42} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function TrendLine({ start, light }: { start: number; light: boolean }) {
  const points = useMemo(
    () => heroBars.map((v, i) => new THREE.Vector3(cellX(FIRST_BAR_COL + i), v * MAX_H + 0.28, cellZ(BAR_ROW))),
    [],
  );
  const length = useMemo(() => points.reduce((acc, p, i) => (i ? acc + p.distanceTo(points[i - 1]) : 0), 0), [points]);
  const main = useRef<any>(null);
  const glow = useRef<any>(null);
  const drawStart = RISE + STAGGER * heroBars.length * 0.6;

  useFrame(({ clock }) => {
    const p = easeOutCubic((clock.elapsedTime - start - drawStart) / 1.2);
    const offset = length * (1 - p);
    for (const l of [main.current, glow.current]) {
      if (l?.material) l.material.dashOffset = offset;
    }
  });

  const common = { points, dashed: true, dashSize: length, gapSize: length, dashOffset: length } as const;
  return (
    <group>
      <Line ref={glow} {...common} color={light ? '#0b817c' : '#2cc2bc'} lineWidth={9} transparent opacity={0.18} toneMapped={false} />
      <Line ref={main} {...common} color={light ? '#08706b' : '#40d6cf'} lineWidth={2.6} toneMapped={false} />
    </group>
  );
}

function Scene({ light }: { light: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock }) => {
    if (start === null) setStart(clock.elapsedTime + 0.2);
    const g = group.current;
    if (!g) return;
    // Subtle parallax tilt towards the pointer.
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0.32 + pointer.current.x * 0.12, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.05, 0.05);
  });

  return (
    <group ref={group} rotation={[0, 0.32, 0]}>
      <CellGrid light={light} />
      {start !== null && (
        <>
          <Bars start={start} />
          <TrendLine start={start} light={light} />
        </>
      )}
    </group>
  );
}

export default function Hero3D() {
  const light = useIsLight();
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);

  // Stop rendering when the hero is scrolled off-screen or the tab is hidden.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  const visible = inView && tabVisible;

  return (
    <div ref={wrap} className="h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0.5, 7.2, 14.5], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ camera }) => camera.lookAt(0.2, 1.1, 0)}
      >
        <ambientLight intensity={light ? 1.1 : 0.55} />
        <directionalLight position={[5, 9, 6]} intensity={light ? 1.4 : 1.2} />
        <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#2cc2bc" />
        <Scene light={light} />
      </Canvas>
    </div>
  );
}
