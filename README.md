# Loopdrop

Original HTML5 puzzle in the Pixel Flow / conveyor-voxel genre.  
Rounded capsule **drops** walk a track and auto-clear matching clay cubes. No aiming.

**Not affiliated with Pixel Flow** (Loom Games) or any competitor. Capsule drops and cream/terracotta UI are original — no pigs, no cloned art/levels.

## Run

```bash
cd /workspace/loopdrop
python3 -m http.server 8765
# open http://localhost:8765/
```

Or open `index.html` directly in a browser (`file://` works; levels are embedded in `game.js`).

No build step. Files: `index.html`, `style.css`, `game.js`, `README.md`, `SOURCES.md`, `levels.json`.

## How to play

1. Tap a colored drop in the dock → it enters the track (capacity 5).
2. While looping (~4s/lap), it spends ammo to pop cubes of its color.
3. After a lap: ammo 0 / no cubes left → exits; leftover ammo → parks in a holding slot.
4. All 5 slots full with work left → fail. No drops left with cubes remaining → “Out of drops”. Clear every cube → win (+5 coins).

## Levels

- **200** seeded levels (`seed = levelNumber`).
- Boards are **pixelized CC0 / Public Domain photos** (strawberry, duck, car, …) — see `SOURCES.md`.
- ~80–250 cubes per picture; ammo packets sum exactly to cube counts.
- Progress: `localStorage` key `loopdrop-save-v1`.

## Shop

Mock only — spend coins for extra slots (max 7), undo, clear hold, +50 coins / remove ads (“IAP later”). No real payments, no gacha.

## Tech

Canvas playfield + DOM HUD. Touch & mouse. No external runtime assets, ads, or tracking.  
Photo sources credited in `SOURCES.md` (CC0/PD only).
