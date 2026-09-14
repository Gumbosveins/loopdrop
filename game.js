/**
 * Loopdrop — original Pixel Flow / conveyor-voxel puzzle
 * No external assets. localStorage key: loopdrop-save-v1
 */
(function () {
  'use strict';

  // ─── Constants ───────────────────────────────────────────
  const SAVE_KEY = 'loopdrop-save-v1';
  const TOTAL_LEVELS = 200;
  const TRACK_CAP = 5;
  const BASE_SLOTS = 5;
  const MAX_SLOTS = 7;
  const LAP_MS = 5200;
  const FIRE_INTERVAL = 200; // 5/s → ~20 ammo per lap
  const WIN_COINS = 5;
  const COLORS = [
    { id: 0, name: 'red',    top: '#ff6b6b', side: '#c92a2a', face: '#e63946', dark: '#9b2226' },
    { id: 1, name: 'pink',   top: '#ffa8c5', side: '#d6336c', face: '#ff6b9d', dark: '#a61e4d' },
    { id: 2, name: 'orange', top: '#ffb347', side: '#e8590c', face: '#ff8c42', dark: '#c2410c' },
    { id: 3, name: 'yellow', top: '#ffe566', side: '#e6b800', face: '#ffd60a', dark: '#b08900' },
    { id: 4, name: 'green',  top: '#5ce0d0', side: '#0b9a8d', face: '#2ec4b6', dark: '#087f75' },
    { id: 5, name: 'blue',   top: '#7dd3fc', side: '#0284c7', face: '#4cc9f0', dark: '#0369a1' },
    { id: 6, name: 'purple', top: '#c4a1ff', side: '#7b2cbf', face: '#9b5de5', dark: '#5a189a' },
    { id: 7, name: 'brown',  top: '#e0a878', side: '#9a5b2e', face: '#c77d4a', dark: '#6f3e1a' },
  ];

  // PHOTO_LEVELS injected below (CC0/PD voxel pictures)
  const PHOTO_LEVELS = [{"name":"planet","w":18,"h":9,"grid":[-1,-1,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,1,1,1,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,1,-1,-1,1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,-1,-1,-1,1,1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,-1,-1,1,1,1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,1,1,1,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]},{"name":"peach","w":14,"h":8,"grid":[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,-1,-1,1,1,-1,-1,-1,-1,7,7,7,7,7,7,-1,1,1,-1,-1,-1,-1,-1,7,7,7,7,7,7,-1,1,1,-1,-1,-1,-1,-1,7,7,7,7,7,7,-1,1,1,-1,-1,-1,-1,-1,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]},{"name":"bicycle","w":18,"h":22,"grid":[-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,-1,7,-1,7,7,7,7,7,7,7,7,7,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]},{"name":"planet","w":14,"h":9,"grid":[-1,-1,-1,-1,-1,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,7,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,6,7,7,7,7,7,7,7,7,7,7,7,-1,-1,6,7,7,7,7,6,6,7,7,7,7,7,-1,-1,6,7,7,7,7,6,-1,6,7,7,7,7,-1,-1,6,7,7,7,7,6,6,6,7,7,7,7,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,-1]},{"name":"tulip","w":14,"h":22,"grid":[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,-1,-1,-1,-1,7,7,-1,-1,7,7,7,7,-1,-1,-1,-1,-1,-1,7,7,1,1,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,7,7,1,7,7,7,7,-1,-1,-1,-1,-1,-1,1,1,7,1,7,7,7,7,-1,-1,-1,-1,-1,-1,1,1,1,1,7,7,7,1,-1,-1,-1,-1,-1,-1,-1,1,1,1,7,7,1,1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,-1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,7,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1]},{"name":"pear","w":14,"h":20,"grid":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,1,1,1,1,1,-1,-1,-1,-1,1,1,-1,-1,-1,1,1,7,7,1,1,-1,-1,-1,1,1,-1,-1,1,1,1,7,1,1,1,-1,-1,-1,1,1,-1,-1,1,1,7,7,7,1,7,-1,-1,-1,1,1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,7,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,-1,7,7,7,7,7,7,-1,-1,-1,1,1,-1,-1,-1,7,-1,-1,7,7,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1]},{"name":"pear","w":14,"h":11,"grid":[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,7,7,7,7,7,7,7,1,7,7,1,1,1,1,7,7,7,7,7,7,7,1,1,1,1,1,1,1,7,7,7,7,7,7,7,1,1,1,1,1,1,1,7,7,7,7,7,7,7,1,1,1,-1,-1,-1,-1,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,1,7,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,1,1,7,7,7,-1,-1,-1,-1,-1,-1]},{"name":"earth","w":14,"h":14,"grid":[-1,-1,-1,-1,-1,7,7,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,6,6,6,6,6,-1,-1,-1,-1,-1,-1,-1,6,6,6,6,6,6,6,6,-1,-1,-1,-1,-1,6,6,6,6,6,6,6,6,6,6,-1,-1,-1,6,6,6,6,6,6,6,6,7,6,6,-1,-1,7,6,6,6,6,6,6,6,6,7,7,6,6,-1,7,6,6,6,6,6,6,7,7,7,7,7,6,7,7,6,6,6,6,6,6,6,7,7,6,7,7,7,7,6,6,6,-1,6,6,-1,6,6,6,6,7,-1,-1,6,6,6,6,6,6,6,6,6,6,6,7,-1,-1,-1,6,6,6,6,6,6,6,6,6,6,7,-1,-1,-1,-1,6,6,6,6,6,6,6,6,-1,-1,-1,-1,-1,-1,-1,6,6,6,6,6,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,-1,-1,-1,-1,-1]},{"name":"lemon","w":14,"h":17,"grid":[-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,7,7,-1,7,7,-1,-1,-1,-1,7,7,7,-1,-1,7,7,7,7,7,-1,-1,-1,-1,7,7,7,7,-1,7,7,7,7,7,7,7,-1,-1,-1,7,7,7,7,7,7,7,7,7,7,7,7,-1,7,7,7,7,1,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,7,-1,7,7,7,7,7,-1,7,7,7,7,7,1,1,7,7,7,7,7,-1,-1,-1,-1,7,7,7,7,1,7,7,7,7,7,-1,-1,-1,-1,-1,1,1,1,1,7,7,7,7,7,-1,-1,1,-1,-1,7,7,7,7,7,7,7,7,7,-1,-1,1,7,7,7,7,7,7,7,-1,-1,-1,-1,-1,-1,1,7,7,7,7,7,7,-1,-1,7,7,7,-1,-1,7,7,7,7,-1,-1,7,7,-1,7,7,7,7,-1,7,1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,-1,-1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]},{"name":"cherries","w":16,"h":21,"grid":[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,1,1,-1,-1,1,7,1,7,1,1,1,7,7,7,7,7,-1,7,1,1,1,7,7,7,1,1,1,1,1,1,1,7,1,7,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1,7,1,1,-1,7,7,7,7,7,-1,7,7,7,-1,7,1,1,1,1,-1,7,7,7,-1,-1,7,7,7,-1,7,7,1,1,1,1,1,7,7,-1,7,-1,-1,7,7,7,7,7,1,1,1,1,1,7,7,7,7,7,7,7,-1,7,7,7,1,1,1,-1,1,-1,7,-1,7,7,7,7,7,7,7,-1,1,1,1,-1,1,7,7,7,7,7,7,7,-1,7,1,-1,1,-1,1,1,1,7,7,7,7,7,7,7,7,-1,1,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,1,1,1,-1,-1,1,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1,7,7,-1,-1,7,7,7,7,7,7,7,7,7,7,7,1,7,7,1,1,1,-1,1,1,1,7,7,7,7,7,7,1,7,7,7,7,7,7,7,7,7,-1,-1,-1,1,1,1,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]},{"name":"watermelon","w":16,"h":10,"grid":[-1,-1,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,0,0,0,-1,-1,-1,-1,-1,-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,7,0,0,7,-1,-1,-1,-1,-1,-1,7,7,0,0,0,0,7,0,7,7,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,7,7,7,-1,-1,7,7,7,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,7,7,0,0,7,-1,-1,1,1,-1,-1,-1,-1,-1,-1,7,7,0,0,0,7,-1,-1,0,0,0,7,-1,-1,-1,-1,7,0,0,0,0,7,-1,0,0,0,7,7,-1,-1,-1,-1,7,7,0,7,7,7,-1,0,0,7,7,-1,-1,-1]},{"name":"apple","w":14,"h":10,"grid":[-1,-1,-1,-1,-1,7,7,7,7,1,1,7,7,7,-1,-1,-1,-1,7,7,7,7,7,1,-1,-1,7,7,-1,1,1,-1,1,-1,-1,-1,7,1,-1,-1,7,7,7,1,-1,1,1,7,-1,7,7,7,7,7,-1,-1,7,7,7,7,7,7,7,7,7,0,0,7,7,7,7,7,7,0,7,0,0,0,7,7,0,7,7,7,7,7,7,0,0,7,7,7,7,0,7,7,7,7,-1,7,7,7,0,7,7,-1,0,0,7,7,7,7,-1,7,-1,-1,7,7,7,0,0,7,7,7,7,7,7,7,7,7,7,7,0,0,7,7,7,7,7,7]},{"name":"orange","w":15,"h":17,"grid":[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,7,7,7,7,7,7,7,7,7,7,-1,-1,7,-1,7,2,2,-1,-1,-1,-1,-1,-1,-1,-1,7,7,7,7,7,2,2,2,-1,-1,-1,-1,-1,-1,-1,7,7,-1,-1,7,2,-1,-1,2,7,-1,-1,7,-1,-1,7,7,7,7,7,7,2,2,2,7,7,7,7,-1,-1,7,7,7,7,7,-1,7,7,2,7,7,7,7,-1,-1,7,7,7,7,-1,7,7,7,7,7,7,7,0,-1,-1,7,-1,7,7,7,-1,-1,7,7,-1,7,0,0,7,-1,7,7,7,-1,7,7,7,7,7,7,7,7,7,7,-1,7,7,-1,7,7,7,2,2,2,7,7,-1,7,7,-1,-1,7,7,-1,7,7,7,7,7,-1,7,7,7,7,7,7,7,7,7,7,7,7,-1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,-1,7,7,7,7,7,7,7,7,7,7,-1,-1,7,-1,7,-1,7,7,7,7,7,7,7,7,7,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]},{"name":"earth","w":14,"h":14,"grid":[4,4,4,4,4,6,6,-1,6,6,6,5,5,5,4,4,4,4,4,4,6,6,5,6,6,5,5,5,4,7,7,4,-1,4,6,6,5,5,6,5,5,5,4,4,7,7,4,4,6,6,5,5,6,5,5,5,4,4,4,4,4,4,6,6,6,6,5,5,5,5,-1,4,4,4,-1,4,4,6,6,6,5,5,5,5,5,-1,4,4,4,4,4,4,6,6,6,5,5,5,5,5,-1,4,4,6,4,4,-1,6,6,6,5,5,5,5,5,-1,4,6,6,6,6,6,6,6,6,6,-1,-1,5,5,6,6,6,6,6,6,6,6,6,6,-1,-1,-1,-1,-1,6,6,6,6,6,6,6,-1,6,-1,-1,-1,-1,-1,-1,6,6,6,6,6,6,6,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,6,4,4,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,4]}]; // __PHOTO_LEVELS__

  // ─── Seeded RNG ──────────────────────────────────────────
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Level generation (photo voxels) ───────────────────
  function difficultyFor(level) {
    if (level <= 10) return { packetMin: 8, packetMax: 20, preferSimple: true, maxColors: 3 };
    if (level <= 30) return { packetMin: 10, packetMax: 24, preferSimple: true, maxColors: 4 };
    if (level <= 60) return { packetMin: 12, packetMax: 30, preferSimple: false, maxColors: 5 };
    if (level <= 100) return { packetMin: 14, packetMax: 36, preferSimple: false, maxColors: 6 };
    if (level <= 150) return { packetMin: 16, packetMax: 40, preferSimple: false, maxColors: 7 };
    return { packetMin: 18, packetMax: 40, preferSimple: false, maxColors: 8 };
  }

  function splitAmmoPackets(count, rng, minP, maxP) {
    if (count <= 0) return [];
    const packets = [];
    let left = count;
    while (left > 0) {
      if (left <= minP) {
        packets.push(left);
        break;
      }
      const hi = Math.min(maxP, left);
      const lo = Math.min(minP, left);
      let size = lo + Math.floor(rng() * (hi - lo + 1));
      if (left - size > 0 && left - size < Math.floor(minP / 2)) {
        size = left; // avoid tiny remainder
      }
      size = Math.max(1, Math.min(size, left));
      packets.push(size);
      left -= size;
    }
    return packets;
  }

  function photoColorCount(photo) {
    const set = new Set();
    for (const v of photo.grid) if (v >= 0) set.add(v);
    return set.size;
  }

  function photoFilled(photo) {
    let n = 0;
    for (const v of photo.grid) if (v >= 0) n++;
    return n;
  }

  /** Deterministic pick: early levels favor 2–3 color simpler photos */
  function pickPhoto(levelNumber, rng) {
    if (!PHOTO_LEVELS.length) {
      // Tiny fallback so the game still boots
      return {
        name: 'fallback',
        w: 8, h: 8,
        grid: (() => {
          const g = [];
          for (let i = 0; i < 64; i++) {
            const r = (i / 8) | 0, c = i % 8;
            g.push((r > 1 && r < 6 && c > 1 && c < 6) ? (c < 4 ? 0 : 3) : -1);
          }
          return g;
        })(),
      };
    }
    const scored = PHOTO_LEVELS.map((p, i) => ({
      i,
      p,
      colors: photoColorCount(p),
      filled: photoFilled(p),
    }));
    let pool;
    if (levelNumber <= 10) {
      pool = scored.filter((s) => s.colors <= 3).sort((a, b) => a.filled - b.filled || a.colors - b.colors);
      if (pool.length < 3) pool = scored.slice().sort((a, b) => a.colors - b.colors || a.filled - b.filled);
    } else if (levelNumber <= 30) {
      pool = scored.filter((s) => s.colors <= 4).sort((a, b) => a.filled - b.filled);
      if (!pool.length) pool = scored;
    } else {
      pool = scored.slice().sort((a, b) => b.filled - a.filled || b.colors - a.colors);
    }
    // Rotate through pool by level for variety, with seed jitter
    const idx = (levelNumber - 1 + Math.floor(rng() * 3)) % pool.length;
    return pool[idx].p;
  }

  function generateLevel(levelNumber) {
    const seed = levelNumber;
    const rng = mulberry32(seed * 9973 + 42);
    const diff = difficultyFor(levelNumber);

    const photo = pickPhoto(levelNumber, rng);
    const rows = photo.h;
    const cols = photo.w;
    let flat = photo.grid.slice();

    // Optional horizontal flip
    if (rng() > 0.5) {
      const flipped = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) flipped.push(flat[r * cols + (cols - 1 - c)]);
      }
      flat = flipped;
    }

    // Seed-based palette permutation (remap color indices among COLORS)
    const perm = shuffle([...COLORS.keys()], rng);
    const usedOrig = new Set();
    for (const v of flat) if (v >= 0) usedOrig.add(v);
    const origList = [...usedOrig];
    // Limit colors for early levels by merging extras into nearest kept
    let keep = origList.slice();
    if (diff.maxColors && keep.length > diff.maxColors) {
      keep = shuffle(keep, rng).slice(0, diff.maxColors);
    }
    const remap = {};
    for (const o of origList) {
      if (keep.includes(o)) remap[o] = perm[o % perm.length];
      else remap[o] = perm[keep[Math.floor(rng() * keep.length)] % perm.length];
    }

    const grid = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        const v = flat[r * cols + c];
        grid[r][c] = v < 0 ? -1 : remap[v];
      }
    }

    const counts = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const col = grid[r][c];
        if (col >= 0) counts[col] = (counts[col] || 0) + 1;
      }
    }

    let dock = [];
    for (const col of Object.keys(counts).map(Number)) {
      const packets = splitAmmoPackets(counts[col], rng, diff.packetMin, diff.packetMax);
      for (const ammo of packets) {
        dock.push({ color: col, ammo, id: 'p' + dock.length + '_' + levelNumber });
      }
    }
    dock = shuffle(dock, rng);

    // Early levels: fewer packets (merge same-color) so one tap can finish more often
    if (levelNumber <= 10) {
      while (dock.length > 6) {
        let merged = false;
        for (let i = 0; i < dock.length && !merged; i++) {
          for (let j = i + 1; j < dock.length; j++) {
            if (dock[i].color === dock[j].color) {
              dock[i].ammo += dock[j].ammo;
              dock.splice(j, 1);
              merged = true;
              break;
            }
          }
        }
        if (!merged) break;
      }
    }

    // Verify totals equal cube counts
    const dockTotals = {};
    for (const d of dock) dockTotals[d.color] = (dockTotals[d.color] || 0) + d.ammo;
    for (const col of Object.keys(counts).map(Number)) {
      const diffAmt = counts[col] - (dockTotals[col] || 0);
      if (diffAmt !== 0) {
        const existing = dock.find((d) => d.color === col);
        if (existing) existing.ammo += diffAmt;
        else if (diffAmt > 0) dock.push({ color: col, ammo: diffAmt, id: 'fix' + col });
      }
    }

    return {
      levelNumber,
      rows,
      cols,
      grid,
      dock,
      counts,
      photoName: photo.name || 'photo',
    };
  }

  // ─── Save / Shop ─────────────────────────────────────────
  function defaultSave() {
    return {
      coins: 0,
      won: {}, // level -> true
      maxUnlocked: 1,
      shop: { extraSlots: 0, undo: 0, clearHold: 0, removeAds: false },
      lastLevel: 1,
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      const s = JSON.parse(raw);
      return Object.assign(defaultSave(), s, { shop: Object.assign(defaultSave().shop, s.shop || {}) });
    } catch (e) {
      return defaultSave();
    }
  }
  function writeSave(s) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  }

  const SHOP_CATALOG = [
    { id: 'extraSlots', name: 'Extra holding slot', desc: 'Max 7 slots (+1 each)', cost: 40, max: 2 },
    { id: 'undo', name: 'Undo last launch', desc: 'Stock +3 uses', cost: 25, stock: 3 },
    { id: 'clearHold', name: 'Clear one holding drop', desc: 'Stock +3 uses', cost: 30, stock: 3 },
    { id: 'coins50', name: '+50 coins', desc: 'Top up your purse', cost: 0, iap: true },
    { id: 'removeAds', name: 'Remove ads', desc: 'Cosmetic — no ads exist', cost: 80, once: true },
  ];

  // ─── DOM refs ────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const screens = {
    title: $('screen-title'),
    howto: $('screen-howto'),
    levels: $('screen-levels'),
    shop: $('screen-shop'),
    game: $('screen-game'),
  };
  const overlays = {
    pause: $('overlay-pause'),
    win: $('overlay-win'),
    fail: $('overlay-fail'),
  };
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');

  let save = loadSave();
  let state = null; // active game state
  let raf = 0;
  let lastTs = 0;
  let toastTimer = 0;
  let returnScreen = 'title';

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove('active'));
    screens[name].classList.add('active');
    hideOverlays();
  }
  function hideOverlays() {
    Object.values(overlays).forEach((el) => el.classList.remove('show'));
  }
  function showOverlay(name) {
    overlays[name].classList.add('show');
  }
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { t.hidden = true; }, 200);
    }, 1400);
  }
  function updateCoinUI() {
    const txt = '🪙 ' + save.coins;
    ['levels-coins', 'shop-coins', 'hud-coins'].forEach((id) => {
      const el = $(id);
      if (el) el.textContent = txt;
    });
  }

  // ─── Track geometry ──────────────────────────────────────
  // Rounded-rect path around the voxel picture
  function buildTrackPath(cx, cy, hw, hh, radius) {
    // Parametric clockwise path: top → right → bottom → left
    // Approximate with polyline samples
    const pts = [];
    const steps = 64;
    // Expand for track centerline
    const R = radius;
    const left = cx - hw, right = cx + hw, top = cy - hh, bot = cy + hh;
    // Top edge L→R
    for (let i = 0; i <= steps / 4; i++) {
      const t = i / (steps / 4);
      pts.push({ x: left + R + t * (right - left - 2 * R), y: top });
    }
    // Top-right corner
    for (let i = 1; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      pts.push({ x: right - R + Math.cos(a) * R, y: top + R + Math.sin(a) * R });
    }
    // Right edge T→B
    for (let i = 1; i <= steps / 4; i++) {
      const t = i / (steps / 4);
      pts.push({ x: right, y: top + R + t * (bot - top - 2 * R) });
    }
    // Bottom-right
    for (let i = 1; i <= 8; i++) {
      const a = 0 + (i / 8) * (Math.PI / 2);
      pts.push({ x: right - R + Math.cos(a) * R, y: bot - R + Math.sin(a) * R });
    }
    // Bottom R→L
    for (let i = 1; i <= steps / 4; i++) {
      const t = i / (steps / 4);
      pts.push({ x: right - R - t * (right - left - 2 * R), y: bot });
    }
    // Bottom-left
    for (let i = 1; i <= 8; i++) {
      const a = Math.PI / 2 + (i / 8) * (Math.PI / 2);
      pts.push({ x: left + R + Math.cos(a) * R, y: bot - R + Math.sin(a) * R });
    }
    // Left B→T
    for (let i = 1; i <= steps / 4; i++) {
      const t = i / (steps / 4);
      pts.push({ x: left, y: bot - R - t * (bot - top - 2 * R) });
    }
    // Top-left
    for (let i = 1; i <= 8; i++) {
      const a = Math.PI + (i / 8) * (Math.PI / 2);
      pts.push({ x: left + R + Math.cos(a) * R, y: top + R + Math.sin(a) * R });
    }
    // Compute cumulative lengths
    let total = 0;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      total += Math.hypot(dx, dy);
      cum.push(total);
    }
    return { pts, cum, total };
  }

  function pointOnPath(path, dist) {
    const d = ((dist % path.total) + path.total) % path.total;
    let i = 1;
    while (i < path.cum.length && path.cum[i] < d) i++;
    const i0 = Math.max(0, i - 1);
    const i1 = Math.min(path.pts.length - 1, i);
    const segLen = path.cum[i1] - path.cum[i0] || 1;
    const t = (d - path.cum[i0]) / segLen;
    const a = path.pts[i0], b = path.pts[i1];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  // Gate is on the left side of the track
  function gateDist(path) {
    // Left edge midpoint ≈ 3/4 along clockwise from top-left start... 
    // Our path starts at top-left after corner ≈ start of top edge.
    // Left side is near the end. Use ~0.75 of total for left-middle.
    return path.total * 0.78;
  }

  // ─── Game state ──────────────────────────────────────────
  function slotCount() {
    return Math.min(MAX_SLOTS, BASE_SLOTS + (save.shop.extraSlots || 0));
  }

  const LOGICAL_W = 390;
  const LOGICAL_H = 520;

  function startLevel(n) {
    setupCanvas();
    const level = generateLevel(n);
    const W = LOGICAL_W;
    const H = LOGICAL_H;

    // Layout inside canvas
    const picArea = { x: W * 0.5, y: H * 0.42, maxW: W * 0.52, maxH: H * 0.48 };
    // Allow small cells (~10–14px) so denser photo grids fill the track interior
    const cellSize = Math.max(
      10,
      Math.min(
        picArea.maxW / Math.max(level.cols, 1),
        picArea.maxH / Math.max(level.rows, 1),
        26
      )
    );
    const gridW = level.cols * cellSize;
    const gridH = level.rows * cellSize;
    const gridOrigin = {
      x: picArea.x - gridW / 2,
      y: picArea.y - gridH / 2,
    };

    const pad = 36;
    const track = buildTrackPath(
      picArea.x,
      picArea.y,
      gridW / 2 + pad,
      gridH / 2 + pad,
      28
    );

    // Cubes list
    const cubes = [];
    for (let r = 0; r < level.rows; r++) {
      for (let c = 0; c < level.cols; c++) {
        if (level.grid[r][c] >= 0) {
          cubes.push({
            r, c,
            color: level.grid[r][c],
            alive: true,
            pending: false,
            squash: 0,
            popT: 0,
          });
        }
      }
    }

    state = {
      levelNum: n,
      level,
      cubes,
      gridOrigin,
      cellSize,
      track,
      gateD: gateDist(track),
      drops: [], // on track
      holding: new Array(slotCount()).fill(null),
      dock: level.dock.map((d) => ({ ...d, used: false })),
      projectiles: [],
      particles: [],
      occupancyShake: 0,
      won: false,
      failed: false,
      paused: false,
      lastLaunch: null, // for undo
      elapsed: 0,
    };

    save.lastLevel = n;
    writeSave(save);
    $('hud-level').textContent = 'Level ' + n;
    updateCoinUI();
    renderHolding();
    renderDock();
    updateBoosters();
    showScreen('game');
    hideOverlays();
    lastTs = performance.now();
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function remainingCubesOf(color) {
    return state.cubes.filter((c) => c.alive && c.color === color);
  }

  /** Map drop track position → which grid line it faces (one shot per line per lap). */
  function dropSightLine(drop) {
    const pos = pointOnPath(state.track, drop.dist);
    const s = state.cellSize;
    const o = state.gridOrigin;
    const rows = state.level.rows;
    const cols = state.level.cols;
    const left = o.x;
    const right = o.x + cols * s;
    const top = o.y;
    const bot = o.y + rows * s;
    const cx = (left + right) / 2;
    const cy = (top + bot) / 2;
    // Which side of the picture is the drop on?
    const dl = Math.abs(pos.x - left);
    const dr = Math.abs(pos.x - right);
    const dt = Math.abs(pos.y - top);
    const db = Math.abs(pos.y - bot);
    const m = Math.min(dl, dr, dt, db);
    let side;
    if (m === dt) side = 'top';
    else if (m === db) side = 'bottom';
    else if (m === dl) side = 'left';
    else side = 'right';

    let line;
    if (side === 'top' || side === 'bottom') {
      line = Math.floor((pos.x - left) / s);
      line = Math.max(0, Math.min(cols - 1, line));
    } else {
      line = Math.floor((pos.y - top) / s);
      line = Math.max(0, Math.min(rows - 1, line));
    }
    return { side, line, key: side + ':' + line };
  }

  /** Outermost matching cube on that line, looking inward from the track side. */
  function pickTargetOnLine(color, side, line) {
    const free = state.cubes.filter((c) => {
      if (!c.alive || c.pending || c.color !== color) return false;
      if (side === 'top' || side === 'bottom') return c.c === line;
      return c.r === line;
    });
    if (!free.length) return null;
    if (side === 'top') free.sort((a, b) => a.r - b.r);       // outermost = smallest row
    else if (side === 'bottom') free.sort((a, b) => b.r - a.r); // largest row
    else if (side === 'left') free.sort((a, b) => a.c - b.c);  // smallest col
    else free.sort((a, b) => b.c - a.c);                        // largest col
    return free[0];
  }

  function cubeWorldPos(cube) {
    const s = state.cellSize;
    const o = state.gridOrigin;
    return {
      x: o.x + cube.c * s + s * 0.5,
      y: o.y + cube.r * s + s * 0.5,
    };
  }

  function tryLaunchFromDock(index) {
    if (!state || state.won || state.failed || state.paused) return;
    const d = state.dock[index];
    if (!d || d.used || d.ammo <= 0) return;
    if (state.drops.length >= TRACK_CAP) {
      toast('Track full — wait');
      const el = document.querySelectorAll('.dock-drop')[index];
      if (el) {
        el.classList.remove('shake');
        void el.offsetWidth;
        el.classList.add('shake');
      }
      state.occupancyShake = 0.35;
      return;
    }
    d.used = true;
    const drop = {
      color: d.color,
      ammo: d.ammo,
      dist: state.gateD, // enter at gate
      from: 'dock',
      dockIndex: index,
      id: d.id + '_' + Date.now(),
      hitThisLap: new Set(),
      lastSightKey: null,
    };
    state.lastLaunch = { type: 'dock', index, dropSnapshot: { color: d.color, ammo: d.ammo, id: d.id } };
    state.drops.push(drop);
    renderDock();
    updateBoosters();
  }

  function tryLaunchFromHold(slotIndex) {
    if (!state || state.won || state.failed || state.paused) return;
    const d = state.holding[slotIndex];
    if (!d) return;
    if (state.drops.length >= TRACK_CAP) {
      toast('Track full — wait');
      state.occupancyShake = 0.35;
      return;
    }
    state.holding[slotIndex] = null;
    const drop = {
      color: d.color,
      ammo: d.ammo,
      dist: state.gateD,
      from: 'hold',
      holdIndex: slotIndex,
      id: d.id || 'h' + Date.now(),
      hitThisLap: new Set(),
      lastSightKey: null,
    };
    state.lastLaunch = { type: 'hold', index: slotIndex, dropSnapshot: { ...d } };
    state.drops.push(drop);
    renderHolding();
    updateBoosters();
  }

  function onLapComplete(drop, idx) {
    // Finished one full lap (crossed gate going around)
    drop.hitThisLap = new Set();
    drop.lastSightKey = null;
    const hasCubes = remainingCubesOf(drop.color).length > 0;
    if (drop.ammo <= 0 || !hasCubes) {
      // Exit — leftover ammo treated as spent
      state.drops.splice(idx, 1);
      return;
    }
    // Try holding slot
    const empty = state.holding.findIndex((s) => s === null);
    if (empty >= 0) {
      state.holding[empty] = { color: drop.color, ammo: drop.ammo, id: drop.id };
      state.drops.splice(idx, 1);
      renderHolding();
      return;
    }
    // Fail — slots full
    state.drops.splice(idx, 1);
    showFail('Slots Full', 'No room left to hold drops. Try a different order.');
  }

  function tryFireAtCurrentLine(drop) {
    if (drop.ammo <= 0) return;
    if (!drop.hitThisLap) drop.hitThisLap = new Set();
    const sight = dropSightLine(drop);
    if (drop.lastSightKey === sight.key) return; // still on same line
    drop.lastSightKey = sight.key;
    if (drop.hitThisLap.has(sight.key)) return; // already shot this line this lap
    const target = pickTargetOnLine(drop.color, sight.side, sight.line);
    if (!target) return; // no matching cube on this line — do not spend ammo
    drop.hitThisLap.add(sight.key);
    target.pending = true;
    drop.ammo -= 1;
    const from = pointOnPath(state.track, drop.dist);
    const to = cubeWorldPos(target);
    state.projectiles.push({
      x: from.x, y: from.y,
      x0: from.x, y0: from.y,
      tx: to.x, ty: to.y,
      t: 0,
      dur: 0.2,
      color: drop.color,
      target,
    });
  }

  function applyPop(cube) {
    if (!cube || !cube.alive) return;
    cube.alive = false;
    cube.pending = false;
    cube.popT = 0.35;
    cube.squash = 1;
    const p = cubeWorldPos(cube);
    const col = COLORS[cube.color];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      state.particles.push({
        x: p.x, y: p.y,
        vx: Math.cos(a) * (40 + Math.random() * 60),
        vy: Math.sin(a) * (40 + Math.random() * 60) - 30,
        life: 0.4 + Math.random() * 0.2,
        color: col.top,
        size: 3 + Math.random() * 3,
      });
    }
  }


  function showFail(title, msg) {
    const panel = overlays.fail.querySelector('.panel');
    if (panel) {
      const h2 = panel.querySelector('h2');
      const p = panel.querySelector('p');
      if (h2) h2.textContent = title;
      if (p) p.textContent = msg;
    }
    state.failed = true;
    showOverlay('fail');
  }

  function checkOutOfDrops() {
    if (!state || state.won || state.failed) return;
    // Do not fail while projectiles still in flight
    if (state.projectiles.length > 0) return;
    const cubesLeft = state.cubes.some((c) => c.alive);
    if (!cubesLeft) return;
    const unusedDock = state.dock.some((d) => d && !d.used && d.ammo > 0);
    const onTrack = state.drops.length > 0;
    const holding = state.holding.some(Boolean);
    if (!unusedDock && !onTrack && !holding) {
      showFail('Out of drops', 'No drops left but cubes remain. Try a different order.');
    }
  }

  function checkWin() {
    if (state.won || state.failed) return;
    if (state.cubes.every((c) => !c.alive)) {
      state.won = true;
      // Remaining drops will exit naturally; award coins
      save.coins += WIN_COINS;
      save.won[state.levelNum] = true;
      if (state.levelNum >= save.maxUnlocked) {
        save.maxUnlocked = Math.min(TOTAL_LEVELS, state.levelNum + 1);
      }
      writeSave(save);
      updateCoinUI();
      $('win-reward').textContent = '+' + WIN_COINS + ' 🪙';
      setTimeout(() => {
        if (state && state.won) showOverlay('win');
      }, 400);
    }
  }

  // ─── Update loop ─────────────────────────────────────────
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (!state || state.paused) {
      if (state) draw();
      return;
    }
    if (!screens.game.classList.contains('active')) return;

    state.elapsed += dt;
    if (state.occupancyShake > 0) state.occupancyShake -= dt;

    // Move drops
    const speed = state.track.total / (LAP_MS / 1000); // units per second
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i];
      if (state.won) {
        // Drain & exit
        drop.ammo = 0;
      }
      const prev = drop.dist;
      drop.dist += speed * dt;

      // Fire: at most one matching cube per grid line per lap (line-of-sight from track)
      if (!state.won && drop.ammo > 0 && remainingCubesOf(drop.color).length) {
        tryFireAtCurrentLine(drop);
      }

      // Lap complete: crossed full lap past gate entry
      // We spawn at gateD. After traveling track.total, we're back.
      const traveled = drop.dist - state.gateD;
      const prevTraveled = prev - state.gateD;
      if (traveled >= state.track.total && prevTraveled < state.track.total) {
        // Snap and handle lap
        drop.dist = state.gateD + (traveled % state.track.total);
        onLapComplete(drop, i);
      }
    }

    // If won, remove drops that have no work
    if (state.won) {
      state.drops = state.drops.filter((d) => d.ammo > 0);
    }

    // Failsafe: emptied dock/hold/track with cubes still alive (after lap exits)
    checkOutOfDrops();

    // Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      p.t += dt;
      const u = Math.min(1, p.t / p.dur);
      const pos = pointLerp(p, u);
      p.cx = pos.x;
      p.cy = pos.y;
      if (u >= 1) {
        if (p.target && p.target.alive) {
          applyPop(p.target);
        } else if (p.target) {
          // Miss / already cleared — release reservation
          p.target.pending = false;
        }
        state.projectiles.splice(i, 1);
        checkWin();
        checkOutOfDrops();
      }
    }

    // Particles & squash
    for (const c of state.cubes) {
      if (c.squash > 0) c.squash = Math.max(0, c.squash - dt * 4);
      if (c.popT > 0) c.popT = Math.max(0, c.popT - dt);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    draw();
  }

  function pointLerp(p, u) {
    // ease out
    const e = 1 - (1 - u) * (1 - u);
    // Need start stored — store sx0 on create
    if (p.x0 === undefined) {
      p.x0 = p.x;
      p.y0 = p.y;
    }
    return {
      x: p.x0 + (p.tx - p.x0) * e,
      y: p.y0 + (p.ty - p.y0) * e,
    };
  }

  // ─── Drawing ─────────────────────────────────────────────
  function draw() {
    const W = LOGICAL_W, H = LOGICAL_H;
    ctx.clearRect(0, 0, W, H);

    // Soft play mat
    roundRect(ctx, 16, 8, W - 32, H - 16, 20);
    ctx.fillStyle = 'rgba(255,248,238,0.55)';
    ctx.fill();

    if (!state) return;

    drawTrack();
    drawCubes();
    drawProjectiles();
    drawDrops();
    drawParticles();
    drawGateOccupancy();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTrack() {
    const path = state.track;
    ctx.save();
    // Track band
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(path.pts[0].x, path.pts[0].y);
    for (let i = 1; i < path.pts.length; i++) ctx.lineTo(path.pts[i].x, path.pts[i].y);
    ctx.closePath();
    ctx.strokeStyle = '#2c2418';
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.strokeStyle = '#c45c3e';
    ctx.lineWidth = 16;
    ctx.stroke();
    // Inner dashed flow marks
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = 'rgba(255,248,238,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawGateOccupancy() {
    const g = pointOnPath(state.track, state.gateD);
    const n = state.drops.length;
    const shake = state.occupancyShake > 0 ? Math.sin(state.elapsed * 40) * 3 : 0;
    ctx.save();
    ctx.translate(g.x - 28 + shake, g.y);
    roundRect(ctx, -22, -16, 44, 32, 10);
    ctx.fillStyle = '#fff8ee';
    ctx.fill();
    ctx.strokeStyle = '#2c2418';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = n >= TRACK_CAP ? '#c45c3e' : '#2c2418';
    ctx.font = 'bold 14px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n + '/' + TRACK_CAP, 0, 1);
    ctx.restore();
  }

  function drawCubes() {
    const s = state.cellSize;
    const o = state.gridOrigin;
    // Back-to-front: smaller row first (top of picture), then left-to-right
    const sorted = state.cubes.slice().sort((a, b) => a.r - b.r || a.c - b.c);
    const depth = Math.max(2.5, s * 0.28);
    const rad = Math.max(1.5, Math.min(4, s * 0.22));
    for (const cube of sorted) {
      if (!cube.alive && cube.popT <= 0) continue;
      const col = COLORS[cube.color % COLORS.length];
      let x = o.x + cube.c * s;
      let y = o.y + cube.r * s;
      let alpha = 1;
      let scale = 1;
      if (!cube.alive) {
        alpha = Math.max(0, cube.popT / 0.35);
        scale = 1 + (1 - alpha) * 0.35;
      }
      if (cube.squash > 0) scale *= 1 - cube.squash * 0.12;
      ctx.save();
      ctx.globalAlpha = alpha;
      const cx = x + s / 2, cy = y + s / 2;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // Right side (darker)
      ctx.beginPath();
      ctx.moveTo(x + s - 0.5, y + 1);
      ctx.lineTo(x + s + depth, y + 1 - depth * 0.55);
      ctx.lineTo(x + s + depth, y + s - depth * 0.55);
      ctx.lineTo(x + s - 0.5, y + s - 0.5);
      ctx.closePath();
      ctx.fillStyle = col.side;
      ctx.fill();

      // Top (bright)
      ctx.beginPath();
      ctx.moveTo(x + 1, y);
      ctx.lineTo(x + s - 0.5, y);
      ctx.lineTo(x + s + depth, y - depth * 0.55);
      ctx.lineTo(x + 1 + depth, y - depth * 0.55);
      ctx.closePath();
      ctx.fillStyle = col.top;
      ctx.fill();

      // Front face — chunky rounded voxel
      roundRect(ctx, x + 0.5, y + 0.5, s - 1, s - 1, rad);
      ctx.fillStyle = col.face;
      ctx.fill();
      // Soft rim
      ctx.strokeStyle = col.dark;
      ctx.lineWidth = Math.max(0.6, s * 0.04);
      ctx.stroke();
      // Specular
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      roundRect(ctx, x + s * 0.12, y + s * 0.12, s * 0.38, Math.max(2, s * 0.14), 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawDropCapsule(x, y, colorIdx, ammo, scale) {
    const col = COLORS[colorIdx];
    const sc = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    // Body
    roundRect(ctx, -12, -16, 24, 30, 12);
    ctx.fillStyle = col.face;
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, -12, 6, 24, 8, 4);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    roundRect(ctx, -7, -12, 10, 8, 5);
    ctx.fill();
    // Ammo
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeText(String(ammo), 0, 2);
    ctx.fillText(String(ammo), 0, 2);
    ctx.restore();
  }

  function drawDrops() {
    for (const drop of state.drops) {
      const p = pointOnPath(state.track, drop.dist);
      drawDropCapsule(p.x, p.y, drop.color, drop.ammo, 1);
    }
  }

  function drawProjectiles() {
    for (const p of state.projectiles) {
      const u = Math.min(1, p.t / p.dur);
      const pos = pointLerp(p, u);
      const col = COLORS[p.color];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = col.top;
      ctx.fill();
      ctx.strokeStyle = col.dark;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }

  // ─── DOM: holding & dock ─────────────────────────────────
  function renderHolding() {
    const row = $('holding-row');
    row.innerHTML = '';
    const slots = slotCount();
    // Visual always shows up to MAX but locked extras if not owned
    const show = Math.max(slots, BASE_SLOTS);
    for (let i = 0; i < show; i++) {
      const slot = document.createElement('div');
      slot.className = 'hold-slot';
      if (i >= slots) {
        slot.classList.add('locked-extra');
        row.appendChild(slot);
        continue;
      }
      const d = state ? state.holding[i] : null;
      if (d) {
        const el = document.createElement('div');
        el.className = 'hold-drop';
        el.style.background = COLORS[d.color].face;
        el.textContent = d.ammo;
        slot.appendChild(el);
        slot.addEventListener('click', () => tryLaunchFromHold(i));
      }
      row.appendChild(slot);
    }
  }

  function renderDock() {
    const dock = $('dock');
    dock.innerHTML = '';
    if (!state) return;
    // Show all packets; used ones as empty wells
    const items = state.dock;
    // Pad to multiple of 4 for grid look
    const count = Math.max(8, Math.ceil(items.length / 4) * 4);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'dock-drop';
      btn.type = 'button';
      const d = items[i];
      if (!d || d.used) {
        btn.classList.add('empty');
        btn.disabled = true;
      } else {
        btn.style.background = COLORS[d.color].face;
        btn.textContent = d.ammo;
        btn.addEventListener('click', () => tryLaunchFromDock(i));
      }
      dock.appendChild(btn);
    }
  }

  function updateBoosters() {
    const undoBtn = $('boost-undo');
    const clearBtn = $('boost-clear');
    const slotBtn = $('boost-slot');
    undoBtn.textContent = '↩ Undo (' + (save.shop.undo || 0) + ')';
    clearBtn.textContent = '✕ Clear (' + (save.shop.clearHold || 0) + ')';
    slotBtn.textContent = '＋ Slot (' + slotCount() + '/' + MAX_SLOTS + ')';
    undoBtn.disabled = !save.shop.undo || !state || !state.lastLaunch;
    clearBtn.disabled = !save.shop.clearHold || !state || !state.holding.some(Boolean);
    slotBtn.disabled = (save.shop.extraSlots || 0) >= 2;
  }

  // ─── Menus ───────────────────────────────────────────────
  function buildLevelGrid() {
    const grid = $('level-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const b = document.createElement('button');
      b.className = 'level-btn';
      b.type = 'button';
      b.textContent = i;
      const locked = i > save.maxUnlocked;
      const won = !!save.won[i];
      if (locked) b.classList.add('locked');
      else if (won) b.classList.add('won');
      if (i === save.lastLevel) b.classList.add('current');
      b.addEventListener('click', () => {
        if (i > save.maxUnlocked) {
          toast('Locked');
          return;
        }
        startLevel(i);
      });
      grid.appendChild(b);
    }
  }

  function buildShop() {
    const wrap = $('shop-items');
    wrap.innerHTML = '';
    updateCoinUI();
    for (const item of SHOP_CATALOG) {
      const row = document.createElement('div');
      row.className = 'shop-item';
      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = '<strong>' + item.name + '</strong><span>' + item.desc + '</span>';
      const buy = document.createElement('button');
      buy.className = 'btn buy';
      buy.type = 'button';
      if (item.iap) {
        buy.textContent = 'IAP later';
        buy.addEventListener('click', () => toast('IAP later — mock only'));
      } else if (item.id === 'removeAds') {
        if (save.shop.removeAds) {
          row.classList.add('owned');
          buy.textContent = 'Owned';
        } else {
          buy.textContent = item.cost + ' 🪙';
          buy.addEventListener('click', () => purchase(item));
        }
      } else if (item.id === 'extraSlots') {
        const owned = save.shop.extraSlots || 0;
        if (owned >= item.max) {
          row.classList.add('owned');
          buy.textContent = 'Max';
        } else {
          buy.textContent = item.cost + ' 🪙';
          buy.addEventListener('click', () => purchase(item));
        }
      } else {
        buy.textContent = item.cost + ' 🪙';
        buy.addEventListener('click', () => purchase(item));
      }
      row.appendChild(info);
      row.appendChild(buy);
      wrap.appendChild(row);
    }
  }

  function purchase(item) {
    if (item.iap) {
      toast('IAP later');
      return;
    }
    if (save.coins < item.cost) {
      toast('Not enough coins');
      return;
    }
    if (item.id === 'extraSlots') {
      if ((save.shop.extraSlots || 0) >= 2) return;
      save.coins -= item.cost;
      save.shop.extraSlots = (save.shop.extraSlots || 0) + 1;
      toast('Slot unlocked!');
      if (state) {
        while (state.holding.length < slotCount()) state.holding.push(null);
        renderHolding();
      }
    } else if (item.id === 'undo') {
      save.coins -= item.cost;
      save.shop.undo = (save.shop.undo || 0) + 3;
      toast('+3 Undo');
    } else if (item.id === 'clearHold') {
      save.coins -= item.cost;
      save.shop.clearHold = (save.shop.clearHold || 0) + 3;
      toast('+3 Clear');
    } else if (item.id === 'removeAds') {
      save.coins -= item.cost;
      save.shop.removeAds = true;
      toast('Ads removed (none existed)');
    }
    writeSave(save);
    updateCoinUI();
    buildShop();
    updateBoosters();
  }

  // ─── Boosters in-game ────────────────────────────────────
  function useUndo() {
    if (!state || !save.shop.undo || !state.lastLaunch) return;
    const L = state.lastLaunch;
    // Only undo if the drop is still on track with same id pattern — simplified: remove newest matching
    if (L.type === 'dock') {
      const onTrack = state.drops.findIndex((d) => d.from === 'dock' && d.dockIndex === L.index);
      if (onTrack < 0) { toast('Too late to undo'); return; }
      state.drops.splice(onTrack, 1);
      const d = state.dock[L.index];
      if (d) { d.used = false; d.ammo = L.dropSnapshot.ammo; }
      renderDock();
    } else if (L.type === 'hold') {
      const onTrack = state.drops.findIndex((d) => d.from === 'hold' && d.holdIndex === L.index);
      if (onTrack < 0) { toast('Too late to undo'); return; }
      const drop = state.drops.splice(onTrack, 1)[0];
      state.holding[L.index] = { color: drop.color, ammo: drop.ammo, id: drop.id };
      renderHolding();
    }
    save.shop.undo -= 1;
    state.lastLaunch = null;
    writeSave(save);
    updateBoosters();
    toast('Undone');
  }

  function useClearHold() {
    if (!state || !save.shop.clearHold) return;
    const idx = state.holding.findIndex(Boolean);
    if (idx < 0) { toast('No holding drops'); return; }
    state.holding[idx] = null;
    save.shop.clearHold -= 1;
    writeSave(save);
    renderHolding();
    updateBoosters();
    toast('Cleared');
  }

  function buySlotInGame() {
    const item = SHOP_CATALOG.find((x) => x.id === 'extraSlots');
    purchase(item);
  }

  // ─── Wire UI ─────────────────────────────────────────────
  $('btn-play').addEventListener('click', () => {
    const n = Math.min(save.maxUnlocked, save.lastLevel || 1);
    startLevel(n);
  });
  $('btn-levels').addEventListener('click', () => {
    buildLevelGrid();
    updateCoinUI();
    showScreen('levels');
  });
  $('btn-shop').addEventListener('click', () => {
    returnScreen = 'title';
    buildShop();
    showScreen('shop');
  });
  $('btn-howto').addEventListener('click', () => showScreen('howto'));
  $('btn-howto-back').addEventListener('click', () => showScreen('title'));
  $('btn-levels-back').addEventListener('click', () => showScreen('title'));
  $('btn-shop-back').addEventListener('click', () => {
    if (returnScreen === 'game' && state) {
      showScreen('game');
      state.paused = false;
    } else {
      showScreen('title');
    }
  });

  $('hud-coins').addEventListener('click', () => {
    if (state) state.paused = true;
    returnScreen = 'game';
    buildShop();
    showScreen('shop');
  });
  $('btn-pause').addEventListener('click', () => {
    if (!state) return;
    state.paused = true;
    showOverlay('pause');
  });
  $('btn-resume').addEventListener('click', () => {
    if (state) state.paused = false;
    hideOverlays();
  });
  $('btn-pause-restart').addEventListener('click', () => {
    if (state) startLevel(state.levelNum);
  });
  $('btn-pause-menu').addEventListener('click', () => {
    state = null;
    showScreen('title');
  });
  $('btn-next').addEventListener('click', () => {
    const next = Math.min(TOTAL_LEVELS, (state ? state.levelNum : 1) + 1);
    if (next <= save.maxUnlocked) startLevel(next);
    else { toast('Finish this one first'); startLevel(state.levelNum); }
  });
  $('btn-replay').addEventListener('click', () => {
    if (state) startLevel(state.levelNum);
  });
  $('btn-win-menu').addEventListener('click', () => {
    state = null;
    showScreen('title');
  });
  $('btn-retry').addEventListener('click', () => {
    if (state) startLevel(state.levelNum);
  });
  $('btn-fail-menu').addEventListener('click', () => {
    state = null;
    showScreen('title');
  });
  $('btn-restart').addEventListener('click', () => {
    if (state) startLevel(state.levelNum);
  });
  $('boost-undo').addEventListener('click', useUndo);
  $('boost-clear').addEventListener('click', useClearHold);
  $('boost-slot').addEventListener('click', buySlotInGame);

  function setupCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(LOGICAL_W * dpr);
    canvas.height = Math.round(LOGICAL_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Expose for headless verification / debug
  window.Loopdrop = {
    startLevel,
    generateLevel,
    getState: () => state,
    getSave: () => save,
    forceWin() {
      if (!state) return;
      state.cubes.forEach((c) => { c.alive = false; c.popT = 0.2; });
      checkWin();
    },
    TOTAL_LEVELS,
    SAVE_KEY,
  };

  updateCoinUI();
  setupCanvas();
  window.addEventListener('resize', setupCanvas);

  // Initial title draw idle
  console.log('[Loopdrop] ready —', TOTAL_LEVELS, 'levels. Not an aim shooter.');
})();
