# Changelog

All notable changes to joshingnature.com are documented here.

---

## [Unreleased]

_Next up: GitHub → Vercel auto-deploy connection, Sanity CMS, domain purchase (joshingnature.com), Mapbox/MapTiler token for contour lines._

---

## 2026-04-22

### Added
- **Park/wilderness inline labels** — Custom `park_label` symbol layer added via `map.addLayer()` using the OpenMapTiles `park` source-layer. Renders national park, wilderness, and protected area names as uppercase italic text directly on the shaded fill areas. Opacity scales with zoom (0.55 at z6 → 0.80 at z10+). Labels toggle with the Parks layer switch.

### Changed
- **Parks no longer clickable** — Removed click popup for park areas; names now appear as always-on inline labels instead.

---

## 2026-04-22 (earlier)

### Added
- **Interactive map feature popups** — Clicking trails, campsites, summits, parks, or waterways now shows a dark card popup with name, type, elevation (peaks), surface/difficulty (trails), and an OpenStreetMap link.
- **Cursor pointer on hover** — Cursor changes to pointer when hovering any interactive map layer.
- **Feature classification system** — `classifyFeature()` function maps OpenMapTiles source-layer + class to icon, label, and color.

### Changed
- **Visual trail enhancement** — Trails recolored to brand bamboo tan (`#b8935a`), width scales 1.2px (z10) → 4px (z18) via `setPaintProperty` on load.
- **Park fill enhancement** — Deeper forest green (`#3d7a52`) at 22% opacity; outline more prominent.
- **MapLibre popup white background removed** — Overridden in `globals.css` via `.maplibregl-popup-content { background: transparent }`. All popups now use custom dark warm card styling with Framer Motion entry animation.
- **`interactiveLayerIds` wired** — Passed to the Map component for proper MapLibre hit-testing.

---

## 2026-04-22 (earlier)

### Added
- **Layer toggle panel** — Collapsible "Layers" button top-left of map. Toggles: Trails & Paths, Campsites & Summits, Parks & Reserves, Waterways, Marked Hiking Routes.
- **Waymarked Trails overlay** — Free raster overlay (`tile.waymarkedtrails.org`) added as a custom source on map load. Off by default.

### Changed
- **Map tiles** — Switched from MapLibre demo tiles (`demotiles.maplibre.org`) to OpenFreeMap liberty style (`tiles.openfreemap.org/styles/liberty`) — warm earthy OSM tiles, no API key required.
- **Map layout fix** — Changed from `height: calc(100vh - 64px)` + `marginTop` to `fixed inset-0 top-16`, eliminating footer bleed-through.
- **Hero wordmark** — Removed white-background JN color monogram from hero; wordmark promoted to 480px wide (was 288px).
- **Navbar logo** — Switched from color monogram to linework monogram + `invert` — eliminates white box on dark navbar background.
- **YouTube thumbnails** — All thumbnail URLs changed from `hqdefault.jpg` to `maxresdefault.jpg` (1080p) across homepage and videos page.

---

## 2026-04-22 (initial deploy)

### Added
- **Vercel production deploy** — First deploy via Vercel CLI. Live at `joshingnature.vercel.app`. Project linked as `joshingnature` under `joshingnaturepnw-8394s-projects`.
- **SSH key setup** — Generated `~/.ssh/id_ed25519`, added to GitHub. Remote switched from HTTPS to SSH.
- **`.superpowers/` gitignored** — Added to `.gitignore` for brainstorming session artifacts.

### Changed
- **Force push to main** — Remote had a divergent placeholder "Initial commit"; local history preserved with `--force-with-lease`.

---

## 2026-04-13

### Added
- **Brand redesign** — Full aesthetic overhaul from dark/techy/futuristic to warm/organic/earthy per designer assets. New CSS custom properties for trout red, bamboo tan, warm near-black.
- **Real content** — 9 confirmed YouTube video IDs wired into `src/data/content.ts` with season, category, location metadata.
- **7 real map locations** — PNW trail/lookout/lake coordinates in `content.ts` linked to videos.
- **Logo assets** — `logo-jn-color.png`, `logo-jn-line.png`, `logo-wordmark.png` added to `public/`.
- **Hero photo** — `hero-winter-lookout.jpg` (Winchester Mountain winter camping thumbnail) as full-bleed hero background.
- **`/map` page** — MapLibre GL JS map with custom JN location markers, popups, sidebar, coordinate HUD.
- **`/videos` page** — YouTubeEmbed featured video + filterable grid (Season 1, Season 2, Catch & Cook, Adventures tabs). 1h ISR cache.
- **Navbar** — Fixed top, responsive mobile menu, Framer Motion active pill indicator.
- **Animated sections** — `AnimatedSection` wrapper with Framer Motion scroll-triggered fade/slide.

---

## 2026-04-12

### Added
- Next.js 16 scaffold via `create-next-app` (Turbopack, TypeScript, Tailwind CSS v4, App Router).
- shadcn/ui components: badge, button, card, navigation-menu, separator, sheet.
- MapLibre GL JS + react-map-gl installed.
- Framer Motion installed.
- `@next/third-parties` for YouTube lite embeds.
