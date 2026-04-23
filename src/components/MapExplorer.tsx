"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useState, useCallback, useRef, useMemo } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Waves,
  Anchor,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Navigation,
  TreePine,
  Tent,
  Eye,
  AlertTriangle,
  Play,
  Target,
  Activity,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LOCATIONS, youtubeUrl, type Location, type LocationType } from "@/data/content";
import { linestringLengthKm } from "@/lib/haversine";
import SearchBar, { type SearchResult } from "@/components/map/SearchBar";
import ElevationProfile from "@/components/map/ElevationProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveFeature = {
  lng: number;
  lat: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
  sourceLayer: string;
  layerId: string;
  geometry?: number[][];
};

type SidebarTab = "spots" | "trails";
type DifficultyFilter = "all" | "easy" | "moderate" | "hard";

// ─── Layer Toggles ────────────────────────────────────────────────────────────

type LayerGroup = {
  id: string;
  label: string;
  Icon: React.ElementType;
  layers?: string[];
  overlayId?: string;
  defaultOn: boolean;
  interactive?: string[];
};

const LAYER_GROUPS: LayerGroup[] = [
  {
    id: "trails",
    label: "Trails & Paths",
    Icon: Navigation,
    layers: [
      "road_path_pedestrian",
      "tunnel_path_pedestrian",
      "bridge_path_pedestrian",
      "bridge_path_pedestrian_casing",
      "highway-name-path",
    ],
    interactive: ["road_path_pedestrian", "bridge_path_pedestrian"],
    defaultOn: true,
  },
  {
    id: "pois",
    label: "Campsites & Summits",
    Icon: MapPin,
    layers: ["poi_r20", "poi_r7", "poi_r1"],
    interactive: ["poi_r1", "poi_r7", "poi_r20"],
    defaultOn: true,
  },
  {
    id: "parks",
    label: "Parks & Reserves",
    Icon: TreePine,
    layers: ["park", "park_outline", "park_label"],
    interactive: [],
    defaultOn: true,
  },
  {
    id: "waterways",
    label: "Waterways",
    Icon: Waves,
    layers: ["waterway_river", "waterway_other", "waterway_tunnel", "waterway_line_label"],
    interactive: ["waterway_river", "waterway_other"],
    defaultOn: true,
  },
  {
    id: "hiking_routes",
    label: "Marked Hiking Routes",
    Icon: Mountain,
    overlayId: "hiking-routes-layer",
    defaultOn: false,
  },
];

const ALL_INTERACTIVE = LAYER_GROUPS.flatMap((g) => g.interactive ?? []);

// ─── Difficulty helpers ────────────────────────────────────────────────────────

const SAC_DIFFICULTY: Record<string, { label: string; color: string; dot: string; lineColor: string }> = {
  hiking:                    { label: "Easy",    color: "text-green-400",  dot: "bg-green-400",  lineColor: "#4ade80" },
  mountain_hiking:           { label: "Moderate",color: "text-blue-400",   dot: "bg-blue-400",   lineColor: "#60a5fa" },
  demanding_mountain_hiking: { label: "Hard",    color: "text-orange-400", dot: "bg-orange-400", lineColor: "#fb923c" },
  alpine_hiking:             { label: "Expert",  color: "text-red-400",    dot: "bg-red-400",    lineColor: "#f87171" },
  demanding_alpine_hiking:   { label: "Extreme", color: "text-rose-400",   dot: "bg-rose-400",   lineColor: "#f43f5e" },
  difficult_alpine_hiking:   { label: "Extreme", color: "text-rose-400",   dot: "bg-rose-400",   lineColor: "#f43f5e" },
};

function getDiff(sacScale?: string) {
  return SAC_DIFFICULTY[sacScale ?? ""] ?? { label: "", color: "text-muted-foreground", dot: "bg-white/25", lineColor: "#b8935a" };
}

