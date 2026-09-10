"use client";

import { ContactShadows, Html, PerspectiveCamera, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type SpotLight as SpotLightImpl,
  type Texture,
} from "three";

import { useAuth } from "@/lib/auth-context";

import {
  UNVEIL_CAM_Z,
  UNVEIL_MAN_Z,
  UNVEIL_PEDESTAL_Z,
  UNVEIL_FUTURE_PRODUCTS,
  UNVEIL_SLOT_X,
  manSlotX,
  type UnveilManState,
} from "./v2-unveil-shared";
import styles from "./v2-unveil-section.module.css";

const WALK_SRCS = [
  "/brand/v2/walk-r-contact.png",
  "/brand/v2/walk-r-passing.png",
  "/brand/v2/walk-l-contact.png",
  "/brand/v2/walk-l-passing.png",
];
const STAND_SRC = "/brand/profile/soon-mountain-man-stand.png";
const FACTORY_SRC = "/brand/v2/pedestal-factory.png";
const BOX_SRC = "/brand/v2/unveil-open-crate.png";
const PRODUCT_SRCS = UNVEIL_FUTURE_PRODUCTS.map((item) => item.src);
const WATCH_KEY = "mk-unveil-watch";
const FACTORY_ASPECT = 3 / 4;
const SHAFT_HEIGHT = 0.74;
const SHAFT_RADIUS_TOP = 0.34;
const SHAFT_RADIUS_BOT = 0.42;
const SHAFT_RADIUS_MID = (SHAFT_RADIUS_TOP + SHAFT_RADIUS_BOT) / 2;
const FACTORY_WRAP_X = (Math.PI * 2 * SHAFT_RADIUS_MID) / (FACTORY_ASPECT * SHAFT_HEIGHT);
const PEDESTAL_TOP_Y = 1.186;
const PEDESTAL_SETS: Array<Array<{ sku: number; x: number; z: number; scale: number; sink: number }>> = [
  [
    { sku: 0, x: -0.08, z: 0.1, scale: 1, sink: 0.058 },
    { sku: 0, x: 0.08, z: 0.04, scale: 0.88, sink: 0.052 },
  ],
  [
    { sku: 1, x: -0.09, z: 0.1, scale: 1, sink: 0.02 },
    { sku: 1, x: 0.09, z: 0.06, scale: 0.9, sink: 0.018 },
    { sku: 1, x: 0.0, z: 0.0, scale: 0.8, sink: 0.016 },
  ],
  [
    { sku: 2, x: -0.08, z: 0.1, scale: 1, sink: 0.02 },
    { sku: 2, x: 0.09, z: 0.06, scale: 0.9, sink: 0.018 },
    { sku: 2, x: 0.0, z: 0.0, scale: 0.82, sink: 0.016 },
  ],
  [
    { sku: 3, x: -0.09, z: 0.1, scale: 1, sink: 0.02 },
    { sku: 3, x: 0.09, z: 0.06, scale: 0.9, sink: 0.018 },
    { sku: 3, x: 0.0, z: 0.0, scale: 0.8, sink: 0.016 },
  ],
  [
    { sku: 4, x: -0.09, z: 0.1, scale: 1, sink: 0.02 },
    { sku: 4, x: 0.09, z: 0.06, scale: 0.9, sink: 0.018 },
    { sku: 4, x: 0.0, z: 0.0, scale: 0.82, sink: 0.016 },
  ],
];
const MAN_Z = UNVEIL_MAN_Z;
const PEDESTAL_Z = UNVEIL_PEDESTAL_Z;
const WALK_HEIGHT = 2.58;
/** Face height; cloud sits a few centimeters to the man's right. */
const MAN_HEAD_Y = 2.38;
const TALK_RIGHT_X = 0;
const STEP_RATIO = 0.543;
const DISTANCE_PER_CYCLE = WALK_HEIGHT * STEP_RATIO * 2;
const CYCLE_SECONDS = 1.32;
const WALK_SPEED = DISTANCE_PER_CYCLE / CYCLE_SECONDS;
const STEP_DIST = DISTANCE_PER_CYCLE / 2;
const CONTACT_TIME = 0.12;
const ARRIVE_PLANT = 2 / 60;
const ARRIVE_QUARTER = 2 / 60;
const ARRIVE_ALMOST = 2 / 60;
const ARRIVE_SUM = ARRIVE_PLANT + ARRIVE_QUARTER + ARRIVE_ALMOST;
const PRESENT_TIME = 4.2;
const LEAVE_ALMOST = 2 / 60;
const LEAVE_QUARTER = 2 / 60;
const LEAVE_PLANT = 2 / 60;
const LEAVE_SUM = LEAVE_ALMOST + LEAVE_QUARTER + LEAVE_PLANT;
const HOLD_TIME = ARRIVE_SUM + PRESENT_TIME + LEAVE_SUM;
const PLANT_SRC = "/brand/v2/stop-profile-gather.png";
const QUARTER_SRC = "/brand/v2/stop-three-quarter.png";
const ALMOST_SRC = "/brand/v2/stop-almost-front.png";
const WALK_CELL_W = 1600;
const WALK_CELL_H = 2000;
const WALK_ASPECT = WALK_CELL_W / WALK_CELL_H;
const POSE_SRCS = [...WALK_SRCS, PLANT_SRC, QUARTER_SRC, ALMOST_SRC, STAND_SRC];
const POSE_KINDS: Array<"walk" | "stand"> = ["walk", "walk", "walk", "walk", "stand", "stand", "stand", "stand"];
const POSE_BLEND = 2;

