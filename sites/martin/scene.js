// Menuiserie Martin : objets en bois en 3D (three.js r160)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const ESSENCES = {
  chene:  { nom: 'Chêne',  light: [168, 122, 80], dark: [100, 66, 38],  f: 0.075, k: 1.8, rough: 0.5 },
  noyer:  { nom: 'Noyer',  light: [112, 74, 48],   dark: [48, 28, 17],   f: 0.06,  k: 1.6, rough: 0.5 },
  frene:  { nom: 'Frêne',  light: [214, 186, 142], dark: [158, 120, 76], f: 0.05,  k: 3.0, rough: 0.6 },
  laque:  { nom: 'Laqué gris', paint: 0x3a3f42, rough: 0.42 },
  blanc:  { nom: 'Laqué blanc', paint: 0xeeece6, rough: 0.4 },
  a7016:  { nom: 'Gris anthracite', alu: 0x383d42 },
  a9005:  { nom: 'Noir sablé', alu: 0x1c1d1f },
  a9016:  { nom: 'Blanc', alu: 0xe9e9e4 },
  abronze:{ nom: 'Bronze', alu: 0x5a4a38 },
};

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const cache = {};
function woodCanvas(e, seed) {
  const W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'), img = ctx.createImageData(W, H), d = img.data, r = rng(seed);
  const row = new Float32Array(H + 1); let v = 0;
  for (let y = 0; y <= H; y++) { v = v * 0.82 + (r() - 0.5) * 0.9; row[y] = v; }
  const p1 = r() * 6, p2 = r() * 6, p3 = r() * 6, off = r() * 50;
  const bump = document.createElement('canvas'); bump.width = W; bump.height = H;
  const bctx = bump.getContext('2d'), bimg = bctx.createImageData(W, H), b = bimg.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const w = y + off + Math.sin(x * 0.0061 + p1) * 7 + Math.sin(x * 0.019 + p2) * 1.8 + Math.sin(y * 0.045 + x * 0.0023 + p3) * 4;
    let q = w * e.f; q -= Math.floor(q);
    let t = Math.pow(q, e.k) * 0.8 + row[y] * 0.12 + (r() - 0.5) * 0.06;
    t = Math.min(1, Math.max(0, t));
    const i = (y * W + x) * 4;
    d[i] = e.light[0] + (e.dark[0] - e.light[0]) * t;
    d[i + 1] = e.light[1] + (e.dark[1] - e.light[1]) * t;
    d[i + 2] = e.light[2] + (e.dark[2] - e.light[2]) * t;
    d[i + 3] = 255;
    const g = 255 - t * 120; b[i] = b[i + 1] = b[i + 2] = g; b[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); bctx.putImageData(bimg, 0, 0);
  return { c, bump };
}

export function woodMat(key, seed = 1, renderer, rep = 2) {
  const e = ESSENCES[key], id = key + seed + '_' + rep;
  if (cache[id]) return cache[id];
  let m;
  if (e.alu) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), im = x.createImageData(256, 256), r = rng(seed + 9);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); const bm = new THREE.CanvasTexture(c); bm.wrapS = bm.wrapT = THREE.RepeatWrapping; bm.repeat.set(6, 6);
    m = new THREE.MeshStandardMaterial({ color: e.alu, metalness: 0.45, roughness: 0.52, bumpMap: bm, bumpScale: 0.25, envMapIntensity: 0.9 });
  } else if (e.paint) m = new THREE.MeshStandardMaterial({ color: e.paint, roughness: e.rough, metalness: 0 });
  else {
    const { c, bump } = woodCanvas(e, seed);
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    const bm = new THREE.CanvasTexture(bump);
    [map, bm].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, rep); });
    if (renderer) map.anisotropy = bm.anisotropy = renderer.capabilities.getMaxAnisotropy();
    m = new THREE.MeshStandardMaterial({ map, bumpMap: bm, bumpScale: 0.8, roughness: e.rough, metalness: 0, envMapIntensity: 0.55 });
  }
  return (cache[id] = m);
}

