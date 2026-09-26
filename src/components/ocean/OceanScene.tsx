import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { createFish } from './fish';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Scroll-driven ocean: a fish leaps at a lavender sunset, then (as you scroll)
 *  dives in with a splash and the camera follows it below the surface into
 *  light rays, caustics, bubbles and drifting plankton.
 * ──────────────────────────────────────────────────────────────────────────── */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

const SUN = new THREE.Vector3(-0.35, 0.22, -1).normalize();
const ABOVE_FOG = new THREE.Color('#d9d3fa');
const UNDER_FOG = new THREE.Color('#25378a');
const FLOOR_Y = -9;

type World = {
  under: number;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  fish: THREE.Vector3;
  ripple: THREE.Vector3; // x, z, start time
  splash: ((x: number, z: number) => void) | null;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/* ── Sky ─────────────────────────────────────────────────────────────────── */

const SKY_GLSL = /* glsl */ `
vec3 skyCol(vec3 d, vec3 sun) {
  float h = d.y;
  vec3 top = vec3(0.60, 0.58, 0.94);
  vec3 hor = vec3(0.99, 0.84, 0.86);
  vec3 c = mix(hor, top, smoothstep(0.0, 0.5, h));
  c = mix(c, vec3(0.62, 0.62, 0.9), smoothstep(0.0, -0.25, h));
  float s = max(dot(d, sun), 0.0);
  c += vec3(1.0, 0.9, 0.8) * (pow(s, 900.0) * 2.5 + pow(s, 12.0) * 0.28);
  return c;
}`;

function Sky({ world }: { world: World }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSun: { value: SUN } },
        vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uSun; varying vec3 vDir; ${SKY_GLSL}
          void main(){ gl_FragColor = vec4(skyCol(normalize(vDir), uSun), 1.0); }`,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position);
    ref.current.visible = world.under < 0.6;
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  );
}

/* ── Water surface ───────────────────────────────────────────────────────── */

function Water({ world, segs }: { world: World; segs: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uRip: { value: new THREE.Vector3(0, 0, -100) },
          uFogColor: { value: new THREE.Color() },
          uFogNear: { value: 30 },
          uFogFar: { value: 170 },
          uSun: { value: SUN },
        },
        vertexShader: /* glsl */ `
          uniform float uTime; uniform vec3 uRip;
          varying vec3 vPos; varying vec3 vN;
          float H(vec2 p){
            float h = 0.14*sin(p.x*0.55 + uTime*1.05) + 0.10*sin(p.y*0.8 - uTime*1.25)
                    + 0.06*sin((p.x*0.9 + p.y*1.2)*1.4 + uTime*1.8) + 0.03*sin((p.x - p.y)*3.1 + uTime*2.6);
            float t = uTime - uRip.z;
            if (t > 0.0 && t < 5.0) {
              float d = distance(p, uRip.xy);
              h += 0.34*sin(d*5.0 - t*7.0)*exp(-d*0.5)*exp(-t*0.85)*smoothstep(0.0,0.2,t)*(1.0 - smoothstep(t*1.5 - 0.4, t*1.5 + 0.6, d));
            }
            return h;
          }
          void main(){
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vec2 p = wp.xz; float e = 0.08;
            float h = H(p);
            vN = normalize(vec3(-(H(p+vec2(e,0.0)) - H(p-vec2(e,0.0)))/(2.0*e), 1.0, -(H(p+vec2(0.0,e)) - H(p-vec2(0.0,e)))/(2.0*e)));
            wp.y += h; vPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar; uniform vec3 uSun; uniform float uTime;
          varying vec3 vPos; varying vec3 vN;
          ${SKY_GLSL}
          void main(){
            vec3 V = normalize(cameraPosition - vPos);
            vec3 N = normalize(vN);
            vec3 col;
            if (cameraPosition.y >= vPos.y) {
              float fr = 0.03 + 0.97*pow(1.0 - max(dot(N, V), 0.0), 5.0);
              vec3 deep = vec3(0.17, 0.2, 0.52);
              vec3 shallow = vec3(0.36, 0.44, 0.86);
              vec3 base = mix(shallow, deep, clamp(1.0 - V.y*2.0, 0.0, 1.0));
              vec3 R = reflect(-V, N); R.y = abs(R.y);
              col = mix(base, skyCol(R, uSun), fr);
              col += vec3(1.0, 0.95, 0.9) * pow(max(dot(R, uSun), 0.0), 220.0) * 2.0;
            } else {
              float c = max(dot(-N, V), 0.0);
              float win = smoothstep(0.55, 0.9, c);           // Snell's window
              col = mix(pow(uFogColor, vec3(1.0/2.2)) * 1.05, vec3(0.8, 0.84, 1.0), win);
              col += 0.25*vec3(0.8,0.9,1.0)*pow(win, 3.0)*(0.5 + 0.5*sin(vPos.x*3.0 + uTime*2.0)*sin(vPos.z*2.7 - uTime*1.7));
            }
            float f = smoothstep(uFogNear, uFogFar, distance(cameraPosition, vPos));
            gl_FragColor = vec4(mix(col, pow(uFogColor, vec3(1.0/2.2)), f), 1.0);
          }`,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useFrame(({ clock }) => {
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uRip.value.copy(world.ripple);
    u.uFogColor.value.copy(world.fogColor);
    u.uFogNear.value = world.fogNear;
    u.uFogFar.value = world.fogFar;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} material={mat} frustumCulled={false}>
      <planeGeometry args={[260, 260, segs, segs]} />
    </mesh>
  );
}

/* ── Seabed with animated caustics ───────────────────────────────────────── */

function Seabed({ world }: { world: World }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uFogColor: { value: new THREE.Color() }, uFogNear: { value: 1 }, uFogFar: { value: 30 } },
        vertexShader: /* glsl */ `varying vec3 vPos; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vPos = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar; varying vec3 vPos;
          float caustic(vec2 p, float time){
            vec2 i = p; float c = 1.0; float inten = 0.005;
            for (int n = 0; n < 5; n++) {
              float t = time * (1.0 - (3.5 / float(n + 1)));
              i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
              c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
            }
            c /= 5.0; c = 1.17 - pow(c, 1.4);
            return clamp(pow(abs(c), 8.0), 0.0, 1.0);
          }
          void main(){
            vec2 p = mod(vPos.xz * 0.55, 6.28318) - 250.0;
            float ca = caustic(p, uTime * 0.55);
            float grain = fract(sin(dot(floor(vPos.xz*18.0), vec2(12.9898,78.233))) * 43758.5453);
            vec3 sand = mix(vec3(0.55, 0.52, 0.62), vec3(0.62, 0.6, 0.7), grain*0.4);
            vec3 col = sand * (0.42 + 1.25 * ca) * vec3(0.72, 0.8, 1.05);
            float f = smoothstep(uFogNear, uFogFar, distance(cameraPosition, vPos));
            gl_FragColor = vec4(mix(col, pow(uFogColor, vec3(1.0/2.2)), f), 1.0);
          }`,
      }),
    [],
  );
  useFrame(({ clock }) => {
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uFogColor.value.copy(world.fogColor);
    u.uFogNear.value = world.fogNear;
    u.uFogFar.value = world.fogFar;
  });
  return (
    <mesh position-y={FLOOR_Y} rotation-x={-Math.PI / 2} material={mat}>
      <planeGeometry args={[260, 260, 1, 1]} />
    </mesh>
  );
}

/* ── God rays ────────────────────────────────────────────────────────────── */

function GodRays({ world }: { world: World }) {
  const rays = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 8 }, (_, i) => ({
      x: -7 + i * 2.1 + r() * 1.2,
      z: -4 + r() * 5,
      w: 0.8 + r() * 1.6,
      tilt: (r() - 0.5) * 0.35,
      mat: new THREE.ShaderMaterial({
        uniforms: { uVis: { value: 0 }, uTime: { value: 0 }, uSeed: { value: r() * 10 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `uniform float uVis; uniform float uTime; uniform float uSeed; varying vec2 vUv;
          void main(){
            float edge = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
            float a = pow(vUv.y, 1.6) * edge * (0.55 + 0.45*sin(uTime*0.6 + uSeed)) * 0.22 * uVis;
            gl_FragColor = vec4(vec3(0.78, 0.86, 1.0) * a, a);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    }));
  }, []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock, camera }) => {
    rays.forEach((ray, i) => {
      const m = refs.current[i];
      if (!m) return;
      ray.mat.uniforms.uTime.value = clock.elapsedTime;
      ray.mat.uniforms.uVis.value = world.under;
      m.rotation.set(0, Math.atan2(camera.position.x - ray.x, camera.position.z - ray.z), ray.tilt + Math.sin(clock.elapsedTime * 0.2 + i) * 0.04);
    });
  });
  return (
    <group>
      {rays.map((ray, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[ray.x, -8, ray.z]} material={ray.mat}>
          <planeGeometry args={[ray.w, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Seaweed + rocks ─────────────────────────────────────────────────────── */

function Seaweed({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const { geo, mat } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.16, 2.5, 1, 12).translate(0, 1.25, 0);
    const mat = new THREE.MeshStandardMaterial({ color: '#2f6f73', roughness: 0.7, side: THREE.DoubleSide });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 ip = vec3(0.0);
        #ifdef USE_INSTANCING
          ip = instanceMatrix[3].xyz;
        #endif
        float k = pow(clamp(position.y / 2.5, 0.0, 1.0), 1.4);
        transformed.x += sin(uTime*1.2 + ip.x*0.7 + ip.z*0.5 + position.y*0.9) * 0.35 * k;
        transformed.z += cos(uTime*0.9 + ip.x*0.3 + position.y*0.7) * 0.18 * k;`,
      );
    };
    return { geo, mat };
  }, [uTime]);
  useLayoutEffect(() => {
    const r = rng(9);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const cluster = Math.floor(r() * 5);
      const cx = [-6, -2.5, 3.5, 6.5, 0.5][cluster];
      const cz = [-3, -6, -4.5, -1, -8][cluster];
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * Math.PI);
      m.compose(new THREE.Vector3(cx + (r() - 0.5) * 2.2, FLOOR_Y, cz + (r() - 0.5) * 2), q, new THREE.Vector3(1, 0.6 + r() * 1.3, 1));
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  useFrame(({ clock }) => { uTime.value = clock.elapsedTime; });
  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

function Rocks() {
  const rocks = useMemo(() => {
    const r = rng(17);
    return Array.from({ length: 12 }, () => {
      const g = new THREE.IcosahedronGeometry(1, 2);
      const pos = g.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        v.multiplyScalar(0.8 + Math.sin(v.x * 3.1 + v.y * 2.3) * 0.12 + Math.cos(v.z * 4.2) * 0.08);
        pos.setXYZ(i, v.x, v.y * 0.6, v.z);
      }
      g.computeVertexNormals();
      return { g, x: (r() - 0.5) * 18, z: -2 - r() * 9, s: 0.3 + r() * 0.9, ry: r() * 6 };
    });
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4b5588', roughness: 0.95 }), []);
  return (
    <group>
      {rocks.map((rk, i) => (
        <mesh key={i} geometry={rk.g} material={mat} position={[rk.x, FLOOR_Y + rk.s * 0.25, rk.z]} scale={rk.s} rotation-y={rk.ry} />
      ))}
    </group>
  );
}

/* ── Bubbles + plankton ──────────────────────────────────────────────────── */

function Bubbles({ world, count }: { world: World; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: count }, (_, i) => ({
      trail: i < count * 0.4, // follows the fish
      x: (r() - 0.5) * 16,
      y: FLOOR_Y + r() * 9,
      z: -6 + r() * 8,
      s: 0.03 + r() * 0.07,
      v: 0.5 + r() * 1.2,
      ph: r() * 6,
    }));
  }, [count]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e9eeff', roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.5, envMapIntensity: 2 }),
    [],
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    data.forEach((b, i) => {
      b.y += b.v * Math.min(dt, 0.05);
      if (b.y > -0.05) {
        if (b.trail && world.fish.y < -0.3) {
          b.x = world.fish.x + (Math.random() - 0.5) * 0.4;
          b.z = world.fish.z + (Math.random() - 0.5) * 0.4;
          b.y = world.fish.y;
        } else {
          b.y = FLOOR_Y + Math.random() * 2;
        }
      }
      const s = b.s * (b.y < -0.1 ? 1 : 0);
      m.makeScale(s, s, s).setPosition(b.x + Math.sin(t * 2 + b.ph) * 0.05, b.y, b.z);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, mat, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 8]} />
    </instancedMesh>
  );
}

function Plankton({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const r = rng(31);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 30;
      pos[i * 3 + 1] = FLOOR_Y + r() * 8.7;
      pos[i * 3 + 2] = -12 + r() * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 32);
    const mat = new THREE.PointsMaterial({ size: 0.07, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.7, depthWrite: false, color: '#dfe7ff' });
    return { geo, mat };
  }, [count]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.6;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.11) * 0.25;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

/* ── Splash droplets ─────────────────────────────────────────────────────── */

function Splash({ world }: { world: World }) {
  const COUNT = 70;
  const ref = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(() => Array.from({ length: COUNT }, () => ({ p: new THREE.Vector3(0, -99, 0), v: new THREE.Vector3(), life: 0 })), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f4f6ff', roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.85 }), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useEffect(() => {
    world.splash = (x, z) => {
      drops.forEach((d) => {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.6 + Math.random() * 1.8;
        d.p.set(x + Math.cos(a) * 0.15, 0.05, z + Math.sin(a) * 0.15);
        d.v.set(Math.cos(a) * sp, 2 + Math.random() * 3.2, Math.sin(a) * sp);
        d.life = 1;
      });
    };
    return () => { world.splash = null; };
  }, [world, drops]);
  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    drops.forEach((d, i) => {
      if (d.life > 0) {
        d.v.y -= 9.8 * step;
        d.p.addScaledVector(d.v, step);
        if (d.p.y < -0.05) d.life = 0;
      }
      const s = d.life > 0 ? 0.014 + (i % 3) * 0.006 : 0;
      m.makeScale(s, s * 1.4, s).setPosition(d.p.x, d.p.y, d.p.z);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, mat, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
    </instancedMesh>
  );
}

/* ── The fish ────────────────────────────────────────────────────────────── */

function Fish({ world, progress }: { world: World; progress: MotionValue<number> }) {
  const fish = useMemo(() => createFish(), []);
  useEffect(() => () => fish.dispose(), [fish]);
  const st = useMemo(() => ({ prev: new THREE.Vector3(-2.4, -1, -1.2), dir: new THREE.Vector3(1, 0, 0), lastSplash: -9, tmp: new THREE.Vector3() }), []);

  const sample = (t: number, p: number, out: THREE.Vector3) => {
    // 1) Idle: leaping in and out of the water, again and again.
    const ph = (t % 4.4) / 4.4;
    const idle = new THREE.Vector3(-3 + ph * 5, -0.9 + 2.5 * Math.sin(Math.PI * ph), -1.2);
    // 2) Scroll: one long dive from above the water down into the deep.
    const s = clamp(p / 0.34);
    const dive = new THREE.Vector3(-0.8 + 3.2 * s, 1.9 - 3.4 * s * s + Math.sin(t * 2) * 0.05 * (1 - s), -1.0);
    // 3) Underwater: slow, lazy loops on the right-hand side of the screen.
    const a = t * 0.32;
    const loop = new THREE.Vector3(4.2 + 2.0 * Math.cos(a), -4.2 + 0.45 * Math.sin(2 * a), -0.8 + 1.5 * Math.sin(a));
    if (p <= 0.34) return out.lerpVectors(idle, dive, smooth(0, 0.07, p));
    return out.lerpVectors(dive.set(2.4, -1.5, -1.0), loop, smooth(0.34, 0.62, p));
  };

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const p = progress.get();
    const pos = sample(t, p, st.tmp);
    const ahead = sample(t + 0.05, Math.min(1, p + 0.01), new THREE.Vector3());

    // Splash + ripple when crossing the surface.
    if ((st.prev.y > 0) !== (pos.y > 0) && t - st.lastSplash > 0.4) {
      st.lastSplash = t;
      world.ripple.set(pos.x, pos.z, t);
      world.splash?.(pos.x, pos.z);
    }

    const speed = pos.distanceTo(st.prev) / Math.max(dt, 1e-3);
    const want = ahead.sub(pos);
    if (want.lengthSq() > 1e-8) st.dir.lerp(want.normalize(), 0.15).normalize();
    st.prev.copy(pos);
    world.fish.copy(pos);

    fish.group.position.copy(pos);
    fish.group.lookAt(pos.clone().add(st.dir));
    fish.uniforms.uSwim.value += Math.min(dt, 0.05) * (7 + Math.min(speed, 6) * 1.5);
    fish.uniforms.uAmp.value = 0.1 + Math.min(speed, 6) * 0.012;
  });

  return <primitive object={fish.group} />;
}

/* ── Camera + fog ────────────────────────────────────────────────────────── */

function CameraRig({ world, progress }: { world: World; progress: MotionValue<number> }) {
  const { camera, scene } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  const first = useRef(true);
  const v = useMemo(() => ({ pos: new THREE.Vector3(), lk: new THREE.Vector3() }), []);

  useEffect(() => {
    scene.fog = new THREE.Fog(ABOVE_FOG.clone(), 30, 170);
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); scene.fog = null; };
  }, [scene]);

  useFrame((_, dt) => {
    const p = progress.get();
    const a = smooth(0, 0.3, p);
    const b = smooth(0.3, 0.55, p);
    v.pos.set(0, 1.6, 10).lerp(new THREE.Vector3(1.0, 0.8, 7), a).lerp(new THREE.Vector3(0.6, -3.6, 8.2), b);
    v.lk.set(0, 0.7, 0).lerp(new THREE.Vector3(1.2, -0.3, -1), a).lerp(new THREE.Vector3(1.4, -4.2, -0.8), b);
    v.lk.lerp(world.fish, 0.12 + 0.13 * (1 - b));
    v.pos.x += pointer.current.x * 0.35;
    v.pos.y += -pointer.current.y * 0.2;

    const k = first.current ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 4);
    first.current = false;
    camera.position.lerp(v.pos, k);
    look.current.lerp(v.lk, k);
    camera.lookAt(look.current);

    // Above → below the surface.
    const under = smooth(0.25, -0.5, camera.position.y);
    world.under = under;
    world.fogColor.lerpColors(ABOVE_FOG, UNDER_FOG, under);
    world.fogNear = THREE.MathUtils.lerp(30, 0.5, under);
    world.fogFar = THREE.MathUtils.lerp(170, 24, under);
    const fog = scene.fog as THREE.Fog;
    fog.color.copy(world.fogColor);
    fog.near = world.fogNear;
    fog.far = world.fogFar;
    scene.background = under > 0.5 ? world.fogColor : null;
  });
  return null;
}

/** Cheap sky-coloured environment for reflections (no PMREM pass). */
function Environment() {
  const { scene } = useThree();
  useEffect(() => {
    const face = (top: string, bottom: string) => {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      const g = c.getContext('2d')!;
      const grd = g.createLinearGradient(0, 0, 0, 16);
      grd.addColorStop(0, top);
      grd.addColorStop(1, bottom);
      g.fillStyle = grd;
      g.fillRect(0, 0, 16, 16);
      return c;
    };
    const side = face('#b7b3f5', '#5a63c8');
    const env = new THREE.CubeTexture([side, side, face('#ffe9f0', '#ffe9f0'), face('#2a3a8c', '#2a3a8c'), side, side]);
    env.colorSpace = THREE.SRGBColorSpace;
    env.needsUpdate = true;
    scene.environment = env;
    return () => { env.dispose(); scene.environment = null; };
  }, [scene]);
  return null;
}

/** Compile every shader off the main thread (where supported) before the first frame. */
function Warmup({ onDone }: { onDone: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      gl.compileAsync(scene, camera)
        .catch(() => {})
        .finally(() => { if (alive) onDone(); });
    }, 0);
    return () => { alive = false; window.clearTimeout(t); };
  }, [gl, scene, camera, onDone]);
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  const n = useRef(0);
  useFrame(() => { if (++n.current === 3) onReady?.(); });
  return null;
}

export default function OceanScene({ progress, mobile, onReady }: { progress: MotionValue<number>; mobile: boolean; onReady?: () => void }) {
  const world = useMemo<World>(
    () => ({ under: 0, fogColor: ABOVE_FOG.clone(), fogNear: 30, fogFar: 170, fish: new THREE.Vector3(), ripple: new THREE.Vector3(0, 0, -100), splash: null }),
    [],
  );
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useMemo(() => () => setCompiled(true), []);
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
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        frameloop={compiled && inView && tabVisible ? 'always' : 'never'}
        camera={{ position: [0, 1.6, 10], fov: mobile ? 55 : 42, near: 0.1, far: 1200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Environment />
        <hemisphereLight args={['#dfe0ff', '#2b2f70', 0.9]} />
        <directionalLight position={[-4, 10, -6]} intensity={2.2} color="#fff1ea" />
        <directionalLight position={[5, 3, 8]} intensity={0.8} color="#b9c4ff" />
        <CameraRig world={world} progress={progress} />
        <Sky world={world} />
        <Water world={world} segs={mobile ? 120 : 200} />
        <Seabed world={world} />
        <Rocks />
        <Seaweed count={mobile ? 40 : 80} />
        <GodRays world={world} />
        <Plankton count={mobile ? 350 : 800} />
        <Bubbles world={world} count={mobile ? 50 : 100} />
        <Splash world={world} />
        <Fish world={world} progress={progress} />
        <Warmup onDone={onCompiled} />
        <Ready onReady={onReady} />
      </Canvas>
    </div>
  );
}
