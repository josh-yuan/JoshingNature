"use client";

import { useState, useEffect } from "react";
import { haversineKm, sampleLinestring } from "@/lib/haversine";

type ElevPoint = { distance: number; elevation: number };

async function fetchElevations(coords: [number, number][]): Promise<ElevPoint[]> {
  // opentopodata expects lat,lng order
  const locations = coords.map(([lng, lat]) => `${lat},${lng}`).join("|");
  const res = await fetch(
    `https://api.opentopodata.org/v1/srtm30m?locations=${encodeURIComponent(locations)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(data.status);

  let cumDist = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results.map((r: any, i: number) => {
    if (i > 0) cumDist += haversineKm(coords[i - 1], coords[i]);
    return { distance: cumDist, elevation: r.elevation ?? 0 };
  });
}

function Sparkline({ points }: { points: ElevPoint[] }) {
  const W = 224, H = 56;
  const PAD_B = 20, PAD_T = 4;

  const elevations = points.map((p) => p.elevation);
  const minE = Math.min(...elevations);
  const maxE = Math.max(...elevations);
  const eRange = maxE - minE || 1;
  const maxDist = points[points.length - 1].distance || 1;

  const toX = (d: number) => (d / maxDist) * W;
  const toY = (e: number) => PAD_T + (1 - (e - minE) / eRange) * (H - PAD_T - PAD_B);

  const pts = points.map((p) => `${toX(p.distance).toFixed(1)},${toY(p.elevation).toFixed(1)}`).join(" ");
  const pathD = points.map((p, i) =>
    `${i === 0 ? "M" : "L"}${toX(p.distance).toFixed(1)} ${toY(p.elevation).toFixed(1)}`
  ).join(" ");
  const fillD = `${pathD} L${W} ${H - PAD_B} L0 ${H - PAD_B}Z`;

  const gainM = Math.round(
    points.reduce((acc, p, i) => (i > 0 && p.elevation > points[i - 1].elevation ? acc + p.elevation - points[i - 1].elevation : acc), 0)
  );
  const distStr = maxDist >= 1 ? `${maxDist.toFixed(1)} km` : `${Math.round(maxDist * 1000)} m`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg overflow-hidden" style={{ height: H }}>
        <defs>
          <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#eg)" />
        <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="0" y1={H - PAD_B} x2={W} y2={H - PAD_B} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <text x="1" y={H - 5} fontSize="8" fill="rgba(255,255,255,0.3)">{Math.round(minE)}m</text>
        <text x={W - 1} y={H - 5} fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="end">{Math.round(maxE)}m</text>
      </svg>
      <div className="flex items-center justify-between mt-1.5 text-[10px]">
        <span className="text-muted-foreground">{distStr} visible</span>
        <span className="text-sky-400 font-medium">+{gainM}m gain</span>
      </div>
    </div>
  );
}

export default function ElevationProfile({ geometry }: { geometry: number[][] }) {
  const [points, setPoints] = useState<ElevPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPoints(null);
    setLoading(true);
    setError(false);

    const coords = geometry as [number, number][];
    if (coords.length < 2) { setLoading(false); setError(true); return; }

    const sampled = sampleLinestring(coords, Math.min(20, coords.length));
    fetchElevations(sampled)
      .then((pts) => { if (!cancelled) setPoints(pts); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [geometry]);

  if (error) return null;
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 py-1 text-[10px] text-muted-foreground">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" />
        Loading elevation…
      </div>
    );
  }
  if (!points || points.length < 2) return null;
  return <Sparkline points={points} />;
}
