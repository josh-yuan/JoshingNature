# Old-Growth Redesign — Design Doc

**Date:** 2026-06-12
**Requested by:** Josh — "greener and richer colors as the base palette, wording in marble white on top, the vibrancy and beauty of the raw untamed wilderness laced into the very viscera of this project."

## Direction

The site moves from the warm campfire-brown dark theme to **Old-Growth**: a deep rich pine-green base with marble white typography. The trout red (`#d4453a`, the rainbow trout lateral stripe) stays as the brand pop color — red on green is a natural complement and it remains reserved for CTAs (Subscribe, play buttons, featured glow). A new vibrant **fern green** accent carries the wilderness vibrancy; the bamboo tan is demoted to a supporting warm note (Adventures/Backpacking badges, map trail defaults).

## Palette (oklch, defined in `src/app/globals.css`)

| Token | Value | Role |
|---|---|---|
| `--background` | `oklch(0.18 0.045 158)` | deep pine green base |
| `--foreground` | `oklch(0.965 0.006 120)` | marble white |
| `--card` | `oklch(0.22 0.048 156)` | understory green surfaces |
| `--primary` | `oklch(0.56 0.19 25)` | trout red — CTAs only |
| `--accent` / `--fern` | `oklch(0.74 0.14 145)` | vibrant fern — links, active states, eyebrows |
| `--muted-foreground` | `oklch(0.79 0.04 140)` | sage secondary text |
| `--tan` | `oklch(0.70 0.09 75)` | bamboo — supporting badges |
| `--moss` | `oklch(0.55 0.10 150)` | mid green for gradients |
| `--pine` | `oklch(0.14 0.04 160)` | deepest canopy shadow — nav glass, hero overlay |

## Texture & typography

- **Body background**: layered radial gradients (canopy light from above, moss pooling below), fixed attachment — never a flat fill.
- **`.topo-bg`**: faint marble-white topographic contour SVG pattern (footer, pillars, videos page).
- **`.canopy-band`**: pooled fern light for feature sections. `.grain` noise retained.
- **`.text-marble`**: marble white with a faint top sheen + deep green shadow, used on section headlines. `.text-glow` now glows fern.
- **Display face**: Fraunces (variable serif, SOFT/WONK/opsz axes) on `h1–h3` — organic, hand-set feel pairing with the handwritten logo. Geist stays for body.

## Per-surface notes

- **Navbar**: pine glass (`bg-pine/80`), fern active pill, solid trout-red Subscribe pill.
- **Hero**: winter-lookout photo now grades through `pine/75 → background` with a moss radial from below.
- **Map**: all `#1c1410` surfaces → `#0c2417` (popups, HUD, layer panel, sidebar, search bar); elevation profile retinted blue → fern `#6fd693`; park label halo deep green. SAC difficulty colors unchanged (functional legend).
- **Badges**: stone → bamboo tan; filter tabs select in fern.

## Out of scope

Content, layout structure, map data layers, and the white location-popup modal (deliberate light card) are unchanged.
