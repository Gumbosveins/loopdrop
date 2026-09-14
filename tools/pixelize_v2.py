#!/usr/bin/env python3
"""Improved Loopdrop pixelizer: bbox, border reject, k-means, candy palette map."""
from __future__ import annotations

import json
import math
import os
import re
import sys
import time
import urllib.parse
from collections import Counter, deque
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageFilter

ROOT = Path("/workspace/loopdrop")
SRC = ROOT / "assets" / "src"
SRC.mkdir(parents=True, exist_ok=True)
TOOLS = ROOT / "tools"
UA = "LoopdropGameBot/1.0 (educational HTML5 game; CC0/PD only; contact: loopdrop@local)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA})

# Must match game.js COLORS face colors (order = palette index)
PALETTE_HEX = [
    "#e63946",  # 0 red/coral
    "#ff6b9d",  # 1 pink
    "#ff8c42",  # 2 orange/amber-ish
    "#ffd60a",  # 3 yellow
    "#2ec4b6",  # 4 green/moss-teal
    "#4cc9f0",  # 5 blue/sky
    "#9b5de5",  # 6 purple
    "#c77d4a",  # 7 brown/cream-clay
]
PALETTE = np.array(
    [tuple(int(h[i : i + 2], 16) for i in (1, 3, 5)) for h in PALETTE_HEX],
    dtype=np.float64,
)

ALLOWED_LICENSE_RE = re.compile(
    r"(^|\b)(cc0|cc-?0|public\s*domain|pd-?us|pd[- ]?art|pd[- ]?old|"
    r"copyrighted\s*free\s*use|no\s*rights\s*reserved|\bpd\b)(\b|$)",
    re.I,
)

# Known-good CC0/PD filenames / search queries for simple subjects
FETCH_QUERIES = [
    "red apple fruit white background",
    "yellow lemon fruit white background",
    "orange fruit white background",
    "strawberry fruit white background",
    "pear fruit white background",
    "peach fruit white background",
    "banana fruit white background",
    "tomato fruit white background",
    "carrot vegetable white background",
    "watermelon slice white background",
    "cherries fruit white background",
    "grapes fruit white background",
    "sunflower flower white background",
    "tulip flower white background",
    "mushroom white background",
    "The Earth seen from Apollo 17",
    "Blue Marble NASA Earth",
    "Jupiter Cassini public domain",
    "Saturn Hubble public domain",
    "Moon Apollo public domain",
    "carrot USDA",
    "apple USDA",
    "lemon USDA",
    "strawberry USDA",
    "pear USDA",
    "peach USDA",
    "tomato USDA",
    "banana USDA",
    "watermelon USDA",
    "broccoli USDA",
    "pineapple fruit white",
    "rubber duck yellow",
    "ladybug insect",
    "butterfly insect white background",
    "goldfish white background",
    "hot air balloon",
    "lighthouse coastal",
    "cactus plant white",
    "rose flower botanical plate",
    "Köhler Medizinal-Pflanzen lemon",
    "Köhler Medizinal-Pflanzen apple",
    "Bufford fruit cards pear",
    "Bufford fruit cards apple",
    "Bufford fruit cards peach",
    "Bufford fruit cards orange",
    "Semper Augustus Tulip",
    "Ambersweet oranges",
    "Melitopol Cherry",
    "Carrots orange vegetable",
    "Watermelon fruit",
]

NAME_HINTS = [
    ("strawberry", "strawberry"),
    ("apple", "apple"),
    ("lemon", "lemon"),
    ("mandarin", "orange"),
    ("orange", "orange"),
    ("citrus", "lemon"),
    ("watermelon", "watermelon"),
    ("tomato", "tomato"),
    ("cherry_dulcemiel", "tomato"),
    ("cherry_nebula", "tomato"),
    ("cherries", "cherries"),
    ("cherry", "cherries"),
    ("grape", "grapes"),
    ("peach", "peach"),
    ("pear", "pear"),
    ("banana", "banana"),
    ("tomato", "tomato"),
    ("carrot", "carrot"),
    ("mushroom", "mushroom"),
    ("fungi", "mushroom"),
    ("sunflower", "sunflower"),
    ("tulip", "tulip"),
    ("rose", "rose"),
    ("blue_marble", "earth"),
    ("blue marble", "earth"),
    ("earth", "earth"),
    ("apollo", "earth"),
    ("jupiter", "planet"),
    ("saturn", "planet"),
    ("mars", "planet"),
    ("planet", "planet"),
    ("moon", "moon"),
    ("rocket", "rocket"),
    ("bicycle", "bicycle"),
    ("bike", "bicycle"),
    ("sailboat", "sailboat"),
    ("boat", "sailboat"),
    ("duck", "duck"),
    ("owl", "owl"),
    ("fish", "fish"),
    ("turtle", "turtle"),
    ("frog", "frog"),
    ("butterfly", "butterfly"),
    ("car_", "car"),
    ("_car", "car"),
    ("dog", "dog"),
    ("cat", "cat"),
    ("cactus", "cactus"),
    ("tree", "tree"),
    ("house", "house"),
    ("lighthouse", "lighthouse"),
    ("balloon", "balloon"),
    ("crown", "crown"),
    ("camera", "camera"),
    ("cup", "cup"),
    ("ice", "ice"),
    ("pineapple", "pineapple"),
    ("broccoli", "broccoli"),
    ("ladybug", "ladybug"),
    ("rubber", "duck"),
]


