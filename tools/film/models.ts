import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Procedural cricket bat + ball for the hero film (render-time only).
 *  Units: bat ≈ 3.45 tall (≈ 86 cm), ball r ≈ 0.145 (≈ 7.2 cm) — real proportions.
 * ──────────────────────────────────────────────────────────────────────────── */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

/* ── Textures ─────────────────────────────────────────────────────────────── */

function willowTexture() {
  const W = 512;
  const H = 2048;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9d3a4';
  g.fillRect(0, 0, W, H);
  const r = rng(4);
  // straight English-willow grains running the length of the blade
  const grains = 13;
  for (let k = 0; k < grains; k++) {
    const x0 = (k + 0.5) * (W / grains) + (r() - 0.5) * 10;
    const w = 3 + r() * 6;
    const dark = 0.1 + r() * 0.14;
    g.beginPath();
    for (let y = 0; y <= H; y += 16) {
      const x = x0 + Math.sin(y * 0.004 + k) * 5 + Math.sin(y * 0.017 + k * 3) * 1.5;
      if (y === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokeStyle = `rgba(150,100,45,${dark})`;
    g.lineWidth = w;
    g.stroke();
    g.strokeStyle = `rgba(120,80,35,${dark * 0.8})`;
    g.lineWidth = 1;
    g.stroke();
  }
  // fine fibres + tiny pores
  for (let i = 0; i < 9000; i++) {
    const x = r() * W;
    const y = r() * H;
    g.fillStyle = `rgba(${r() < 0.5 ? '120,80,40' : '255,245,220'},${0.05 + r() * 0.08})`;
    g.fillRect(x, y, 1, 4 + r() * 18);
  }
  // burnished edges
  const edge = g.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, 'rgba(150,100,50,0.35)');
  edge.addColorStop(0.08, 'rgba(150,100,50,0)');
  edge.addColorStop(0.92, 'rgba(150,100,50,0)');
  edge.addColorStop(1, 'rgba(150,100,50,0.35)');
  g.fillStyle = edge;
  g.fillRect(0, 0, W, H);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function gripTextures() {
  const W = 512;
  const H = 1024;
  const col = document.createElement('canvas');
  col.width = W;
  col.height = H;
  const bump = document.createElement('canvas');
  bump.width = W;
  bump.height = H;
  const g = col.getContext('2d')!;
  const b = bump.getContext('2d')!;
  g.fillStyle = '#16225e';
  g.fillRect(0, 0, W, H);
  b.fillStyle = '#000';
  b.fillRect(0, 0, W, H);
  // spiral ribs (a wound rubber grip)
  for (let y = -W; y < H + W; y += 22) {
    g.save();
    b.save();
    for (const ctx of [g, b]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + W * 0.45);
      ctx.lineWidth = 12;
    }
    g.strokeStyle = '#24348a';
    g.stroke();
    b.strokeStyle = '#fff';
    b.stroke();
    g.restore();
    b.restore();
  }
  // pimpled texture
  const r = rng(8);
  for (let i = 0; i < 6000; i++) {
    const x = r() * W;
    const y = r() * H;
    b.fillStyle = 'rgba(255,255,255,0.35)';
    b.beginPath();
    b.arc(x, y, 1.4, 0, Math.PI * 2);
    b.fill();
  }
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const bmp = new THREE.CanvasTexture(bump);
  bmp.wrapS = bmp.wrapT = THREE.RepeatWrapping;
  return { map, bump: bmp };
}

function stickerTexture() {
  const W = 512;
  const H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, W, H);
  // band
  const band = g.createLinearGradient(0, 0, W, 0);
  band.addColorStop(0, '#1d2a78');
  band.addColorStop(0.5, '#3b5bff');
  band.addColorStop(1, '#1d2a78');
  g.fillStyle = band;
  g.fillRect(40, 70, W - 80, 250);
  g.strokeStyle = '#c9d2ff';
  g.lineWidth = 6;
  g.strokeRect(52, 82, W - 104, 226);
  g.fillStyle = '#ffffff';
  g.font = '800 170px "DM Sans Variable", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MK', W / 2, 200);
  g.fillStyle = '#1d2a78';
  g.font = '700 46px "DM Sans Variable", Arial, sans-serif';
  g.save();
  g.translate(W / 2, 640);
  g.rotate(-Math.PI / 2);
  g.fillText('THE DATA INNINGS', 0, 0);
  g.restore();
  g.strokeStyle = '#3b5bff';
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(W / 2 - 70, 400);
  g.lineTo(W / 2 - 70, 900);
  g.moveTo(W / 2 + 70, 400);
  g.lineTo(W / 2 + 70, 900);
  g.stroke();
  g.fillStyle = '#1d2a78';
  g.font = '600 30px "DM Sans Variable", Arial, sans-serif';
  g.fillText('GRADE 1 · ENGLISH WILLOW', W / 2, 975);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function leatherTextures() {
  const W = 1024;
  const H = 512;
  const col = document.createElement('canvas');
  col.width = W;
  col.height = H;
  const rough = document.createElement('canvas');
  rough.width = W;
  rough.height = H;
  const g = col.getContext('2d')!;
  const rg = rough.getContext('2d')!;
  g.fillStyle = '#9e0f16';
  g.fillRect(0, 0, W, H);
  rg.fillStyle = '#5a5a5a';
  rg.fillRect(0, 0, W, H);
  const r = rng(12);
  for (let i = 0; i < 2600; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 2 + r() * 14;
    g.fillStyle = `rgba(${r() < 0.5 ? '60,0,5' : '200,40,45'},${0.04 + r() * 0.07})`;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    rg.fillStyle = `rgba(${r() < 0.5 ? '30,30,30' : '140,140,140'},0.12)`;
    rg.beginPath();
    rg.arc(x, y, rad, 0, Math.PI * 2);
    rg.fill();
  }
  // gold maker's stamp on one face
  g.fillStyle = 'rgba(214,176,92,0.9)';
  g.font = '700 34px "DM Sans Variable", Arial, sans-serif';
  g.textAlign = 'center';
  g.fillText('MK · TEST', W * 0.25, H * 0.5);
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughness = new THREE.CanvasTexture(rough);
  return { map, roughness };
}