export const laiton = () => new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.28 });
export const verre = () => new THREE.MeshPhysicalMaterial({ color: 0xf4f8f6, metalness: 0, roughness: 0.02, transmission: 0.96, thickness: 0.012, ior: 1.5, transparent: true, opacity: 1, envMapIntensity: 1.2 });

// Pièce de bois : le fil du bois suit la longueur (axe x), puis on la tourne
function piece(mat, len, thick, depth, x = 0, y = 0, z = 0, vertical = false) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(len, thick, depth, 2, Math.min(0.004, thick / 4, depth / 4)), mat);
  if (vertical) m.rotation.z = Math.PI / 2;
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}

// ---------- Fenêtre deux vantaux à petits bois ----------
export function fenetre(mats) {
  const W = 1.25, H = 1.45, fw = 0.068, fd = 0.07, sw = 0.062, sd = 0.058;
  const g = new THREE.Group(), parts = {};
  const dor = new THREE.Group(); g.add(dor); parts.dormant = dor;
  dor.add(piece(mats.a, W, fw, fd, 0, H / 2 - fw / 2, 0));
  dor.add(piece(mats.a, W, fw, fd, 0, -H / 2 + fw / 2, 0));
  dor.add(piece(mats.b, H - 2 * fw, fw, fd, -W / 2 + fw / 2, 0, 0, true));
  dor.add(piece(mats.b, H - 2 * fw, fw, fd, W / 2 - fw / 2, 0, 0, true));
  const appui = piece(mats.a, W + 0.08, 0.05, 0.13, 0, -H / 2 - 0.02, 0.035); g.add(appui); parts.appui = appui;
  const iw = W - 2 * fw, ih = H - 2 * fw, lw = iw / 2;
  parts.sashes = [];
  [-1, 1].forEach((side, n) => {
    const pivot = new THREE.Group(); pivot.position.set(side * iw / 2, 0, 0.012); g.add(pivot);
    const s = new THREE.Group(); s.position.x = -side * lw / 2; pivot.add(s);
    const cadre = new THREE.Group(); s.add(cadre);
    cadre.add(piece(mats.a, lw, sw, sd, 0, ih / 2 - sw / 2, 0));
    cadre.add(piece(mats.a, lw, sw * 1.35, sd, 0, -ih / 2 + sw * 0.675, 0));
    cadre.add(piece(mats.b, ih - sw * 2.35, sw, sd, -lw / 2 + sw / 2, -sw * 0.175, 0, true));
    cadre.add(piece(mats.b, ih - sw * 2.35, sw, sd, lw / 2 - sw / 2, -sw * 0.175, 0, true));
    const gl = new THREE.Group(); s.add(gl);
    const vit = new THREE.Mesh(new THREE.BoxGeometry(lw - sw * 1.6, ih - sw * 2.0, 0.018), mats.verre);
    vit.position.y = -sw * 0.175; gl.add(vit);
    const bois = new THREE.Group(); s.add(bois);
    const gh = ih - sw * 2.35;
    [1 / 3, 2 / 3].forEach(f => bois.add(piece(mats.a, lw - sw * 2, 0.026, 0.03, 0, -sw * 0.175 + gh / 2 - gh * f, 0.0)));
    const quinc = new THREE.Group(); s.add(quinc);
    if (side === 1) {
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, ih * 0.9, 16), mats.laiton);
      tige.position.set(-lw / 2 + 0.012, 0, 0.04); quinc.add(tige);
      const poignee = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.13, 0.02), mats.laiton);
      poignee.position.set(-lw / 2 + 0.03, 0, 0.055); quinc.add(poignee);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 24), mats.laiton);
      base.rotation.x = Math.PI / 2; base.position.set(-lw / 2 + 0.03, 0.05, 0.04); quinc.add(base);
    }
    [0.36, -0.36].forEach(f => {
      const pa = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.09, 16), mats.laiton);
      pa.position.set(side * (lw / 2 + 0.002), f * ih, 0.028); quinc.add(pa);
    });
    quinc.traverse(o => { o.castShadow = true; });
    parts.sashes.push({ pivot, s, cadre, gl, bois, quinc, side });
  });
  g.userData = { parts, W, H };
  return g;
}

