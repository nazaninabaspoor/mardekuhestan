"use client";

import { ContactShadows, PerspectiveCamera, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  PlaneGeometry,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type SpotLight as SpotLightImpl,
  type Texture,
} from "three";

import { UNVEIL_SLOT_X, type UnveilManState } from "./v2-unveil-shared";

const WALK_SRCS = [
  "/brand/v2/walk-r-contact.png",
  "/brand/v2/walk-r-passing.png",
  "/brand/v2/walk-l-contact.png",
  "/brand/v2/walk-l-passing.png",
];
const STAND_SRC = "/brand/profile/soon-mountain-man-stand.png";
const MAN_Z = -0.88;
const PEDESTAL_Z = 0.92;
const WALK_SPEED = 0.58;
const HOLD_TIME = 2.2;
const CYCLE_LEN = 1.48;
const WINDUP = 0.42;
const WALK_CELL_W = 900;
const WALK_CELL_H = 2000;
const WALK_ASPECT = WALK_CELL_W / WALK_CELL_H;
const WALK_HEIGHT = 2.58;

type SceneRefs = {
  cloth: MutableRefObject<number[]>;
  man: MutableRefObject<UnveilManState>;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function keyStudioBackground(data: Uint8ClampedArray, w: number, h: number) {
  const n = w * h;
  const body = new Uint8Array(n);
  let hasCutout = false;
  for (let i = 0; i < n; i += 1) {
    if (data[i * 4 + 3] < 250) hasCutout = true;
  }

  for (let i = 0; i < n; i += 1) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const maxc = Math.max(r, g, b);
    const chroma = maxc - Math.min(r, g, b);
    if (maxc >= 16 || chroma >= 10 || (hasCutout && data[o + 3] > 40)) body[i] = 1;
  }

  const outside = new Uint8Array(n);
  const stack: number[] = [];
  const seedOut = (idx: number) => {
    if (idx < 0 || idx >= n || outside[idx] || body[idx]) return;
    outside[idx] = 1;
    stack.push(idx);
  };
  for (let x = 0; x < w; x += 1) {
    seedOut(x);
    seedOut((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    seedOut(y * w);
    seedOut(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    if (x > 0) seedOut(i - 1);
    if (x + 1 < w) seedOut(i + 1);
    if (i >= w) seedOut(i - w);
    if (i + w < n) seedOut(i + w);
  }
  for (let i = 0; i < n; i += 1) {
    if (!outside[i]) body[i] = 1;
  }

  const labels = new Int32Array(n);
  let best = 0;
  let bestSize = 0;
  let label = 0;
  for (let i = 0; i < n; i += 1) {
    if (!body[i] || labels[i]) continue;
    label += 1;
    let size = 0;
    stack.length = 0;
    stack.push(i);
    labels[i] = label;
    while (stack.length) {
      const j = stack.pop()!;
      size += 1;
      const x = j % w;
      const next = [x > 0 ? j - 1 : -1, x + 1 < w ? j + 1 : -1, j >= w ? j - w : -1, j + w < n ? j + w : -1];
      for (const nb of next) {
        if (nb < 0 || !body[nb] || labels[nb]) continue;
        labels[nb] = label;
        stack.push(nb);
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = label;
    }
  }
  for (let i = 0; i < n; i += 1) {
    body[i] = labels[i] === best ? 1 : 0;
  }

  const canGrow = (idx: number) => {
    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const maxc = Math.max(r, g, b);
    const chroma = maxc - Math.min(r, g, b);
    if (hasCutout && data[o + 3] === 0) return false;
    if (maxc < 8) return false;
    return maxc < 42 || chroma >= 6;
  };

  const footY = Math.floor(h * 0.72);
  for (let pass = 0; pass < 12; pass += 1) {
    const next = Uint8Array.from(body);
    for (let y = Math.max(1, footY); y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = y * w + x;
        if (body[i] || !body[i - w] || !canGrow(i)) continue;
        next[i] = 1;
      }
    }
    body.set(next);
  }

  const soleY = Math.floor(h * 0.8);
  for (let pass = 0; pass < 5; pass += 1) {
    const next = Uint8Array.from(body);
    for (let y = soleY; y < h; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        if (body[i] || !(body[i - 1] || body[i + 1]) || !canGrow(i)) continue;
        next[i] = 1;
      }
    }
    body.set(next);
  }

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      if (body[i]) continue;
      let fg = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          if (body[(y + dy) * w + (x + dx)]) fg += 1;
        }
      }
      if (fg >= 6) body[i] = 1;
    }
  }

  const peeled = Uint8Array.from(body);
  const floorY = Math.floor(h * 0.93);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      if (!body[i]) continue;
      if (body[i - 1] && body[i + 1] && body[i - w] && body[i + w]) continue;
      const o = i * 4;
      const maxc = Math.max(data[o], data[o + 1], data[o + 2]);
      const chroma = maxc - Math.min(data[o], data[o + 1], data[o + 2]);
      const soleUnderBody = y >= floorY && body[i - w] && maxc < 18;
      if (soleUnderBody) continue;
      if (maxc < 20 && chroma < 11) peeled[i] = 0;
    }
  }
  body.set(peeled);

  for (let i = 0; i < n; i += 1) {
    data[i * 4 + 3] = body[i] ? 255 : 0;
  }
}

