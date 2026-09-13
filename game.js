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
  const LAP_MS = 4000;
  const FIRE_INTERVAL = 200; // 5/s → ~20 ammo per lap
  const WIN_COINS = 5;
  const COLORS = [
    { id: 0, name: 'coral', top: '#f07167', side: '#c44d45', face: '#e85d4c', dark: '#9a3530' },
    { id: 1, name: 'moss',  top: '#6ecf8e', side: '#3a8a58', face: '#3a9e6e', dark: '#2a6a48' },
    { id: 2, name: 'sky',   top: '#6eb5f0', side: '#3a6fa8', face: '#3d7ec9', dark: '#2a5588' },
    { id: 3, name: 'amber', top: '#f5c542', side: '#c4921e', face: '#e8a820', dark: '#a07010' },
    { id: 4, name: 'clay',  top: '#d4a574', side: '#a06a40', face: '#b87a5a', dark: '#7a4a30' },
    { id: 5, name: 'ink',   top: '#7a8a9a', side: '#4a5560', face: '#5a6a7a', dark: '#3a4450' },
  ];

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

  // ─── Hand-authored silhouettes (cells as [r,c] relative) ─
  // Compact original shapes — NOT competitor levels
  const SILHOUETTES = {
    heart: [
      [0,1],[0,3],
      [1,0],[1,1],[1,2],[1,3],[1,4],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,1],[3,2],[3,3],
      [4,2],
    ],
    star: [
      [0,2],
      [1,1],[1,2],[1,3],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,1],[3,2],[3,3],
      [4,0],[4,2],[4,4],
    ],
    house: [
      [0,2],
      [1,1],[1,2],[1,3],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,0],[3,1],[3,2],[3,3],[3,4],
      [4,0],[4,1],[4,3],[4,4],
    ],
    mushroom: [
      [0,1],[0,2],[0,3],
      [1,0],[1,1],[1,2],[1,3],[1,4],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,2],
      [4,1],[4,2],[4,3],
    ],
    rocket: [
      [0,2],
      [1,1],[1,2],[1,3],
      [2,1],[2,2],[2,3],
      [3,1],[3,2],[3,3],
      [4,0],[4,2],[4,4],
      [5,2],
    ],
    fish: [
      [1,0],[1,1],
      [0,2],[0,3],[0,4],
      [1,2],[1,3],[1,4],[1,5],
      [2,2],[2,3],[2,4],
      [3,0],[3,1],
    ],
    tree: [
      [0,2],
      [1,1],[1,2],[1,3],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,1],[3,2],[3,3],
      [4,2],
      [5,2],
    ],
    cup: [
      [0,0],[0,1],[0,2],[0,3],
      [1,0],[1,3],[1,4],
      [2,0],[2,3],[2,4],
      [3,0],[3,1],[3,2],[3,3],
      [4,1],[4,2],
    ],
    car: [
      [1,1],[1,2],[1,3],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,0],[3,1],[3,2],[3,3],[3,4],
      [4,1],[4,3],
    ],
    moon: [
      [0,1],[0,2],[0,3],
      [1,0],[1,1],
      [2,0],[2,1],
      [3,0],[3,1],[3,2],
      [4,1],[4,2],[4,3],
    ],
    boot: [
      [0,2],[0,3],
      [1,2],[1,3],
      [2,2],[2,3],
      [3,0],[3,1],[3,2],[3,3],
      [4,0],[4,1],[4,2],[4,3],[4,4],
    ],
    key: [
      [0,1],[0,2],
      [1,0],[1,1],[1,2],[1,3],
      [2,1],[2,2],
      [3,2],
      [4,1],[4,2],
      [5,2],
    ],
    cactus: [
      [0,2],
      [1,0],[1,2],
      [2,0],[2,1],[2,2],[2,3],
      [3,2],[3,3],
      [4,2],
      [5,1],[5,2],[5,3],
    ],
    bird: [
      [0,3],
      [1,0],[1,1],[1,2],[1,3],
      [2,1],[2,2],[2,3],[2,4],
      [3,2],[3,3],
      [4,1],[4,2],
    ],
    boat: [
      [0,3],
      [1,2],[1,3],
      [2,1],[2,2],[2,3],
      [3,0],[3,1],[3,2],[3,3],[3,4],
      [4,1],[4,2],[4,3],
    ],
    gem: [
      [0,2],
      [1,1],[1,2],[1,3],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,1],[3,2],[3,3],
      [4,2],
    ],
    potion: [
      [0,1],[0,2],[0,3],
      [1,2],
      [2,1],[2,2],[2,3],
      [3,0],[3,1],[3,2],[3,3],[3,4],
      [4,0],[4,1],[4,2],[4,3],[4,4],
    ],
    sword: [
      [0,2],
      [1,2],
      [2,1],[2,2],[2,3],
      [3,2],
      [4,2],
      [5,1],[5,2],[5,3],
    ],
    cloud: [
      [0,1],[0,2],
      [1,0],[1,1],[1,2],[1,3],[1,4],
      [2,0],[2,1],[2,2],[2,3],[2,4],[2,5],
      [3,1],[3,2],[3,3],[3,4],
    ],
    crown: [
      [0,0],[0,2],[0,4],
      [1,0],[1,1],[1,2],[1,3],[1,4],
      [2,0],[2,1],[2,2],[2,3],[2,4],
      [3,1],[3,2],[3,3],
    ],
  };
  const SILHOUETTE_NAMES = Object.keys(SILHOUETTES);

  // ─── Level generation ────────────────────────────────────
  function difficultyFor(level) {
    if (level <= 10) return { colors: 2, minCells: 10, maxCells: 14, packets: [3, 5], ammoBias: 0.9 };
    if (level <= 30) return { colors: 2, minCells: 12, maxCells: 16, packets: [4, 7], ammoBias: 1.0 };
    if (level <= 60) return { colors: 3, minCells: 14, maxCells: 18, packets: [5, 9], ammoBias: 1.05 };
    if (level <= 100) return { colors: 4, minCells: 14, maxCells: 20, packets: [7, 12], ammoBias: 1.1 };
    if (level <= 150) return { colors: 5, minCells: 16, maxCells: 22, packets: [9, 14], ammoBias: 1.15 };
    return { colors: 6, minCells: 16, maxCells: 22, packets: [10, 16], ammoBias: 1.2 };
  }

  function proceduralBlob(rng, targetCells) {
    const cells = new Set();
    const w = 5 + Math.floor(rng() * 3);
    const h = 5 + Math.floor(rng() * 3);
    let r = Math.floor(h / 2), c = Math.floor(w / 2);
    cells.add(r + ',' + c);
    const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]];
    let guard = 0;
    while (cells.size < targetCells && guard++ < 500) {
      const list = [...cells].map((s) => s.split(',').map(Number));
      const pick = list[Math.floor(rng() * list.length)];
      const d = dirs[Math.floor(rng() * dirs.length)];
      const nr = pick[0] + d[0], nc = pick[1] + d[1];
      if (nr >= 0 && nr < h && nc >= 0 && nc < w) cells.add(nr + ',' + nc);
    }
    return [...cells].map((s) => s.split(',').map(Number));
  }

  function splitAmmo(count, rng, bias) {
    if (count <= 0) return [];
    // Prefer a few packets that sum exactly to count
    const packets = [];
    let left = count;
    while (left > 0) {
      if (left <= 4) {
        packets.push(left);
        break;
      }
      // Packet size roughly 4–12, scaled by bias
      const maxP = Math.min(left - 1, Math.max(5, Math.floor(12 * bias)));
      const minP = Math.min(4, left);
      let size = minP + Math.floor(rng() * (maxP - minP + 1));
      // Leave at least 2 for another packet if possible, or take all
      if (left - size < 2 && left - size > 0) size = left;
      size = Math.max(1, Math.min(size, left));
      packets.push(size);
      left -= size;
    }
    return packets;
  }

  function generateLevel(levelNumber) {
    const seed = levelNumber;
    const rng = mulberry32(seed * 9973 + 42);
    const diff = difficultyFor(levelNumber);
    const numColors = Math.min(diff.colors, COLORS.length);

    // Pick silhouette or blob
    let cells;
    if (levelNumber <= 20 || (levelNumber % 5 === 0 && levelNumber <= 100)) {
      const name = SILHOUETTE_NAMES[(levelNumber - 1) % SILHOUETTE_NAMES.length];
      cells = SILHOUETTES[name].map(([r, c]) => [r, c]);
      // Sometimes mirror / trim for variety
      if (rng() > 0.6 && cells.length > diff.minCells) {
        const drop = Math.floor(rng() * 3);
        for (let i = 0; i < drop; i++) cells.pop();
      }
    } else {
      const target = diff.minCells + Math.floor(rng() * (diff.maxCells - diff.minCells + 1));
      cells = proceduralBlob(rng, target);
    }

    // Normalize cells to 0-based bbox
    let minR = Infinity, minC = Infinity, maxR = 0, maxC = 0;
    for (const [r, c] of cells) {
      minR = Math.min(minR, r); minC = Math.min(minC, c);
      maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
    }
    cells = cells.map(([r, c]) => [r - minR, c - minC]);
    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;

    // Assign colors (recolor via seed)
    const colorOrder = shuffle([...COLORS.keys()].slice(0, 6), rng).slice(0, numColors);
    const grid = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) grid[r][c] = -1;
    }
    // Paint: flood-ish by position hash
    for (const [r, c] of cells) {
      const ci = colorOrder[Math.floor(rng() * numColors)];
      grid[r][c] = ci;
    }
    // Smooth: give neighbors same color often for nicer blobs
    for (let pass = 0; pass < 2; pass++) {
      for (const [r, c] of cells) {
        if (rng() > 0.55) continue;
        const nbs = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
        for (const [nr, nc] of nbs) {
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] >= 0) {
            if (rng() > 0.4) grid[r][c] = grid[nr][nc];
            break;
          }
        }
      }
    }

    // Ensure all selected colors appear at least once
    const used = new Set();
    for (const [r, c] of cells) used.add(grid[r][c]);
    for (const want of colorOrder) {
      if (!used.has(want)) {
        const [r, c] = cells[Math.floor(rng() * cells.length)];
        grid[r][c] = want;
        used.add(want);
      }
    }

    // Count per color
    const counts = {};
    for (const [r, c] of cells) {
      const col = grid[r][c];
      counts[col] = (counts[col] || 0) + 1;
    }

    // Build dock packets — totals MUST match cube counts
    let dock = [];
    for (const col of Object.keys(counts).map(Number)) {
      const packets = splitAmmo(counts[col], rng, diff.ammoBias);
      for (const ammo of packets) {
        dock.push({ color: col, ammo, id: 'p' + dock.length + '_' + levelNumber });
      }
    }
    dock = shuffle(dock, rng);

    // Pad / trim packet count toward difficulty target by merging/splitting carefully
    const [pMin, pMax] = diff.packets;
    // If too few packets, split largest
    while (dock.length < pMin && dock.some((d) => d.ammo >= 4)) {
      dock.sort((a, b) => b.ammo - a.ammo);
      const big = dock[0];
      if (big.ammo < 4) break;
      const half = Math.floor(big.ammo / 2);
      big.ammo -= half;
      dock.push({ color: big.color, ammo: half, id: 'x' + dock.length + '_' + levelNumber });
      dock = shuffle(dock, rng);
    }
    // If too many, merge same-color
    while (dock.length > pMax) {
      const byColor = {};
      dock.forEach((d, i) => {
        if (!byColor[d.color]) byColor[d.color] = [];
        byColor[d.color].push(i);
      });
      let merged = false;
      for (const col of Object.keys(byColor)) {
        if (byColor[col].length >= 2) {
          const i0 = byColor[col][0], i1 = byColor[col][1];
          dock[i0].ammo += dock[i1].ammo;
          dock.splice(i1, 1);
          merged = true;
          break;
        }
      }
      if (!merged) break;
    }

    // Verify totals
    const dockTotals = {};
    for (const d of dock) dockTotals[d.color] = (dockTotals[d.color] || 0) + d.ammo;
    for (const col of Object.keys(counts).map(Number)) {
      if (dockTotals[col] !== counts[col]) {
        // Fix any drift
        const diffAmt = counts[col] - (dockTotals[col] || 0);
        if (diffAmt !== 0) {
          const existing = dock.find((d) => d.color === col);
          if (existing) existing.ammo += diffAmt;
          else if (diffAmt > 0) dock.push({ color: col, ammo: diffAmt, id: 'fix' + col });
        }
      }
    }

    return { levelNumber, rows, cols, grid, dock, counts };
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
    const cellSize = Math.min(
      picArea.maxW / Math.max(level.cols, 1),
      picArea.maxH / Math.max(level.rows, 1),
      28
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

  function pickTargetCube(color) {
    const alive = remainingCubesOf(color);
    if (!alive.length) return null;
    // Prefer edge/outer cells
    const rows = state.level.rows, cols = state.level.cols;
    const edge = alive.filter((c) => {
      // Edge of bounding shape: missing neighbor or border
      const nbs = [[c.r-1,c.c],[c.r+1,c.c],[c.r,c.c-1],[c.r,c.c+1]];
      for (const [nr, nc] of nbs) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return true;
        const other = state.cubes.find((x) => x.r === nr && x.c === nc);
        if (!other || !other.alive) return true;
      }
      return false;
    });
    const pool = edge.length ? edge : alive;
    // Prefer outer (far from center)
    const cr = (rows - 1) / 2, cc = (cols - 1) / 2;
    pool.sort((a, b) => {
      const da = Math.hypot(a.r - cr, a.c - cc);
      const db = Math.hypot(b.r - cr, b.c - cc);
      return db - da;
    });
    return pool[0];
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
      fireAcc: 0,
      from: 'dock',
      dockIndex: index,
      id: d.id + '_' + Date.now(),
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
      fireAcc: 0,
      from: 'hold',
      holdIndex: slotIndex,
      id: d.id || 'h' + Date.now(),
    };
    state.lastLaunch = { type: 'hold', index: slotIndex, dropSnapshot: { ...d } };
    state.drops.push(drop);
    renderHolding();
    updateBoosters();
  }

  function onLapComplete(drop, idx) {
    // Finished one full lap (crossed gate going around)
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
    state.failed = true;
    showOverlay('fail');
  }

  function fireFromDrop(drop) {
    if (drop.ammo <= 0) return;
    const target = pickTargetCube(drop.color);
    if (!target) return;
    drop.ammo -= 1;
    const from = pointOnPath(state.track, drop.dist);
    const to = cubeWorldPos(target);
    state.projectiles.push({
      x: from.x, y: from.y,
      x0: from.x, y0: from.y,
      tx: to.x, ty: to.y,
      t: 0,
      dur: 0.18,
      color: drop.color,
      target,
    });
  }

  function applyPop(cube) {
    if (!cube.alive) return;
    cube.alive = false;
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

      // Fire
      if (!state.won && drop.ammo > 0 && remainingCubesOf(drop.color).length) {
        drop.fireAcc += dt * 1000;
        while (drop.fireAcc >= FIRE_INTERVAL && drop.ammo > 0) {
          drop.fireAcc -= FIRE_INTERVAL;
          fireFromDrop(drop);
        }
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
      state.drops = state.drops.filter((d) => {
        // let them walk a bit then remove
        return d.ammo > 0;
      });
    }

    // Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      p.t += dt;
      const u = Math.min(1, p.t / p.dur);
      p.x = p.x + (p.tx - p.x) * 0; // will lerp below
      const sx = pointLerp(p, u).x;
      const sy = pointLerp(p, u).y;
      p.cx = sx;
      p.cy = sy;
      if (u >= 1) {
        applyPop(p.target);
        state.projectiles.splice(i, 1);
        checkWin();
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
    // Draw back-to-front (top rows first visually with depth — actually lower rows in front)
    const sorted = state.cubes.slice().sort((a, b) => a.r - b.r || a.c - b.c);
    for (const cube of sorted) {
      if (!cube.alive && cube.popT <= 0) continue;
      const col = COLORS[cube.color];
      let x = o.x + cube.c * s;
      let y = o.y + cube.r * s;
      const depth = s * 0.22;
      let alpha = 1;
      let scale = 1;
      if (!cube.alive) {
        alpha = Math.max(0, cube.popT / 0.35);
        scale = 1 + (1 - alpha) * 0.4;
      }
      if (cube.squash > 0) {
        scale *= 1 - cube.squash * 0.15;
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      const cx = x + s / 2, cy = y + s / 2;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // Right side face
      ctx.beginPath();
      ctx.moveTo(x + s, y + 2);
      ctx.lineTo(x + s + depth, y + 2 - depth * 0.5);
      ctx.lineTo(x + s + depth, y + s - depth * 0.5);
      ctx.lineTo(x + s, y + s);
      ctx.closePath();
      ctx.fillStyle = col.side;
      ctx.fill();

      // Top face
      ctx.beginPath();
      ctx.moveTo(x + 2, y);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x + s + depth, y - depth * 0.5);
      ctx.lineTo(x + 2 + depth, y - depth * 0.5);
      ctx.closePath();
      ctx.fillStyle = col.top;
      ctx.fill();

      // Front face
      roundRect(ctx, x + 1, y + 1, s - 2, s - 2, 3);
      ctx.fillStyle = col.face;
      ctx.fill();
      // Specular
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + 3, y + 3, s * 0.35, 3);

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
