import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Procedural fish (no model files): a lathe-turned, laterally compressed body
 *  with a painted scale texture, translucent fins, glossy eyes, and a swimming
 *  S-wave applied in the vertex shader. Local space: head → +x, back → +y.
 * ──────────────────────────────────────────────────────────────────────────── */

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

function bodyTexture() {
  const W = 256;
  const H = 128;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H);
  const belly = [238, 241, 255];
  const mid = [128, 156, 214];
  const back = [30, 50, 108];
  for (let py = 0; py < H; py++) {
    const v = 1 - py / H; // 0 = tail, 1 = nose
    for (let px = 0; px < W; px++) {
      const u = px / W; // around the body; 0.75 = back, 0.25 = belly
      const b = 0.5 + 0.5 * Math.cos(2 * Math.PI * (u - 0.75));
      let col = b < 0.5 ? mix(belly, mid, b * 2) : mix(mid, back, (b - 0.5) * 2);
      // lateral line
      const ll = Math.exp(-Math.pow((b - 0.52) / 0.018, 2));
      col = col.map((x) => x * (1 - ll * 0.22));
      // soft vertical bars on the upper flank
      const bars = b > 0.55 ? Math.max(0, Math.sin(v * 44)) * 0.1 * (b - 0.55) * 2.2 : 0;
      col = col.map((x) => x * (1 - bars));
      // overlapping scales
      const sv = v * 24;
      const row = Math.floor(sv);
      const su = u * 60 + (row % 2) * 0.5;
      const fx = su - Math.floor(su) - 0.5;
      const fy = sv - row;
      const rim = Math.max(0, 1 - Math.abs(Math.hypot(fx, fy) - 0.5) * 10);
      const scale = (v > 0.12 && v < 0.84 ? 1 : 0) * rim;
      col = col.map((x) => x * (1 - scale * 0.13) + scale * 10);
      // darker head, bluish tail
      if (v > 0.84) col = col.map((x) => x * (1 - (v - 0.84) * 0.9));
      if (v < 0.1) col = mix(col, [110, 140, 220], (0.1 - v) * 5);
      const k = (py * W + px) * 4;
      img.data[k] = col[0];
      img.data[k + 1] = col[1];
      img.data[k + 2] = col[2];
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function finShape(draw: (s: THREE.Shape) => void) {
  const s = new THREE.Shape();
  draw(s);
  return new THREE.ShapeGeometry(s, 16);
}

export function createFish() {
  const uniforms = { uSwim: { value: 0 }, uAmp: { value: 0.1 } };

  // Bend everything in the same local space so fins follow the body.
  const swim = <M extends THREE.Material>(m: M) => {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uSwim = uniforms.uSwim;
      sh.uniforms.uAmp = uniforms.uAmp;
      sh.vertexShader =
        'uniform float uSwim;\nuniform float uAmp;\n' +
        sh.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float tw = pow(clamp((0.85 - transformed.x) / 2.6, 0.0, 1.0), 1.7);
          transformed.z += sin(transformed.x * 2.6 - uSwim) * uAmp * tw;`,
        );
    };
    return m;
  };

  // Body profile: tail (t=0) → nose (t=1)
  const pts: THREE.Vector2[] = [];
  const N = 56;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const base = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 1.05) * 0.34;
    const r = i === N ? 0 : Math.max(base, 0.028);
    pts.push(new THREE.Vector2(r, -1.15 + t * 2.1));
  }
  const bodyGeo = new THREE.LatheGeometry(pts, 72);
  bodyGeo.rotateZ(-Math.PI / 2);
  bodyGeo.scale(1, 1.05, 0.46);
  bodyGeo.computeVertexNormals();

  const map = bodyTexture();
  const bodyMat = swim(
    new THREE.MeshPhysicalMaterial({
      map,
      roughness: 0.3,
      metalness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.55,
      iridescenceIOR: 1.35,
      envMapIntensity: 1.2,
    }),
  );

  const finMat = swim(
    new THREE.MeshPhysicalMaterial({
      color: '#a9bcf2',
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      iridescence: 0.4,
      depthWrite: false,
    }),
  );

  const tail = finShape((s) => {
    s.moveTo(-1.08, 0);
    s.quadraticCurveTo(-1.35, 0.2, -1.74, 0.6);
    s.quadraticCurveTo(-1.6, 0.22, -1.52, 0.03);
    s.lineTo(-1.52, -0.03);
    s.quadraticCurveTo(-1.6, -0.22, -1.74, -0.6);
    s.quadraticCurveTo(-1.35, -0.2, -1.08, 0);
  });
  const dorsal = finShape((s) => {
    s.moveTo(-0.52, 0.27);
    s.quadraticCurveTo(-0.28, 0.66, 0.14, 0.68);
    s.quadraticCurveTo(0.2, 0.5, 0.3, 0.35);
    s.lineTo(-0.52, 0.27);
  });
  const anal = finShape((s) => {
    s.moveTo(-0.56, -0.24);
    s.quadraticCurveTo(-0.46, -0.54, -0.2, -0.52);
    s.quadraticCurveTo(-0.14, -0.4, -0.05, -0.3);
    s.lineTo(-0.56, -0.24);
  });
  const pelvic = finShape((s) => {
    s.moveTo(0.14, -0.32);
    s.quadraticCurveTo(0.2, -0.56, 0.36, -0.5);
    s.lineTo(0.36, -0.32);
  });
  const pect = (side: 1 | -1) => {
    const g = finShape((s) => {
      s.moveTo(0, 0);
      s.quadraticCurveTo(0.08, 0.12, -0.32, 0.07);
      s.quadraticCurveTo(-0.22, -0.05, 0, 0);
    });
    g.rotateY(side * 0.6);
    g.translate(0.44, -0.12, side * 0.17);
    return g;
  };

  const inner = new THREE.Group();
  inner.add(new THREE.Mesh(bodyGeo, bodyMat));
  for (const g of [tail, dorsal, anal, pelvic, pect(1), pect(-1)]) inner.add(new THREE.Mesh(g, finMat));

  // Eyes
  const sclera = new THREE.MeshPhysicalMaterial({ color: '#e2d7a8', roughness: 0.2, metalness: 0.4, clearcoat: 1 });
  const pupil = new THREE.MeshPhysicalMaterial({ color: '#05060c', roughness: 0.05, clearcoat: 1 });
  const eyeGeo = new THREE.SphereGeometry(0.056, 24, 16);
  const pupilGeo = new THREE.SphereGeometry(0.036, 20, 14);
  for (const side of [1, -1]) {
    const e = new THREE.Mesh(eyeGeo, sclera);
    e.position.set(0.66, 0.05, side * 0.066);
    const p = new THREE.Mesh(pupilGeo, pupil);
    p.position.set(0.675, 0.055, side * 0.098);
    inner.add(e, p);
  }

  inner.rotation.y = -Math.PI / 2; // local +x (head) → +z so lookAt() aims the head
  const group = new THREE.Group();
  group.add(inner);
  group.scale.setScalar(0.85);

  const dispose = () => {
    [bodyGeo, tail, dorsal, anal, pelvic, eyeGeo, pupilGeo].forEach((g) => g.dispose());
    [bodyMat, finMat, sclera, pupil].forEach((m) => m.dispose());
    map.dispose();
  };

  return { group, uniforms, dispose };
}