function walkFrameAt(phase: number) {
  const t = ((phase % 1) + 1) % 1;
  if (t < 0.4) return 0;
  if (t < 0.5) return 1;
  if (t < 0.9) return 2;
  return 3;
}

function opaqueImageData(source: Texture) {
  const image = source.image as HTMLImageElement | ImageBitmap | HTMLCanvasElement | undefined;
  if (!image || !("width" in image) || !image.width) return null;

  const src = document.createElement("canvas");
  src.width = image.width;
  src.height = image.height;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image as CanvasImageSource, 0, 0);
  const pixels = ctx.getImageData(0, 0, src.width, src.height);
  keyStudioBackground(pixels.data, src.width, src.height);
  ctx.putImageData(pixels, 0, 0);
  return { canvas: src, data: pixels.data, w: src.width, h: src.height };
}

function feetBaseline(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = h - 1; y >= 0; y -= 1) {
    let hits = 0;
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 48) hits += 1;
    }
    if (hits > w * 0.035) return y;
  }
  return h - 1;
}

function headTop(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y += 1) {
    let hits = 0;
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 48) hits += 1;
    }
    if (hits > w * 0.02) return y;
  }
  return 0;
}

function makeWalkTexture(canvas: HTMLCanvasElement) {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.generateMipmaps = true;
  map.minFilter = LinearMipmapLinearFilter;
  map.magFilter = LinearFilter;
  map.anisotropy = 16;
  map.needsUpdate = true;
  return map;
}

function normalizeWalkCycle(sources: Texture[]) {
  const prepared = sources.map((source) => opaqueImageData(source)).filter(Boolean) as {
    canvas: HTMLCanvasElement;
    data: Uint8ClampedArray;
    w: number;
    h: number;
  }[];
  if (prepared.length !== sources.length) return sources;

  const metrics = prepared.map((item) => {
    const feet = feetBaseline(item.data, item.w, item.h);
    const head = headTop(item.data, item.w, item.h);
    let minX = item.w;
    let maxX = 0;
    for (let y = head; y <= feet; y += 1) {
      for (let x = 0; x < item.w; x += 1) {
        if (item.data[(y * item.w + x) * 4 + 3] < 20) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    return { feet, head, minX, maxX, height: Math.max(1, feet - head) };
  });

  const bodyH = Math.max(...metrics.map((item) => item.height));
  const fit = (WALK_CELL_H - 140) / bodyH;
  const ground = WALK_CELL_H - 56;

  return prepared.map((item, index) => {
    const m = metrics[index];
    const cell = document.createElement("canvas");
    cell.width = WALK_CELL_W;
    cell.height = WALK_CELL_H;
    const ctx = cell.getContext("2d");
    if (!ctx) return makeWalkTexture(item.canvas);
    const drawW = item.w * fit;
    const cx = (m.minX + m.maxX) / 2;
    const dx = WALK_CELL_W / 2 - cx * fit;
    const dy = ground - m.feet * fit;
    ctx.clearRect(0, 0, WALK_CELL_W, WALK_CELL_H);
    ctx.drawImage(item.canvas, 0, 0, item.w, item.h, dx, dy, drawW, item.h * fit);
    return makeWalkTexture(cell);
  });
}

function knockoutAndCrop(source: Texture) {
  const image = source.image as HTMLImageElement | ImageBitmap | HTMLCanvasElement | undefined;
  if (!image || !("width" in image) || !image.width) return source;

  const src = document.createElement("canvas");
  src.width = image.width;
  src.height = image.height;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;

  ctx.drawImage(image as CanvasImageSource, 0, 0);
  const pixels = ctx.getImageData(0, 0, src.width, src.height);
  const data = pixels.data;
  const w = src.width;
  const h = src.height;
  keyStudioBackground(data, w, h);

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] < 12) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  minX = Math.max(0, minX - 18);
  minY = Math.max(0, minY - 18);
  maxX = Math.min(w - 1, maxX + 18);
  maxY = Math.min(h - 1, maxY + 36);
  const cw = Math.max(1, maxX - minX + 1);
  const ch = Math.max(1, maxY - minY + 1);
  const cropped = document.createElement("canvas");
  cropped.width = cw;
  cropped.height = ch;
  const cut = cropped.getContext("2d");
  if (!cut) return source;
  ctx.putImageData(pixels, 0, 0);
  cut.drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);

  const map = new CanvasTexture(cropped);
  map.colorSpace = SRGBColorSpace;
  map.generateMipmaps = true;
  map.minFilter = LinearMipmapLinearFilter;
  map.magFilter = LinearFilter;
  map.anisotropy = 16;
  map.needsUpdate = true;
  return map;
}