// e = 0 (montée) … 1 (éclatée) ; o = ouverture des vantaux (radians)
export function poseFenetre(g, e = 0, o = 0) {
  const P = g.userData.parts, ee = e * e * (3 - 2 * e);
  P.appui.position.y = -g.userData.H / 2 - 0.02 - ee * 0.18;
  P.sashes.forEach(S => {
    S.pivot.rotation.y = (g.userData.sens || -1) * S.side * o * (1 - ee);
    S.s.position.z = ee * 0.34; S.s.position.x = -S.side * (g.userData.lw || (g.userData.W - 0.136) / 2) / 2 + S.side * ee * 0.05;
    S.gl.position.z = ee * 0.26; S.bois.position.z = ee * 0.12; S.quinc.position.z = ee * 0.5;
  });
}

// ---------- Porte à panneaux ----------
export function porte(mats) {
  const g = new THREE.Group(), W = 0.83, H = 2.04, st = 0.115, d = 0.045;
  g.add(piece(mats.b, H, st, d, -W / 2 + st / 2, 0, 0, true));
  g.add(piece(mats.b, H, st, d, W / 2 - st / 2, 0, 0, true));
  g.add(piece(mats.a, W - 2 * st, 0.12, d, 0, H / 2 - 0.06, 0));
  g.add(piece(mats.a, W - 2 * st, 0.18, d, 0, -0.08, 0));
  g.add(piece(mats.a, W - 2 * st, 0.22, d, 0, -H / 2 + 0.11, 0));
  const pw = W - 2 * st, ht = (H / 2 - 0.12) - (-0.08 + 0.09), hb = (-0.08 - 0.09) - (-H / 2 + 0.22);
  [[ht, (H / 2 - 0.12 + (-0.08 + 0.09)) / 2], [hb, ((-0.08 - 0.09) + (-H / 2 + 0.22)) / 2]].forEach(([h, y]) => {
    g.add(piece(mats.c, h, pw, 0.02, 0, y, 0, true));
    g.add(piece(mats.c, h - 0.12, pw - 0.12, 0.034, 0, y, 0, true));
  });
  const ch = 0.06, cd = 0.09;
  g.add(piece(mats.b, H + ch, ch, cd, -W / 2 - ch / 2, ch / 2, 0, true));
  g.add(piece(mats.b, H + ch, ch, cd, W / 2 + ch / 2, ch / 2, 0, true));
  g.add(piece(mats.a, W + 2 * ch, ch, cd, 0, H / 2 + ch / 2, 0));
  const rosace = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 32), mats.laiton);
  rosace.rotation.x = Math.PI / 2; rosace.position.set(W / 2 - 0.07, -0.02, 0.03); g.add(rosace);
  const bec = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.018, 0.02), mats.laiton);
  bec.position.set(W / 2 - 0.125, -0.02, 0.06); g.add(bec);
  const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 16), mats.laiton);
  tige.rotation.x = Math.PI / 2; tige.position.set(W / 2 - 0.07, -0.02, 0.045); g.add(tige);
  [rosace, bec, tige].forEach(m => m.castShadow = true);
  g.position.y = H / 2; return g;
}

