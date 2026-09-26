import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { cityLandmarks, sections, type SectionId } from '../data/content';

/* ─────────────────────────────────────────────────────────────────────────────
 *  3D Data City — full-page background. Buildings are bar-chart skyscrapers on
 *  a spreadsheet grid; scrolling flies the camera between section districts.
 * ──────────────────────────────────────────────────────────────────────────── */

const SIZE = 56; // city is SIZE × SIZE cells
const ROAD_EVERY = 6; // a road every N cells (matches the grid's section lines)
const HALF = SIZE / 2;

// Deterministic pseudo-random so the skyline is identical on every visit.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const isRoad = (i: number) => ((i % ROAD_EVERY) + ROAD_EVERY) % ROAD_EVERY === 0;

/** Landmark plaza centres, one per section. */
const districtCenter: Record<SectionId, THREE.Vector3> = {
  about: new THREE.Vector3(0, 0, 0),
  skills: new THREE.Vector3(-15, 0, -9),
  experience: new THREE.Vector3(9, 0, -15),
  projects: new THREE.Vector3(15, 0, 9),
  education: new THREE.Vector3(-9, 0, 15),
  contact: new THREE.Vector3(0, 0, 0),
};

/** Camera keyframes per section: position + look-at target. */
const rel = (id: SectionId, off: [number, number, number], lookY: number) => ({
  pos: districtCenter[id].clone().add(new THREE.Vector3(...off)),
  look: districtCenter[id].clone().add(new THREE.Vector3(0, lookY, 0)),
});
const keyframes: Record<SectionId, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  about: { pos: new THREE.Vector3(30, 24, 38), look: new THREE.Vector3(0, 2, 0) },
  skills: rel('skills', [15, 15, 21], 5),
  experience: rel('experience', [18, 17, 20], 6),
  projects: rel('projects', [-7, 13, 21], 5.5),
  education: rel('education', [16, 12, 18], 3.5),
  contact: { pos: new THREE.Vector3(0.01, 62, 18), look: new THREE.Vector3(0, 0, 0) },
};