type SceneRefs = {
  cloth: MutableRefObject<number[]>;
  man: MutableRefObject<UnveilManState>;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function inWristBand(x: number, y: number, w: number, h: number) {
  const y0 = Math.floor(h * 0.36);
  const y1 = Math.floor(h * 0.64);
  const xBand = Math.floor(w * 0.24);
  return y >= y0 && y < y1 && (x <= xBand || x >= w - xBand);
}

function morphDilate(body: Uint8Array, w: number, h: number, roiOnly: boolean) {
  const next = Uint8Array.from(body);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      if (roiOnly && !inWristBand(x, y, w, h)) continue;
      const i = y * w + x;
      if (body[i]) continue;
      if (body[i - 1] || body[i + 1] || body[i - w] || body[i + w]) next[i] = 1;
    }
  }
  body.set(next);
}

function morphErode(body: Uint8Array, w: number, h: number, roiOnly: boolean) {
  const next = Uint8Array.from(body);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      if (roiOnly && !inWristBand(x, y, w, h)) continue;
      const i = y * w + x;
      if (!body[i]) continue;
      if (!body[i - 1] || !body[i + 1] || !body[i - w] || !body[i + w]) next[i] = 0;
    }
  }
  body.set(next);
}

function floodOutside(body: Uint8Array, w: number, h: number) {
  const n = w * h;
  const outside = new Uint8Array(n);
  const stack: number[] = [];
  const seed = (idx: number) => {
    if (idx < 0 || idx >= n || outside[idx] || body[idx]) return;
    outside[idx] = 1;
    stack.push(idx);
  };
  for (let x = 0; x < w; x += 1) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    if (x > 0) seed(i - 1);
    if (x + 1 < w) seed(i + 1);
    if (i >= w) seed(i - w);
    if (i + w < n) seed(i + w);
  }
  return outside;
}

function fillSmallHoles(body: Uint8Array, outside: Uint8Array, w: number, h: number, maxSize: number) {
  const n = w * h;
  const seen = new Uint8Array(n);
  const stack: number[] = [];
  for (let i = 0; i < n; i += 1) {
    if (body[i] || outside[i] || seen[i]) continue;
    stack.length = 0;
    const cells: number[] = [];
    seen[i] = 1;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop()!;
      cells.push(j);
      const x = j % w;
      const next = [x > 0 ? j - 1 : -1, x + 1 < w ? j + 1 : -1, j >= w ? j - w : -1, j + w < n ? j + w : -1];
      for (const nb of next) {
        if (nb < 0 || body[nb] || outside[nb] || seen[nb]) continue;
        seen[nb] = 1;
        stack.push(nb);
      }
    }
    if (cells.length > maxSize) continue;
    for (const j of cells) body[j] = 1;
  }
}

function keepBodyIslands(body: Uint8Array, w: number, h: number, minSize: number) {
  const n = w * h;
  const labels = new Int32Array(n);
  const sizes: number[] = [0];
  const stack: number[] = [];
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
    sizes[label] = size;
  }
  for (let i = 0; i < n; i += 1) {
    body[i] = sizes[labels[i]] >= minSize ? 1 : 0;
  }
}

