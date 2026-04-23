"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin, Mountain, Waves, Anchor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LOCATIONS, type LocationType } from "@/data/content";

export type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  type: "jn" | "nominatim";
  lat: number;
  lng: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
};

function locationIcon(type: LocationType) {
  switch (type) {
    case "Fire Lookout": return Anchor;
    case "Coastal":      return Waves;
    default:             return Mountain;
  }
}

function jnSearch(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q),
  ).map((l) => ({
    id: `jn-${l.id}`,
    label: l.name,
    sublabel: l.type,
    type: "jn" as const,
    lat: l.lat,
    lng: l.lng,
  }));
}

async function nominatimSearch(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    addressdetails: "0",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "Accept-Language": "en" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json();
  return data.map((item) => ({
    id: `nom-${item.place_id}`,
    label: item.display_name.split(",")[0].trim(),
    sublabel: item.display_name.split(",").slice(1, 3).join(",").trim(),
    type: "nominatim" as const,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    bbox: item.boundingbox
      ? ([
          parseFloat(item.boundingbox[2]), // minLng (west)
          parseFloat(item.boundingbox[0]), // minLat (south)
          parseFloat(item.boundingbox[3]), // maxLng (east)
          parseFloat(item.boundingbox[1]), // maxLat (north)
        ] as [number, number, number, number])
      : undefined,
  }));
}

export default function SearchBar({ onSelect }: { onSelect: (r: SearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const local = jnSearch(q);
    setResults(local);
    if (q.length < 3) { setLoading(false); return; }
    setLoading(true);
    try {
      const nom = await nominatimSearch(q);
      setResults([...local, ...nom]);
    } catch { /* network error — local results still shown */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setLoading(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  const handleSelect = (r: SearchResult) => {
    setQuery(r.label);
    setOpen(false);
    onSelect(r);
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-80 max-w-[calc(100vw-8rem)]"
    >
      <div
        className={`flex items-center gap-2 rounded-2xl bg-[#1c1410]/95 border backdrop-blur-md px-3 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-colors ${
          open ? "border-accent/35" : "border-white/12"
        }`}
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search trails, parks, peaks…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/55 outline-none min-w-0"
        />
        {loading && (
          <div className="h-3 w-3 rounded-full border-2 border-accent/35 border-t-accent animate-spin shrink-0" />
        )}
        {!loading && query && (
          <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="mt-1.5 rounded-2xl bg-[#1c1410]/97 border border-white/12 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-md"
          >
            {results.slice(0, 7).map((r) => {
              const isJN = r.type === "jn";
              const loc = isJN ? LOCATIONS.find((l) => `jn-${l.id}` === r.id) : null;
              const Icon = loc ? locationIcon(loc.type) : MapPin;
              return (
                <button
                  key={r.id}
                  onMouseDown={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/6 transition-colors border-b border-white/5 last:border-0"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isJN ? "bg-primary/15 border border-primary/25" : "bg-white/6 border border-white/10"
                  }`}>
                    <Icon className={`h-3 w-3 ${isJN ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.label}</p>
                    {r.sublabel && <p className="text-[10px] text-muted-foreground truncate">{r.sublabel}</p>}
                  </div>
                  {isJN && <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60 shrink-0">JN</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