// ---------- Escalier droit, limons et main courante ----------
export function escalier(mats) {
  const g = new THREE.Group(), n = 13, rise = 0.18, go = 0.25, w = 0.9;
  for (let i = 0; i < n; i++) {
    g.add(piece(mats.a, w, 0.04, go + 0.03, 0, (i + 1) * rise - 0.02, -i * go + 0.015));
    g.add(piece(mats.c, w - 0.02, rise - 0.04, 0.018, 0, i * rise + rise / 2 - 0.02, -i * go + go / 2 + 0.005));
  }
  const L = Math.hypot(n * go, n * rise), ang = Math.atan2(rise, go);
  [-1, 1].forEach(sd => {
    const l = piece(mats.b, L + 0.2, 0.28, 0.045, 0, 0, 0); l.rotation.set(0, Math.PI / 2, 0);
    const pg = new THREE.Group(); pg.add(l); pg.rotation.x = ang;
    pg.position.set(sd * (w / 2 + 0.022), n * rise / 2 + 0.02, -n * go / 2 + go / 2); g.add(pg);
  });
  const mc = piece(mats.a, L + 0.1, 0.05, 0.065, 0, 0, 0); mc.rotation.y = Math.PI / 2;
  const mg = new THREE.Group(); mg.add(mc); mg.rotation.x = ang; mg.position.set(w / 2 + 0.022, n * rise / 2 + 0.92, -n * go / 2 + go / 2); g.add(mg);
  for (let i = 0; i < n; i += 1) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.86, 0.028), mats.b);
    b.position.set(w / 2 + 0.022, (i + 1) * rise + 0.43 + 0.04, -i * go + 0.02); b.castShadow = true; g.add(b);
  }
  const pot = piece(mats.a, 1.15, 0.09, 0.09, w / 2 + 0.022, 0.575, go * 0.6, true); pot.rotation.set(0, 0, Math.PI / 2); g.add(pot);
  g.position.z = n * go / 2 - go / 2; return g;
}

// ---------- Bibliothèque sur mesure ----------
export function bibliotheque(mats, livres) {
  const g = new THREE.Group(), W = 1.8, H = 2.1, D = 0.36, t = 0.025;
  g.add(piece(mats.b, H, D, t, -W / 2 + t / 2, H / 2, 0, true)); g.children.at(-1).rotation.set(0, Math.PI / 2, Math.PI / 2);
  g.add(piece(mats.b, H, D, t, W / 2 - t / 2, H / 2, 0, true)); g.children.at(-1).rotation.set(0, Math.PI / 2, Math.PI / 2);
  g.add(piece(mats.b, H, D, t, 0, H / 2, 0, true)); g.children.at(-1).rotation.set(0, Math.PI / 2, Math.PI / 2);
  const back = piece(mats.c, W, H, 0.012, 0, H / 2, -D / 2 + 0.006); g.add(back);
  const r = rng(7), cols = [0x2c3a4a, 0x8a3b2e, 0xd9cfbf, 0x4a5a3c, 0x1d2328, 0xb88a4a, 0x6b6f75];
  for (let k = 0; k <= 5; k++) {
    const y = k === 5 ? H - t / 2 : 0.08 + k * (H - 0.1) / 5;
    g.add(piece(mats.a, W - 2 * t, t, D - 0.012, 0, y, 0.006));
    if (k < 5 && k !== 2) [-1, 1].forEach(sd => {
      let x = sd < 0 ? -W / 2 + t + 0.02 : t / 2 + 0.02; const xmax = sd < 0 ? -t / 2 - 0.02 : W / 2 - t - 0.02;
      const stop = x + (xmax - x) * (0.45 + r() * 0.5);
      while (x < stop) {
        const bw = 0.02 + r() * 0.035, bh = 0.2 + r() * 0.12, bd = 0.18 + r() * 0.06;
        const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), new THREE.MeshStandardMaterial({ color: cols[(r() * cols.length) | 0], roughness: 0.8 }));
        m.position.set(x + bw / 2, y + t / 2 + bh / 2, -D / 2 + 0.02 + bd / 2); m.castShadow = m.receiveShadow = true; g.add(m); x += bw + 0.002;
      }
    });
  }
  if (livres) { const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.22, 32), new THREE.MeshStandardMaterial({ color: 0xe8e3d8, roughness: 0.35 })); vase.position.set(-0.45, 0.08 + 2 * (H - 0.1) / 5 + 0.125, 0); vase.castShadow = true; g.add(vase); }
  return g;
}