function applyCutout(data: Uint8ClampedArray, body: Uint8Array, w: number, h: number) {
  const n = w * h;
  const bleed = new Uint8Array(n * 3);
  const colored = Uint8Array.from(body);
  for (let i = 0; i < n; i += 1) {
    const o = i * 4;
    bleed[i * 3] = data[o];
    bleed[i * 3 + 1] = data[o + 1];
    bleed[i * 3 + 2] = data[o + 2];
  }
  for (let pass = 0; pass < 2; pass += 1) {
    const next = Uint8Array.from(bleed);
    const nextColored = Uint8Array.from(colored);
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        if (colored[i]) continue;
        const nbs = [i - 1, i + 1, i - w, i + w];
        let src = -1;
        for (const nb of nbs) {
          if (colored[nb]) {
            src = nb;
            break;
          }
        }
        if (src < 0) continue;
        next[i * 3] = bleed[src * 3];
        next[i * 3 + 1] = bleed[src * 3 + 1];
        next[i * 3 + 2] = bleed[src * 3 + 2];
        nextColored[i] = 1;
      }
    }
    bleed.set(next);
    colored.set(nextColored);
  }
  for (let i = 0; i < n; i += 1) {
    const o = i * 4;
    if (body[i]) {
      data[o + 3] = 255;
      continue;
    }
    data[o] = bleed[i * 3];
    data[o + 1] = bleed[i * 3 + 1];
    data[o + 2] = bleed[i * 3 + 2];
    data[o + 3] = 0;
  }
}

function keyStudioBackground(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  kind: "walk" | "stand" = "walk",
) {
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
    if (maxc >= 20 || chroma >= 12 || (hasCutout && data[o + 3] > 40)) body[i] = 1;
  }

  const outside = floodOutside(body, w, h);
  fillSmallHoles(body, outside, w, h, kind === "stand" ? 700 : 2400);

  if (kind === "stand") {
    for (let pass = 0; pass < 4; pass += 1) morphDilate(body, w, h, false);
    for (let pass = 0; pass < 4; pass += 1) morphErode(body, w, h, false);
  } else {
    for (let pass = 0; pass < 14; pass += 1) morphDilate(body, w, h, true);
    for (let pass = 0; pass < 14; pass += 1) morphErode(body, w, h, true);
  }

  keepBodyIslands(body, w, h, Math.max(140, Math.floor(n * 0.00045)));

  if (kind === "stand") {
    const rim = floodOutside(body, w, h);
    const peeled = Uint8Array.from(body);
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        if (!body[i]) continue;
        if (!(rim[i - 1] || rim[i + 1] || rim[i - w] || rim[i + w])) continue;
        const o = i * 4;
        const maxc = Math.max(data[o], data[o + 1], data[o + 2]);
        const chroma = maxc - Math.min(data[o], data[o + 1], data[o + 2]);
        if (maxc < 28 && chroma < 14) peeled[i] = 0;
      }
    }
    body.set(peeled);
  }

  const canGrow = (idx: number) => {
    const o = idx * 4;
    const maxc = Math.max(data[o], data[o + 1], data[o + 2]);
    const chroma = maxc - Math.min(data[o], data[o + 1], data[o + 2]);
    if (hasCutout && data[o + 3] === 0) return false;
    return maxc < 36 || chroma >= 8;
  };

  const footY = Math.floor(h * 0.78);
  if (kind === "walk") {
    for (let pass = 0; pass < 8; pass += 1) {
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
  }

  if (kind === "walk") {
    const peeled = Uint8Array.from(body);
    const handLeft = Math.floor(w * 0.22);
    const handRight = Math.ceil(w * 0.78);
    const handTop = Math.floor(h * 0.28);
    const handBot = Math.floor(h * 0.68);
    const footBand = Math.floor(h * 0.82);
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        if (!body[i]) continue;
        if (body[i - 1] && body[i + 1] && body[i - w] && body[i + w]) continue;
        if (y >= footBand) continue;
        if ((x <= handLeft || x >= handRight) && y >= handTop && y <= handBot) continue;
        const o = i * 4;
        const maxc = Math.max(data[o], data[o + 1], data[o + 2]);
        const chroma = maxc - Math.min(data[o], data[o + 1], data[o + 2]);
        if (maxc < 24 && chroma < 12) peeled[i] = 0;
      }
    }
    body.set(peeled);
  }

  applyCutout(data, body, w, h);
}