/* ── Bat ──────────────────────────────────────────────────────────────────── */

const BLADE_TOP = 2.3;
export const BAT_LEN = 3.45;

function bladeSection(y: number) {
  const shoulder = smooth(2.14, BLADE_TOP, y);
  const toe = 1 - smooth(0.0, 0.07, y);
  const W = THREE.MathUtils.lerp(0.54, 0.17, shoulder) * (1 - toe * 0.03);
  // spine height: thickest around the sweet spot, thinner at toe and shoulder
  const sweet = Math.exp(-Math.pow((y - 0.62) / 0.75, 2));
  const spine = THREE.MathUtils.lerp(0.17, 0.3, sweet) * (1 - shoulder * 0.45);
  const edge = THREE.MathUtils.lerp(0.19, 0.12, smooth(0.9, 2.0, y));
  const front = THREE.MathUtils.lerp(0.055, 0.085, shoulder);
  const n = THREE.MathUtils.lerp(4.5, 2.0, shoulder); // squarish → round
  return { W, spine, edge: Math.min(edge, spine), front, n };
}

function bladeGeometry() {
  const ROWS = 140;
  const COLS = 96;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= ROWS; j++) {
    const y = (j / ROWS) * BLADE_TOP;
    const s = bladeSection(y);
    const a = s.W / 2;
    for (let i = 0; i <= COLS; i++) {
      const t = (i / COLS) * Math.PI * 2;
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const x = a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / s.n);
      const k = Math.sign(st) * Math.pow(Math.abs(st), 2 / s.n);
      let z: number;
      if (k >= 0) {
        const xr = Math.min(1, Math.abs(x / a));
        const back = s.edge + (s.spine - s.edge) * Math.pow(1 - xr * xr, 1.3);
        z = back * k;
      } else {
        z = s.front * k;
      }
      pos.push(x, y, -z); // -z: front face toward +z (camera side)
      uv.push(i / COLS, j / ROWS);
    }
  }
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const a = j * (COLS + 1) + i;
      const b = a + COLS + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // toe cap
  const center = pos.length / 3;
  pos.push(0, 0, 0);
  uv.push(0.5, 0);
  for (let i = 0; i < COLS; i++) idx.push(center, i + 1, i);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function createBat() {
  const group = new THREE.Group();

  // UVs of the blade wrap around; map willow so grain runs lengthwise.
  const willow = willowTexture();
  const blade = new THREE.Mesh(
    bladeGeometry(),
    new THREE.MeshPhysicalMaterial({ map: willow, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
  );
  blade.castShadow = true;
  group.add(blade);

  // Front sticker (decal plane just proud of the flat face)
  const sticker = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.84),
    new THREE.MeshPhysicalMaterial({ map: stickerTexture(), transparent: true, roughness: 0.25, clearcoat: 0.8 }),
  );
  sticker.position.set(0, 1.42, 0.0565);
  group.add(sticker);
  // Toe guard strip
  const toeBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.545, 0.06, 0.2),
    new THREE.MeshPhysicalMaterial({ color: '#1d2a78', roughness: 0.4, clearcoat: 0.6 }),
  );
  toeBand.position.set(0, 0.06, -0.05);
  group.add(toeBand);

  // Handle: cane core + wound rubber grip + tapered top
  const grip = gripTextures();
  grip.map.repeat.set(1, 3);
  grip.bump.repeat.set(1, 3);
  const handleLen = BAT_LEN - BLADE_TOP;
  const handleGeo = new THREE.CylinderGeometry(0.083, 0.09, handleLen, 64, 40, true);
  const hp = handleGeo.getAttribute('position');
  for (let i = 0; i < hp.count; i++) {
    const y = hp.getY(i) / handleLen + 0.5; // 0 bottom → 1 top
    const swell = 1 + 0.05 * Math.sin(y * Math.PI); // slight oval swell
    hp.setX(i, hp.getX(i) * swell);
    hp.setZ(i, hp.getZ(i) * swell * 0.95);
  }
  handleGeo.computeVertexNormals();
  const handle = new THREE.Mesh(
    handleGeo,
    new THREE.MeshPhysicalMaterial({ map: grip.map, bumpMap: grip.bump, bumpScale: 3, roughness: 0.78, sheen: 0.4, sheenColor: new THREE.Color('#6b82ff') }),
  );
  handle.position.y = BLADE_TOP + handleLen / 2;
  group.add(handle);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.086, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: '#16225e', roughness: 0.7 }),
  );
  cap.scale.y = 0.5;
  cap.position.y = BAT_LEN;
  group.add(cap);
  // silver collar where grip meets blade
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.092, 0.012, 16, 64),
    new THREE.MeshPhysicalMaterial({ color: '#d7dcef', metalness: 1, roughness: 0.18 }),
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = BLADE_TOP + 0.03;
  group.add(collar);

  // centre the bat on its balance point for nice rotations
  group.children.forEach((c) => (c.position.y -= 1.35));
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

