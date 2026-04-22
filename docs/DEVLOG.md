# JoshingNature — Dev Log

Running log of decisions, rationale, discoveries, and things to revisit. Not a changelog — this is the _why_ behind the work.

---

## 2026-04-22

### Map: why OpenFreeMap liberty instead of Mapbox/MapTiler

Mapbox and MapTiler both have better outdoor styles (terrain, contours, hillshade) but require API keys and have usage limits. OpenFreeMap liberty is completely free, no key, and based on the same OpenMapTiles schema so the vector tile layer names are well-documented. The liberty style has warm earthy tones that fit the brand reasonably well. Switching to MapTiler Outdoor (free tier: 100k tiles/month) would unlock contour lines — worth doing once the site has real traffic.

### Map: park labels approach

The liberty style has `park` (fill) and `park_outline` (line) but no label layer. We inject `park_label` as a custom symbol layer on map load using `map.addLayer(layer, 'poi_r20')` — inserting it below POI icons so park names don't cover campsite/summit markers. Using `Noto Sans Italic` because that's what the liberty style already uses for waterway labels, so it uses the same glyph atlas with no extra font loading.

Decided against click-to-popup for park areas because large polygon click targets are awkward UX — clicking anywhere in a 100km² wilderness polygon and getting a popup is annoying. Inline labels are the right cartographic pattern for area features.

### Map: what's NOT in the OpenMapTiles park source-layer

BLM land is not reliably in the OpenMapTiles `park` source-layer. It may appear in OSM as `boundary=protected_area` with various protection classes, but coverage is inconsistent. USFS National Forest boundaries appear more reliably. If Josh needs BLM boundaries specifically, we'd need a separate source (USGS/BLM GIS data as a custom vector tile layer).

### Logo PNGs — the white background problem

All three designer logos have solid white backgrounds — the designer likely drew them in an app that exports flat images. The CSS workarounds:
- Linework + `invert`: works perfectly (black → white, white bg → black, blends with dark bg)
- Wordmark + `invert`: works (same principle)
- Color monogram + `invert`: breaks the colors (red → cyan, tan → blue)
- Color monogram + `mix-blend-mode: multiply`: possible but colors get crushed on dark backgrounds

**Proper fix:** Ask designer to re-export all three with transparent PNG background (alpha channel). Until then, color monogram is only used in the navbar at a small size where the white box is less noticeable, or avoided entirely.

### YouTube thumbnail quality

`maxresdefault.jpg` is the highest quality YouTube thumbnail (1280×720 or better for 1080p+ videos). `hqdefault.jpg` is 480×360. All of Josh's videos are recent enough to have maxresdefault available. If a future video doesn't (very rare for uploads after ~2014), it serves a broken image — acceptable tradeoff vs. always-blurry thumbnails.

No error fallback implemented yet. Could add `onError={() => setImgSrc(hqFallback)}` if needed.

### Vercel deploy setup

- CLI-based for now (no GitHub auto-deploy connected)
- Project name: `joshingnature` under account `joshingnaturepnw-8394s-projects`  
- Auth: logged in via `npx vercel` device flow on 2026-04-22
- SSH: key generated at `~/.ssh/id_ed25519`, added to GitHub manually
- No env vars needed yet — everything is public (no API keys in code)

**To connect GitHub auto-deploy:** vercel.com → joshingnature project → Settings → Git → Connect → josh-yuan/JoshingNature. Once connected, every push to `main` deploys automatically and PRs get preview URLs.

---

## 2026-04-13

### Brand direction pivot

The initial MVP used a dark/futuristic aesthetic (emerald neon, glassmorphism, grid backgrounds). The designer provided real brand assets showing the actual direction: warm/organic/earthy, like REI meets a fly fishing brand. This required a full CSS custom property overhaul — swapping cold greens for trout red and bamboo tan. The Tailwind v4 `@theme inline` block made this straightforward since all colors flow from CSS variables.

### Content data architecture decision

Chose to put all content (videos, locations, channel info) in `src/data/content.ts` as a single flat file rather than CMS-driven from the start. Rationale: Sanity CMS is the right long-term answer but adds setup overhead (API keys, studio, schemas, GROQ queries). With 9 videos and 7 locations, a TypeScript file is simpler and type-safe. The data shape is designed to be CMS-compatible — the `Video` and `Location` interfaces map cleanly to future Sanity document types.

### Map location data

All 7 location coordinates were manually looked up against Josh's actual video locations (Winchester Mountain, Park Butte, Alpine Lakes, Monogram Lake, Annette Lake, Olympic Coast, Montana Alpine). Coordinates are approximate — accurate to within ~0.01 degrees. If Josh wants exact coordinates for specific campsites or trailheads, those should be updated in `content.ts`.

### Hero photo

Using the winter lookout thumbnail as the hero because it's the most visually striking content Josh has and it perfectly represents the brand (dramatic, cold, authentic). It's a 3.7MB JPG — should add Next.js Image optimization with a proper `sizes` prop and consider converting to WebP for production. The current setup uses `fill` + `object-cover` which works but doesn't optimize.

---

## Recurring TODOs

These keep coming up and aren't done yet:

- [ ] Get designer to re-export logos with transparent PNG backgrounds
- [ ] Connect GitHub → Vercel auto-deploy in dashboard
- [ ] Purchase `joshingnature.com` domain and wire DNS in Vercel
- [ ] Add MapTiler free API key for contour lines / outdoor style
- [ ] Set `git config --global user.name "Josh Yuan"` and `user.email` on the machine
- [ ] Wire real YouTube API key for dynamic video fetching (vs. hardcoded IDs)
- [ ] Set up Sanity CMS for content management
- [ ] Optimize hero image (WebP, proper srcset)
- [ ] Add Google Analytics / basic web vitals monitoring
- [ ] Set up `joshingnature.com` email in Google Workspace (for sponsor/partnership inquiries)