// ---------- Parquet à l'anglaise dans un coin de pièce ----------
export function parquet(mats) {
  const g = new THREE.Group(), S = 3.2, w = 0.14, r = rng(11);
  const geo = new THREE.BoxGeometry(1, 0.014, w - 0.003);
  const planks = [];
  for (let zi = 0; zi < Math.ceil(S / w); zi++) {
    let x = -S / 2 - r() * 0.8;
    while (x < S / 2) { const L = 0.7 + r() * 0.7; planks.push([x + L / 2, -S / 2 + zi * w + w / 2, L]); x += L + 0.003; }
  }
  const inst = new THREE.InstancedMesh(geo, mats.a, planks.length), m4 = new THREE.Matrix4(), col = new THREE.Color();
  planks.forEach(([x, z, L], i) => {
    m4.compose(new THREE.Vector3(x, 0.007, z), new THREE.Quaternion(), new THREE.Vector3(L, 1, 1)); inst.setMatrixAt(i, m4);
    const v = 0.82 + r() * 0.3; col.setRGB(v, v * (0.97 + r() * 0.04), v * (0.93 + r() * 0.06)); inst.setColorAt(i, col);
  });
  inst.receiveShadow = true; g.add(inst);
  const mur = new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.95 });
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(S, 2.6, 0.1), mur); m1.position.set(0, 1.3, -S / 2 - 0.05); m1.receiveShadow = true; g.add(m1);
  const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, S), mur); m2.position.set(-S / 2 - 0.05, 1.3, 0); m2.receiveShadow = true; g.add(m2);
  g.add(piece(mats.c, S, 0.1, 0.016, 0, 0.05, -S / 2 + 0.008));
  const p2 = piece(mats.c, S, 0.1, 0.016, -S / 2 + 0.008, 0.05, 0); p2.rotation.y = Math.PI / 2; g.add(p2);
  return g;
}

// ---------- Studio : rendu, lumière douce, ombre portée ----------
export function studio(canvas, { bg = null, w, h, preserve = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: bg === null, preserveDrawingBuffer: preserve });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); if (bg !== null) scene.background = new THREE.Color(bg);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); sun.position.set(2.5, 4, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 15 });
  scene.add(sun);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
  sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  function size(W, H) { renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
  if (w) size(w, h);
  return { THREE, renderer, scene, camera, sun, sol, size };
}

export function jeuDeBois(key, renderer) {
  return { a: woodMat(key, 1, renderer), b: woodMat(key, 2, renderer), c: woodMat(key, 3, renderer, 5), laiton: laiton(), verre: verre() };
}