/* ── Ball ─────────────────────────────────────────────────────────────────── */

export function createBall() {
  const R = 0.145;
  const group = new THREE.Group();
  const lt = leatherTextures();
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(R, 96, 64),
    new THREE.MeshPhysicalMaterial({ map: lt.map, roughnessMap: lt.roughness, roughness: 0.55, clearcoat: 1, clearcoatRoughness: 0.12 }),
  );
  group.add(ball);

  // Raised main seam: a leather ridge + six rows of cream stitches
  const ridge = new THREE.Mesh(
    new THREE.TorusGeometry(R * 1.003, R * 0.045, 16, 180),
    new THREE.MeshPhysicalMaterial({ color: '#7d0a10', roughness: 0.5, clearcoat: 0.7 }),
  );
  group.add(ridge);
  const stitchGeo = new THREE.CapsuleGeometry(R * 0.012, R * 0.05, 4, 8);
  const stitchMat = new THREE.MeshPhysicalMaterial({ color: '#f1e6cf', roughness: 0.6, sheen: 1, sheenColor: new THREE.Color('#fff') });
  const rows = [-3, -2, -1, 1, 2, 3];
  const perRow = 88;
  const stitches = new THREE.InstancedMesh(stitchGeo, stitchMat, rows.length * perRow);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  let k = 0;
  for (const row of rows) {
    const off = row * R * 0.032; // z offset of each row from the seam plane
    const rr = Math.sqrt(R * R - off * off) * 1.012;
    for (let i = 0; i < perRow; i++) {
      const a = (i / perRow) * Math.PI * 2 + (row % 2 ? 0.02 : 0);
      e.set(0, 0, a + Math.PI / 2 + (row > 0 ? 0.5 : -0.5));
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, off), q, new THREE.Vector3(1, 1, 1));
      stitches.setMatrixAt(k++, m);
    }
  }
  group.add(stitches);
  // Quarter seams (fainter, one per hemisphere)
  for (const side of [1, -1]) {
    const q = new THREE.Mesh(
      new THREE.TorusGeometry(R * 1.001, R * 0.012, 8, 90, Math.PI * 0.9),
      new THREE.MeshPhysicalMaterial({ color: '#6a070c', roughness: 0.55 }),
    );
    q.rotation.set(0, Math.PI / 2, Math.PI * 0.05);
    q.position.z = 0;
    q.rotation.x = side > 0 ? 0 : Math.PI;
    q.rotateOnAxis(new THREE.Vector3(0, 1, 0), side * 0.0);
    group.add(q);
  }
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return group;
}
