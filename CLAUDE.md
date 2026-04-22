@AGENTS.md

# JoshingNature — AI Session Context

## What this project is

**joshingnature.com** — Josh Yuan's personal outdoor/nature content site. Not a final product; an MVP being built fast with a scalable foundation. Vercel-hosted, GitHub-connected.

**Live URL:** https://joshingnature.vercel.app  
**Repo:** https://github.com/josh-yuan/JoshingNature  
**Deploy:** `npx vercel --prod --yes` from repo root (credentials cached)

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Maps | MapLibre GL JS + react-map-gl |
| Map tiles | OpenFreeMap liberty style (free, no API key) |
| YouTube | @next/third-parties YouTubeEmbed (lite facade) |
| Deploy | Vercel (production auto-alias: joshingnature.vercel.app) |
| **Future** | Sanity CMS, AWS S3 + CloudFront, Mapbox premium tiles, Supabase + PostGIS |

## Brand

**Aesthetic:** Warm, organic, hand-crafted. REI × personal outdoor creator × fly fishing brand. NOT dark/techy/glassmorphic.

**Color palette:**
- Background: `oklch(0.10 0.012 55)` — warm near-black brown (~#1c1410)
- Primary: `oklch(0.56 0.19 25)` — trout red (#d4453a) — the brand pop color
- Accent: `oklch(0.70 0.09 75)` — bamboo/tan (#c4a47c)
- Foreground: warm off-white

**Logo assets** (in `public/`):
- `logo-jn-color.png` — JN monogram (fish + bamboo), WHITE background (not transparent)
- `logo-jn-line.png` — JN monogram linework, WHITE background — use with `invert` CSS on dark backgrounds
- `logo-wordmark.png` — "Joshing Nature" handwritten script, WHITE background — use with `invert` CSS on dark backgrounds

**Important:** None of the logo PNGs have transparent backgrounds. Use CSS `filter: invert(1)` for dark backgrounds. Colored monogram should not be used on the hero (white box shows through).

## Content

All content lives in `src/data/content.ts` — edit there for videos/locations, no component changes needed.

**YouTube channel:** @JoshingNature | 48 videos | Season 1 + Season 2  
**Real video IDs** are in `content.ts` — 9 confirmed via oEmbed  
**Thumbnail quality:** Always use `maxresdefault.jpg` (1080p), not `hqdefault.jpg`

**Content pillars:** Catch & Cook, Backpacking/Hiking, Gourmet Camp Cooking, Gear & Skills, Nature/Wildlife

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero (wordmark, winter lookout photo bg), latest episodes, pillars, S1 archive, subscribe CTA |
| `/map` | Full-screen MapLibre map with JN location markers, layer toggles, feature click popups |
| `/videos` | YouTubeEmbed featured + grid with filter tabs, 1h ISR |

## Map architecture

The map (`src/components/MapExplorer.tsx`) uses OpenFreeMap liberty tiles. Key things:

- **Base style:** `https://tiles.openfreemap.org/styles/liberty`
- **Custom layers added on load:** `park_label` (park names), `hiking-routes-layer` (Waymarked Trails raster overlay)
- **Visual enhancements applied on load:** trail color (#b8935a), trail width, park fill color/opacity, park outline
- **Layer toggles:** trails, pois, parks, waterways, hiking routes — toggled via `map.setLayoutProperty`
- **Interactive layers:** `poi_r*`, `road_path_pedestrian`, `bridge_path_pedestrian`, `waterway_*` — click shows feature popup
- **Park labels:** rendered inline as uppercase italic text on shaded fill areas (NOT click popup)
- **Cursor:** changes to pointer on hover over interactive layers
- **MapLibre popup white bg:** overridden in `globals.css` — all popups use custom dark card styling

## Known issues / tech debt

- Logo PNGs lack transparency — need designer to re-export with alpha channel
- `git config` author not set (commits show machine hostname) — run `git config --global user.name/email`
- Vercel deploy is CLI-based; GitHub auto-deploy not yet connected (do in Vercel dashboard → Settings → Git)
- No Sanity CMS yet — all content is hardcoded in `src/data/content.ts`
- No Mapbox token — using free OSM tiles (no contour lines available without MapTiler/Mapbox)
- YouTube channel not API-connected — video IDs are manually curated

## Deployment

```bash
# Build check
npm run build

# Deploy to production
npx vercel --prod --yes

# Push to GitHub (SSH configured)
git push origin main
```

SSH key is set up at `~/.ssh/id_ed25519`. Remote: `git@github.com:josh-yuan/JoshingNature.git`