// ---------- Fenêtre alu deux vantaux, profils fins, ouvrant caché ----------
export function fenetreAlu(mats) {
  const W = 1.25, H = 1.45, fw = 0.05, fd = 0.07, sw = 0.045, sd = 0.06, a = mats.alu;
  const g = new THREE.Group(), parts = {};
  const dor = new THREE.Group(); g.add(dor); parts.dormant = dor;
  dor.add(piece(a, W, fw, fd, 0, H / 2 - fw / 2, 0));
  dor.add(piece(a, W, fw, fd, 0, -H / 2 + fw / 2, 0));
  dor.add(piece(a, H - 2 * fw, fw, fd, -W / 2 + fw / 2, 0, 0, true));
  dor.add(piece(a, H - 2 * fw, fw, fd, W / 2 - fw / 2, 0, 0, true));
  const appui = piece(a, W + 0.04, 0.025, 0.11, 0, -H / 2 - 0.0125, 0.03); g.add(appui); parts.appui = appui;
  const iw = W - 2 * fw, ih = H - 2 * fw, lw = iw / 2;
  parts.sashes = [];
  [-1, 1].forEach(side => {
    const pivot = new THREE.Group(); pivot.position.set(side * iw / 2, 0, 0.008); g.add(pivot);
    const s = new THREE.Group(); s.position.x = -side * lw / 2; pivot.add(s);
    const cadre = new THREE.Group(); s.add(cadre);
    cadre.add(piece(a, lw, sw, sd, 0, ih / 2 - sw / 2, 0));
    cadre.add(piece(a, lw, sw, sd, 0, -ih / 2 + sw / 2, 0));
    cadre.add(piece(a, ih - 2 * sw, sw, sd, -lw / 2 + sw / 2, 0, 0, true));
    cadre.add(piece(a, ih - 2 * sw, sw, sd, lw / 2 - sw / 2, 0, 0, true));
    // parclose fine côté intérieur
    cadre.add(piece(a, lw - 2 * sw, 0.012, 0.02, 0, ih / 2 - sw - 0.006, 0.02));
    cadre.add(piece(a, lw - 2 * sw, 0.012, 0.02, 0, -ih / 2 + sw + 0.006, 0.02));
    const gl = new THREE.Group(); s.add(gl);
    const vit = new THREE.Mesh(new THREE.BoxGeometry(lw - sw * 1.4, ih - sw * 1.4, 0.024), mats.verre); gl.add(vit);
    const bois = new THREE.Group(); s.add(bois);
    const quinc = new THREE.Group(); s.add(quinc);
    if (side === 1) {
      const base = piece(mats.poignee, 0.075, 0.03, 0.012, -lw / 2 + sw / 2, 0, sd / 2 + 0.006, true); quinc.add(base);
      const lev = piece(mats.poignee, 0.14, 0.018, 0.016, -lw / 2 + sw / 2, -0.07, sd / 2 + 0.03, true); quinc.add(lev);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 16), mats.poignee); col.rotation.x = Math.PI / 2; col.position.set(-lw / 2 + sw / 2, 0, sd / 2 + 0.018); quinc.add(col);
    }
    quinc.traverse(o => { o.castShadow = true; });
    parts.sashes.push({ pivot, s, cadre, gl, bois, quinc, side });
  });
  g.userData = { parts, W, H, lw };
  return g;
}

// ---------- Escalier droit : limons acier, marches en chêne, garde-corps à barreaux ----------
export function escalierMetal(mats) {
  const g = new THREE.Group(), n = 13, rise = 0.18, go = 0.25, w = 0.9, acier = mats.acier;
  for (let i = 0; i < n; i++) g.add(piece(mats.a, w - 0.01, 0.045, go + 0.04, 0, (i + 1) * rise - 0.0225, -i * go + 0.02));
  const L = Math.hypot(n * go, n * rise), ang = Math.atan2(rise, go);
  [-1, 1].forEach(sd => {
    const l = piece(acier, L + 0.15, 0.22, 0.012, 0, 0, 0); l.rotation.set(0, Math.PI / 2, 0);
    const pg = new THREE.Group(); pg.add(l); pg.rotation.x = ang;
    pg.position.set(sd * (w / 2 + 0.006), n * rise / 2 - 0.02, -n * go / 2 + go / 2); g.add(pg);
  });
  const mc = piece(acier, L + 0.1, 0.04, 0.012, 0, 0, 0); mc.rotation.y = Math.PI / 2;
  const mg = new THREE.Group(); mg.add(mc); mg.rotation.x = ang; mg.position.set(w / 2 + 0.006, n * rise / 2 + 0.95, -n * go / 2 + go / 2); g.add(mg);
  for (let i = 0; i < n; i++) [0, 0.5].forEach(f => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.9, 0.012), acier);
    b.position.set(w / 2 + 0.006, (i + 1 + f * 0) * rise + f * rise + 0.45 + 0.02, -i * go + 0.12 - f * go); b.castShadow = true; g.add(b);
  });
  g.position.z = n * go / 2 - go / 2; return g;
}

export function jeuAlu(key, renderer) {
  return { alu: woodMat(key, 1, renderer), verre: verre(), poignee: new THREE.MeshStandardMaterial({ color: key === 'a9016' ? 0xd8d8d4 : 0x9a9c9e, metalness: 0.9, roughness: 0.3 }) };
}
export function jeuEscalier(renderer) {
  return { a: woodMat('chene', 1, renderer), acier: new THREE.MeshStandardMaterial({ color: 0x1e2022, metalness: 0.55, roughness: 0.45 }) };
}

