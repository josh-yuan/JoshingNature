"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useState, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Waves, Anchor, MapPin, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LOCATIONS, youtubeUrl, type Location, type LocationType } from "@/data/content";

// ─── Type icon map ────────────────────────────────────────────────────────────

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

// ─── Custom Marker ────────────────────────────────────────────────────────────

function LocationMarker({
  location,
  active,
  onClick,
}: {
  location: Location;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group focus:outline-none relative"
      aria-label={location.name}
    >
      <div
        className={`
          flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg
          transition-all duration-200
          ${active
            ? "bg-primary border-primary text-primary-foreground scale-125 shadow-[0_0_16px_oklch(0.56_0.19_25_/_50%)]"
            : "bg-[#1c1410] border-accent/50 text-accent hover:border-primary hover:bg-primary/20 hover:scale-110"
          }
        `}
      >
        <TypeIcon type={location.type} className="h-4 w-4" />
      </div>
      {active && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30" />
      )}
    </button>
  );
}

// ─── Popup Card ───────────────────────────────────────────────────────────────

function LocationPopup({ location, onClose }: { location: Location; onClose: () => void }) {
  return (
    <Popup
      latitude={location.lat}
      longitude={location.lng}
      onClose={onClose}
      closeOnClick={false}
      offset={22}
    >
      <div className="w-60 rounded-xl bg-[#1c1410] border border-white/10 shadow-2xl overflow-hidden p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-foreground flex-1">
            {location.name}
          </h3>
          <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${TYPE_COLORS[location.type]}`}>
            {location.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {location.description}
        </p>
        {location.videoId && (
          <a
            href={youtubeUrl(location.videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/25 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Watch Episode
          </a>
        )}
      </div>
    </Popup>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  open, onToggle, active, onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  active: Location | null;
  onSelect: (loc: Location) => void;
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
            className="absolute right-0 top-0 bottom-0 z-20 w-64 bg-[#1c1410]/95 border-l border-white/8 backdrop-blur-md flex flex-col"
          >
            <div className="px-4 pt-5 pb-3 border-b border-white/8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Locations</p>
              <p className="text-sm text-muted-foreground mt-0.5">{LOCATIONS.length} spots filmed</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onSelect(loc)}
                  className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                    active?.id === loc.id
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "border-l-2 border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon type={loc.type} className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="text-xs font-medium text-foreground leading-tight">{loc.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[loc.type]}`}>
                    {loc.type}
                  </Badge>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MapExplorer() {
  const [viewState, setViewState] = useState({ latitude: 47.7, longitude: -121.5, zoom: 7 });
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (!(e.originalEvent.target as HTMLElement).closest("button")) {
      setActiveLocation(null);
    }
  }, []);

  const handleSelectLocation = useCallback((loc: Location) => {
    setActiveLocation(loc);
    setViewState((v) => ({ ...v, latitude: loc.lat - 0.05, longitude: loc.lng, zoom: Math.max(v.zoom, 10) }));
  }, []);

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={handleMapClick}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        reuseMaps
      >
        <NavigationControl position="bottom-right" />

        {LOCATIONS.map((loc) => (
          <Marker key={loc.id} latitude={loc.lat} longitude={loc.lng} anchor="center">
            <LocationMarker
              location={loc}
              active={activeLocation?.id === loc.id}
              onClick={() => setActiveLocation((prev) => (prev?.id === loc.id ? null : loc))}
            />
          </Marker>
        ))}

        {activeLocation && (
          <LocationPopup location={activeLocation} onClose={() => setActiveLocation(null)} />
        )}
      </Map>

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

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} active={activeLocation} onSelect={handleSelectLocation} />
    </div>
  );
}
