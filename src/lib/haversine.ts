export function haversineKm(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number],
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function linestringLengthKm(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += haversineKm(coords[i - 1], coords[i]);
  return total;
}

export function sampleLinestring(
  coords: [number, number][],
  n: number,
): [number, number][] {
  if (coords.length === 0) return [];
  if (coords.length === 1 || n <= 1) return [coords[0]];

  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const d = haversineKm(coords[i - 1], coords[i]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return [coords[0], coords[coords.length - 1]];

  const out: [number, number][] = [];
  for (let s = 0; s < n; s++) {
    const target = (s / (n - 1)) * total;
    let cum = 0;
    let placed = false;
    for (let i = 0; i < segs.length; i++) {
      if (cum + segs[i] >= target) {
        const t = segs[i] > 0 ? (target - cum) / segs[i] : 0;
        out.push([
          coords[i][0] + t * (coords[i + 1][0] - coords[i][0]),
          coords[i][1] + t * (coords[i + 1][1] - coords[i][1]),
        ]);
        placed = true;
        break;
      }
      cum += segs[i];
    }
    if (!placed) out.push(coords[coords.length - 1]);
  }
  return out;
}