function opaqueImageData(source: Texture, kind: "walk" | "stand" = "walk") {
  const image = source.image as HTMLImageElement | ImageBitmap | HTMLCanvasElement | undefined;
  if (!image || !("width" in image) || !image.width) return null;

  const src = document.createElement("canvas");
  src.width = image.width;
  src.height = image.height;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image as CanvasImageSource, 0, 0);
  const pixels = ctx.getImageData(0, 0, src.width, src.height);
  keyStudioBackground(pixels.data, src.width, src.height, kind);
  ctx.putImageData(pixels, 0, 0);
  return { canvas: src, data: pixels.data, w: src.width, h: src.height };
}

function feetBaseline(data: Uint8ClampedArray, w: number, h: number, minAlpha = 180) {
  const need = Math.max(8, Math.floor(w * 0.03));
  for (let y = h - 1; y >= 0; y -= 1) {
    let hits = 0;
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > minAlpha) hits += 1;
    }
    if (hits > need) return y;
  }
  return h - 1;
}

function headTop(data: Uint8ClampedArray, w: number, h: number, minAlpha = 48) {
  const need = Math.max(4, Math.floor(w * 0.016));
  for (let y = 0; y < h; y += 1) {
    let hits = 0;
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > minAlpha) hits += 1;
    }
    if (hits > need) return y;
  }
  return 0;
}

function makeWalkTexture(canvas: HTMLCanvasElement) {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.generateMipmaps = false;
  map.minFilter = LinearFilter;
  map.magFilter = LinearFilter;
  map.anisotropy = 4;
  map.needsUpdate = true;
  return map;
}

function isMatteBackground(r: number, g: number, b: number, a: number) {
  if (a < 20) return true;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (g > 148 && g > r + 32 && g > b + 32) return true;
  if (r > 242 && g > 242 && b > 242) return true;
  if (chroma < 14 && lum > 168) {
    if (r - b > 16 && r > 198) return false;
    return true;
  }
  return false;
}

function packProductSprite(source: Texture) {
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
  const n = w * h;

  const seen = new Uint8Array(n);
  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const o = i * 4;
    if (!isMatteBackground(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    seen[i] = 1;
    queue.push(i);
  };
  for (let x = 0; x < w; x += 1) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y += 1) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }
  while (queue.length) {
    const i = queue.pop() as number;
    const x = i % w;
    const y = (i / w) | 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
  for (let i = 0; i < n; i += 1) {
    if (!seen[i]) continue;
    data[i * 4 + 3] = 0;
  }

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] < 28) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) {
    ctx.putImageData(pixels, 0, 0);
    return makeWalkTexture(src);
  }

  const need = Math.max(8, Math.floor((maxX - minX) * 0.08));
  for (let y = maxY; y >= minY; y -= 1) {
    let hits = 0;
    for (let x = minX; x <= maxX; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 150) hits += 1;
    }
    if (hits > need) {
      maxY = y;
      break;
    }
  }

  const pad = 1;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const crop = document.createElement("canvas");
  crop.width = cropW;
  crop.height = cropH;
  const cropCtx = crop.getContext("2d");
  if (!cropCtx) {
    ctx.putImageData(pixels, 0, 0);
    return makeWalkTexture(src);
  }
  ctx.putImageData(pixels, 0, 0);
  cropCtx.drawImage(src, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  const map = makeWalkTexture(crop);
  map.userData.aspect = cropW / cropH;
  return map;
}