function useIsLight() {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'));
  useEffect(() => {
    const mo = new MutationObserver(() => setLight(document.documentElement.classList.contains('light')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return light;
}

type Palette = ReturnType<typeof palette>;
const palette = (light: boolean) =>
  light
    ? {
        bg: '#f4f6f3',
        building: ['#dfe6e0', '#d5ddd7', '#e8ede9', '#cfd9d2'],
        roof: ['#107c41', '#0b817c'],
        cell: '#d2dad4',
        section: '#aebcb2',
        traffic: ['#107c41', '#0b817c'],
        tower: '#138a49',
        towerEmissive: '#0b5a2f',
        line: '#08706b',
      }
    : {
        bg: '#0b0f0d',
        building: ['#20342a', '#27402f', '#1c2e24', '#2e4a39'],
        roof: ['#2fd07a', '#2cc2bc'],
        cell: '#15201a',
        section: '#1f3a2b',
        traffic: ['#4cc47f', '#40d6cf'],
        tower: '#138a49',
        towerEmissive: '#0e6b38',
        line: '#40d6cf',
      };

/* ── Generic skyline ─────────────────────────────────────────────────────── */

type Bldg = { x: number; z: number; w: number; d: number; h: number; tint: number; roof: boolean };

function useSkyline() {
  return useMemo(() => {
    const r = rng(20260926);
    const keep = Object.values(districtCenter).filter((v, i, a) => a.indexOf(v) === i && v.length() > 0);
    const out: Bldg[] = [];
    for (let gx = -HALF; gx < HALF; gx++) {
      for (let gz = -HALF; gz < HALF; gz++) {
        if (isRoad(gx) || isRoad(gz)) continue;
        const x = gx + 0.5;
        const z = gz + 0.5;
        // Leave open plazas around landmark districts
        if (keep.some((c) => Math.abs(c.x - x) < 6.2 && Math.abs(c.z - z) < 3.6)) continue;
        if (r() < 0.22) continue; // some empty lots
        const dist = Math.hypot(x, z) / HALF;
        const tallness = Math.pow(1 - Math.min(dist, 1), 1.6);
        const h = 0.4 + r() * 1.6 + tallness * r() * 9;
        out.push({ x, z, w: 0.62 + r() * 0.26, d: 0.62 + r() * 0.26, h, tint: Math.floor(r() * 4), roof: r() < 0.16 });
      }
    }
    return out;
  }, []);
}

/** Box geometry with a vertical gradient baked into vertex colours (dark base → lit top). */
function useGradientBox() {
  return useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const pos = g.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const k = 0.5 + pos.getY(i) * 0.8;
      colors.set([k, k, k], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
}

function Skyline({ pal }: { pal: Palette }) {
  const buildings = useSkyline();
  const geo = useGradientBox();
  const bodies = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  const roofList = useMemo(() => buildings.filter((b) => b.roof), [buildings]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    buildings.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d).setPosition(b.x, 0, b.z);
      bodies.current!.setMatrixAt(i, m);
      bodies.current!.setColorAt(i, c.set(pal.building[b.tint]));
    });
    bodies.current!.instanceMatrix.needsUpdate = true;
    if (bodies.current!.instanceColor) bodies.current!.instanceColor.needsUpdate = true;

    roofList.forEach((b, i) => {
      m.makeScale(b.w * 1.02, 0.08, b.d * 1.02).setPosition(b.x, b.h, b.z);
      roofs.current!.setMatrixAt(i, m);
      roofs.current!.setColorAt(i, c.set(pal.roof[i % 2]));
    });
    roofs.current!.instanceMatrix.needsUpdate = true;
    if (roofs.current!.instanceColor) roofs.current!.instanceColor.needsUpdate = true;
  }, [buildings, roofList, pal]);

  return (
    <group>
      <instancedMesh ref={bodies} args={[geo, undefined, buildings.length]} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, roofList.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ── Data traffic: glowing packets moving along the roads ────────────────── */

function Traffic({ pal }: { pal: Palette }) {
  const COUNT = 320;
  const ref = useRef<THREE.InstancedMesh>(null);
  const cars = useMemo(() => {
    const r = rng(7);
    const roads: number[] = [];
    for (let i = -HALF; i <= HALF; i++) if (isRoad(i)) roads.push(i);
    return Array.from({ length: COUNT }, (_, i) => ({
      alongX: r() < 0.5,
      lane: roads[Math.floor(r() * roads.length)] + (r() < 0.5 ? -0.18 : 0.18),
      t: r() * SIZE - HALF,
      speed: (1.2 + r() * 2.6) * (r() < 0.5 ? 1 : -1),
      color: i % 3 === 0 ? 1 : 0,
    }));
  }, []);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    cars.forEach((car, i) => ref.current!.setColorAt(i, c.set(pal.traffic[car.color])));
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [cars, pal]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    cars.forEach((car, i) => {
      car.t += car.speed * step;
      if (car.t > HALF) car.t = -HALF;
      if (car.t < -HALF) car.t = HALF;
      if (car.alongX) m.makeScale(0.42, 0.06, 0.08).setPosition(car.t, 0.06, car.lane);
      else m.makeScale(0.08, 0.06, 0.42).setPosition(car.lane, 0.06, car.t);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Landmarks: one district per section ─────────────────────────────────── */

function Tower({ x, z, h, label, sub, pal, active, delay }: {
  x: number; z: number; h: number; label: string; sub?: string; pal: Palette; active: boolean; delay: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const grow = useRef(0);
  const geo = useMemo(() => new THREE.BoxGeometry(1.15, 1, 1.15).translate(0, 0.5, 0), []);

  useFrame((state, dt) => {
    // Towers rise when their section becomes active, then stay up.
    if (active || grow.current > 0) grow.current = Math.min(1, grow.current + dt / (0.9 + delay * 0.4) * (active ? 1 : 0.5));
    const e = 1 - Math.pow(1 - grow.current, 3);
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.4 + x) * 0.015;
    if (mesh.current) mesh.current.scale.y = Math.max(0.02, h * e * breathe);
    if (mat.current) mat.current.emissiveIntensity = THREE.MathUtils.lerp(mat.current.emissiveIntensity, active ? 0.9 : 0.3, 0.06);
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={mesh} geometry={geo} scale={[1, 0.02, 1]}>
        <meshStandardMaterial ref={mat} color={pal.tower} emissive={pal.towerEmissive} emissiveIntensity={0.3} roughness={0.35} metalness={0.1} />
      </mesh>
      {active && (
        <Html position={[0, h + 0.9, 0]} center distanceFactor={16} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded border border-accent/60 bg-bg/85 px-2 py-1 font-mono text-[11px] leading-tight text-ink shadow-lg">
            <div className="font-semibold text-accent-ink">{label}</div>
            {sub && <div className="text-muted">{sub}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

function District({ id, pal, active }: { id: Exclude<SectionId, 'about' | 'contact'>; pal: Palette; active: boolean }) {
  const c = districtCenter[id];
  const items = cityLandmarks[id];
  const spacing = 2.7;
  const start = -((items.length - 1) * spacing) / 2;
  const towers = items.map((it, i) => ({ ...it, x: c.x + start + i * spacing, z: c.z }));

  // Projects district gets a glowing forecast line floating over its towers.
  const forecast = useMemo(() => {
    if (id !== 'projects') return null;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = c.x - 3.2 + t * 6.4;
      const y = 6.5 + t * 3.2 + Math.sin(t * 9) * 0.45;
      pts.push(new THREE.Vector3(x, y, c.z + 1.4));
    }
    return pts;
  }, [id, c]);

  return (
    <group>
      {/* Plaza highlight: a selected cell range on the ground */}
      <mesh position={[c.x, 0.015, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[items.length * spacing + 1.6, 4.2]} />
        <meshBasicMaterial color={pal.roof[0]} transparent opacity={active ? 0.16 : 0.06} toneMapped={false} />
      </mesh>
      {towers.map((t, i) => (
        <Tower key={t.label} x={t.x} z={t.z} h={t.height} label={t.label} sub={t.sub} pal={pal} active={active} delay={i} />
      ))}
      {forecast && active && <Line points={forecast} color={pal.line} lineWidth={3} toneMapped={false} />}
    </group>
  );
}

/* ── Scroll-driven camera ────────────────────────────────────────────────── */

const smooth = (t: number) => t * t * (3 - 2 * t);

function CameraRig({ onActive }: { onActive: (id: SectionId) => void }) {
  const { camera, size } = useThree();
  const target = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);
  const look = useRef(new THREE.Vector3().copy(keyframes.about.look));
  const pointer = useRef({ x: 0, y: 0 });
  const lastActive = useRef<SectionId>('about');
  const first = useRef(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Shift the projection centre right so the city sits beside the text panels.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, -size.width * 0.23, 0, size.width, size.height);
    cam.updateProjectionMatrix();
    return () => { cam.clearViewOffset(); cam.updateProjectionMatrix(); };
  }, [camera, size]);

  useFrame((_, dt) => {
    const vh = window.innerHeight;
    const line = window.scrollY + vh * 0.35; // "reading line" in the viewport
    const tops = sections.map((s) => {
      const el = document.getElementById(s.id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    let i = 0;
    while (i < tops.length - 1 && line >= tops[i + 1]) i++;
    const a = sections[i].id;
    const b = sections[Math.min(i + 1, sections.length - 1)].id;
    // Camera holds on district i, then flies to i+1 over the last 70% of a screen before it.
    const zone = vh * 0.7;
    const t = i < tops.length - 1 ? smooth(Math.min(1, Math.max(0, (line - (tops[i + 1] - zone)) / zone))) : 0;

    target.pos.lerpVectors(keyframes[a].pos, keyframes[b].pos, t);
    target.look.lerpVectors(keyframes[a].look, keyframes[b].look, t);
    // Gentle parallax from the pointer
    target.pos.x += pointer.current.x * 0.8;
    target.pos.y += -pointer.current.y * 0.5;

    const k = first.current ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 3.2);
    first.current = false;
    camera.position.lerp(target.pos, k);
    look.current.lerp(target.look, k);
    camera.lookAt(look.current);

    const act = t > 0.55 ? b : a;
    if (act !== lastActive.current) {
      lastActive.current = act;
      onActive(act);
    }
  });

  return null;
}

/** Signals readiness after the first frames have actually rendered. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current += 1;
    if (!done.current && frames.current > 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function DataCity({ onReady }: { onReady: () => void }) {
  const light = useIsLight();
  const pal = useMemo(() => palette(light), [light]);
  const [active, setActive] = useState<SectionId>('about');
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={tabVisible ? 'always' : 'never'}
        camera={{ position: keyframes.about.pos.toArray(), fov: 42, near: 0.5, far: 220 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[pal.bg]} />
        <fog attach="fog" args={[pal.bg, 28, light ? 95 : 88]} />
        <ambientLight intensity={light ? 1.05 : 0.5} />
        <hemisphereLight args={[light ? '#ffffff' : '#9fd9c0', light ? '#c9d3cc' : '#07110c', light ? 0.6 : 0.45]} />
        <directionalLight position={[18, 30, 12]} intensity={light ? 1.2 : 0.9} />

        <Grid
          position={[0, 0.001, 0]}
          args={[SIZE, SIZE]}
          cellSize={1}
          cellThickness={0.6}
          cellColor={pal.cell}
          sectionSize={ROAD_EVERY}
          sectionThickness={1.1}
          sectionColor={pal.section}
          fadeDistance={90}
          fadeStrength={1.5}
          infiniteGrid
        />
        <Skyline pal={pal} />
        <Traffic pal={pal} />
        {(['skills', 'experience', 'projects', 'education'] as const).map((id) => (
          <District key={id} id={id} pal={pal} active={active === id} />
        ))}
        <CameraRig onActive={setActive} />
        <ReadySignal onReady={onReady} />
      </Canvas>
    </div>
  );
}