function useKnockoutTexture(src: string) {
  const loaded = useTexture(src);
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    loaded.colorSpace = SRGBColorSpace;
    setMap(knockoutAndCrop(loaded));
  }, [loaded]);
  return map;
}

function useWalkCycleTextures(srcs: string[]) {
  const loaded = useTexture(srcs);
  const [maps, setMaps] = useState<Texture[] | null>(null);
  useEffect(() => {
    const list = (Array.isArray(loaded) ? loaded : [loaded]) as Texture[];
    list.forEach((tex) => {
      tex.colorSpace = SRGBColorSpace;
    });
    setMaps(normalizeWalkCycle(list));
  }, [loaded]);
  return maps;
}

function slotX(slot: number) {
  return UNVEIL_SLOT_X[slot];
}

function makeLinenMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#e9dfcf";
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? "rgba(244, 240, 232, 0.35)" : "rgba(210, 196, 172, 0.18)";
    ctx.fillRect(0, y, size, 1);
  }
  for (let x = 0; x < size; x += 3) {
    ctx.fillStyle = "rgba(0, 91, 72, 0.035)";
    ctx.fillRect(x, 0, 1, size);
  }

  for (let i = 0; i < 1400; i += 1) {
    const seed = (i * 1103515245 + 12345) >>> 0;
    const px = (seed % size);
    const py = ((seed * 16807) >>> 8) % size;
    ctx.fillStyle = seed & 1 ? "rgba(144, 56, 40, 0.05)" : "rgba(29, 29, 27, 0.04)";
    ctx.fillRect(px, py, 1.2, 1.2);
  }

  const hem = 22;
  ctx.strokeStyle = "#005B48";
  ctx.lineWidth = 7;
  ctx.strokeRect(hem, hem, size - hem * 2, size - hem * 2);
  ctx.strokeStyle = "#d4a359";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(hem + 8, hem + 8, size - hem * 2 - 16, size - hem * 2 - 16);

  ctx.fillStyle = "#d4a359";
  ctx.beginPath();
  ctx.moveTo(size - 58, size - 42);
  ctx.lineTo(size - 42, size - 70);
  ctx.lineTo(size - 26, size - 42);
  ctx.closePath();
  ctx.fill();

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  map.needsUpdate = true;
  return map;
}

function createDrapeGeometry() {
  const geo = new PlaneGeometry(0.82, 0.82, 28, 28);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const r = Math.hypot(vx, vz);
    const mound = Math.max(0, 0.13 * (1 - (r / 0.24) ** 2));
    const hang = r > 0.33 ? -(r - 0.33) * 1.15 : 0;
    const wrinkle = Math.sin(vx * 17 + vz * 4.2) * 0.01 + Math.sin(vz * 15 - vx * 5) * 0.008;
    pos.setY(i, mound + hang + wrinkle);
  }
  geo.userData.rest = Float32Array.from(pos.array);
  geo.computeVertexNormals();
  return geo;
}