function normalizeWalkCycle(sources: Texture[], kinds?: Array<"walk" | "stand">) {
  const prepared = sources
    .map((source, index) => opaqueImageData(source, kinds?.[index] ?? "walk"))
    .filter(Boolean) as {
    canvas: HTMLCanvasElement;
    data: Uint8ClampedArray;
    w: number;
    h: number;
  }[];
  if (prepared.length !== sources.length) return sources;

  const metrics = prepared.map((item, index) => {
    const standLike = (kinds?.[index] ?? "walk") === "stand";
    let feet = feetBaseline(item.data, item.w, item.h, standLike ? 170 : 180);
    let head = headTop(item.data, item.w, item.h, standLike ? 36 : 48);
    const rawH = Math.max(1, feet - head);
    const inset = standLike ? Math.max(2, Math.round(rawH * 0.006)) : 0;
    head += inset;
    feet -= inset;
    let minX = item.w;
    let maxX = 0;
    let hipX = 0;
    let hipN = 0;
    const hipY0 = head + Math.floor((feet - head) * 0.22);
    const hipY1 = head + Math.floor((feet - head) * 0.5);
    for (let y = head; y <= feet; y += 1) {
      for (let x = 0; x < item.w; x += 1) {
        if (item.data[(y * item.w + x) * 4 + 3] < 20) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y >= hipY0 && y <= hipY1) {
          hipX += x;
          hipN += 1;
        }
      }
    }
    const cx = hipN > 0 ? hipX / hipN : (minX + maxX) / 2;
    return { feet, head, minX, maxX, cx, height: Math.max(1, feet - head) };
  });

  const targetH = WALK_CELL_H - 224;
  const ground = WALK_CELL_H - 64;
  const genAvg =
    metrics.length >= 7
      ? (metrics[4].height + metrics[5].height + metrics[6].height) / 3
      : targetH;
  const expectedStand =
    metrics.length >= 8 ? (genAvg / prepared[6].h) * prepared[7].h : genAvg;

  return prepared.map((item, index) => {
    const m = metrics[index];
    const cell = document.createElement("canvas");
    cell.width = WALK_CELL_W;
    cell.height = WALK_CELL_H;
    const ctx = cell.getContext("2d");
    if (!ctx) return makeWalkTexture(item.canvas);
    const usedH =
      index === 7 ? Math.max(m.height, expectedStand) : index >= 4 ? genAvg : m.height;
    const fit = targetH / usedH;
    const drawW = item.w * fit;
    const drawH = item.h * fit;
    const dx = WALK_CELL_W / 2 - m.cx * fit;
    const dy = ground - m.feet * fit;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, WALK_CELL_W, WALK_CELL_H);
    ctx.drawImage(item.canvas, 0, 0, item.w, item.h, dx, dy, drawW, drawH);
    return makeWalkTexture(cell);
  });
}

function knockoutAndCrop(source: Texture, kind: "walk" | "stand" = "stand") {
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
  keyStudioBackground(data, w, h, kind);

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

  minX = Math.max(0, minX - 6);
  minY = Math.max(0, minY - 6);
  maxX = Math.min(w - 1, maxX + 6);
  maxY = Math.min(h - 1, maxY + 10);
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
  map.generateMipmaps = false;
  map.minFilter = LinearFilter;
  map.magFilter = LinearFilter;
  map.anisotropy = 4;
  map.needsUpdate = true;
  return map;
}

function useKnockoutTexture(src: string, kind: "walk" | "stand" = "stand") {
  const loaded = useTexture(src);
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    loaded.colorSpace = SRGBColorSpace;
    setMap(knockoutAndCrop(loaded, kind));
  }, [loaded, kind]);
  return map;
}

function useManPoses() {
  const loaded = useTexture(POSE_SRCS);
  const [maps, setMaps] = useState<Texture[] | null>(null);
  useEffect(() => {
    const list = (Array.isArray(loaded) ? loaded : [loaded]) as Texture[];
    list.forEach((tex) => {
      tex.colorSpace = SRGBColorSpace;
    });
    setMaps(normalizeWalkCycle(list, POSE_KINDS));
  }, [loaded]);
  return maps;
}

function slotX(slot: number) {
  return manSlotX(slot);
}

function peekNextSlot(slot: number, dir: 1 | -1, last: number) {
  if (dir === 1 && slot >= last) return last - 1;
  if (dir === -1 && slot <= 0) return 1;
  return slot + dir;
}

type StopPose = "plant" | "quarter" | "almost" | "stand";

function poseDuringHold(hold: number): StopPose {
  const elapsed = HOLD_TIME - hold;
  if (elapsed < ARRIVE_PLANT) return "plant";
  if (elapsed < ARRIVE_PLANT + ARRIVE_QUARTER) return "quarter";
  if (elapsed < ARRIVE_SUM) return "almost";
  if (hold > LEAVE_SUM) return "stand";
  const leaveElapsed = LEAVE_SUM - hold;
  if (leaveElapsed < LEAVE_ALMOST) return "almost";
  if (leaveElapsed < LEAVE_ALMOST + LEAVE_QUARTER) return "quarter";
  return "plant";
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

function useFactoryMap() {
  const map = useTexture(FACTORY_SRC);
  useLayoutEffect(() => {
    map.colorSpace = SRGBColorSpace;
    map.wrapS = RepeatWrapping;
    map.wrapT = ClampToEdgeWrapping;
    map.anisotropy = 8;
    map.repeat.set(FACTORY_WRAP_X, 1);
    map.offset.set(0.5, 0);
    map.needsUpdate = true;
  }, [map]);
  return map;
}

function useFutureProductMaps() {
  const loaded = useTexture(PRODUCT_SRCS);
  const [maps, setMaps] = useState<Texture[] | null>(null);
  useEffect(() => {
    const list = (Array.isArray(loaded) ? loaded : [loaded]) as Texture[];
    list.forEach((tex) => {
      tex.colorSpace = SRGBColorSpace;
    });
    setMaps(list.map((tex) => packProductSprite(tex)));
  }, [loaded]);
  return maps;
}

function useBoxMap() {
  const loaded = useTexture(BOX_SRC);
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    loaded.colorSpace = SRGBColorSpace;
    setMap(packProductSprite(loaded));
  }, [loaded]);
  return map;
}

