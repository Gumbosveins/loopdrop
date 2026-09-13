# Loopdrop

Original HTML5 puzzle in the Pixel Flow / conveyor-voxel genre.  
Rounded capsule **drops** walk a track and auto-clear matching clay cubes. No aiming.

## Run

```bash
cd /workspace/loopdrop
python3 -m http.server 8765
# open http://localhost:8765/
```

Or open `index.html` directly in a browser (localStorage works on `file://` in most browsers).

No build step. Files: `index.html`, `style.css`, `game.js`, `README.md`.

## How to play

1. Tap a colored drop in the dock → it enters the track (capacity 5).
2. While looping (~4s/lap), it spends ammo to pop cubes of its color.
3. After a lap: empty ammo / no cubes left → exits; else parks in a holding slot.
4. All 5 slots full with work left → fail. Clear every cube → win (+5 coins).

## Levels

- **200** seeded levels (`seed = levelNumber`).
- ~20 hand-authored silhouettes (heart, star, house, …) plus procedural blobs.
- Ammo packets sum exactly to cube counts → always solvable if sequenced well.
- Progress: `localStorage` key `loopdrop-save-v1`.

## Shop

Mock only — spend coins for extra slots (max 7), undo, clear hold, +50 coins / remove ads (“IAP later”). No real payments, no gacha.

## Tech

Canvas playfield + DOM HUD. Touch & mouse. No external assets, ads, or tracking.