function Cloth({
  x,
  index,
  cloth,
}: {
  x: number;
  index: number;
  cloth: MutableRefObject<number[]>;
}) {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => createDrapeGeometry(), []);
  const linen = useMemo(() => makeLinenMap(), []);
  const slide = index % 2 === 0 ? 1 : -1;

  useFrame(({ clock }) => {
    const progress = cloth.current[index] ?? 0;
    const rest = geometry.userData.rest as Float32Array;
    const pos = geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const time = clock.elapsedTime;
    const lift = progress * progress * (3 - 2 * progress);
    const keep = 1 - lift;

    for (let i = 0; i < pos.count; i += 1) {
      const ox = rest[i * 3];
      const oy = rest[i * 3 + 1];
      const oz = rest[i * 3 + 2];
      const wave = Math.sin(ox * 9 + time * 1.4 + index) * 0.006 * keep;
      arr[i * 3] = ox + lift * (0.28 * slide + ox * 0.35);
      arr[i * 3 + 1] = oy * keep + lift * (0.22 + Math.abs(ox) * 0.18) + wave;
      arr[i * 3 + 2] = oz - lift * 0.32 + wave * 0.4;
    }

    pos.needsUpdate = true;
    if (lift > 0.002) geometry.computeVertexNormals();
    if (!mesh.current) return;
    mesh.current.visible = progress < 0.94;
    const material = mesh.current.material as MeshBasicMaterial & { opacity: number };
    material.opacity = 1 - smoothstep(0.62, 0.94, progress);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[x, 1.22, PEDESTAL_Z]}
      rotation={[0, 0.06 * slide, 0]}
      castShadow
      renderOrder={3}
    >
      <meshStandardMaterial
        map={linen}
        color="#f4f0e8"
        roughness={0.86}
        metalness={0.04}
        side={DoubleSide}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function Pedestal({ x, index, man }: { x: number; index: number; man: MutableRefObject<UnveilManState> }) {
  const spot = useRef<SpotLightImpl>(null);

  useFrame(() => {
    if (!spot.current) return;
    const here = !man.current.walking && man.current.slot === index;
    spot.current.intensity = here ? 26 : 11;
    spot.current.lookAt(x, 1.12, PEDESTAL_Z);
  });

  return (
    <group position={[x, 0, PEDESTAL_Z]} renderOrder={2}>
      <spotLight
        ref={spot}
        position={[0, 4.6, 1.9]}
        color="#d4a359"
        angle={0.28}
        penumbra={0.8}
        distance={12}
        decay={1.35}
      />
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.54, 0.58, 0.16, 8]} />
        <meshStandardMaterial color="#005040" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.028, 10, 32]} />
        <meshStandardMaterial color="#d4a359" roughness={0.22} metalness={0.72} emissive="#d4a359" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.1, 8]} />
        <meshStandardMaterial color="#903828" roughness={0.62} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.74, 8]} />
        <meshStandardMaterial color="#005B48" roughness={0.36} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.62, 0.4]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.13, 0.24, 3]} />
        <meshStandardMaterial color="#d4a359" roughness={0.28} metalness={0.68} />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.4, 0.36, 0.08, 8]} />
        <meshStandardMaterial color="#F4F0E8" roughness={0.48} metalness={0.06} />
      </mesh>
      <mesh position={[0, 1.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.022, 10, 40]} />
        <meshStandardMaterial color="#d4a359" roughness={0.24} metalness={0.7} emissive="#d4a359" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 1.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.39, 0.39, 0.07, 48]} />
        <meshStandardMaterial color="#e7dfcf" roughness={0.28} metalness={0.18} />
      </mesh>
    </group>
  );
}