function Pedestal({
  x,
  index,
  man,
  factoryMap,
}: {
  x: number;
  index: number;
  man: MutableRefObject<UnveilManState>;
  factoryMap: Texture;
}) {
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
        <cylinderGeometry args={[0.54, 0.58, 0.16, 48]} />
        <meshStandardMaterial color="#063a2c" roughness={0.46} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.028, 10, 32]} />
        <meshStandardMaterial color="#d4a359" roughness={0.22} metalness={0.72} emissive="#d4a359" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.1, 48]} />
        <meshStandardMaterial color="#903828" roughness={0.62} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[SHAFT_RADIUS_TOP, SHAFT_RADIUS_BOT, SHAFT_HEIGHT, 64]} />
        <meshStandardMaterial
          map={factoryMap}
          color="#ffffff"
          roughness={0.38}
          metalness={0.08}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.4, 0.36, 0.08, 48]} />
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

function fitClusterItem(aspect: number, scale: number, kind: "item" | "box") {
  if (kind === "box") {
    let height = 0.3 * scale;
    let width = height * aspect;
    if (width > 0.36 * scale) {
      width = 0.36 * scale;
      height = width / aspect;
    }
    return { width, height };
  }
  const wide = aspect > 1.05;
  const maxH = (wide ? 0.22 : 0.36) * scale;
  const maxW = (wide ? 0.4 : 0.25) * scale;
  let height = maxH;
  let width = height * aspect;
  if (width > maxW) {
    width = maxW;
    height = width / aspect;
  }
  return { width, height };
}

function FutureProduct({
  cloth,
  slot,
  map,
  place,
  kind,
}: {
  cloth: MutableRefObject<number[]>;
  slot: number;
  map: Texture;
  place: { x: number; z: number; scale: number; sink: number };
  kind: "item" | "box";
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const shadow = useRef<Mesh>(null);
  const geo = useMemo(() => {
    const plane = new PlaneGeometry(1, 1);
    plane.translate(0, 0.5, 0);
    return plane;
  }, []);
  const aspect = typeof map.userData.aspect === "number" ? map.userData.aspect : FACTORY_ASPECT;
  const fitted = useMemo(() => fitClusterItem(aspect, place.scale, kind), [aspect, place.scale, kind]);

  useFrame(() => {
    if (!group.current || !mesh.current || !shadow.current) return;
    const reveal = smoothstep(0.12, 0.55, cloth.current[slot] ?? 0);
    const material = mesh.current.material as MeshBasicMaterial;
    material.opacity = reveal;
    group.current.visible = reveal > 0.03;
    mesh.current.scale.set(fitted.width, fitted.height, 1);
    const shadowMat = shadow.current.material as MeshBasicMaterial;
    shadowMat.opacity = 0.28 * reveal;
    shadow.current.scale.set(fitted.width * 0.7, fitted.width * 0.4, 1);
  });

  return (
    <group ref={group} position={[place.x, -place.sink, place.z]} visible={false}>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0.01]} renderOrder={2}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="#05140f" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={mesh} geometry={geo} position={[0, 0, 0.03]} renderOrder={2}>
        <meshBasicMaterial
          map={map}
          transparent
          alphaTest={0.06}
          depthTest
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </mesh>
    </group>
  );
}

function ProductCluster({
  x,
  index,
  cloth,
  maps,
  boxMap,
}: {
  x: number;
  index: number;
  cloth: MutableRefObject<number[]>;
  maps: Texture[];
  boxMap: Texture;
}) {
  const boxPlace = {
    x: index % 2 === 0 ? 0.18 : -0.18,
    z: 0.07,
    scale: 1,
    sink: 0.05,
  };

  return (
    <group position={[x, PEDESTAL_TOP_Y, PEDESTAL_Z]}>
      <FutureProduct cloth={cloth} slot={index} map={boxMap} place={boxPlace} kind="box" />
      {PEDESTAL_SETS[index].map((place, item) => (
        <FutureProduct
          key={`${index}-${item}`}
          cloth={cloth}
          slot={index}
          map={maps[place.sku]}
          place={place}
          kind="item"
        />
      ))}
    </group>
  );
}