// ─── Geo utilities ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geoBBox(geometry: any): [number, number, number, number] | null {
  const lngs: number[] = [], lats: number[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function collect(coords: any) {
    if (typeof coords[0] === "number") { lngs.push(coords[0]); lats.push(coords[1]); }
    else coords.forEach(collect);
  }
  if (geometry?.coordinates) collect(geometry.coordinates);
  else if (geometry?.geometries) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geometry.geometries.forEach((g: any) => {
      const b = geoBBox(g);
      if (b) { lngs.push(b[0], b[2]); lats.push(b[1], b[3]); }
    });
  }
  if (lngs.length === 0) return null;
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLineCoords(geometry: any): number[][] {
  if (!geometry) return [];
  if (geometry.type === "LineString") return geometry.coordinates ?? [];
  if (geometry.type === "MultiLineString") return (geometry.coordinates ?? []).flat();
  return [];
}

// ─── Feature classification ───────────────────────────────────────────────────

type FeatureKind = { label: string; Icon: React.ElementType; color: string; border: string; bg: string; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function classifyFeature(sourceLayer: string, props: Record<string, any>): FeatureKind {
  const cls = String(props.class ?? props.subclass ?? "").toLowerCase();
  if (sourceLayer === "poi") {
    if (/camp/.test(cls))           return { label: "Campsite",   Icon: Tent,       color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10" };
    if (/peak|summit|mountain/.test(cls)) return { label: "Summit", Icon: Mountain,  color: "text-accent",       border: "border-accent/30",       bg: "bg-accent/10" };
    if (/hut|shelter|refuge/.test(cls))   return { label: "Alpine Hut", Icon: Anchor, color: "text-accent",      border: "border-accent/30",       bg: "bg-accent/10" };
    if (/viewpoint/.test(cls))      return { label: "Viewpoint",  Icon: Eye,        color: "text-sky-400",      border: "border-sky-400/30",       bg: "bg-sky-400/10" };
    return { label: cls || "Point of Interest", Icon: MapPin, color: "text-muted-foreground", border: "border-white/20", bg: "bg-white/5" };
  }
  if (sourceLayer === "park") {
    const label = cls.includes("national") ? "National Park" : cls.includes("nature") ? "Nature Reserve" : "Protected Area";
    return { label, Icon: TreePine, color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10" };
  }
  if (sourceLayer === "waterway") {
    return { label: cls || "Waterway", Icon: Waves, color: "text-sky-400", border: "border-sky-400/30", bg: "bg-sky-400/10" };
  }
  if (sourceLayer === "transportation") {
    const sacScale = String(props.sac_scale ?? "").toLowerCase();
    const diff = getDiff(sacScale);
    const label = diff.label ? `Trail · ${diff.label}` : (cls || "Trail");
    return { label, Icon: Navigation, color: diff.color, border: "border-accent/30", bg: "bg-accent/10" };
  }
  return { label: "Map Feature", Icon: MapPin, color: "text-muted-foreground", border: "border-white/20", bg: "bg-white/5" };
}

// ─── Feature Popup ────────────────────────────────────────────────────────────

function FeaturePopup({ feature, onClose }: { feature: ActiveFeature; onClose: () => void }) {
  const { lng, lat, properties: p, sourceLayer, geometry } = feature;
  const kind = classifyFeature(sourceLayer, p);
  const Icon = kind.Icon;

  const name = (p.name_en || p.name || p.ref) as string | undefined;
  const ele = p.ele != null ? Math.round(Number(p.ele)) : null;
  const surface = p.surface as string | undefined;
  const trailVis = p.trail_visibility as string | undefined;
  const osmId = p.osm_id as string | undefined;
  const sacScale = String(p.sac_scale ?? "").toLowerCase();
  const diff = getDiff(sacScale || undefined);

  const trailLengthKm = sourceLayer === "transportation" && geometry && geometry.length >= 2
    ? linestringLengthKm(geometry as [number, number][])
    : null;

  const showElevation = sourceLayer === "transportation" && geometry && geometry.length >= 2;

  return (
    <Popup latitude={lat} longitude={lng} onClose={onClose} closeOnClick={false} offset={[0, -6]}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="w-64 rounded-2xl bg-[#1c1410]/97 border border-white/12 shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${kind.border} ${kind.bg}`}>
            <Icon className={`h-3.5 w-3.5 ${kind.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${kind.color}`}>{kind.label}</p>
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{name || "Unnamed"}</h3>
          </div>
        </div>

        {(diff.label || trailLengthKm != null || ele != null || surface || trailVis) && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {diff.label && sacScale && (
              <span className={`inline-flex items-center rounded-full bg-white/6 border border-white/10 px-2 py-0.5 text-[11px] font-semibold ${diff.color}`}>
                {diff.label}
              </span>
            )}
            {trailLengthKm != null && (
              <span className="inline-flex items-center rounded-full bg-white/6 border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
                {trailLengthKm >= 1 ? `${trailLengthKm.toFixed(1)} km` : `${Math.round(trailLengthKm * 1000)} m`} visible
              </span>
            )}
            {ele != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/6 border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
                <Mountain className="h-2.5 w-2.5" />{ele.toLocaleString()}m
              </span>
            )}
            {surface && (
              <span className="inline-flex items-center rounded-full bg-white/6 border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground capitalize">{surface}</span>
            )}
            {trailVis && trailVis !== "excellent" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] text-orange-400 capitalize">
                <AlertTriangle className="h-2.5 w-2.5" />{trailVis}
              </span>
            )}
          </div>
        )}

        {showElevation && (
          <div className="px-4 pb-3.5 border-t border-white/6 pt-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1.5">Elevation Profile</p>
            <ElevationProfile geometry={geometry!} />
          </div>
        )}

        {osmId && (
          <div className="border-t border-white/8 px-4 py-2.5">
            <a
              href={`https://www.openstreetmap.org/${sourceLayer === "waterway" || sourceLayer === "transportation" ? "way" : "node"}/${osmId}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />View on OpenStreetMap
            </a>
          </div>
        )}
      </motion.div>
    </Popup>
  );
}

// ─── Location Popup (white modal with inline video) ───────────────────────────

function LocationPopup({ location, onClose }: { location: Location; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  return (
    <Popup latitude={location.lat} longitude={location.lng} onClose={onClose} closeOnClick={false} offset={22}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="w-72 rounded-2xl bg-white border border-black/8 shadow-[0_8px_40px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        {location.videoId && (
          <div className="relative aspect-video w-full bg-black">
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${location.videoId}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : (
              <button onClick={() => setPlaying(true)} className="group relative w-full h-full block" aria-label={`Play ${location.name}`}>
                <img src={`https://i.ytimg.com/vi/${location.videoId}/maxresdefault.jpg`} alt={location.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-[0_4px_24px_rgba(0,0,0,0.5)] ring-2 ring-white/20 group-hover:scale-110 group-hover:bg-primary transition-transform duration-200">
                    <Play className="h-6 w-6 text-white ml-1" fill="white" />
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight text-gray-900 flex-1">{location.name}</h3>
            <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${TYPE_COLORS[location.type]}`}>{location.type}</Badge>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{location.description}</p>
          {location.videoId && (
            <a href={youtubeUrl(location.videoId)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-700 transition-colors">
              <ExternalLink className="h-3 w-3" />Open in YouTube
            </a>
          )}
        </div>
      </motion.div>
    </Popup>
  );
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: LocationType; className?: string }) {
  switch (type) {
    case "Fire Lookout": return <Anchor className={className} />;
    case "Coastal":      return <Waves className={className} />;
    default:             return <Mountain className={className} />;
  }
}

const TYPE_COLORS: Record<LocationType, string> = {
  "Fire Lookout": "bg-primary/15 text-primary border-primary/30",
  "Alpine Lake":  "bg-accent/15 text-accent border-accent/30",
  "Backpacking":  "bg-stone-500/15 text-stone-400 border-stone-500/30",
  "Coastal":      "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "Alpine":       "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

// ─── Location Marker ──────────────────────────────────────────────────────────

function LocationMarker({ location, active, onClick }: { location: Location; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group focus:outline-none relative" aria-label={location.name}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-200 ${
        active
          ? "bg-primary border-primary text-primary-foreground scale-125 shadow-[0_0_16px_oklch(0.56_0.19_25_/_50%)]"
          : "bg-[#1c1410] border-accent/50 text-accent hover:border-primary hover:bg-primary/20 hover:scale-110"
      }`}>
        <TypeIcon type={location.type} className="h-4 w-4" />
      </div>
      {active && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30" />}
    </button>
  );
}

// ─── Layer Toggle Panel ───────────────────────────────────────────────────────

function LayerPanel({ visibility, onToggle }: { visibility: Record<string, boolean>; onToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = Object.values(visibility).filter(Boolean).length;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="absolute left-4 top-4 z-30 flex flex-col gap-1.5"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-[#1c1410]/92 border border-white/12 px-3 py-2 backdrop-blur-sm hover:border-white/20 transition-colors shadow-lg"
      >
        <Layers className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-xs font-semibold text-foreground">Layers</span>
        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">{activeCount}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-0.5 rounded-xl bg-[#1c1410]/95 border border-white/12 p-1.5 backdrop-blur-md shadow-2xl"
          >
            {LAYER_GROUPS.map((group) => {
              const active = visibility[group.id] ?? group.defaultOn;
              const Icon = group.Icon;
              return (
                <button key={group.id} onClick={() => onToggle(group.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                    active ? "bg-white/8 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-accent" : "text-muted-foreground/60"}`} />
                  <span className="whitespace-nowrap">{group.label}</span>
                  <div className={`ml-auto h-2 w-2 rounded-full transition-colors ${active ? "bg-accent" : "bg-white/15"}`} />
                </button>
              );
            })}

            {/* Difficulty legend */}
            <div className="mt-1 border-t border-white/8 pt-2 pb-1 px-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1.5">Trail Difficulty</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Easy",    color: "bg-green-400" },
                  { label: "Moderate",color: "bg-blue-400" },
                  { label: "Hard",    color: "bg-orange-400" },
                  { label: "Expert",  color: "bg-red-400" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-4 rounded-full ${color}`} />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/8 pt-1.5 px-2 pb-1">
              <p className="text-[10px] text-muted-foreground/50 leading-tight">
                Click features · Double-click park names to zoom
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  open, onToggle, active, onSelect,
  tab, onTabChange,
  nearbyTrails, filteredTrails,
  difficultyFilter, onDifficultyChange,
  onTrailSelect,
}: {
  open: boolean; onToggle: () => void;
  active: Location | null; onSelect: (loc: Location) => void;
  tab: SidebarTab; onTabChange: (t: SidebarTab) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nearbyTrails: any[]; filteredTrails: any[];
  difficultyFilter: DifficultyFilter; onDifficultyChange: (f: DifficultyFilter) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTrailSelect: (t: any) => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1410]/90 border border-white/10 text-muted-foreground hover:text-foreground backdrop-blur-sm transition-colors"
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute right-0 top-0 bottom-0 z-20 w-72 bg-[#1c1410]/95 border-l border-white/8 backdrop-blur-md flex flex-col"
          >
            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-white/8">
              {[
                { id: "spots" as SidebarTab, label: "My Spots", Icon: User },
                { id: "trails" as SidebarTab, label: "Nearby Trails", Icon: Activity },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-colors ${
                    tab === id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {id === "trails" && nearbyTrails.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[9px] font-bold text-accent">
                      {Math.min(nearbyTrails.length, 99)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Spots tab */}
            {tab === "spots" && (
              <>
                <div className="px-4 pt-3.5 pb-2 shrink-0 border-b border-white/6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Locations</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{LOCATIONS.length} spots filmed</p>
                </div>
                <div className="flex-1 overflow-y-auto py-1.5">
                  {LOCATIONS.map((loc) => (
                    <button key={loc.id} onClick={() => onSelect(loc)}
                      className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                        active?.id === loc.id ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon type={loc.type} className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span className="text-xs font-medium text-foreground leading-tight">{loc.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[loc.type]}`}>{loc.type}</Badge>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Trails tab */}
            {tab === "trails" && (
              <>
                {/* Difficulty filter */}
                <div className="px-3 py-2.5 border-b border-white/6 flex gap-1.5 shrink-0">
                  {(["all", "easy", "moderate", "hard"] as DifficultyFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => onDifficultyChange(f)}
                      className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold capitalize transition-colors ${
                        difficultyFilter === f
                          ? "bg-accent/20 text-accent border border-accent/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="px-4 pt-2.5 pb-1 shrink-0">
                  <p className="text-[10px] text-muted-foreground">
                    {filteredTrails.length} trail{filteredTrails.length !== 1 ? "s" : ""} visible
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto py-1">
                  {filteredTrails.length === 0 && (
                    <div className="px-4 py-10 text-center">
                      <Activity className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {nearbyTrails.length === 0 ? "Pan or zoom the map to discover nearby trails" : "No trails match this filter"}
                      </p>
                    </div>
                  )}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {filteredTrails.map((trail: any, i: number) => {
                    const p = trail.properties ?? {};
                    const name = p.name_en || p.name || p.ref;
                    const sac = String(p.sac_scale ?? "").toLowerCase();
                    const diff = getDiff(sac || undefined);
                    const surface = p.surface as string | undefined;
                    return (
                      <button
                        key={String(p.osm_id ?? i)}
                        onClick={() => onTrailSelect(trail)}
                        className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 mb-0.5">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${diff.dot}`} />
                          <span className="text-xs font-medium text-foreground truncate">{name || "Unnamed Trail"}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4.5 text-[10px] text-muted-foreground">
                          {diff.label && <span className={diff.color}>{diff.label}</span>}
                          {surface && <span>· {surface}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MapExplorer() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({ latitude: 47.7, longitude: -121.5, zoom: 7 });
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("spots");
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYER_GROUPS.map((g) => [g.id, g.defaultOn]))
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nearbyTrails, setNearbyTrails] = useState<any[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocating, setGeolocating] = useState(false);

  const filteredTrails = useMemo(() => {
    if (difficultyFilter === "all") return nearbyTrails;
    const sacMap: Record<DifficultyFilter, string[]> = {
      all: [],
      easy:     ["hiking"],
      moderate: ["mountain_hiking"],
      hard:     ["demanding_mountain_hiking", "alpine_hiking", "demanding_alpine_hiking", "difficult_alpine_hiking"],
    };
    const allowed = sacMap[difficultyFilter];
    return nearbyTrails.filter((t) =>
      allowed.includes(String(t.properties?.sac_scale ?? "").toLowerCase())
    );
  }, [nearbyTrails, difficultyFilter]);

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // ── Park labels ────────────────────────────────────────────────────────
    if (!map.getLayer("park_label")) {
      map.addLayer(
        {
          id: "park_label",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "park",
          minzoom: 8,
          filter: ["<=", ["get", "rank"], 2],
          layout: {
            "symbol-placement": "point",
            "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
            "text-font": ["Noto Sans Italic"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 11, 11, 14, 13],
            "text-letter-spacing": 0.12,
            "text-max-width": 8,
            "text-transform": "uppercase",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-padding": 12,
            "visibility": "visible",
          },
          paint: {
            "text-color": "#5a9e6a",
            "text-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.30, 12, 0.50],
            "text-halo-color": "rgba(18, 12, 8, 0.5)",
            "text-halo-width": 1,
          },
        },
        "poi_r20",
      );
    }

    // ── Hiking routes overlay ──────────────────────────────────────────────
    if (!map.getSource("hiking-routes")) {
      map.addSource("hiking-routes", {
        type: "raster",
        tiles: ["https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© <a href='https://waymarkedtrails.org'>Waymarked Trails</a>",
      });
      map.addLayer({
        id: "hiking-routes-layer",
        type: "raster",
        source: "hiking-routes",
        layout: { visibility: "none" },
        paint: { "raster-opacity": 0.85 },
      });
    }

    // ── Trail visual enhancements — difficulty colors ──────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const difficultyColorExpr: any = [
      "match", ["get", "sac_scale"],
      "hiking",                    "#4ade80",
      "mountain_hiking",           "#60a5fa",
      "demanding_mountain_hiking", "#fb923c",
      "alpine_hiking",             "#f87171",
      "demanding_alpine_hiking",   "#f43f5e",
      "difficult_alpine_hiking",   "#f43f5e",
      "#b8935a", // default — brand tan for unlabeled paths
    ];

    const pathLayers = ["road_path_pedestrian", "bridge_path_pedestrian", "tunnel_path_pedestrian"];
    pathLayers.forEach((id) => {
      if (!map.getLayer(id)) return;
      try { map.setPaintProperty(id, "line-color", difficultyColorExpr); } catch {}
      try { map.setPaintProperty(id, "line-opacity", 0.9); } catch {}
      try {
        map.setPaintProperty(id, "line-width", [
          "interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 2.5, 18, 4,
        ]);
      } catch {}
    });

    if (map.getLayer("bridge_path_pedestrian_casing")) {
      try { map.setPaintProperty("bridge_path_pedestrian_casing", "line-color", "#7a5c2e"); } catch {}
    }

    // Parks
    if (map.getLayer("park")) {
      try { map.setPaintProperty("park", "fill-opacity", 0.22); } catch {}
      try { map.setPaintProperty("park", "fill-color", "#3d7a52"); } catch {}
    }
    if (map.getLayer("park_outline")) {
      try { map.setPaintProperty("park_outline", "line-color", "#4a8f60"); } catch {}
      try { map.setPaintProperty("park_outline", "line-opacity", 0.7); } catch {}
      try { map.setPaintProperty("park_outline", "line-width", 1.5); } catch {}
    }

    // Waterways
    ["waterway_river", "waterway_other"].forEach((id) => {
      if (!map.getLayer(id)) return;
      try { map.setPaintProperty(id, "line-opacity", 0.85); } catch {}
    });

    // ── Cursor on hover ────────────────────────────────────────────────────
    ALL_INTERACTIVE.forEach((layerId) => {
      if (!map.getLayer(layerId)) return;
      map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
    });

    // Park label: zoom-in cursor + double-click to fitBounds
    map.on("mouseenter", "park_label", () => { map.getCanvas().style.cursor = "zoom-in"; });
    map.on("mouseleave", "park_label", () => { map.getCanvas().style.cursor = ""; });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("dblclick", "park_label", (e: any) => {
      e.preventDefault();
      const f = e.features?.[0];
      if (!f) return;
      const name = f.properties?.name || f.properties?.name_en;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryOpts: any = { sourceLayer: "park" };
      if (name) queryOpts.filter = ["==", ["coalesce", ["get", "name"], ["get", "name_en"]], name];
      const allFeatures = map.querySourceFeatures("openmaptiles", queryOpts);
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (const sf of allFeatures) {
        const bbox = geoBBox(sf.geometry);
        if (bbox) {
          if (bbox[0] < minLng) minLng = bbox[0];
          if (bbox[1] < minLat) minLat = bbox[1];
          if (bbox[2] > maxLng) maxLng = bbox[2];
          if (bbox[3] > maxLat) maxLat = bbox[3];
        }
      }
      if (minLng === Infinity) return;
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 900, maxZoom: 12 });
    });
  }, []);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if ((e.originalEvent.target as HTMLElement).closest("button")) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: [...ALL_INTERACTIVE, "highway-name-path"],
    });

    if (features.length > 0) {
      const f = features[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let props = (f.properties ?? {}) as Record<string, any>;
      let sourceLayer = f.sourceLayer ?? "";

      // Capture linestring geometry for elevation profile
      const geom = getLineCoords(f.geometry);

      // Merge transportation_name (name) with transportation (physical attrs)
      if (sourceLayer === "transportation_name") {
        const geo = features.find((ft) => ft.sourceLayer === "transportation");
        if (geo?.properties) props = { ...geo.properties, ...props };
        sourceLayer = "transportation";
      } else if (sourceLayer === "transportation") {
        const nameF = features.find((ft) => ft.sourceLayer === "transportation_name");
        if (nameF?.properties) props = { ...props, ...nameF.properties };
      }

      setActiveLocation(null);
      setActiveFeature({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        properties: props,
        sourceLayer,
        layerId: f.layer.id,
        geometry: geom.length >= 2 ? geom : undefined,
      });
    } else {
      setActiveLocation(null);
      setActiveFeature(null);
    }
  }, []);

  const handleMoveEnd = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = map.queryRenderedFeatures(undefined, {
      layers: ["road_path_pedestrian", "bridge_path_pedestrian"],
    });
    const seen = new Set<string>();
    const deduped = features.filter((f) => {
      const id = String(f.properties?.osm_id ?? f.id ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    setNearbyTrails(deduped.slice(0, 60));
  }, []);

  const handleSelectLocation = useCallback((loc: Location) => {
    setActiveFeature(null);
    setActiveLocation(loc);
    setViewState((v) => ({ ...v, latitude: loc.lat - 0.05, longitude: loc.lng, zoom: Math.max(v.zoom, 10) }));
  }, []);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (result.bbox) {
      const [minLng, minLat, maxLng, maxLat] = result.bbox;
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 900, maxZoom: 14 });
    } else {
      map.flyTo({ center: [result.lng, result.lat], zoom: 13, duration: 900 });
    }
  }, []);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setGeolocating(false);
        mapRef.current?.getMap()?.flyTo({ center: [lng, lat], zoom: 13, duration: 1200 });
      },
      () => setGeolocating(false),
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTrailSelect = useCallback((trail: any) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const coords = getLineCoords(trail.geometry);
    if (!coords.length) return;
    const [lng, lat] = coords[Math.floor(coords.length / 2)] as [number, number];
    map.flyTo({ center: [lng, lat], zoom: 14, duration: 900 });
    setActiveLocation(null);
    setActiveFeature({
      lng, lat,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: (trail.properties ?? {}) as Record<string, any>,
      sourceLayer: trail.sourceLayer ?? "transportation",
      layerId: trail.layer?.id ?? "road_path_pedestrian",
      geometry: coords.length >= 2 ? coords : undefined,
    });
  }, []);

  const toggleLayer = useCallback((groupId: string) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    setLayerVisibility((prev) => {
      const next = !prev[groupId];
      const group = LAYER_GROUPS.find((g) => g.id === groupId);
      if (!group) return prev;
      if (group.overlayId) {
        if (map.getLayer(group.overlayId)) map.setLayoutProperty(group.overlayId, "visibility", next ? "visible" : "none");
      } else {
        group.layers?.forEach((layerId) => {
          if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", next ? "visible" : "none");
        });
      }
      return { ...prev, [groupId]: next };
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        onMoveEnd={handleMoveEnd}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        reuseMaps
        interactiveLayerIds={ALL_INTERACTIVE}
      >
        <NavigationControl position="bottom-right" />

        {LOCATIONS.map((loc) => (
          <Marker key={loc.id} latitude={loc.lat} longitude={loc.lng} anchor="center">
            <LocationMarker
              location={loc}
              active={activeLocation?.id === loc.id}
              onClick={() => {
                setActiveFeature(null);
                setActiveLocation((prev) => (prev?.id === loc.id ? null : loc));
              }}
            />
          </Marker>
        ))}

        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
              <div className="h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/40" />
            </div>
          </Marker>
        )}

        {activeLocation && (
          <LocationPopup location={activeLocation} onClose={() => setActiveLocation(null)} />
        )}
        {activeFeature && (
          <FeaturePopup feature={activeFeature} onClose={() => setActiveFeature(null)} />
        )}
      </Map>

      {/* Search bar — top center */}
      <SearchBar onSelect={handleSearchSelect} />

      <LayerPanel visibility={layerVisibility} onToggle={toggleLayer} />

      {/* Near Me button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        onClick={handleNearMe}
        disabled={geolocating}
        className="absolute left-4 bottom-28 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1410]/92 border border-white/12 text-muted-foreground hover:text-foreground hover:border-white/25 backdrop-blur-sm transition-colors shadow-lg disabled:opacity-40"
        aria-label="Fly to my location"
        title="Near me"
      >
        {geolocating
          ? <div className="h-4 w-4 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
          : <Target className="h-4 w-4" />
        }
      </motion.button>

      {/* Coordinate HUD */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute left-4 bottom-12 z-10 rounded-xl bg-[#1c1410]/90 border border-white/8 px-3 py-2 backdrop-blur-sm font-mono text-[11px] text-muted-foreground"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-primary" />
          <span>{viewState.latitude.toFixed(4)}°N</span>
          <span className="text-white/20">·</span>
          <span>{Math.abs(viewState.longitude).toFixed(4)}°W</span>
          <span className="text-white/20">·</span>
          <span>z{viewState.zoom.toFixed(1)}</span>
        </div>
      </motion.div>

      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        active={activeLocation}
        onSelect={handleSelectLocation}
        tab={sidebarTab}
        onTabChange={setSidebarTab}
        nearbyTrails={nearbyTrails}
        filteredTrails={filteredTrails}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        onTrailSelect={handleTrailSelect}
      />
    </div>
  );
}