def guess_name(path: Path) -> str:
    stem = path.stem.lower()
    stem = re.sub(r"\.(jpg|jpeg|png|webp|tif|tiff)$", "", stem, flags=re.I)
    for needle, name in NAME_HINTS:
        if needle in stem:
            return name
    # met_123_name or nasa_xxx_name
    m = re.search(r"(?:met|nasa)_[^_]+_([a-z]+)", stem)
    if m:
        return m.group(1)
    clean = re.sub(r"[^a-z]+", " ", stem).strip().split()
    return clean[0][:24] if clean else "photo"


def license_ok(short_name: str, license_url: str = "") -> bool:
    sn = (short_name or "").strip()
    url = (license_url or "").strip()
    text = f"{sn} {url}"
    if re.search(r"cc[- ]?by|sharealike|\bnc\b|noncommercial|gfdl|fair\s*use", sn, re.I):
        return False
    if ALLOWED_LICENSE_RE.search(sn):
        return True
    if url and re.search(r"publicdomain|cc0|creativecommons\.org/publicdomain", url, re.I):
        if re.search(r"cc[- ]?by", url, re.I) and "publicdomain" not in url.lower():
            return False
        return True
    return False


def commons_search(query: str, limit: int = 8):
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata",
        "iiurlwidth": 800,
        "format": "json",
    }
    try:
        r = SESSION.get(api, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"  search fail {query}: {e}")
        return []
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for page in pages.values():
        title = page.get("title", "")
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        mime = info.get("mime") or ""
        if not mime.startswith("image/") or mime in ("image/svg+xml", "image/gif"):
            continue
        meta = info.get("extmetadata") or {}

        def meta_val(k):
            v = meta.get(k) or {}
            return (v.get("value") or "").strip()

        lic = meta_val("LicenseShortName")
        lic_url = meta_val("LicenseUrl")
        artist = re.sub(r"<[^>]+>", "", meta_val("Artist") or meta_val("Attribution") or "Unknown")
        artist = re.sub(r"\s+", " ", artist).strip()[:120]
        if not license_ok(lic, lic_url):
            continue
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        out.append(
            {
                "title": title,
                "url": url,
                "fullurl": info.get("url"),
                "license": lic or "Public domain",
                "license_url": lic_url,
                "author": artist or "Unknown",
                "query": query,
            }
        )
    return out