// ---------- Fenêtre alu fine « dormant invisible » (esprit gamme fine) ----------
// W, H = dimensions du tableau (trou dans le mur). type : 'f2' 2 vantaux, 'pf2' porte-fenêtre, 'f1' 1 vantail.
// ancienne : true = vieille fenêtre épaisse (dormant visible, gros profils) pour la comparaison.
export function fenetreFine(mats, { W = 1.25, H = 1.45, type = 'f2', ancienne = false, cadre = false } = {}) {
  const a = mats.alu, g = new THREE.Group(), parts = { sashes: [] };
  const sw = ancienne ? 0.105 : 0.045, meet = ancienne ? 0.075 : 0.03, sd = ancienne ? 0.07 : 0.06;
  const bot = type === 'pf2' ? (ancienne ? 0.16 : 0.1) : sw;
  const bande = ancienne ? 0.055 : 0;            // dormant visible dans le tableau
  // dormant : caché dans l'épaisseur du mur (ou visible pour l'ancienne)
  const dor = new THREE.Group(); g.add(dor); parts.dormant = dor;
  const fw = ancienne ? 0.06 + bande : 0.05, ins = ancienne ? -2 * bande : 0.008, dz = ancienne ? -0.06 : -0.12;
  let OW = (ancienne ? W - 2 * bande : W) - 0.004, OH = (ancienne ? H - 2 * bande : H) - 0.004;
  if (cadre) {
    // dormant visible, d'un seul bloc, ouvrants ajustés dedans (jeu 1 mm)
    const cf = 0.055, cd = 0.072, z = -0.05 - 0.004;
    dor.add(piece(a, W, cf, cd, 0, H / 2 - cf / 2, z));
    dor.add(piece(a, W, cf, cd, 0, -H / 2 + cf / 2, z));
    dor.add(piece(a, H - 2 * cf + 0.002, cf, cd, -W / 2 + cf / 2, 0, z, true));
    dor.add(piece(a, H - 2 * cf + 0.002, cf, cd, W / 2 - cf / 2, 0, z, true));
    OW = W - 2 * cf - 0.002; OH = H - 2 * cf - 0.002;
  } else {
    const iw = W + ins, ih = H + ins;
    dor.add(piece(a, iw + 2 * fw, fw, 0.073, 0, ih / 2 + fw / 2, dz));
    dor.add(piece(a, iw + 2 * fw, fw, 0.073, 0, -ih / 2 - fw / 2, dz));
    dor.add(piece(a, ih, fw, 0.073, -iw / 2 - fw / 2, 0, dz, true));
    dor.add(piece(a, ih, fw, 0.073, iw / 2 + fw / 2, 0, dz, true));
  }
  const n = type === 'f1' ? 1 : 2, lw = OW / n;
  const sides = n === 1 ? [-1] : [-1, 1];
  sides.forEach(side => {
    const pivot = new THREE.Group(); pivot.position.set(side * OW / 2, 0, -0.05); g.add(pivot);
    const s = new THREE.Group(); s.position.x = -side * lw / 2; pivot.add(s);
    const cadre = new THREE.Group(); s.add(cadre);
    const gauche = n === 1 ? sw : (side < 0 ? sw : meet), droite = n === 1 ? sw : (side < 0 ? meet : sw);
    cadre.add(piece(a, lw, sw, sd, 0, OH / 2 - sw / 2, 0));
    cadre.add(piece(a, lw, bot, sd, 0, -OH / 2 + bot / 2, 0));
    cadre.add(piece(a, OH - sw - bot, gauche, sd, -lw / 2 + gauche / 2, (bot - sw) / 2, 0, true));
    cadre.add(piece(a, OH - sw - bot, droite, sd, lw / 2 - droite / 2, (bot - sw) / 2, 0, true));
    const gl = new THREE.Group(); s.add(gl);
    const vit = new THREE.Mesh(new THREE.BoxGeometry(lw - gauche - droite + 0.02, OH - sw - bot + 0.02, 0.028), mats.verre);
    vit.position.set((gauche - droite) / 2, (bot - sw) / 2, 0); vit.castShadow = false; gl.add(vit);
    const bois = new THREE.Group(); s.add(bois);
    const quinc = new THREE.Group(); s.add(quinc);
    const avecPoignee = n === 1 || side === 1;
    if (avecPoignee) {
      const hx = n === 1 ? lw / 2 - sw / 2 : -lw / 2 + meet / 2, hy = type === 'pf2' ? -OH / 2 + 1.05 : 0;
      const pm = mats.poignee;
      const rose = piece(pm, 0.07, ancienne ? 0.04 : 0.026, 0.012, hx, hy, sd / 2 + 0.006, true); quinc.add(rose);
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16), pm); tige.rotation.x = Math.PI / 2; tige.position.set(hx, hy + 0.012, sd / 2 + 0.02); quinc.add(tige);
      const lev = piece(pm, ancienne ? 0.13 : 0.12, ancienne ? 0.024 : 0.016, 0.014, hx, hy + 0.012 - 0.06, sd / 2 + 0.034, true); quinc.add(lev);
    }
    quinc.traverse(o => { o.castShadow = true; });
    parts.sashes.push({ pivot, s, cadre, gl, bois, quinc, side });
  });
  parts.appui = new THREE.Group(); g.add(parts.appui);
  g.userData = { parts, W, H, lw, sens: 1 };
  return g;
}

