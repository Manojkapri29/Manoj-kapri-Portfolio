import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, SpotLight } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createBall, createBat } from './models';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Hero film: a cricket bat floating in a spotlight on a dark stage.
 *  Deterministic — every frame is a pure function of window.__t (0..1), so the
 *  render script can step through it and capture each frame.
 *
 *   0.00–0.40  bat turns slowly in the light, ball orbits it
 *   0.40–0.66  camera glides in to the blade (grain, sticker, grip)
 *   0.66–1.00  pull back — bat swings, meets the ball at the sweet spot,
 *              the ball flies off; bat settles on a diagonal for the CTA
 * ──────────────────────────────────────────────────────────────────────────── */

declare global {
  interface Window { __t: number }
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;
const IMPACT = 0.82;

function Dust({ portrait }: { portrait: boolean }) {
  const X_FOR_DUST = (portrait ? 0 : 1.15) - 0.4;
  const { geo, mat } = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const N = 650;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2;
      const rad = Math.sqrt(r()) * 2.4;
      pos.set([Math.cos(a) * rad, -2.4 + r() * 6.5, Math.sin(a) * rad], i * 3);
      seed[i] = r();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uBurst: { value: 0 }, uImpact: { value: new THREE.Vector3() } },
      vertexShader: /* glsl */ `
        attribute float seed; uniform float uT; uniform float uBurst; uniform vec3 uImpact; varying float vA;
        void main(){
          vec3 p = position;
          p.y += mod(uT * (0.6 + seed) + seed * 7.0, 1.0) * 0.8;
          p.x += sin(uT * 6.0 + seed * 40.0) * 0.08;
          vec3 d = normalize(p - uImpact + 0.001);
          float near = exp(-distance(p, uImpact) * 1.2);
          p += d * uBurst * near * (0.6 + seed) * 1.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.5 + seed * 3.5) * (6.0 / -mv.z);
          float cone = 1.0 - smoothstep(0.6, 2.4, length(p.xz));
          vA = cone * (0.25 + 0.75 * seed) + near * uBurst * 2.0;
        }`,
      fragmentShader: /* glsl */ `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), smoothstep(0.5, 0.0, d) * vA * 0.28); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, mat };
  }, []);
  useFrame(() => {
    const t = window.__t;
    mat.uniforms.uT.value = t;
    mat.uniforms.uBurst.value = clamp((t - IMPACT) / 0.12) * (1 - clamp((t - IMPACT - 0.06) / 0.15));
    mat.uniforms.uImpact.value.set(X_FOR_DUST, 0.03, 0.26);
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

function Scene({ portrait }: { portrait: boolean }) {
  const bat = useMemo(() => createBat(), []);
  const ball = useMemo(() => createBall(), []);
  const flash = useRef<THREE.PointLight>(null);
  const trail = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);

  // Framing: bat sits right of centre on desktop (text on the left), centred-low on phones.
  const X = portrait ? 0 : 1.15;

  useFrame(() => {
    const t = window.__t;

    // Bat pose
    const turn = lerp(-0.6, 0.35, seg(t, 0, 0.62));
    const swing = seg(t, 0.7, IMPACT) - 0.35 * seg(t, IMPACT, 0.96);
    bat.position.set(X, 0.25 + Math.sin(t * 9) * 0.04 * (1 - swing), 0);
    bat.rotation.set(0.12 * swing, lerp(turn, 0.12, seg(t, 0.62, 0.72)), -swing * 1.05);

    // Ball: orbit → line up in front of the face → struck at the sweet spot → gone
    const orbitA = t * 7.5 + 0.6;
    const orbit = new THREE.Vector3(X + Math.cos(orbitA) * 1.05, 0.2 + Math.sin(t * 5) * 0.25, Math.sin(orbitA) * 1.05);
    const hit = new THREE.Vector3(X - 0.4, 0.03, 0.26);
    const lineUp = new THREE.Vector3(X - 2.0, -0.35, 2.8);
    const away = new THREE.Vector3(X + 3.5, 3.2, -9);
    const p = new THREE.Vector3();
    if (t < 0.66) p.copy(orbit);
    else if (t < 0.72) p.lerpVectors(orbit, lineUp, seg(t, 0.66, 0.72));
    else if (t < IMPACT) p.lerpVectors(lineUp, hit, clamp((t - 0.72) / (IMPACT - 0.72)));
    else p.lerpVectors(hit, away, clamp((t - IMPACT) / 0.1));
    ball.position.copy(p);
    ball.rotation.set(t * 22, t * 14, 0.4);
    ball.visible = t < IMPACT + 0.1;
    if (trail.current) {
      const on = t > IMPACT && t < IMPACT + 0.1;
      trail.current.visible = on;
      if (on) {
        trail.current.position.copy(p).lerp(hit, 0.5);
        trail.current.lookAt(hit);
        trail.current.scale.set(1, 1, p.distanceTo(hit));
      }
    }
    if (flash.current) flash.current.intensity = 9 * Math.exp(-Math.pow((t - IMPACT) / 0.01, 2));

    // Camera: wide → close-up on the blade → pull back for the strike
    const wide = portrait ? new THREE.Vector3(0.0, 1.0, 13.5) : new THREE.Vector3(0.2, 1.0, 9.2);
    const close = portrait ? new THREE.Vector3(0.9, 0.5, 4.2) : new THREE.Vector3(X + 0.35, 0.45, 3.4);
    const strike = portrait ? new THREE.Vector3(-0.6, 0.9, 11) : new THREE.Vector3(0.2, 0.9, 8.8);
    const pos = new THREE.Vector3()
      .copy(wide)
      .lerp(close, seg(t, 0.38, 0.62))
      .lerp(strike, seg(t, 0.64, 0.8));
    pos.x += Math.sin(t * 3) * 0.12;
    camera.position.copy(pos);
    const lWide = portrait ? new THREE.Vector3(0, -0.35, 0) : new THREE.Vector3(0.35, 0.15, 0);
    const lClose = portrait ? new THREE.Vector3(X, 0.35, 0) : new THREE.Vector3(X - 0.95, 0.35, 0);
    look.copy(lWide).lerp(lClose, seg(t, 0.38, 0.62)).lerp(portrait ? new THREE.Vector3(0, -0.25, 0) : new THREE.Vector3(0.1, 0.1, 0), seg(t, 0.64, 0.8));
    camera.lookAt(look);
  });

  return (
    <>
      <primitive object={bat} />
      <primitive object={ball} />
      <mesh ref={trail} visible={false}>
        <cylinderGeometry args={[0.02, 0.09, 1, 16, 1, true]} />
        <meshBasicMaterial color="#b8c6ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight ref={flash} position={[X - 0.4, 0.05, 0.7]} color="#cfd8ff" intensity={0} distance={6} />

      {/* key: volumetric spotlight from straight above */}
      <SpotLight
        position={[X, 6.5, 0.6]}
        target-position={[X, -1.5, 0]}
        angle={0.36}
        penumbra={0.65}
        intensity={140}
        distance={14}
        attenuation={9}
        anglePower={5}
        radiusTop={0.25}
        radiusBottom={2.6}
        opacity={0.1}
        color="#eef2ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      {/* warm soft key from the front-top so the willow face reads */}
      <spotLight position={[X - 1.5, 3.5, 7]} target-position={[X, 0, 0]} angle={0.35} penumbra={1} intensity={70} color="#ffe9cf" />
      {/* cool rim lights */}
      <spotLight position={[X - 4, 2.5, -3]} angle={0.5} penumbra={1} intensity={60} color="#5b78ff" />
      <spotLight position={[X + 4, 1.5, -2.5]} angle={0.5} penumbra={1} intensity={45} color="#8a6bff" />
      <ambientLight intensity={0.04} />

      {/* reflective stage */}
      <mesh rotation-x={-Math.PI / 2} position-y={-1.75} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <MeshReflectorMaterial
          blur={[500, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={14}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#07080d"
          metalness={0.6}
          mirror={0.6}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[X, -1.74, 0.3]}>
        <circleGeometry args={[2.2, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={'varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(0.55, 0.6, 0.8) * a * a * 0.45, 1.0); }'}
        />
      </mesh>
      <Dust portrait={portrait} />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[6, 1.2, 1]} color="#eaf0ff" />
        <Lightformer form="rect" intensity={1.2} position={[0, 1.5, 6]} scale={[5, 3, 1]} color="#fff3e2" />
        <Lightformer form="rect" intensity={0.8} position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#4a63ff" />
        <Lightformer form="rect" intensity={0.6} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#8a6bff" />
      </Environment>
    </>
  );
}

function Post({ portrait }: { portrait: boolean }) {
  const dof = useRef<{ target: THREE.Vector3; bokehScale: number } | null>(null);
  useFrame(() => {
    const t = window.__t;
    if (dof.current) {
      dof.current.target = new THREE.Vector3(portrait ? 0 : 1.15, 0.35, 0);
      dof.current.bokehScale = 0.6 + 1.6 * seg(t, 0.4, 0.62) * (1 - seg(t, 0.64, 0.8));
    }
  });
  return (
    <EffectComposer multisampling={4}>
      <DepthOfField ref={dof as never} focusDistance={0} focalLength={0.02} bokehScale={0.6} target={[portrait ? 0 : 1.15, 0.35, 0]} />
      <Bloom intensity={0.5} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
      <Noise opacity={0.045} />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
    </EffectComposer>
  );
}

function Stage() {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);
  return null;
}

export default function Film({ width, height }: { width: number; height: number }) {
  const portrait = height > width;
  return (
    <div style={{ width, height }}>
      <Canvas
        shadows
        dpr={1}
        frameloop="never"
        gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        camera={{ fov: portrait ? 40 : 32, near: 0.1, far: 80, position: [0, 0.5, 8] }}
        style={{ width, height, background: '#05060a' }}
      >
        <color attach="background" args={['#05060a']} />
        <fog attach="fog" args={['#05060a', 14, 34]} />
        <Stage />
        <Scene portrait={portrait} />
        <Post portrait={portrait} />
      </Canvas>
    </div>
  );
}