def download(item, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 2000:
        return True
    try:
        r = SESSION.get(item["url"], timeout=60)
        r.raise_for_status()
        dest.write_bytes(r.content)
        return True
    except Exception as e:
        print(f"  download fail {item['title']}: {e}")
        return False


# ─── Image analysis helpers ─────────────────────────────────


def load_rgba(path: Path) -> np.ndarray:
    im = Image.open(path)
    if im.mode == "P":
        im = im.convert("RGBA")
    elif im.mode != "RGBA":
        im = im.convert("RGBA")
    return np.array(im)


def studio_gray_mask(rgb: np.ndarray) -> np.ndarray:
    """Near-uniform light/mid studio gray (low chroma, high-ish value)."""
    r, g, b = rgb[..., 0].astype(np.float64), rgb[..., 1].astype(np.float64), rgb[..., 2].astype(np.float64)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    chroma = mx - mn
    mean = (r + g + b) / 3.0
    # light gray backdrop
    light = (mean > 200) & (chroma < 18)
    # mid studio gray
    mid = (mean > 160) & (mean <= 200) & (chroma < 12)
    return light | mid


def empty_mask(arr: np.ndarray) -> np.ndarray:
    """True where pixel is empty (transparent / near-white / studio gray)."""
    a = arr[..., 3]
    rgb = arr[..., :3]
    near_white = (rgb[..., 0] > 245) & (rgb[..., 1] > 245) & (rgb[..., 2] > 245)
    soft_white = (rgb[..., 0] > 235) & (rgb[..., 1] > 235) & (rgb[..., 2] > 235)
    near_black = (rgb[..., 0] < 8) & (rgb[..., 1] < 8) & (rgb[..., 2] < 8)
    gray = studio_gray_mask(rgb)
    return (a < 28) | near_white | soft_white | near_black | gray


def content_bbox(mask_filled: np.ndarray):
    if not mask_filled.any():
        return None
    ys, xs = np.where(mask_filled)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def is_dark_border_color(rgb) -> bool:
    r, g, b = int(rgb[0]), int(rgb[1]), int(rgb[2])
    # dark brown / black / dark wood frames
    if r < 55 and g < 45 and b < 40:
        return True
    if r < 90 and g < 60 and b < 45 and (r - g) > 8:
        return True
    # ornate gilt-dark mixed — treat very dark neutrals
    if max(r, g, b) < 50:
        return True
    return False


def edge_border_fraction(arr: np.ndarray, filled: np.ndarray, band: int = 6) -> float:
    """Fraction of edge-band filled pixels that are dark brown/black."""
    h, w = filled.shape
    edge = np.zeros_like(filled)
    edge[:band, :] = True
    edge[-band:, :] = True
    edge[:, :band] = True
    edge[:, -band:] = True
    edge_filled = edge & filled
    n = int(edge_filled.sum())
    if n < 20:
        return 0.0
    samples = arr[..., :3][edge_filled]
    r, g, b = samples[:, 0].astype(int), samples[:, 1].astype(int), samples[:, 2].astype(int)
    dark = (
        ((r < 55) & (g < 45) & (b < 40))
        | ((r < 90) & (g < 60) & (b < 45) & ((r - g) > 8))
        | (np.maximum(np.maximum(r, g), b) < 50)
    )
    return float(dark.sum()) / n


def erode_border(arr: np.ndarray, filled: np.ndarray, max_iters: int = 60):
    """Erode dark border from outside inward; return new filled mask (vectorized)."""
    h, w = filled.shape
    f = filled.copy()
    rgb = arr[..., :3]
    dark = (
        ((rgb[..., 0] < 55) & (rgb[..., 1] < 45) & (rgb[..., 2] < 40))
        | ((rgb[..., 0] < 90) & (rgb[..., 1] < 60) & (rgb[..., 2] < 45) & ((rgb[..., 0].astype(int) - rgb[..., 1].astype(int)) > 8))
        | (np.maximum(np.maximum(rgb[..., 0], rgb[..., 1]), rgb[..., 2]) < 50)
    )
    orig = int(filled.sum())
    for _ in range(max_iters):
        # 4-neighbor empty or image edge
        up = np.ones_like(f); up[1:, :] = f[:-1, :]
        down = np.ones_like(f); down[:-1, :] = f[1:, :]
        left = np.ones_like(f); left[:, 1:] = f[:, :-1]
        right = np.ones_like(f); right[:, :-1] = f[:, 1:]
        exposed = f & (~up | ~down | ~left | ~right)
        exposed[0, :] = f[0, :]
        exposed[-1, :] = f[-1, :]
        exposed[:, 0] = f[:, 0]
        exposed[:, -1] = f[:, -1]
        remove = exposed & dark
        if not remove.any():
            break
        f[remove] = False
        if f.sum() < orig * 0.55:
            break
    return f


def center_square_crop(arr: np.ndarray, filled: np.ndarray):
    """Tight bbox then expand to square-ish around content center."""
    bbox = content_bbox(filled)
    if not bbox:
        return None, None
    x0, y0, x1, y1 = bbox
    cw, ch = x1 - x0, y1 - y0
    if cw < 8 or ch < 8:
        return None, None
    # pad slightly
    pad = max(2, int(0.03 * max(cw, ch)))
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(arr.shape[1], x1 + pad)
    y1 = min(arr.shape[0], y1 + pad)
    cw, ch = x1 - x0, y1 - y0
    # prefer content; if very wide/tall painting, center on densest region
    side = max(cw, ch)
    # don't expand too much into empty — keep rectangle of content
    # but make aspect closer to square by cropping the longer side toward mass center
    ys, xs = np.where(filled[y0:y1, x0:x1])
    if len(xs) == 0:
        return None, None
    cy = y0 + int(ys.mean())
    cx = x0 + int(xs.mean())
    # target square size = max side but clamp to content extent * 1.15
    side = int(max(cw, ch) * 1.05)
    side = min(side, max(arr.shape[0], arr.shape[1]))
    nx0 = max(0, cx - side // 2)
    ny0 = max(0, cy - side // 2)
    nx1 = min(arr.shape[1], nx0 + side)
    ny1 = min(arr.shape[0], ny0 + side)
    nx0 = max(0, nx1 - side)
    ny0 = max(0, ny1 - side)
    # Prefer content bbox if aspect already reasonable (<1.6)
    aspect = max(cw, ch) / max(min(cw, ch), 1)
    if aspect <= 1.55:
        return arr[y0:y1, x0:x1].copy(), filled[y0:y1, x0:x1].copy()
    return arr[ny0:ny1, nx0:nx1].copy(), filled[ny0:ny1, nx0:nx1].copy()


def nearest_palette(rgb) -> int:
    d = np.sum((PALETTE - np.asarray(rgb, dtype=np.float64)) ** 2, axis=1)
    return int(np.argmin(d))


def kmeans(pixels: np.ndarray, k: int, iters: int = 12, seed: int = 42):
    """pixels: (N,3) float. Returns labels (N,), centers (k,3)."""
    n = len(pixels)
    if n == 0:
        return np.array([], dtype=int), np.zeros((0, 3))
    k = max(1, min(k, n))
    rng = np.random.default_rng(seed)
    # k-means++ style init
    centers = np.empty((k, 3), dtype=np.float64)
    centers[0] = pixels[rng.integers(0, n)]
    for i in range(1, k):
        dist2 = np.min(np.sum((pixels[:, None, :] - centers[None, :i, :]) ** 2, axis=2), axis=1)
        probs = dist2 / (dist2.sum() + 1e-12)
        centers[i] = pixels[rng.choice(n, p=probs)]
    labels = np.zeros(n, dtype=int)
    for _ in range(iters):
        dist2 = np.sum((pixels[:, None, :] - centers[None, :, :]) ** 2, axis=2)
        labels = np.argmin(dist2, axis=1)
        for ci in range(k):
            m = labels == ci
            if m.any():
                centers[ci] = pixels[m].mean(axis=0)
    return labels, centers


def drop_speckles(grid: np.ndarray, min_size: int = 3) -> np.ndarray:
    h, w = grid.shape
    visited = np.zeros_like(grid, dtype=bool)
    out = grid.copy()
    for y in range(h):
        for x in range(w):
            if out[y, x] < 0 or visited[y, x]:
                continue
            col = out[y, x]
            q = deque([(y, x)])
            visited[y, x] = True
            comp = [(y, x)]
            while q:
                cy, cx = q.popleft()
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and out[ny, nx] == col:
                        visited[ny, nx] = True
                        q.append((ny, nx))
                        comp.append((ny, nx))
            if len(comp) <= min_size - 1:  # size <= 2 when min_size=3 → ≤2
                for cy, cx in comp:
                    out[cy, cx] = -1
    return out


def fill_small_holes(grid: np.ndarray, max_hole: int = 3) -> np.ndarray:
    """Fill small empty components fully enclosed by filled cells."""
    h, w = grid.shape
    filled = grid >= 0
    empty = ~filled
    visited = np.zeros_like(empty, dtype=bool)
    out = grid.copy()
    for y in range(h):
        for x in range(w):
            if not empty[y, x] or visited[y, x]:
                continue
            q = deque([(y, x)])
            visited[y, x] = True
            comp = [(y, x)]
            touches_border = False
            while q:
                cy, cx = q.popleft()
                if cy == 0 or cx == 0 or cy == h - 1 or cx == w - 1:
                    touches_border = True
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and empty[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
                        comp.append((ny, nx))
            if touches_border or len(comp) > max_hole:
                continue
            # fill with mode of neighboring colors
            neigh_cols = []
            for cy, cx in comp:
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and out[ny, nx] >= 0:
                        neigh_cols.append(int(out[ny, nx]))
            if not neigh_cols:
                continue
            fill_c = Counter(neigh_cols).most_common(1)[0][0]
            for cy, cx in comp:
                out[cy, cx] = fill_c
    return out


def mask_structure_ok(filled_mask: np.ndarray) -> bool:
    """Reject silhouette that is >70% one blob with near-zero spatial variance structure.
    Use variance of row/col occupancy — flat rectangle of one color fails if too uniform.
    Actually: reject if >70% one color AND low variance of filled mask positions.
    Here we only have mask; caller checks color dominance separately.
    """
    if filled_mask.sum() < 10:
        return False
    # spatial variance of filled cells
    ys, xs = np.where(filled_mask)
    if len(xs) < 10:
        return False
    # coefficient of variation of row fills
    row_fills = filled_mask.sum(axis=1).astype(np.float64)
    row_fills = row_fills[row_fills > 0]
    if len(row_fills) < 3:
        return False
    # If almost every occupied row has nearly identical fill count and shape is a solid block
    # with no holes, variance of mask itself:
    # Use fraction of bbox that is filled — solid rectangle without structure
    y0, y1 = ys.min(), ys.max() + 1
    x0, x1 = xs.min(), xs.max() + 1
    bbox_area = (y1 - y0) * (x1 - x0)
    fill_frac = filled_mask.sum() / max(bbox_area, 1)
    # solid block with fill_frac > 0.92 and aspect near 1 and no holes → still OK for fruit
    # Reject only if variance of row occupancy is extremely low relative to mean AND fill is a thin frame
    # Frame detection: outer ring dense, interior empty
    if y1 - y0 >= 6 and x1 - x0 >= 6:
        inner = filled_mask[y0 + 2 : y1 - 2, x0 + 2 : x1 - 2]
        outer_band = filled_mask[y0:y1, x0:x1].copy()
        outer_band[2:-2, 2:-2] = False
        if outer_band.sum() > 0 and inner.size > 0:
            outer_dens = outer_band.sum() / max(outer_band.size, 1)
            inner_dens = inner.sum() / max(inner.size, 1)
            if outer_dens > 0.55 and inner_dens < 0.15:
                return False  # frame-like
    return True



def is_color_frame(grid) -> bool:
    """Reject grids that are mostly a dark/brown outer ring with hollow or flat interior (picture frames)."""
    import numpy as np
    from collections import Counter
    h, w = grid.shape
    if h < 6 or w < 6:
        return False
    band = max(1, min(2, h // 5, w // 5))
    outer = []
    inner = []
    for y in range(h):
        for x in range(w):
            v = int(grid[y, x])
            if v < 0:
                continue
            on_outer = y < band or y >= h - band or x < band or x >= w - band
            if on_outer:
                outer.append(v)
            elif y >= band + 1 and y < h - band - 1 and x >= band + 1 and x < w - band - 1:
                inner.append(v)
    if len(outer) < 12:
        return False
    oc = Counter(outer)
    odom_c, odom_n = oc.most_common(1)[0]
    if odom_n / len(outer) < 0.55:
        return False
    # outer dominant is brown/cream (7) or gray-ish brown
    if odom_c not in (7, 5, 4):
        # still frame-like if outer is uniform and inner mostly empty
        pass
    inner_filled = len(inner)
    inner_area = max(1, (h - 2 * band - 2) * (w - 2 * band - 2))
    # classic frame: thick outer ring, sparse interior
    if inner_filled < 0.25 * inner_area and odom_n / len(outer) > 0.6:
        return True
    # or solid rectangle of one border color surrounding a solid block of another (met peach)
    if inner_filled > 0:
        ic = Counter(inner)
        idom_c, idom_n = ic.most_common(1)[0]
        if idom_c != odom_c and idom_n / inner_filled > 0.7 and odom_n / len(outer) > 0.7:
            # check that outer is really a ring: corners of outer match
            corners = [grid[0, 0], grid[0, w - 1], grid[h - 1, 0], grid[h - 1, w - 1]]
            if sum(1 for c in corners if c == odom_c) >= 3:
                return True
    return False


def choose_target_w(name: str, aspect: float) -> list[int]:
    """Preferred widths 16–22 depending on subject; try several (capped for speed)."""
    roundish = {"earth", "planet", "moon", "apple", "orange", "peach", "tomato", "cherry", "cherries", "lemon", "watermelon", "strawberry"}
    tall = {"carrot", "tulip", "rose", "rocket", "lighthouse", "tree", "cactus", "banana"}
    wide = {"fish", "sailboat", "car", "bicycle", "grapes"}
    if name in roundish:
        base = [18, 16, 20, 22]
    elif name in tall:
        base = [14, 16, 18]
    elif name in wide:
        base = [20, 22, 18]
    else:
        base = [16, 18, 20, 14]
    out = []
    for tw in base:
        th = max(6, int(round(tw * aspect)))
        if 6 <= th <= 24 and 12 <= tw <= 24:
            out.append(tw)
    return out or [16]


def pixelize_one(path: Path, name: str | None = None, target_w: int | None = None):
    """Return level dict or (None, reason)."""
    name = name or guess_name(path)
    try:
        arr = load_rgba(path)
    except Exception as e:
        return None, f"load_fail:{e}"
    h0, w0 = arr.shape[:2]
    if h0 < 32 or w0 < 32:
        return None, "too_small_src"
    # Speed: downscale before analysis (keeps subject, kills ornate detail)
    max_dim = 480
    if max(h0, w0) > max_dim:
        scale = max_dim / max(h0, w0)
        nw, nh = max(32, int(w0 * scale)), max(32, int(h0 * scale))
        im = Image.fromarray(arr, "RGBA").resize((nw, nh), Image.Resampling.BOX)
        arr = np.array(im)
        h0, w0 = arr.shape[:2]

    empty = empty_mask(arr)
    filled = ~empty
    # If almost everything empty (white bg photo), OK; if almost everything filled (busy painting), still try
    area = h0 * w0
    filled_frac = filled.sum() / area
    if filled.sum() < area * 0.005:
        return None, "empty_tiny"

    # Border / frame detection
    frac = edge_border_fraction(arr, filled, band=max(4, min(h0, w0) // 40))
    if frac > 0.40:
        filled2 = erode_border(arr, filled)
        frac2 = edge_border_fraction(arr, filled2, band=max(4, min(h0, w0) // 40))
        if frac2 > 0.40 or filled2.sum() < filled.sum() * 0.4:
            return None, f"frame_border:{frac:.2f}"
        filled = filled2
        # mark eroded as empty in arr alpha for downstream
        arr = arr.copy()
        arr[~filled, 3] = 0

    cropped_arr, cropped_filled = center_square_crop(arr, filled)
    if cropped_arr is None:
        return None, "bbox_fail"
    ch, cw = cropped_arr.shape[:2]
    if cropped_filled.sum() < 50:
        return None, "content_tiny"

    if not mask_structure_ok(cropped_filled):
        return None, "frame_silhouette"

    aspect = ch / max(cw, 1)
    widths = [target_w] if target_w else choose_target_w(name, aspect)

    best = None
    best_reason = "no_width"
    for tw in widths:
        th = max(6, min(24, int(round(tw * aspect))))
        if th > 24:
            continue
        # Build RGBA image from crop with empty pixels transparent
        rgba = cropped_arr.copy()
        rgba[~cropped_filled, 3] = 0
        im = Image.fromarray(rgba, "RGBA")
        small = im.resize((tw, th), Image.Resampling.BOX)
        sarr = np.array(small)
        # re-evaluate empty on downsampled
        sempty = empty_mask(sarr) | (sarr[..., 3] < 40)
        # also treat near-transparent average as empty
        coords = []
        pixels = []
        for y in range(th):
            for x in range(tw):
                if sempty[y, x]:
                    continue
                r, g, b, a = sarr[y, x]
                if a < 40:
                    continue
                pixels.append([float(r), float(g), float(b)])
                coords.append((y, x))
        if len(pixels) < 50:
            best_reason = f"sparse:{len(pixels)}"
            continue
        pix = np.array(pixels, dtype=np.float64)
        # choose k 3–6 from unique buckets
        buckets = len({(int(p[0]) // 28, int(p[1]) // 28, int(p[2]) // 28) for p in pixels})
        k = max(3, min(6, buckets))
        if len(pixels) < 90:
            k = min(k, 4)
        labels, centers = kmeans(pix, k)
        center_pal = [nearest_palette(c) for c in centers]
        # If all centers collapse to same palette index, try mapping by forcing diversity:
        if len(set(center_pal)) == 1 and k >= 2:
            # assign each center to its nearest unused palette by Hungarian-ish greedy
            used = set()
            center_pal = []
            for c in centers:
                dists = np.sum((PALETTE - c) ** 2, axis=1)
                order = np.argsort(dists)
                chosen = int(order[0])
                for oi in order:
                    if int(oi) not in used:
                        chosen = int(oi)
                        break
                used.add(chosen)
                center_pal.append(chosen)

        grid = np.full((th, tw), -1, dtype=int)
        for (y, x), lab in zip(coords, labels):
            grid[y, x] = center_pal[lab]

        grid = drop_speckles(grid, min_size=3)  # removes size ≤2
        grid = fill_small_holes(grid, max_hole=2)

        filled_n = int((grid >= 0).sum())
        colors_used = len(set(grid[grid >= 0].tolist())) if filled_n else 0
        if filled_n < 70:
            best_reason = f"filled_low:{filled_n}"
            continue
        if filled_n > 280:
            best_reason = f"filled_high:{filled_n}"
            continue
        if colors_used < 2:
            best_reason = "colors<2"
            continue

        # dominance + structure
        vals, counts = np.unique(grid[grid >= 0], return_counts=True)
        dom = counts.max() / filled_n
        if dom > 0.70:
            fmask = grid >= 0
            ys, xs = np.where(fmask)
            if colors_used <= 2:
                std_norm = (xs.std() + ys.std()) / max(tw + th, 1)
                if std_norm < 0.08:
                    best_reason = "low_structure"
                    continue
            if not mask_structure_ok(fmask):
                best_reason = "frame_or_blob"
                continue
            # muddy brown-dominated "painting" blobs
            dom_color = int(vals[np.argmax(counts)])
            if dom > 0.72 and dom_color in (7, 5) and colors_used <= 3:
                best_reason = f"muddy_dom:{dom:.2f}"
                continue
            if dom > 0.82:
                best_reason = f"mono:{dom:.2f}"
                continue

        if is_color_frame(grid):
            best_reason = "color_frame"
            continue

        flat = grid.flatten().tolist()
        cand = {
            "name": name,
            "w": tw,
            "h": th,
            "grid": flat,
            "filled": filled_n,
            "colors": colors_used,
            "file": path.name,
            "dom": float(dom),
        }
        # score: prefer mid filled 80-200, more colors, not too dominant
        score = -abs(filled_n - 140) + colors_used * 15 - max(0, dom - 0.55) * 40
        cand["score"] = score
        if best is None or score > best["score"]:
            best = cand
            best_reason = "ok"
        # good enough early exit
        if 80 <= filled_n <= 200 and colors_used >= 3 and dom < 0.65:
            break

    if best is None:
        return None, best_reason
    return best, "ok"


def fetch_more(sources_log: list, max_new: int = 40):
    """Fetch additional CC0/PD images into SRC."""
    seen = {p.name for p in SRC.iterdir() if p.is_file()}
    seen_titles = set()
    got = 0
    for qi, q in enumerate(FETCH_QUERIES):
        if got >= max_new:
            break
        print(f"[{qi+1}/{len(FETCH_QUERIES)}] search: {q}")
        results = commons_search(q, limit=8)
        kept = 0
        for item in results:
            title = item["title"]
            if title in seen_titles:
                continue
            safe = re.sub(r"[^\w.\-]+", "_", title.replace("File:", ""))[:90]
            ext = Path(urllib.parse.urlparse(item["url"]).path).suffix or ".jpg"
            if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"):
                ext = ".jpg"
            dest = SRC / f"{safe}{ext}"
            if dest.name in seen and dest.exists():
                seen_titles.add(title)
                continue
            if download(item, dest):
                seen.add(dest.name)
                seen_titles.add(title)
                sources_log.append(
                    {
                        "file": dest.name,
                        "title": title,
                        "license": item["license"],
                        "author": item["author"],
                        "link": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}",
                        "query": q,
                    }
                )
                got += 1
                kept += 1
                print(f"  + {dest.name} ({item['license']})")
                if kept >= 2:
                    break
        time.sleep(0.2)
    return got


def load_existing_sources_md():
    """Parse existing SOURCES.md table into list of dicts."""
    path = ROOT / "SOURCES.md"
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| `"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 5:
            continue
        file = parts[0].strip("`")
        rows.append(
            {
                "file": file,
                "title": parts[1],
                "license": parts[2],
                "author": parts[3],
                "link": parts[4],
            }
        )
    return rows


def write_sources_md(rows):
    # dedupe by file
    by_file = {}
    for r in rows:
        by_file[r["file"]] = r
    lines = [
        "# Image sources",
        "",
        "All images used for Loopdrop photo levels are **Public Domain / CC0 / NASA PD / Met Museum Open Access (PD)**.",
        "CC-BY, CC-BY-SA, NC, GFDL, and unclear licenses were skipped. User-Agent: LoopdropGameBot/1.0.",
        "",
        "| File | Title | License | Author | Link |",
        "| --- | --- | --- | --- | --- |",
    ]
    for f, r in sorted(by_file.items()):
        link = r.get("link") or r.get("commons") or ""
        if link.startswith("[") and "](" in link:
            # already markdown
            link_md = link
        elif link:
            link_md = f"[link]({link})"
        else:
            link_md = ""
        lines.append(
            f"| `{r['file']}` | {r.get('title','')} | {r.get('license','')} | {r.get('author','')} | {link_md} |"
        )
    lines.append("")
    (ROOT / "SOURCES.md").write_text("\n".join(lines), encoding="utf-8")


def embed_into_game(levels):
    game_path = ROOT / "game.js"
    src = game_path.read_text(encoding="utf-8")
    payload = json.dumps(levels, separators=(",", ":"))
    new_line = f"  const PHOTO_LEVELS = {payload}; // __PHOTO_LEVELS__"
    marker = "// __PHOTO_LEVELS__"
    idx = src.find(marker)
    if idx < 0:
        raise SystemExit("PHOTO_LEVELS marker not found")
    start = src.rfind("const PHOTO_LEVELS", 0, idx)
    if start < 0:
        raise SystemExit("const PHOTO_LEVELS not found")
    line_start = src.rfind("\n", 0, start) + 1
    end = idx + len(marker)
    src2 = src[:line_start] + new_line + src[end:]
    game_path.write_text(src2, encoding="utf-8")

    # bump cache bust
    idx_path = ROOT / "index.html"
    html = idx_path.read_text(encoding="utf-8")
    html2 = re.sub(r"game\.js\?v=\d+", "game.js?v=4", html)
    if "game.js?v=4" not in html2:
        html2 = re.sub(r'src="game\.js"', 'src="game.js?v=4"', html2)
    idx_path.write_text(html2, encoding="utf-8")



def main():
    reject_counts = Counter()
    sources = load_existing_sources_md()

    # Fetch more if we may need them
    do_fetch = "--no-fetch" not in sys.argv
    if do_fetch:
        print("=== Fetching additional CC0/PD sources ===")
        nnew = fetch_more(sources, max_new=50)
        print(f"New downloads: {nnew}")
    else:
        print("=== Skipping fetch (--no-fetch) ===")

    print("=== Pixelizing all assets ===")
    images = sorted(
        [
            p
            for p in SRC.iterdir()
            if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")
        ]
    )
    accepted = []
    SKIP_NAMES = {"tootsie", "frans", "interior", "state", "vincent", "dots", "candy", "men", "genre", "painting", "fortepan", "award", "tree"}
    SKIP_FILES = {"Tootsie-Roll-Dots-Candy.jpg.jpg", "Frans_Post_-_Gezicht_op_Olinda_Brazilië.jpg.jpg",
                  "Interior_genre_painting_women_men_furniture_watch_fruit_grape_money-box_Fortepan_2931.jpg.jpg",
                  "StateLibQld_1_132440_Men_enjoying_watermelon_on_a_hot_day_1935.jpg.jpg",
                  "Vincent_Willem_van_Gogh_128.jpg.jpg", "Mushroom_award.png.png",
                  "Tree_with_red_apples_in_Barkedal_4.jpg.jpg",
                  "Specimen_of_Bush_sunflower_Eucelia_californica_ca.1920_CHS-5480_.jpg.jpg",
                  "The_Earth_seen_from_Apollo_17.tiff.jpg"}
    for path in images:
        if path.name in SKIP_FILES:
            reject_counts["skip_junk"] += 1
            print(f"  SKIP {path.name}")
            continue
        name = guess_name(path)
        if name in SKIP_NAMES or name.startswith("state"):
            reject_counts["skip_name"] += 1
            print(f"  SKIP name={name} {path.name}")
            continue
        res, reason = pixelize_one(path, name=name)
        if res is None:
            reject_counts[reason.split(":")[0]] += 1
            print(f"  REJECT {path.name} ({name}): {reason}")
            continue
        accepted.append(res)
        print(
            f"  OK {path.name}: {name} {res['w']}x{res['h']} filled={res['filled']} colors={res['colors']} score={res['score']:.1f}"
        )

    # Deduplicate by name keeping best score, but allow up to 2 per name if different
    # Drop weak scores / muddy leftovers
    accepted = [L for L in accepted if L["filled"] >= 70 and L["score"] > -90]
    accepted.sort(key=lambda L: -L["score"])
    picked = []
    name_counts = Counter()
    PREFER = {"apple","orange","strawberry","lemon","peach","pear","cherries","tomato","carrot",
              "banana","watermelon","grapes","earth","planet","moon","mushroom","sunflower",
              "tulip","rose","rocket","fish","cat","dog","owl","turtle","frog","cactus","house",
              "sailboat","camera","cup","crown","ice","balloon","duck","butterfly","car","bicycle"}
    for L in accepted:
        if L["name"] not in PREFER and L["name"] in ("fruit","frans","blue","mandarin"):
            # rename mandarin already orange; skip generic fruit unless needed
            if L["name"] == "fruit":
                continue
        if name_counts[L["name"]] >= 2:
            continue
        # skip near-duplicate grids
        sig = (L["name"], L["w"], L["h"], L["filled"], L["colors"])
        if any(
            (p["name"], p["w"], p["h"], p["filled"], p["colors"]) == sig for p in picked
        ):
            continue
        name_counts[L["name"]] += 1
        picked.append(L)

    # Prefer diversity: ensure at least 30
    if len(picked) < 30:
        for L in accepted:
            if L in picked:
                continue
            picked.append(L)
            if len(picked) >= 35:
                break

    # Sort for game: fewer colors / mid filled first (easier early levels)
    picked.sort(key=lambda L: (L["colors"], L["filled"]))

    levels_out = [{"name": L["name"], "w": L["w"], "h": L["h"], "grid": L["grid"]} for L in picked]

    (ROOT / "levels.json").write_text(json.dumps(levels_out), encoding="utf-8")
    summary = {
        "count": len(levels_out),
        "rejects": dict(reject_counts),
        "levels": [
            {
                "name": L["name"],
                "w": L["w"],
                "h": L["h"],
                "filled": L["filled"],
                "colors": L["colors"],
                "file": L.get("file"),
            }
            for L in picked
        ],
    }
    (TOOLS / "pixelize_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (TOOLS / "photo_levels.fragment.js").write_text(
        "const PHOTO_LEVELS = " + json.dumps(levels_out, separators=(",", ":")) + "; // __PHOTO_LEVELS__\n",
        encoding="utf-8",
    )

    # Filter SOURCES.md to files that were accepted (plus keep NASA/Met attributions for used)
    used_files = {L.get("file") for L in picked}
    used_rows = [r for r in sources if r.get("file") in used_files]
    # also add rows for accepted files missing from sources
    known = {r["file"] for r in used_rows}
    for L in picked:
        f = L.get("file")
        if f and f not in known:
            used_rows.append(
                {
                    "file": f,
                    "title": f,
                    "license": "Public Domain / CC0 / NASA PD / Met OA (see assets)",
                    "author": "see Commons/Met/NASA",
                    "link": "",
                }
            )
    write_sources_md(used_rows if used_rows else sources)

    embed_into_game(levels_out)

    print("\n=== FIRST 10 ACCEPTED ===")
    for L in picked[:10]:
        print(f"  {L['name']:12s} filled={L['filled']:3d} {L['w']}x{L['h']} colors={L['colors']} file={L.get('file')}")
    print(f"\nTOTAL accepted: {len(picked)}")
    print(f"Reject reasons: {dict(reject_counts)}")


if __name__ == "__main__":
    main()
