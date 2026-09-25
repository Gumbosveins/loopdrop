# Loopdrop — free browser color-drop puzzle

**Play (no install, no account):** https://gumbosveins.github.io/loopdrop/

Original HTML5 **conveyor / color-match** puzzle: cute blob **drops** walk a track and auto-clear matching clay cubes — **one matching cube per aligned grid line per lap**. Five holding slots. No aiming. Runs on GitHub Pages.

[![Play Loopdrop](https://img.shields.io/badge/play-Loopdrop-blue)](https://gumbosveins.github.io/loopdrop/)
[![Dev.to](https://img.shields.io/badge/dev.to-articles-black)](https://dev.to/gumbosveins)

**Not affiliated with Pixel Flow** (Loom Games) or any competitor. All voxel sprites, blob creatures, UI, and levels are original — no pigs, no cloned art/levels.

## Play

Live on GitHub Pages: https://gumbosveins.github.io/loopdrop/

## Run locally

```bash
python3 -m http.server 8765
# open http://localhost:8765/
```

Or open `index.html` directly in a browser (`file://` works; sprites are embedded in `game.js`).

No build step. Files: `index.html`, `style.css`, `game.js`, `README.md`.

## How to play

1. Tap a colored drop in the dock → it enters the track (capacity 5).
2. While looping (~9s/lap), it pops **one** matching cube **per aligned grid line per lap** (outermost from that side). Fires only on straight edges when centered on a cell — **not** in corner arcs.
3. After a lap: ammo 0 / no cubes left → exits; leftover ammo → parks in a holding slot.
4. All 5 slots full with work left → fail. No drops left with cubes remaining → “Out of drops”. Clear every cube → win (+5 coins).
5. **Big boards take a few minutes** — ammo is split into modest packets (≈12–28), so expect many laps and relaunches from holding.

## Levels

- **200** seeded levels (`seed = levelNumber`).
- Boards are **hand-authored recognizable voxel sprites** (duck, cat, robot, castle, foods, …) — **50** unique dense designs (typically 22–28², ~180–420 cubes) cycled with flip + palette permute.
- Early levels prefer lighter silhouettes; mid/late use denser fills.
- Ammo packets always sum exactly to cube counts.
- Progress: `localStorage` key **`loopdrop-save-v3`** (v2 saves are not migrated — progress resets OK after this upgrade).

## Shop

Mock only — spend coins for extra slots (max 7), undo, clear hold, +50 coins / remove ads (“IAP later”). No real payments, no gacha.

## Tech

Canvas playfield + DOM HUD. Touch & mouse. No external runtime assets, ads, or tracking.  
Original candy palette, glossy isometric voxels (AO + rim), purple chevron track, sky gradient, and eyed blob drops.

## More from Gumbosveins

- [Would You For Cash?](https://apps.apple.com/app/would-you-for-cash/id6759262761) — party card game for iPhone
- Free write-ups: [dev.to/gumbosveins](https://dev.to/gumbosveins)