// Pièce : mur avec tableau, sol, extérieur lumineux, soleil qui entre par la fenêtre
export function salle(st, { W = 1.25, H = 1.45, allege = 0.9, sol = 0xCFC8BC, mur = 0xEDEBE6 } = {}) {
  const g = new THREE.Group(), ep = 0.28, L = 40, HH = 6;
  const mm = new THREE.MeshStandardMaterial({ color: mur, roughness: 0.95, envMapIntensity: 0.55 });
  const bloc = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, ep), mm); m.position.set(x, y, -ep / 2 + 0.0); m.castShadow = m.receiveShadow = true; g.add(m); };
  const xl = -W / 2, xr = W / 2, yb = allege, yt = allege + H;
  bloc(L / 2 + xl, HH, (-L / 2 + xl) / 2, HH / 2);
  bloc(L / 2 - xr, HH, (xr + L / 2) / 2, HH / 2);
  bloc(W, HH - yt, 0, (yt + HH) / 2);
  if (yb > 0) bloc(W, yb, 0, yb / 2);
  const solM = new THREE.Mesh(new THREE.PlaneGeometry(L, 30), new THREE.MeshStandardMaterial({ color: sol, roughness: 0.7, envMapIntensity: 0.4 }));
  solM.rotation.x = -Math.PI / 2; solM.position.set(0, 0, 15 - ep); solM.receiveShadow = true; g.add(solM);
  // extérieur : ciel pâle et végétation floue
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#CFE0EC'); gr.addColorStop(.55, '#E6EEF0'); gr.addColorStop(.62, '#B9C6AE'); gr.addColorStop(1, '#9FAE93');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const fond = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  fond.position.set(0, 3, -10); g.add(fond);
  // soleil dehors
  st.sun.position.set(-3.2, 4.6, -5.5); st.sun.target.position.set(0.9, 0, 1.9); st.scene.add(st.sun.target);
  st.sun.intensity = 5.5; st.sun.color.set(0xfff0d8);
  Object.assign(st.sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 0.5, far: 40 }); st.sun.shadow.camera.updateProjectionMatrix(); st.sun.shadow.mapSize.set(4096, 4096); if (st.sun.shadow.map) { st.sun.shadow.map.dispose(); st.sun.shadow.map = null; }
  st.sun.shadow.radius = 3; st.sol.visible = false;
  const fill = new THREE.HemisphereLight(0xf6f7fa, 0xe0d8ca, 0.55); g.add(fill); st.renderer.toneMappingExposure = 1.12;
  return g;
}
export function jeuFin(key, renderer) {
  const alu = woodMat(key, 1, renderer);
  return { alu, verre: verre(), poignee: alu };
}