function MountainMan({
  man,
  cloth,
  active,
}: {
  man: MutableRefObject<UnveilManState>;
  cloth: MutableRefObject<number[]>;
  active: boolean;
}) {
  const walks = useWalkCycleTextures(WALK_SRCS);
  const stand = useKnockoutTexture(STAND_SRC);
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const frameRef = useRef(-1);
  const walkGeo = useMemo(() => {
    const geo = new PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!group.current || !mesh.current || !walks || !stand) return;
    const dt = Math.min(delta, 1 / 24);
    const state = man.current;
    const last = UNVEIL_SLOT_X.length - 1;

    if (active) {
      if (state.hold > 0) {
        state.walking = false;
        state.accel = 0;
        state.x = slotX(state.slot);
        state.hold -= dt;
        cloth.current[state.slot] = Math.min(1, cloth.current[state.slot] + dt * 0.72);
        if (state.hold <= 0) {
          if (state.dir === 1 && state.slot >= last) {
            state.dir = -1;
            state.slot = last - 1;
          } else if (state.dir === -1 && state.slot <= 0) {
            state.dir = 1;
            state.slot = 1;
          } else {
            state.slot += state.dir;
          }
          state.facing = state.dir;
          state.windup = WINDUP;
        }
      } else if (state.windup > 0) {
        const target = slotX(state.slot);
        state.facing = target >= state.x ? 1 : -1;
        state.walking = false;
        state.accel = 0;
        state.windup -= dt;
      } else {
        const target = slotX(state.slot);
        const dist = Math.abs(target - state.x);
        state.facing = target >= state.x ? 1 : -1;
        const cruise = WALK_SPEED * (0.32 + 0.68 * smoothstep(0.05, 1.0, dist));
        const step = Math.min(dist, cruise * dt);
        if (dist <= 0.06) {
          state.x = target;
          state.walking = false;
          state.accel = 0;
          state.hold = HOLD_TIME;
          state.windup = 0;
        } else {
          state.walking = true;
          state.accel = cruise / WALK_SPEED;
          state.x += state.facing * step;
          state.stride += step;
        }
      }
    }

    const presenting = state.hold > 0.38 && state.hold < HOLD_TIME - 0.42;
    const cycling = state.walking;
    const phase = (((state.stride / CYCLE_LEN) % 1) + 1) % 1;
    const frame = cycling ? walkFrameAt(phase) : 0;
    const map = presenting ? stand : walks[frame];
    const image = map.image as { width: number; height: number };
    const standAspect = image?.width && image?.height ? image.width / image.height : 0.4;
    const height = presenting ? 2.62 : WALK_HEIGHT;
    const aspect = presenting ? standAspect : WALK_ASPECT;
    const bob = cycling ? -Math.cos(phase * Math.PI * 4) * 0.01 : 0;
    const flip = presenting ? 1 : state.facing;
    const visualKey = presenting ? -1 : frame;

    const material = mesh.current.material as MeshBasicMaterial;
    if (frameRef.current !== visualKey) {
      material.map = map;
      material.needsUpdate = true;
      frameRef.current = visualKey;
    }

    group.current.position.set(state.x, bob, MAN_Z);
    mesh.current.scale.set(height * aspect * flip, height, 1);
    mesh.current.position.set(0, 0, 0);
    material.opacity = 1;
    mesh.current.visible = true;
  });

  if (!walks || !stand) return null;

  return (
    <group ref={group} position={[man.current.x, 0, MAN_Z]}>
      <mesh ref={mesh} geometry={walkGeo} renderOrder={0}>
        <meshBasicMaterial
          map={stand}
          transparent
          depthTest
          depthWrite={false}
          toneMapped={false}
          opacity={1}
        />
      </mesh>
    </group>
  );
}

function Hall() {
  return (
    <>
      <hemisphereLight color="#7ea58f" groundColor="#1a241c" intensity={0.55} />
      <ambientLight color="#005B48" intensity={0.42} />
      <directionalLight position={[3.4, 6.8, 4.2]} intensity={1.05} color="#ffe1a8" castShadow />
      <directionalLight position={[-5.2, 2.8, 1.6]} intensity={0.25} color="#50AF47" />
    </>
  );
}

function World({ cloth, man, active }: SceneRefs & { active: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.55, 6.7]} fov={32} near={0.1} far={42} />
      <Hall />
      <MountainMan man={man} cloth={cloth} active={active} />
      {UNVEIL_SLOT_X.map((x, index) => (
        <Pedestal key={`p-${x}`} x={x} index={index} man={man} />
      ))}
      {UNVEIL_SLOT_X.map((x, index) => (
        <Cloth key={`c-${x}`} x={x} index={index} cloth={cloth} />
      ))}
      <ContactShadows position={[0, 0.012, 0.35]} opacity={0.38} scale={14} blur={2.2} far={5} color="#05140f" />
    </>
  );
}

export function V2UnveilCanvas({ cloth, man, active = true }: SceneRefs & { active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#063a2c", 0);
        gl.toneMappingExposure = 1.12;
      }}
    >
      <Suspense fallback={null}>
        <World cloth={cloth} man={man} active={active} />
      </Suspense>
    </Canvas>
  );
}