function readWatchList() {
  try {
    const raw = window.localStorage.getItem(WATCH_KEY);
    if (!raw) return {} as Record<string, boolean>;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, boolean>;
  }
}

function PeakTalk({ man }: { man: MutableRefObject<UnveilManState> }) {
  const { user, openLoginModal } = useAuth();
  const [talk, setTalk] = useState({ open: false, slot: 0 });
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const last = useRef("");

  useEffect(() => {
    setWatched(readWatchList());
  }, []);

  useFrame(() => {
    const state = man.current;
    const elapsed = HOLD_TIME - state.hold;
    const showing = !state.walking && state.hold > LEAVE_SUM && elapsed >= ARRIVE_SUM;
    const key = `${showing ? 1 : 0}:${state.slot}`;
    if (key === last.current) return;
    last.current = key;
    setTalk({ open: showing, slot: state.slot });
  });

  const product = UNVEIL_FUTURE_PRODUCTS[talk.slot];
  const saved = Boolean(product && watched[product.id]);

  return (
    <Html
      position={[TALK_RIGHT_X, MAN_HEAD_Y, 0.18]}
      zIndexRange={[40, 8]}
      style={{
        pointerEvents: talk.open ? "auto" : "none",
        opacity: talk.open ? 1 : 0,
        visibility: talk.open ? "visible" : "hidden",
      }}
    >
        {product ? (
          <div className={styles.thought} dir="rtl" aria-hidden={talk.open ? undefined : true}>
            <div className={styles.thoughtCloud}>
              <p>{saved ? "باشه، یادم می‌ماند." : product.invite}</p>
              {saved ? (
                <span className={styles.thoughtSaved}>یادم ماند</span>
              ) : (
                <button
                  type="button"
                  className={styles.thoughtCta}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!user) {
                      openLoginModal({ next: "/#product-unveil" });
                      return;
                    }
                    const next = { ...readWatchList(), [product.id]: true };
                    setWatched(next);
                    try {
                      window.localStorage.setItem(WATCH_KEY, JSON.stringify(next));
                    } catch {
                      /* waitlist backend comes later */
                    }
                  }}
                >
                  خبرم کن
                </button>
              )}
            </div>
            <span className={styles.thoughtPuff} aria-hidden="true" />
            <span className={`${styles.thoughtPuff} ${styles.thoughtPuffMid}`} aria-hidden="true" />
            <span className={`${styles.thoughtPuff} ${styles.thoughtPuffSmall}`} aria-hidden="true" />
          </div>
        ) : null}
    </Html>
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
  const poses = useManPoses();
  const group = useRef<Group>(null);
  const meshA = useRef<Mesh>(null);
  const meshB = useRef<Mesh>(null);
  const fade = useRef({ from: 0, to: 0, t: 1 });
  const walkGeo = useMemo(() => {
    const geo = new PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!group.current || !meshA.current || !meshB.current || !poses) return;
    const dt = Math.min(delta, 1 / 24);
    const tick = Math.min(delta, 1 / 60);
    const state = man.current;
    const last = UNVEIL_SLOT_X.length - 1;

    if (active) {
      if (state.hold > 0) {
        state.walking = false;
        state.x = slotX(state.slot);
        state.hold -= tick;
        const pose = poseDuringHold(Math.max(0, state.hold));
        if (pose === "stand") {
          cloth.current[state.slot] = Math.min(1, cloth.current[state.slot] + dt * 0.72);
        }
        if (state.hold <= LEAVE_SUM) {
          const upcoming = peekNextSlot(state.slot, state.dir, last);
          state.facing = slotX(upcoming) >= state.x ? 1 : -1;
        }
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
          state.originX = state.x;
          state.stride = 0;
          state.windup = 0;
          state.gait = 0;
          state.foot = 0;
        }
      } else {
        const target = slotX(state.slot);
        const dist = Math.abs(target - state.x);
        state.facing = target >= state.x ? 1 : -1;
        const arrive = () => {
          state.x = target;
          state.walking = false;
          state.hold = HOLD_TIME;
          state.stride = 0;
          state.windup = 0;
          state.gait = 0;
        };
        if (dist <= 0.05 && state.gait === 0) {
          arrive();
        } else if (state.gait === 0) {
          state.walking = true;
          state.windup += dt;
          if (state.windup >= CONTACT_TIME) {
            if (dist <= 0.08) arrive();
            else {
              state.gait = 1;
              state.stride = 0;
            }
          }
        } else {
          state.walking = true;
          const swinging = fade.current.to === state.foot * 2 + 1;
          if (swinging) {
            const step = Math.min(dist, STEP_DIST - state.stride, WALK_SPEED * dt);
            state.x += state.facing * step;
            state.stride += step;
          }
          if (state.stride >= STEP_DIST - 0.001 || dist <= 0.05) {
            if (Math.abs(target - state.x) <= 0.08) arrive();
            else if (swinging && state.stride >= STEP_DIST - 0.001) {
              state.gait = 0;
              state.windup = 0;
              state.foot = state.foot === 0 ? 1 : 0;
              state.stride = 0;
            }
          }
        }
      }
    }

    const holding = state.hold > 0;
    const stopPose = holding ? poseDuringHold(state.hold) : "plant";
    const walkFrame = state.foot * 2 + (state.gait === 1 ? 1 : 0);
    const poseIndex = { plant: 4, quarter: 5, almost: 6, stand: 7 } as const;
    const visualKey = holding ? poseIndex[stopPose] : walkFrame;
    const snapWalk = visualKey < 4 && fade.current.to < 4;
    if (visualKey !== fade.current.to) {
      fade.current.from = fade.current.to;
      fade.current.to = visualKey;
      fade.current.t = snapWalk ? 1 : 0;
    } else {
      fade.current.t = Math.min(1, fade.current.t + 1 / POSE_BLEND);
    }

    const toMap = poses[fade.current.to];
    const fromMap = poses[fade.current.from];
    const flipOf = (key: number) => (key >= 5 ? 1 : state.facing);
    const bob = state.gait === 1 && !holding ? -Math.cos((state.stride / STEP_DIST) * Math.PI) * 0.012 : 0;
    const matA = meshA.current.material as MeshBasicMaterial;
    const matB = meshB.current.material as MeshBasicMaterial;
    if (matA.map !== toMap) {
      matA.map = toMap;
      matA.needsUpdate = true;
    }
    if (matB.map !== fromMap) {
      matB.map = fromMap;
      matB.needsUpdate = true;
    }
    const u = fade.current.t;
    const ease = u * u * (3 - 2 * u);
    matA.opacity = ease;
    matB.opacity = 1 - ease;
    meshB.current.visible = fade.current.t < 0.999;

    group.current.position.set(state.x, bob, MAN_Z);
    meshA.current.scale.set(WALK_HEIGHT * WALK_ASPECT * flipOf(fade.current.to), WALK_HEIGHT, 1);
    meshB.current.scale.set(WALK_HEIGHT * WALK_ASPECT * flipOf(fade.current.from), WALK_HEIGHT, 1);
    meshA.current.position.set(0, 0, 0);
    meshB.current.position.set(0, 0, 0.001);
  });

  if (!poses) return null;

  return (
    <group ref={group} position={[man.current.x, 0, MAN_Z]}>
      <mesh ref={meshA} geometry={walkGeo} renderOrder={1}>
        <meshBasicMaterial
          map={poses[7]}
          transparent
          alphaTest={0}
          depthTest
          depthWrite={false}
          toneMapped={false}
          opacity={1}
        />
      </mesh>
      <mesh ref={meshB} geometry={walkGeo} renderOrder={0} visible={false}>
        <meshBasicMaterial
          map={poses[4]}
          transparent
          alphaTest={0}
          depthTest
          depthWrite={false}
          toneMapped={false}
          opacity={0}
        />
      </mesh>
      <PeakTalk man={man} />
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
  const factoryMap = useFactoryMap();
  const productMaps = useFutureProductMaps();
  const boxMap = useBoxMap();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.55, UNVEIL_CAM_Z]} fov={32} near={0.1} far={42} />
      <Hall />
      <MountainMan man={man} cloth={cloth} active={active} />
      {UNVEIL_SLOT_X.map((x, index) => (
        <Pedestal key={`p-${x}`} x={x} index={index} man={man} factoryMap={factoryMap} />
      ))}
      {productMaps && boxMap
        ? UNVEIL_SLOT_X.map((x, index) => (
            <ProductCluster
              key={`prod-${x}`}
              x={x}
              index={index}
              cloth={cloth}
              maps={productMaps}
              boxMap={boxMap}
            />
          ))
        : null}
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
      style={{ pointerEvents: "auto" }}
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
